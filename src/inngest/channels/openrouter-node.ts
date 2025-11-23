import { channel, topic } from "@inngest/realtime";

export const OPENROUTER_NODE_CHANNEL_NAME = "openrouter-node-execution"
export const openRouterNodeChannel = channel(OPENROUTER_NODE_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
