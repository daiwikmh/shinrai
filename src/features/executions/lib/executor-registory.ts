import { NodeType } from "@/generated/prisma/enums";
import { NodeExecutor } from "../type";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { httpRequestExecutor } from "../components/http-request/executor";
import { googleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";
import { telegramExecutor } from "@/features/triggers/components/telegram-trigger/executor";
import { openAgentExecutor } from "../components/open-agent/executor";
import { openRouterExecutor } from "../components/open-router-node/executor";
import { fileUploadExecutor } from "../components/file-upload/executor";
import { walrusStorageExecutor } from "../components/walrus-nodes/executor";


export const executorRegistory: Record<NodeType, NodeExecutor> = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,//fix types
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.FILE_UPLOAD]: fileUploadExecutor,
  [NodeType.OPENROUTER_NODE]: openRouterExecutor,
  [NodeType.OPEN_AGENT_NODE]: openAgentExecutor,
  [NodeType.TELEGRAM_TRIGGER]: telegramExecutor,
  [NodeType.WALRUS_NODE_STORAGE]: walrusStorageExecutor,
};

export const getExecutor = (type: NodeType):NodeExecutor => {
  const executor = executorRegistory[type];
  if(!executor) throw new Error(`Executor not found for type ${type}`);
  
  return executor;
};