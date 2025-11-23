import { InitialNode } from "@/components/initial-node";
import { FileUploadNode } from "@/features/executions/components/file-upload/node";
import { HttpRequestNode } from "@/features/executions/components/http-request/node";
import { OpenAgentNode } from "@/features/executions/components/open-agent/node";
import { OpenRouterNode } from "@/features/executions/components/open-router-node/node";
import { WalrusStorageNode } from "@/features/executions/components/walrus-nodes/node";
import { GoogleFormTriggerNode } from "@/features/triggers/components/google-form-trigger/node";

import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";
import { TelegramTriggerNode } from "@/features/triggers/components/telegram-trigger/node";
import { NodeType } from "@/generated/prisma/enums";
import type { NodeTypes } from "@xyflow/react";

export const nodesComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerNode,
  [NodeType.FILE_UPLOAD]: FileUploadNode,
  [NodeType.OPENROUTER_NODE]: OpenRouterNode,
  [NodeType.OPEN_AGENT_NODE]: OpenAgentNode,
  [NodeType.TELEGRAM_TRIGGER]: TelegramTriggerNode,
  [NodeType.WALRUS_NODE_STORAGE]: WalrusStorageNode,

} as const satisfies NodeTypes;

export type RegisteredNodeTypes = keyof typeof nodesComponents;

