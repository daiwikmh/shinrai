import type { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { openRouterNodeChannel } from "@/inngest/channels/openrouter-node";
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type OpenRouterData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
};
export const openRouterExecutor: NodeExecutor<OpenRouterData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  // Implement the logic for http-request execution here
  await publish(
    openRouterNodeChannel().status({
      nodeId,
      status: "loading",
    }),
  );
  const openRouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  try {
    
    if (!data.variableName) {
      throw new NonRetriableError("Variable name is required");
    }
    if (!data.model) {
      throw new NonRetriableError("Model is required");
    }

    const systemPromptTemplate = Handlebars.compile(data.systemPrompt || "");
    const userPromptTemplate = Handlebars.compile(data.userPrompt || "");

    const renderedSystemPrompt = systemPromptTemplate(context);
    const renderedUserPrompt = userPromptTemplate(context);
   const { steps } = await step.ai.wrap(
     "openRouter-generate-text",
     generateText,
     {
       model: openRouter.chat(data.model||"openai/gpt-4o-mini"),
       system: renderedSystemPrompt,
       prompt: renderedUserPrompt,
       experimental_telemetry:{
         isEnabled:true,
         recordInputs:true,
         recordOutputs:true
       }
       
     }
   )
   const text = steps[0].content[0].type === "text" ? steps[0].content[0].text : "";
    await publish(
      openRouterNodeChannel().status({
        nodeId,
        status: "success",
      }),
    );
   return {
     ...context,
     [data.variableName]: {
       aiResponse: text
     }
   }
  } catch (error) {
    await publish(
      openRouterNodeChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};