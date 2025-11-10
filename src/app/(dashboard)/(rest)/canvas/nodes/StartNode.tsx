"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Handle,
  Position,
  useReactFlow,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import {
  CheckCircle,
  Clock,
  Copy,
  PlusCircle,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState, type ReactElement } from "react";
import { useSolana } from "@/components/solana-provider";
import { address } from "@solana/kit";
import idl from "@/hooks/solana_idl_pda/solana_pda.json";

const PROGRAM_ID = address("4dKuHyzt5uQoaQGWRwdguE1sWcnrbsiu8BeauJPYLDLT");

type StartNodeData = Node<{
  label: string;
  status: "idle" | "running" | "success" | "error";
}>;

interface AgentInfo {
  agentName: string;
  agentPda: string;
  owner: string;
  txSignature: string;
}

export function StartNode({ data, id }: NodeProps<StartNodeData>) {
  const { setNodes } = useReactFlow();
  const { rpc, selectedWallet, selectedAccount, isConnected } = useSolana();

  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [agentName, setAgentName] = useState("");

  const statusColor: Record<string, string> = {
    idle: "border-green-300",
    running: "border-yellow-400",
    success: "border-green-500",
    error: "border-red-500",
  };

  const statusIcon: Record<string, ReactElement> = {
    idle: <Clock className="w-3 h-3 text-gray-400" />,
    running: <Clock className="w-3 h-3 text-yellow-400 animate-spin" />,
    success: <CheckCircle className="w-3 h-3 text-green-500" />,
    error: <XCircle className="w-3 h-3 text-red-500" />,
  };

  const handleCreateAgent = async () => {
    if (!isConnected || !selectedWallet || !selectedAccount) {
      alert("Please connect your wallet first");
      return;
    }

    if (!agentName.trim()) {
      alert("Please enter an agent name");
      return;
    }

    setIsCreating(true);

    try {
      // Update node status to running
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, status: "running" } } : n
        )
      );

      console.log("Creating agent with name:", agentName.trim());
      console.log("Owner:", selectedAccount.address);
      console.log("Program ID:", PROGRAM_ID);

      // Check if wallet supports signAndSendTransaction
      if (!selectedWallet.features.includes("solana:signAndSendTransaction")) {
        throw new Error("Wallet does not support signAndSendTransaction");
      }

      // TODO: Implement transaction creation with @solana/kit
      alert("Transaction creation with new kit needs to be implemented. Check console for details.");

      // Temporary success for UI demonstration
      setAgentInfo({
        agentName: agentName.trim(),
        agentPda: "PLACEHOLDER_PDA",
        owner: selectedAccount.address,
        txSignature: "PLACEHOLDER_SIGNATURE",
      });

      // Update node status to success
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, status: "success" } } : n
        )
      );
    } catch (error: any) {
      console.error("Failed to create agent:", error);
      alert(`Failed to create agent: ${error.message || "Unknown error"}`);

      // Update node status to error
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, status: "error" } } : n
        )
      );
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card
      className={`relative w-[280px] shadow-md border ${statusColor[data.status || "idle"]}`}
    >
      <CardHeader className="flex justify-between items-center text-sm font-semibold pb-2">
        <div className="flex items-center justify-between w-full">
          <span>{data.label}</span>
          {statusIcon[data.status || "idle"]}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() =>
              setNodes((nodes) => nodes.filter((node) => node.id !== id))
            }
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 transition-colors"
            title="Remove Node"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
          {!agentInfo && (
            <button
              onClick={handleCreateAgent}
              disabled={isCreating || !isConnected}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-100 transition-colors disabled:opacity-50"
              title={!isConnected ? "Connect wallet first" : "Create Solana Agent"}
            >
              {isCreating ? (
                <Clock className="w-4 h-4 text-blue-600 animate-spin" />
              ) : (
                <PlusCircle className="w-4 h-4 text-blue-600" />
              )}
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-2">
        {!agentInfo ? (
          <div className="space-y-2">
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Agent name (e.g. trading-bot)"
              className="w-full px-2 py-1 text-xs border rounded bg-background"
              disabled={isCreating}
            />
            {!isConnected && (
              <p className="text-xs text-destructive">
                Connect wallet to create agent
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-muted-foreground">Agent Name:</span>
              </div>
              <div className="font-mono text-xs bg-muted p-1 rounded border">
                {agentInfo.agentName}
              </div>
            </div>

            <div className="text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-muted-foreground">Agent PDA:</span>
                <button
                  onClick={() => copyToClipboard(agentInfo.agentPda)}
                  className="p-1 hover:bg-accent rounded"
                  title="Copy PDA address"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="font-mono text-xs bg-muted p-1 rounded border">
                {truncateAddress(agentInfo.agentPda)}
              </div>
            </div>

            <div className="text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-muted-foreground">Owner:</span>
                <button
                  onClick={() => copyToClipboard(agentInfo.owner)}
                  className="p-1 hover:bg-accent rounded"
                  title="Copy owner address"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="font-mono text-xs bg-muted p-1 rounded border">
                {truncateAddress(agentInfo.owner)}
              </div>
            </div>

            <div className="text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-muted-foreground">Transaction:</span>
                <button
                  onClick={() => copyToClipboard(agentInfo.txSignature)}
                  className="p-1 hover:bg-accent rounded"
                  title="Copy transaction signature"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="font-mono text-xs bg-muted p-1 rounded border">
                {truncateAddress(agentInfo.txSignature)}
              </div>
            </div>
          </>
        )}
      </CardContent>
      <Handle type="source" position={Position.Right} />
    </Card>
  );
}
