import type { NodeProps } from "@xyflow/react";
import { memo } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { SquareMousePointer } from "lucide-react";

export const ManualTriggerNode = memo((props: NodeProps) => {
  return (
    <>
      <BaseTriggerNode
        {...props}
        icon={SquareMousePointer}
        name="When clicking 'Execute workflow'" />
      {/*status={nodeStatus} TODO*/}
      {/*onSettings={handleOpenSettings} TODO*/}
      {/*onDoubleClick={handleDoubleClick} TODO*/}
    </>
  )
});

ManualTriggerNode.displayName = "ManualTriggerNode";