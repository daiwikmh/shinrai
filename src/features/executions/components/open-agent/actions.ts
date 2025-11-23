"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { openAgentChannel } from "@/inngest/channels/open-agent";
import { inngest } from "@/inngest/client";

export type OpenAgentToken = Realtime.Token<
  typeof openAgentChannel,
  ["status"]
>;

export async function fetchOpenAgentRealtimeToken(): Promise<OpenAgentToken> {
  const token = await getSubscriptionToken(inngest,{
    channel: openAgentChannel(),
    topics: ["status"],
  });

  return token;
}
