"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { fileUploadChannel } from "@/inngest/channels/file-upload";

export type FileUploadToken = Realtime.Token<
  typeof fileUploadChannel,
  ["status"]
>;

export async function fetchFileUploadRealtimeToken(): Promise<FileUploadToken> {
  const token = await getSubscriptionToken(inngest,{
    channel: fileUploadChannel(),
    topics: ["status"],
  });

  return token;
}
