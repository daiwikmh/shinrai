"use client";

import { useCallback, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  type Connection,
  type Edge,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { AgentNode } from "./nodes/AgentNode";
import { PoolNode } from "./nodes/PoolNode";
import { PoolWatcherNode } from "./nodes/PoolWatcherNode";
import { TriggerNode } from "./nodes/TriggerNode";
import { StartNode } from "./nodes/StartNode";
import { OutputNode } from "./nodes/OutputNode";
import { TestNode } from "./nodes/TestNode";

import { TopBar } from "./topbar/TopBar";
import { WorkflowSidebar } from "./sidebar/WorkflowSidebar";
import { SolanaProvider } from "@/providers/solana-provider";

const nodeTypes = {
  agent: AgentNode,
  pool: PoolNode,
  poolwatcher: PoolWatcherNode,
  trigger: TriggerNode,
  start: StartNode,
  output: OutputNode,
  test: TestNode,
};

function CanvasFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);
  const [workflowResults, setWorkflowResults] = useState<Record<string, unknown>>({});

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleAddNode = (type: string) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
        status: "idle" as const,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleRunWorkflow = async () => {
    setIsWorkflowRunning(true);
    setWorkflowResults({});

    // Simulate workflow execution
    // In a real implementation, you would execute nodes in topological order
    for (const node of nodes) {
      // Update node status to running
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id ? { ...n, data: { ...n.data, status: "running" } } : n
        )
      );

      // Simulate async work
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update node status to success and store result
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id ? { ...n, data: { ...n.data, status: "success" } } : n
        )
      );

      setWorkflowResults((prev) => ({
        ...prev,
        [node.id]: {
          nodeId: node.id,
          type: node.type,
          result: "Executed successfully",
          timestamp: new Date().toISOString(),
        },
      }));
    }

    setIsWorkflowRunning(false);
  };

  return (
    <div className="flex h-screen w-full">
      <WorkflowSidebar
        isWorkflowRunning={isWorkflowRunning}
        workflowResults={workflowResults}
        onRunWorkflow={handleRunWorkflow}
      />
      <div className="flex-1 flex flex-col">
        <TopBar onAddNode={handleAddNode} />
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-muted"
          >
            <Background variant={BackgroundVariant.Dots} />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default function CanvasPage() {
  return (
    <SolanaProvider>
      <ReactFlowProvider>
        <CanvasFlow />
      </ReactFlowProvider>
    </SolanaProvider>
  );
}
