import type { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { openRouterNodeChannel } from "@/inngest/channels/openrouter-node";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type OpenRouterData = {
  variableName?: string;
  credentialId?: string;
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
  try {
    if (!data.variableName) {
      throw new NonRetriableError("Variable name is required");
    }
    if (!data.credentialId) {
      await publish(
        openRouterNodeChannel().status({
          nodeId,
          status: "error"
        })
      )
      throw new NonRetriableError("Credential ID is required");
    }
    if (!data.model) {
      throw new NonRetriableError("Model is required");
    }
    const credential = await prisma.credential.findUnique({
      where: {
        id: data.credentialId,
      },
    });
    let decryptedValue = "";
    if(credential!== null) {
      decryptedValue = decrypt(credential.value);
    }
    
    const openRouter = createOpenRouter({
        apiKey: decryptedValue,
    })
    const systemPromptTemplate = Handlebars.compile(data.systemPrompt || "");
    const userPromptTemplate = Handlebars.compile(data.userPrompt || "");
    const renderedSystemPrompt = systemPromptTemplate(context);
    const renderedUserPrompt = userPromptTemplate(context);
    const { steps } = await step.ai.wrap(
      "openRouter-generate-text",
      generateText,
      {
        model: openRouter.chat(data.model || "openai/gpt-4o-mini"),
        maxOutputTokens: 200,
        system: renderedSystemPrompt,
        prompt: renderedUserPrompt,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      },
    );
    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";
    await publish(
      openRouterNodeChannel().status({
        nodeId,
        status: "success",
      }),
    );
    return {
      ...context,
      [data.variableName]: {
        aiResponse: text,
      },
    };
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
