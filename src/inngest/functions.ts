// import prisma from "@/lib/db";
import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider"

const google = createGoogleGenerativeAI();
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});
export const execute = inngest.createFunction(
  { id: "execute-ai" },
  { event: "execute/ai" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
   const { steps:geminiSteps } = await step.ai.wrap("gemini-generate-text",
     generateText,{
       model: google("gemini-2.5-flash-lite"),
       system:"You are a helpful assistant.",
       prompt:"Generate a short story about a cat and a dog.",
       experimental_telemetry: {
           isEnabled: true,
           recordInputs: true,
           recordOutputs: true,
         },
     })
   const { steps:openRouterSteps } = await step.ai.wrap("openrouter-generate-text",
     generateText,{
       model: openrouter("deepseek/deepseek-chat-v3.1:free"),
       system:"You are a helpful assistant.",
       prompt:"Generate a short story about a cat and a dog.",
       experimental_telemetry: {
           isEnabled: true,
           recordInputs: true,
           recordOutputs: true,
         },
     })
    return {
      geminiSteps,
      openRouterSteps
    };
  },
);
