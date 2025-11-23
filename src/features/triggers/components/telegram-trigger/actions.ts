"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";

import { inngest } from "@/inngest/client";
import { telegramTriggerChannel } from "@/inngest/channels/telegram-trigger";

export type TelegramRealtimeToken = Realtime.Token<
  typeof telegramTriggerChannel,
  ["status"]
>;

export async function fetchTelegramRealtimeToken(): Promise<TelegramRealtimeToken> {
  const token = await getSubscriptionToken(inngest,{
    channel: telegramTriggerChannel(),
    topics: ["status"],
  });

  return token;
}
