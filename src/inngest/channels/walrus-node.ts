import { channel, topic } from "@inngest/realtime";

export const WALRUS_NODE_CHANNEL_NAME = "walrus-node-execution"
export const walrusNodeChannel = channel(WALRUS_NODE_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
