import type { NodeExecutor } from "@/features/executions/type";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";

type ManualTriggerData = Record<string, unknown>;
export const manualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({
  data,
  nodeId,
  context,
  step,
  publish
}) => {
    // Implement the logic for manual trigger execution here
    await publish(
      manualTriggerChannel().status({
        nodeId,
        status:  "loading"
      })
    )
    const result = await step.run("manual-trigger", async () => context);
    
    await publish(
      manualTriggerChannel().status({
        nodeId,
        status:  "success"
      })
    )
    return result
};
