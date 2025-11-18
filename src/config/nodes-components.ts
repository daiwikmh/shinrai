import { InitialNode } from "@/components/initial-node";
import { HttpRequestNode } from "@/features/executions/components/http-request/node";
import { WalrusStorageNode } from "@/features/executions/components/walrus-nodes/node";

import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";
import { NodeType } from "@/generated/prisma/enums";
import type { NodeTypes } from "@xyflow/react";

export const nodesComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.WALRUS_NODE_STORAGE]: WalrusStorageNode,

} as const satisfies NodeTypes;

export type RegisteredNodeTypes = keyof typeof nodesComponents;

