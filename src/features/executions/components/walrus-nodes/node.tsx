"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { DatabaseIcon } from "lucide-react";
import { memo, useState, useMemo, useEffect } from "react";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { FormType, WalrusStorageDialog } from "./dialog";
import { NodeType } from "@/generated/prisma/enums";
import { client } from "@/app/(dashboard)/(rest)/onchain/walrus/connect";

type WalrusStorageNodeData = {
  fileDataSource?: string;
  epochs?: number;
  deletable?: boolean;
  [key: string]: unknown;
};

type WalrusStorageNodeType = Node<WalrusStorageNodeData>;

export const WalrusStorageNode = memo((props: NodeProps<WalrusStorageNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [totalCost, setTotalCost] = useState<bigint | null>(null);
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
        const fileData = {
          fileName: sourceNode.data.fileName as string | undefined,
          fileSize: sourceNode.data.fileSize as number | undefined,
          fileType: sourceNode.data.fileType as string | undefined,
          fileContent: sourceNode.data.fileContent as string | undefined,
        };

        console.log("Walrus Node - Connected file data:", {
          fileName: fileData.fileName,
          fileSize: fileData.fileSize,
          fileType: fileData.fileType,
          hasFileContent: !!fileData.fileContent,
          fileContentLength: fileData.fileContent?.length,
        });

        return fileData;
      }
    }

    return null;
  }, [getEdges, getNodes, props.id]);

  // Calculate storage cost when file size or epochs change
  useEffect(() => {
    const calculateCost = async () => {
      if (!connectedFileData?.fileSize) {
        setTotalCost(null);
        return;
      }

      const epochs = props.data?.epochs || 5;

      try {
        const cost = await client.walrus.storageCost(connectedFileData.fileSize, epochs);
        setTotalCost(cost.totalCost);
      } catch (error) {
        console.error("Error calculating storage cost:", error);
        setTotalCost(null);
      }
    };

    calculateCost();
  }, [connectedFileData?.fileSize, props.data?.epochs]);

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
            // Store reference to connected file if available
            hasConnectedFile: !!connectedFileData?.fileName,
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
  let description = "Connect a File Upload node";
  if (connectedFileData?.fileName && connectedFileData?.fileContent) {
    // Connected file with actual content
    const fileSizeKB = ((connectedFileData.fileSize || 0) / 1024).toFixed(2);
    const costStr = totalCost !== null
      ? `, ${(Number(totalCost) / 1_000_000_000).toFixed(9)} WAL`
      : '';
    description = `Ready: ${connectedFileData.fileName} (${fileSizeKB} KB, ${nodeData?.epochs || 5} epochs${costStr})`;
  } else if (connectedFileData?.fileName && !connectedFileData?.fileContent) {
    // Connected but no file content (file not uploaded yet)
    description = `Waiting for file: ${connectedFileData.fileName}`;
  } else if (nodeData?.fileDataSource) {
    // Manual reference (not recommended)
    description = `Manual ref: ${nodeData.fileDataSource} (${nodeData.epochs || 5} epochs)`;
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
        connectedFileContent={connectedFileData?.fileContent}
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
