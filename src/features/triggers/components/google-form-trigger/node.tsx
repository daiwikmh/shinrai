import type { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { GoogleFormTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { GOOGLE_FORM_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/google-form-trigger";
import { fetchGoogleFormRealtimeToken } from "./actions";

export const GoogleFormTriggerNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const nodeStatus = useNodeStatus({
    nodeId:props.id,
    channel: GOOGLE_FORM_TRIGGER_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchGoogleFormRealtimeToken,
  });
  
  const handleOpenSettings = () => setDialogOpen(true);
  
  return (
    <>
      <GoogleFormTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen}/>
      <BaseTriggerNode
        {...props}
        icon={"/logo/googleform.png"}
        name="Google Form Trigger"
        description="When google form is submitted triggers workflow."
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings} />
    </>
  )
});

GoogleFormTriggerNode.displayName = "Google Form Trigger";