import { channel, topic } from "@inngest/realtime";

export const OPEN_AGENT_CHANNEL_NAME = "open-agent-execution"
export const openAgentChannel = channel(OPEN_AGENT_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
