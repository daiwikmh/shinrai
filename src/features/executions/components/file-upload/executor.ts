import type { NodeExecutor } from "@/features/executions/type";
import { fileUploadChannel } from "@/inngest/channels/file-upload";

type FileUploadData = Record<string, unknown>;
export const fileUploadExecutor: NodeExecutor<FileUploadData> = async ({
  data,
  nodeId,
  context,
  step,
  publish
}) => {
    // Implement the logic for manual trigger execution here
    await publish(
      fileUploadChannel().status({
        nodeId,
        status:  "loading"
      })
    )
    const result = await step.run("manual-trigger", async () => context);
    
    await publish(
      fileUploadChannel().status({
        nodeId,
        status:  "success"
      })
    )
    return result
};
