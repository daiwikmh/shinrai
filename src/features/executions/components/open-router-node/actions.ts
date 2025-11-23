"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { openRouterNodeChannel } from "@/inngest/channels/openrouter-node";

export type OpenRouterToken = Realtime.Token<
  typeof openRouterNodeChannel,
  ["status"]
>;

export async function fetchOpenRouterRealtimeToken(): Promise<OpenRouterToken> {
  const token = await getSubscriptionToken(inngest,{
    channel: openRouterNodeChannel(),
    topics: ["status"],
  });

  return token;
}
