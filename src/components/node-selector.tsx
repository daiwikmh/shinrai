"use client";

import { createId } from "@paralleldrive/cuid2"
import { useReactFlow } from "@xyflow/react";
import {
  SquareMousePointerIcon,
  DatabaseIcon,
  Globe2Icon,
  UploadCloudIcon,
  BotIcon,
  MessageCircleIcon
} from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { NodeType } from "@/generated/prisma/enums";
import { Separator } from "./ui/separator";
import Image from "next/image";

export type NodeTypeOption = {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }> | string;
}

const triggerNodes: NodeTypeOption[] = [
  {
    type: NodeType.MANUAL_TRIGGER,
    label: "Manual Trigger",
    description: "Runs the flow on clicking a button. Good for getting started quickly",
    icon: SquareMousePointerIcon
  },
  {
    type: NodeType.GOOGLE_FORM_TRIGGER,
    label: "Google Form Trigger",
    description: "Runs the flow when a Google Form is submitted",
    icon: "/logo/googleform.png"
  },
  {
    type: NodeType.TELEGRAM_TRIGGER,
    label: "Telegram Trigger",
    description: "Runs the flow when a Telegram message is received",
    icon: "/logo/telegram.png"
  }
]

const executionNodes: NodeTypeOption[] = [
  {
    type: NodeType.HTTP_REQUEST,
    label: "Http Request",
    description: "Makes an http request",
    icon: Globe2Icon
  },
  {
    type: NodeType.OPENROUTER_NODE,
    label: "OpenRouter Node",
    description: "Makes an request to OpenRouter api for llm chat",
    icon: "/logo/openrouter.png"
  },
  {
    type: NodeType.OPEN_AGENT_NODE,
    label: "OpenAgent Node",
    description: "Makes an request to OpenRouter api for llm with vercel agent and tools",
    icon: "/logo/agent.png"
  },
  {
    type: NodeType.FILE_UPLOAD,
    label: "File Upload",
    description: "Uploads a file to a storage service",
    icon: UploadCloudIcon
  }
]

const walrusNodes: NodeTypeOption[] = [
  {
    type: NodeType.WALRUS_NODE_STORAGE,
    label: "Walrus Storage",
    description: "Upload and store files on Walrus decentralized storage network",
    icon: DatabaseIcon
  }
]

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function NodeSelector({
  open,
  onOpenChange,
  children
}: NodeSelectorProps) {
  const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();
  
  const handleNodeSelect = useCallback((selection: NodeTypeOption) => {
    if (selection.type === NodeType.MANUAL_TRIGGER){
      const nodes = getNodes();
      const hasManualTrigger = nodes.some((node) => node.type === NodeType.MANUAL_TRIGGER)
      
      if(hasManualTrigger){
        toast.error("Only one manual trigger is allowed per workflow.")
        return;
      }
    }
    setNodes((nodes) => {
      const hasInitialTrigger = nodes.some((node) => node.type === NodeType.INITIAL);
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const flowPosition = screenToFlowPosition({
        x: centerX + (Math.random() - 0.5) * 200,
        y: centerY + (Math.random() - 0.5) * 200
      });
      const newNode = {
        id: createId(),
        data: {},
        position: flowPosition,
        type: selection.type
      };
      if (hasInitialTrigger) {
        return [newNode];
      }
      
      return [...nodes, newNode];
    });
    
    onOpenChange(false);
  }, [setNodes, getNodes, screenToFlowPosition, onOpenChange]);

  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Select Node</SheetTitle>
          <SheetDescription>
            Choose a node type to add to your flow.
          </SheetDescription>
        </SheetHeader>
        <div>
          <div className="w-full mx-2">
            <h3 className="text-sm text-muted-foreground font-bold">Trigger Nodes</h3>
          </div>
          {triggerNodes.map((nodeType) => {
            const Icon = nodeType.icon;
            return (
              <div key={nodeType.type} className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                onClick={() => handleNodeSelect(nodeType)}>
                <div className="flex items-center gap-6 w-full overflow-hidden">
                  {typeof Icon === "string" ? (
                    <Image 
                    src={Icon} 
                    alt={nodeType.label} 
                    width={500}
                    height={500}
                    className="size-7 object-contain rounded-sm" 
                    />)
                    : (<Icon className="size-5" />
                    )}
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium text-sm">
                      {nodeType.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {nodeType.description}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Separator/>
        <div>
          <div className="w-full mx-2">
            <h3 className="text-sm text-muted-foreground font-bold">Execution Nodes</h3>
          </div>
          {executionNodes.map((nodeType) => {
            const Icon = nodeType.icon;
            return (
              <div key={nodeType.type} className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                onClick={() => handleNodeSelect(nodeType)}>
                <div className="flex items-center gap-6 w-full overflow-hidden">
                  {typeof Icon === "string" ? (
                    <Image 
                    src={Icon} 
                    alt={nodeType.label} 
                    width={500}
                    height={500}
                    className="size-5 object-contain rounded-sm" 
                    />)
                    : (<Icon className="size-5" />
                    )}
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium text-sm">
                      {nodeType.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {nodeType.description}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Separator/>
        <div>
          <div className="w-full mx-2">
            <h3 className="text-sm text-muted-foreground font-bold">Walrus</h3>
          </div>
          {walrusNodes.map((nodeType) => {
            const Icon = nodeType.icon;
            return (
              <div key={nodeType.type} className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                onClick={() => handleNodeSelect(nodeType)}>
                <div className="flex items-center gap-6 w-full overflow-hidden">
                  {typeof Icon === "string" ? (
                    <Image
                    src={Icon}
                    alt={nodeType.label}
                    className="size-5 object-contain rounded-sm"
                    />)
                    : (<Icon className="size-5" />
                    )}
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium text-sm">
                      {nodeType.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {nodeType.description}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </SheetContent>
    </Sheet>
  )
}