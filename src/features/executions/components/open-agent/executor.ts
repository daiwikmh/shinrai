import type { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import Handlebars from "handlebars";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { openAgentChannel } from "@/inngest/channels/open-agent";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type OpenAgentData = {
  variableName?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: string;
};
export const openAgentExecutor: NodeExecutor<OpenAgentData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  // Implement the logic for http-request execution here
  await publish(
    openAgentChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  try {
    const {steps} = await step.run("open-agent", async () => {
      

      const responsePayload = {
        httpResponse: {
          status: response.status,
          statusText: response.statusText,
          body: responseData,
        },
      };

      
    });

    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "success",
      }),
    );
    return {
      ...context,
      [data.variableName]: responsePayload,
    };
  } catch (error) {
    await publish(
      openAgentChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
