import type { NodeExecutor } from "@/features/executions/type";
import { walrusNodeChannel } from "@/inngest/channels/walrus-node";
import { WalrusFile } from "@mysten/walrus";
import { client } from "@/config/connect";
import ky from "ky";
import { NonRetriableError } from "inngest";
import z from "zod";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";
import type { Signer } from "@mysten/sui/cryptography";


function getContentTypeFromExtension(extension: string): string {
  const contentTypeMap: Record<string, string> = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',

    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'oga': 'audio/ogg',
    'ogg': 'audio/ogg',
    'm4a': 'audio/mp4',

    // Video
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',

    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'txt': 'text/plain',
    'json': 'application/json',
    'xml': 'application/xml',

    // Archives
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
  };
  return contentTypeMap[extension.toLowerCase()] || 'application/octet-stream';
  }
const telegramFileSchema = z.object({
  url: z.string().url(),
  fileId: z.string(),
  filePath: z.string(),
  extension: z.string(),
  size: z.number(),
});


const telegramNodeSchema = z.object({
  chatId: z.string(),
  username: z.string(),
  sentAt: z.string(),
  mediaType: z.string(),
  isMedia: z.boolean(),
  text: z.string().optional(),
  file: telegramFileSchema.nullable(),
});

type WalrusStorageData = {
  variableName?: string;
  epochs?: number;
};

export const walrusStorageExecutor: NodeExecutor<WalrusStorageData> = async ({
  data,
  nodeId,
  context,
  step,
  publish
}) => {
    // Implement the logic for manual trigger execution here
    await publish(
      walrusNodeChannel().status({
        nodeId,
        status:  "loading"
      })
    )
    
   try { const result = await step.run("walrus-node", async () => {
      const telegramData = context.telegramNode;
      const workflowId = context.workflowId;
      const { data: workflow } = useSuspenseWorkflow(`${workflowId}`);
      if (!telegramData) {
        throw new NonRetriableError(
          "WalrusStorageNode: No file data found. Please connect this node to a Telegram trigger or other file source."
        );
      }

      const validatedTelegram = telegramNodeSchema.safeParse(telegramData);

      if (!validatedTelegram.success) {
        throw new NonRetriableError(
          `WalrusStorageNode: Invalid telegram data structure. Error: ${validatedTelegram.error.message}`
        );
      }

      if (!validatedTelegram.data.file) {
        throw new NonRetriableError(
          "WalrusStorageNode: No file found in Telegram message. Please send an image, document, or other file to the bot."
        );
      }

      const telegramFile = validatedTelegram.data.file;
      if(!telegramFile) {
        throw new NonRetriableError('No file provided');
      }
      const fileName = `file.${telegramFile.extension}`;
      const contentType = getContentTypeFromExtension(telegramFile.extension);
      const response = await ky.get(telegramFile.url);
      const arrayBuffer = await response.arrayBuffer();
      const fileBuffer = new Uint8Array(arrayBuffer);
      const upload = WalrusFile.from({
              contents: fileBuffer,
              identifier: fileName,
              tags: {
                'content-type': contentType
              }
            });
      const keyPair:unknown = workflow.keypair;
          // Upload file to Walrus
      const uploadResults = await client.walrus.writeFiles({
          files: [upload],
          epochs: data.epochs || 3,
          deletable: true,
          signer: keyPair as Signer,
        });
    
          // Extract the first result (we only upload one file)
      const uploadResult = uploadResults[0];

      const responsePayload = {
        walrusUpload: {
          blobId: uploadResult.blobId,
          success: uploadResult.id === 'certified',
          status: uploadResult.id,
          fileName: fileName,
          epochs: data.epochs || 3,
          metadata: {
            contentType: contentType,
            size: fileBuffer.length,
          }
  }
  };
      return {
        ...context,
        ...responsePayload
      }
  });
  
    await publish(
      walrusNodeChannel().status({
        nodeId,
        status:  "success"
      })
    )
    return result
   } catch (error) {
    await publish(
      walrusNodeChannel().status({
        nodeId,
        status:  "error"
      })
    )
    throw error;
   }
};
