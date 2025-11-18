"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { DatabaseIcon } from "lucide-react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { FormType, WalrusStorageDialog } from "./dialog";

type WalrusStorageNodeData = {
  inputMode?: "file" | "variable" | "url";
  fileSource?: string;
  fileName?: string;
  fileSize?: number;
  epochs?: number;
  deletable?: boolean;
  [key: string]: unknown;
};

type WalrusStorageNodeType = Node<WalrusStorageNodeData>;

export const WalrusStorageNode = memo((props: NodeProps<WalrusStorageNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const {setNodes} = useReactFlow();
  const nodeStatus = "initial";

  const handleSubmit = (values: FormType) => {
    setNodes((nodes) => nodes.map((node) => {
      if(node.id === props.id) {
        return {
          ...node,
          data: {
            ...node.data,
            inputMode: values.inputMode,
            fileSource: values.fileSource,
            fileName: values.fileName,
            fileSize: values.fileSize,
            epochs: values.epochs,
            deletable: values.deletable,
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

  let description = "Not Configured";
  if (nodeData?.inputMode === "file" && nodeData?.fileName) {
    description = `Upload: ${nodeData.fileName} (${nodeData.epochs || 5} epochs)`;
  } else if (nodeData?.inputMode === "variable" && nodeData?.fileSource) {
    description = `Variable: ${nodeData.fileSource} (${nodeData.epochs || 5} epochs)`;
  } else if (nodeData?.inputMode === "url" && nodeData?.fileSource) {
    description = `URL: ${nodeData.fileSource} (${nodeData.epochs || 5} epochs)`;
  }

  return (
    <>
      <WalrusStorageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultInputMode={nodeData?.inputMode}
        defaultFileSource={nodeData?.fileSource}
        defaultFileName={nodeData?.fileName}
        defaultFileSize={nodeData?.fileSize}
        defaultEpochs={nodeData?.epochs}
        defaultDeletable={nodeData?.deletable}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={DatabaseIcon}
        name="Walrus Storage"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

WalrusStorageNode.displayName = "WalrusStorageNode";
