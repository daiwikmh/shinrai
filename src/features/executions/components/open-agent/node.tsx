"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { Globe2Icon } from "lucide-react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { AVAILABLE_TOOLS, OpenAgentDialog, OpenAgentFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchOpenAgentRealtimeToken } from "./actions";
import { OPEN_AGENT_CHANNEL_NAME } from "@/inngest/channels/open-agent";

type OpenAgentNodeData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
  tools?: (typeof AVAILABLE_TOOLS)[number][];
};

type OpenAgentNodeType = Node<OpenAgentNodeData>;

export const OpenAgentNode = memo((props: NodeProps<OpenAgentNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const {setNodes} = useReactFlow();
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: OPEN_AGENT_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchOpenAgentRealtimeToken,
  });

  const handleSubmit = (values:OpenAgentFormValues) => {
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
  const description = nodeData?.userPrompt || "Not Configured";

  return (
    <>
      <OpenAgentDialog 
      open={dialogOpen} 
      onOpenChange={setDialogOpen}
      onSubmit={handleSubmit}
      defaultValues={nodeData}
      />
        <BaseExecutionNode
          {...props}
          id={props.id}
          icon={"/logo/agent.png"}
          name="Open Agent"
          status={nodeStatus}
          description={description}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
    </>
  );
});

OpenAgentNode.displayName = "OpenAgentNode";
