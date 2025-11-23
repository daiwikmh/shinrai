"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { Globe2Icon } from "lucide-react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { OpenRouterDialog, OpenRouterFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchOpenRouterRealtimeToken } from "./actions";
import { OPENROUTER_NODE_CHANNEL_NAME } from "@/inngest/channels/openrouter-node";

type OpenRouterNodeData = {
  variableName?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

type OpenRouterNodeType = Node<OpenRouterNodeData>;

export const OpenRouterNode = memo((props: NodeProps<OpenRouterNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const {setNodes} = useReactFlow();
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: OPENROUTER_NODE_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchOpenRouterRealtimeToken,
  });

  const handleSubmit = (values:OpenRouterFormValues) => {
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
  
  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const nodeData = props.data;
  const description = nodeData?.endpoint
    ? `${nodeData.method || "GET"}: ${nodeData.endpoint}`
    : "Not Configured";

  return (
    <>
      <OpenRouterDialog 
      open={dialogOpen} 
      onOpenChange={setDialogOpen}
      onSubmit={handleSubmit}
      defaultValues={nodeData}
      />
        <BaseExecutionNode
          {...props}
          id={props.id}
          icon={"/logo/openrouter.png"}
          name="OpenRouter AI"
          status={nodeStatus}
          description={description}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
    </>
  );
});

OpenRouterNode.displayName = "OpenRouterNode";
