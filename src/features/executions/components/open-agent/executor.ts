import type { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import { openAgentChannel } from "@/inngest/channels/open-agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { allSuiTools } from "./tools";
import prisma from "@/lib/db";
import Handlebars from "handlebars";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});


type OpenAgentData = {
  variableName?: string;
  prompt?: string;
  model?: string;
  enableSuiTools?: boolean;
  systemPrompt?: string;
  maxSteps?: number;
};

export const openAgentExecutor: NodeExecutor<OpenAgentData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    openAgentChannel().status({
      nodeId,
      status: "loading",
    })
  );

  try {
      // Validate required fields
      if (!data.prompt) {
        throw new NonRetriableError("OpenAgentNode: Prompt is missing");
      }
      if (!data.variableName) {
        throw new NonRetriableError("OpenAgentNode: Variable name is missing");
      }

      // Get workflow for signer access
      const workflowId = (context as any).workflowId;
      const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
      });

      if (!workflow) {
        throw new NonRetriableError("Workflow not found");
      }

      const openRouter = createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
      })

      // Prepare tools with workflow signer
      const tools = data.enableSuiTools ? allSuiTools : undefined;
      const userPrompt = Handlebars.compile(data.prompt || "")(context);
      // Build context summary for the agent
      const contextSummary = JSON.stringify(context, null, 2);
      const fullPrompt = `Context from previous workflow steps:
${contextSummary}

User Task:
${userPrompt}`
      // Execute AI agent with step.ai.wrap
      const aiResult = await step.ai.wrap(
        "ai-agent-execution",
        generateText,{
          model: openRouter.chat(data.model || "deepseek/deepseek-chat-v3-0324:free"),
          tools,
          system: data.systemPrompt || `You are a helpful AI agent executing within a workflow.
You have access to the workflow context and can use Sui blockchain tools to perform transactions.
Always provide clear, actionable responses.
${data.enableSuiTools ? `The workflow wallet address is: ${workflow.address}` : ''}`,
          prompt: fullPrompt,
          maxRetries: data.maxSteps ?? 5,
          maxTokens: data.maxTokens ?? 4096,

        }

      );

      // Prepare response payload
      const responsePayload = {
        agentResponse: {
          text: aiResult.text,
          finishReason: aiResult.finishReason,
          usage: {
            promptTokens: aiResult.usage.inputTokens,
            completionTokens: aiResult.usage.outputTokens,
            totalTokens: aiResult.usage.totalTokens,
          },
          toolCalls: aiResult.steps.flatMap(
            (step) =>
              step.toolCalls?.map((call) => ({
                toolName: call.toolName,
                args: call.input,
                result: aiResult.steps
                  .find((s) => s.toolResults)
                  ?.toolResults?.find((r) => r.toolCallId === call.toolCallId)
                  ?.output,
              })) || []
          ),
          steps: aiResult.steps.length,
          model: data.model || "deepseek/deepseek-chat-v3-0324:free",
        },
      };

      await publish(
        openAgentChannel().status({
          nodeId,
          status: "success",
        })
      );
      // Return context with agent response
      return {
        ...context,
        [data.variableName]: responsePayload,
      };
    


  } catch (error) {
    await publish(
      openAgentChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
