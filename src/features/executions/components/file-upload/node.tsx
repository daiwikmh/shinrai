"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { UploadCloudIcon } from "lucide-react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { FormType, FileUploadDialog } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchFileUploadRealtimeToken } from "./actions";
import { FILE_UPLOAD_CHANNEL_NAME } from "@/inngest/channels/file-upload";

type FileUploadNodeData = {
  inputMode?: "file" | "variable" | "url";
  fileSource?: string;
  fileName?: string;
  fileSize?: number;
  epochs?: number;
  deletable?: boolean;
  [key: string]: unknown;
};

type FileUploadNodeType = Node<FileUploadNodeData>;

export const FileUploadNode = memo((props: NodeProps<FileUploadNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const {setNodes} = useReactFlow();
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: FILE_UPLOAD_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchFileUploadRealtimeToken,
  });

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
      <FileUploadDialog
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
        icon={UploadCloudIcon}
        name="File Upload"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

FileUploadNode.displayName = "FileUploadNode";
