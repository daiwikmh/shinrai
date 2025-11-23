import type { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import Handlebars from "handlebars";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { openRouterNodeChannel } from "@/inngest/channels/openrouter-node";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type OpenRouterData = {
  variableName?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: string;
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
    const result = await step.run("http-request", async () => {
      if (!data.endpoint) {
        await publish(
          openRouterNodeChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError("HttpRequestNode: Endpoint is missing");
      }
      if (!data.method) {
        await publish(
          openRouterNodeChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError("HttpRequestNode: Method is missing");
      }
      if (!data.variableName) {
        await publish(
          openRouterNodeChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError(
          "HttpRequestNode: Variable name is missing",
        );
      }
      const endpoint = Handlebars.compile(data.endpoint)(context);
      const method = data.method;

      const options: KyOptions = { method };
      if (["POST", "PUT", "PATCH"].includes(method)) {
        const resolved = Handlebars.compile(data.body || {})(context);
        JSON.parse(resolved);
        options.body = resolved;

        options.headers = {
          "Content-Type": "application/json",
        };
      }
      const response = await ky(endpoint, options);
      const contentType = response.headers.get("content-type");
      const responseData = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

      const responsePayload = {
        httpResponse: {
          status: response.status,
          statusText: response.statusText,
          body: responseData,
        },
      };

      return {
        ...context,
        [data.variableName]: responsePayload,
      };
    });

    await publish(
      openRouterNodeChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return result;
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
