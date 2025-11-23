import type { NodeExecutor } from "@/features/executions/type";
import { walrusNodeChannel } from "@/inngest/channels/walrus-node";

type WalrusStorageData = Record<string, unknown>;
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
    const result = await step.run("walrus-node", async () => context);
    
    await publish(
      walrusNodeChannel().status({
        nodeId,
        status:  "success"
      })
    )
    return result
};
