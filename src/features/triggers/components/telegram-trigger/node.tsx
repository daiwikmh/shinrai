import { useReactFlow, type NodeProps, type Node } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { TelegramFormValues, TelegramTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { TELEGRAM_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/telegram-trigger";
import { fetchTelegramRealtimeToken } from "./actions";

type TelegramNodeData = {
  botToken: string;
};

type TelegramNodeDataType = Node<TelegramNodeData>;

export const TelegramTriggerNode = memo((props: NodeProps<TelegramNodeDataType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const {setNodes} = useReactFlow()
  const nodeStatus = useNodeStatus({
    nodeId:props.id,
    channel: TELEGRAM_TRIGGER_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchTelegramRealtimeToken,
  });
  
  const handleOpenSettings = () => setDialogOpen(true);
  const nodeData = props.data;
  const handleSubmit = (values:TelegramFormValues) => {
    setNodes((nodes) => nodes.map((node) =>{
      if(node.id === props.id) {
        return {
          ...node,
          data:{
            ...node.data,
            ...values
          }
        }
      }
      return node;
    }))
  };
  
  return (
    <>
      <TelegramTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={handleSubmit} defaultValues={nodeData}/>
      <BaseTriggerNode
        {...props}
        icon={"/logo/telegram.png"}
        name="Telegram Trigger"
        description="When telegram message is received triggers workflow."
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings} />
    </>
  )
});

TelegramTriggerNode.displayName = "Telegram Trigger";