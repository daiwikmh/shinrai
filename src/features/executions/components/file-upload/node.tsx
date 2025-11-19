"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { UploadIcon } from "lucide-react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { FormType, FileUploadDialog } from "./dialog";

type FileUploadNodeData = {
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  fileContent?: string; // Base64 encoded file content
  [key: string]: unknown;
};

type FileUploadNodeType = Node<FileUploadNodeData>;

export const FileUploadNode = memo((props: NodeProps<FileUploadNodeType>) => {
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
            fileName: values.fileName,
            fileSize: values.fileSize,
            fileType: values.fileType,
            fileContent: values.fileContent,
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
  const description = nodeData?.fileName
    ? `File: ${nodeData.fileName} (${((nodeData.fileSize || 0) / 1024).toFixed(2)} KB)`
    : "Not Configured";

  return (
    <>
      <FileUploadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultFileName={nodeData?.fileName}
        defaultFileSize={nodeData?.fileSize}
        defaultFileType={nodeData?.fileType}
        defaultFileContent={nodeData?.fileContent}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={UploadIcon}
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
