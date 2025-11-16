"use client";

import { type Node, type NodeProps, useReactFlow } from '@xyflow/react';
import { Globe2Icon } from 'lucide-react';
import { memo, useState } from
'react';
import { BaseExecutionNode } from '@/components/base-execution-node';

type HttpRequestNodeData = {
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
  [key: string]: unknown;
};

type HttpRequestNodeType = Node<HttpRequestNodeData>;

export const HttpRequestNode = memo((
  props: NodeProps<HttpRequestNodeType>
) => {
  const nodeData = props.data as HttpRequestNodeData;
  const description = nodeData?.endpoint ? `${nodeData.method || "GET"}: ${nodeData.endpoint}` : 'Not Configured';
  
  return (
    <>
    <BaseExecutionNode
      {...props}
      id={props.id}
      icon={Globe2Icon}
      name="HTTP Request"
      description={description}
      onSettings={() => {}}
      onDoubleClick={() => {}}
    />
    </>
  );
});

HttpRequestNode.displayName = 'HttpRequestNode';