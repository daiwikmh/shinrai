import type { NodeExecutor } from "@/features/executions/type";
import { telegramTriggerChannel } from "@/inngest/channels/telegram-trigger";

type TelegramTriggerData = {
  botToken: string;
};

type initialTelegramData = {
  content: string;
  chatId: string;
  username: string;
  fileId: string;
  mediaType: string;
  raw: any;
}

export const telegramExecutor: NodeExecutor<TelegramTriggerData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  try {
    // 1. Notify UI: Loading
    await publish(
      telegramTriggerChannel().status({
        nodeId,
        status: "loading",
      })
    );

    // 2. Execute Logic: Process Media and Construct Data
    const result = await step.run("process-telegram-payload", async () => {
      const { botToken } = data;
      // context comes from the Webhook payload we defined earlier
      const { fileId, mediaType, content, chatId, username } = context.telegram as initialTelegramData;

      let fileUrl: string | null = null;
      let fileMeta: any = null;

      // --- HANDLE MEDIA FILES (Voice, Image, Document) ---
      if (fileId && botToken) {
        // Step A: Ask Telegram for the File Path using the ID
        const response = await fetch(
          `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`
        );
        const telegramData = await response.json();

        if (!response.ok || !telegramData.ok) {
          throw new Error(`Telegram API Error: ${telegramData.description || "Unknown error"}`);
        }

        const filePath = telegramData.result.file_path; // e.g., "voice/123.oga" or "photos/abc.jpg"
        
        // Step B: Construct the public Download URL
        fileUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
        
        // Step C: Store metadata (useful for file extensions)
        fileMeta = {
            fileId: fileId,
            filePath: filePath,
            extension: filePath.split('.').pop(), // e.g., "jpg", "oga", "pdf"
            size: telegramData.result.file_size
        };
      }

      // 3. Return Standardized Output
      // This shape allows downstream nodes to easily check `if (telegramNode.mediaType === 'voice')`
      return {
        ...context,
        telegramNode: {
          // Metadata
          chatId: chatId,
          username: username,
          sentAt: new Date().toISOString(),
          
          // Content Classifiers
          mediaType: mediaType || "text", // "text", "image", "voice", "document"
          isMedia: !!fileUrl,
          
          // The Payload
          text: content, // Caption for images/docs, or the message body for text
          
          // The File (if applicable)
          file: fileUrl ? {
              url: fileUrl,
              ...fileMeta
          } : null
        },
      };
    });

    // 4. Notify UI: Success
    await publish(
      telegramTriggerChannel().status({
        nodeId,
        status: "success",
      })
    );

    return result;

  } catch (error: any) {
    // 5. Notify UI: Failed
    await publish(
      telegramTriggerChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};