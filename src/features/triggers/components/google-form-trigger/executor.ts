import type { NodeExecutor } from "@/features/executions/type";
import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";

type GoogleFormTriggerData = Record<string, unknown>;
export const googleFormTriggerExecutor: NodeExecutor<GoogleFormTriggerData> = async ({
  data,
  nodeId,
  context,
  step,
  publish
}) => {
    // Implement the logic for manual trigger execution here
    await publish(
      googleFormTriggerChannel().status({
        nodeId,
        status:  "loading"
      })
    )
    const result = await step.run("google-form-trigger", async () => context);
    
    await publish(
      googleFormTriggerChannel().status({
        nodeId,
        status:  "success"
      })
    )
    return result
};
