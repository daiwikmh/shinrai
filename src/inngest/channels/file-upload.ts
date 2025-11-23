import { channel, topic } from "@inngest/realtime";

export const FILE_UPLOAD_CHANNEL_NAME = "file-upload-execution"
export const fileUploadChannel = channel(FILE_UPLOAD_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
