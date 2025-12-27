import type { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import { openAgentChannel } from "@/inngest/channels/open-agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, stepCountIs } from "ai";
import { allSuiTools } from "./tools";
import prisma from "@/lib/db";
import Handlebars from "handlebars";
import { decrypt } from "@/lib/encryption";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});


type OpenAgentData = {
  variableName?: string;
  prompt?: string;
  credentialId?: string;
  model?: string;
  enableSuiTools?: boolean;
  systemPrompt?: string;
  maxRetries?: number;
  maxTokens?: number;
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
      if(!data.credentialId) {
        throw new NonRetriableError("OpenAgentNode: Credential ID is missing");
      }

      // Get workflow for signer access
      const workflowId = (context as any).workflowId;
      const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
      });

      if (!workflow) {
        throw new NonRetriableError("Workflow not found");
      }
      
      const credential = await prisma.credential.findUnique({
        where: { 
          id: data.credentialId
        },
      });
      let decryptedValue = "";
      if(credential!== null) {
        decryptedValue = decrypt(credential.value);
      }
      
      const openRouter = createOpenRouter({
          apiKey: decryptedValue,
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
          model: openRouter.chat(data.model || "deepseek/deepseek-chat-v3.1"),
          tools,
          system: data.systemPrompt || `You are a helpful AI agent executing within a workflow.
You have access to the workflow context and can use Sui blockchain tools to perform transactions.
Always provide clear, actionable responses.
${data.enableSuiTools ? `The workflow wallet address is: ${workflow.address}` : ''}`,
          prompt: fullPrompt,
          maxOutputTokens: 200,
          stopWhen: [stepCountIs(5)]

        }

      );

      // Prepare response payload
      const responsePayload = {
        agentResponse: {
          text: aiResult.steps.at(-1)?.content.at(-1),
          result: aiResult.steps,
          model: data.model || "nex-agi/deepseek-v3.1-nex-n1:free",
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
