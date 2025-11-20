import { NodeType } from "@/generated/prisma/enums";
import { NodeExecutor } from "../type";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { httpRequestExecutor } from "../components/http-request/executor";

export const executorRegistory: Record<NodeType, NodeExecutor> = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,//fix types
  [NodeType.WALRUS_NODE_STORAGE]: manualTriggerExecutor,
};

export const getExecutor = (type: NodeType):NodeExecutor => {
  const executor = executorRegistory[type];
  if(!executor) throw new Error(`Executor not found for type ${type}`);
  
  return executor;
};