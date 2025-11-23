import type { NodeExecutor } from "@/features/executions/type";
import { walrusNodeChannel } from "@/inngest/channels/walrus-node";
import { WalrusFile } from "@mysten/walrus";
import { client } from "@/config/connect";
import ky from "ky";
import { NonRetriableError } from "inngest";
import z from "zod";
import { decodeSuiPrivateKey, type Signer } from "@mysten/sui/cryptography";
import prisma from "@/lib/db";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromBase64, fromHex } from "@mysten/utils";


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
  
  await publish(
    walrusNodeChannel().status({
      nodeId,
      status: "loading"
    })
  )

  try {
    const result = await step.run("walrus-node", async () => {
      // ... (Keep your existing checks for telegramData and parsedTelegram) ...
      const workflowId = (context as any).workflowId;
      const telegramData = (context as any).telegramNode; 
      
      
      // [Validation logic omitted for brevity, keep your existing checks]
      if (!telegramData?.file) throw new NonRetriableError("No file found");
      const telegramFile = telegramData.file;

      // 1. Fetch from DB
      const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
      });

      if (!workflow || !workflow.keypair) {
        throw new NonRetriableError("Workflow wallet/keypair not found in DB.");
      }

      // 2. RECONSTRUCT THE SIGNER
      // This turns your DB string back into a functional object
      const secretKey = workflow.privateKey
      console.log(secretKey)
      const signer = Ed25519Keypair.fromSecretKey(secretKey);
      
      // 3. Download & Prepare
      const fileName = `file.${telegramFile.extension}`;
      const contentType = getContentTypeFromExtension(telegramFile.extension);
      
      const response = await ky.get(telegramFile.url);
      const arrayBuffer = await response.arrayBuffer();
      const fileBuffer = new Uint8Array(arrayBuffer);

      const upload = WalrusFile.from({
        contents: fileBuffer,
        identifier: fileName,
        tags: { 'content-type': contentType }
      });

      // 4. Upload using the reconstructed signer
      const uploadResults = await client.walrus.writeFiles({
        files: [upload],
        epochs: data.epochs || 1,
        deletable: true,
        signer: signer, 
      });

      const uploadResult = uploadResults[0];

      // 5. Success
      return {
        ...context,
        walrusUpload: {
          blobId: uploadResult.blobId,
          status: 'uploaded',
          suiObjectId: uploadResult.id,
          fileName: fileName,
          metadata: {
            contentType: contentType,
            size: fileBuffer.length,
          }
        }
      };
    });

    await publish(walrusNodeChannel().status({ nodeId, status: "success" }));
    return result;

  } catch (error: any) {
    await publish(
      walrusNodeChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};