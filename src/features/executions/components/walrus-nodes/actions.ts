"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { walrusNodeChannel } from "@/inngest/channels/walrus-node";

export type WalrusStorageToken = Realtime.Token<
  typeof walrusNodeChannel,
  ["status"]
>;

export async function fetchWalrusStorageRealtimeToken(): Promise<WalrusStorageToken> {
  const token = await getSubscriptionToken(inngest,{
    channel: walrusNodeChannel(),
    topics: ["status"],
  });

  return token;
}
