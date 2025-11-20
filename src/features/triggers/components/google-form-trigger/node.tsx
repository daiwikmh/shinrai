import type { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { SquareMousePointer } from "lucide-react";
import { ManualTriggerDialog } from "./dialog";
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
      <ManualTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen}/>
      <BaseTriggerNode
        {...props}
        icon={"/logos/googleform.png"}
        name="When form is submitted trigger."
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings} />
    </>
  )
});

GoogleFormTriggerNode.displayName = "Google Form Trigger";