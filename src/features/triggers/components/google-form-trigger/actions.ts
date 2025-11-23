"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";

import { inngest } from "@/inngest/client";
import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger";

export type GoogleFormRealtimeToken = Realtime.Token<
  typeof googleFormTriggerChannel,
  ["status"]
>;

export async function fetchGoogleFormRealtimeToken(): Promise<GoogleFormRealtimeToken> {
  const token = await getSubscriptionToken(inngest,{
    channel: googleFormTriggerChannel(),
    topics: ["status"],
  });

  return token;
}
