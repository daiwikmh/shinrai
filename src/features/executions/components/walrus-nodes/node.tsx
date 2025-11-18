"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { DatabaseIcon } from "lucide-react";
import { memo, useState, useMemo } from "react";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { FormType, WalrusStorageDialog } from "./dialog";
import { NodeType } from "@/generated/prisma/enums";

type WalrusStorageNodeData = {
  fileDataSource?: string;
  epochs?: number;
  deletable?: boolean;
  [key: string]: unknown;
};

type WalrusStorageNodeType = Node<WalrusStorageNodeData>;

export const WalrusStorageNode = memo((props: NodeProps<WalrusStorageNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const {setNodes, getEdges, getNodes} = useReactFlow();
  const nodeStatus = "initial";

  // Find connected file upload node
  const connectedFileData = useMemo(() => {
    const edges = getEdges();
    const nodes = getNodes();

    // Find edges that connect TO this node (target is this node)
    const incomingEdges = edges.filter((edge) => edge.target === props.id);

    // Find the source node (File Upload node)
    for (const edge of incomingEdges) {
      const sourceNode = nodes.find((node) => node.id === edge.source);
      if (sourceNode && sourceNode.type === NodeType.FILE_UPLOAD) {
        return {
          fileName: sourceNode.data.fileName as string | undefined,
          fileSize: sourceNode.data.fileSize as number | undefined,
          fileType: sourceNode.data.fileType as string | undefined,
        };
      }
    }

    return null;
  }, [getEdges, getNodes, props.id]);

  const handleSubmit = (values: FormType) => {
    setNodes((nodes) => nodes.map((node) => {
      if(node.id === props.id) {
        return {
          ...node,
          data: {
            ...node.data,
            fileDataSource: values.fileDataSource,
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

  // Build description based on connected file or configured source
  let description = "Not Configured";
  if (connectedFileData?.fileName) {
    const fileSizeKB = ((connectedFileData.fileSize || 0) / 1024).toFixed(2);
    description = `File: ${connectedFileData.fileName} (${fileSizeKB} KB, ${nodeData?.epochs || 5} epochs)`;
  } else if (nodeData?.fileDataSource) {
    description = `Store: ${nodeData.fileDataSource} (${nodeData.epochs || 5} epochs)`;
  }

  return (
    <>
      <WalrusStorageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultFileDataSource={nodeData?.fileDataSource}
        defaultEpochs={nodeData?.epochs}
        defaultDeletable={nodeData?.deletable}
        connectedFileName={connectedFileData?.fileName}
        connectedFileSize={connectedFileData?.fileSize}
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
