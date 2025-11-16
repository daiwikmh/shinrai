"use client"

import { NodeToolbar, Position } from "@xyflow/react"
import { Settings2Icon, TrashIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "./ui/button"

interface WorkflowNodeProps {
  children: ReactNode,
  showToolbar?: boolean,
  onDelete?: () => void,
  onSettings?: () => void,
  name?: string,
  description?: string,
};

export function WorkflowNode({
  children,
  showToolbar,
  onDelete,
  onSettings,
  name,
  description
}:WorkflowNodeProps) {
  return (
    <>
      {showToolbar && (
        <NodeToolbar>
          <Button size={"sm"} variant={"ghost"} onClick={onSettings}>
            <Settings2Icon className="size-4"/>
          </Button>
          <Button size={"sm"} variant={"ghost"} onClick={onDelete}>
            <TrashIcon className="size-4"/>
          </Button>
        </NodeToolbar>
      )}
      {children}
      {name && (
        <NodeToolbar
         position={Position.Bottom}
         isVisible
         className="max-w-[200px] text-center">
           <p className="font-medium">
             {name}
           </p>
           {description && (
             <p className="text-muted-foreground truncate text-sm">
               {description}
             </p>
           )}
        </NodeToolbar>
      )}
    </>
  )
}