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
  PlayCircle,
  Trash2,
  XCircle,
  Sparkles,
} from "lucide-react";
import { useState, type ReactElement } from "react";
import { useSolana } from "@/components/solana-provider";
import { address, createSolanaRpcSubscriptions, lamports, pipe } from "@solana/kit";
import idl from "@/hooks/solana_idl_pda/solana_pda.json";

const PROGRAM_ID = address("4dKuHyzt5uQoaQGWRwdguE1sWcnrbsiu8BeauJPYLDLT");

type RootNodeData = Node<{
  label: string;
  status: "idle" | "running" | "success" | "error";
}>;

interface AgentInfo {
  agentName: string;
  agentPda: string;
  owner: string;
  txSignature: string;
  bump: number;
}

export function RootNode({ data, id }: NodeProps<RootNodeData>) {
  const { setNodes } = useReactFlow();
  const { rpc, selectedWallet, selectedAccount, isConnected } = useSolana();

  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [agentName, setAgentName] = useState("");

  const statusColor: Record<string, string> = {
    idle: "border-primary",
    running: "border-yellow-400",
    success: "border-green-500",
    error: "border-red-500",
  };

  const statusIcon: Record<string, ReactElement> = {
    idle: <Clock className="w-4 h-4 text-muted-foreground" />,
    running: <Clock className="w-4 h-4 text-yellow-400 animate-spin" />,
    success: <CheckCircle className="w-4 h-4 text-green-500" />,
    error: <XCircle className="w-4 h-4 text-red-500" />,
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

      const ownerAddress = address(selectedAccount.address);

      // Derive PDA for the agent using @solana/kit
      const seeds = [
        new TextEncoder().encode("agent"),
        new TextEncoder().encode(ownerAddress),
        new TextEncoder().encode(agentName.trim()),
      ];

      // For now, we'll use a simplified approach and let you implement the full PDA derivation
      // You'll need to use findProgramDerivedAddress from @solana/kit or implement it

      // This is a placeholder - you need to implement proper PDA derivation with the new kit
      console.log("Creating agent with name:", agentName.trim());
      console.log("Owner:", selectedAccount.address);
      console.log("Program ID:", PROGRAM_ID);

      // Check if wallet supports signAndSendTransaction
      if (!selectedWallet.features.includes("solana:signAndSendTransaction")) {
        throw new Error("Wallet does not support signAndSendTransaction");
      }

      // TODO: Implement transaction creation with @solana/kit
      // You'll need to:
      // 1. Create the transaction instruction
      // 2. Build the transaction
      // 3. Use wallet.signAndSendTransaction feature

      alert("Transaction creation with new kit needs to be implemented. Check console for details.");

      // Temporary success for UI demonstration
      setAgentInfo({
        agentName: agentName.trim(),
        agentPda: "PLACEHOLDER_PDA",
        owner: selectedAccount.address,
        txSignature: "PLACEHOLDER_SIGNATURE",
        bump: 0,
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
      className={`relative w-[320px] shadow-lg border-2 ${statusColor[data.status || "idle"]} bg-gradient-to-br from-primary/5 to-primary/10`}
    >
      <CardHeader className="flex justify-between items-center text-sm font-semibold pb-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-lg font-bold text-primary">{data.label}</span>
          </div>
          {statusIcon[data.status || "idle"]}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() =>
              setNodes((nodes) => nodes.filter((node) => node.id !== id))
            }
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-destructive/10 transition-colors"
            title="Remove Node"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </button>
          {!agentInfo && (
            <button
              onClick={handleCreateAgent}
              disabled={isCreating || !isConnected}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary/10 transition-colors disabled:opacity-50"
              title={!isConnected ? "Connect wallet first" : "Create Solana Agent"}
            >
              {isCreating ? (
                <Clock className="w-5 h-5 text-primary animate-spin" />
              ) : (
                <PlayCircle className="w-5 h-5 text-primary" />
              )}
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {!agentInfo ? (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground font-medium">
              Initialize Root Agent
            </div>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Agent name (e.g. workflow-root)"
              className="w-full px-3 py-2 text-sm border-2 rounded-lg bg-background focus:border-primary transition-colors"
              disabled={isCreating}
            />
            {!isConnected && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10">
                <XCircle className="w-4 h-4 text-destructive" />
                <p className="text-xs text-destructive font-medium">
                  Connect wallet to create agent
                </p>
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              This will be the root node of your workflow on Solana
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-success/10">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-xs text-success font-medium">
                Root Agent Created Successfully
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground font-medium">Agent Name:</span>
                </div>
                <div className="font-mono text-xs bg-muted p-2 rounded-lg border font-semibold">
                  {agentInfo.agentName}
                </div>
              </div>

              <div className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground font-medium">Agent PDA:</span>
                  <button
                    onClick={() => copyToClipboard(agentInfo.agentPda)}
                    className="p-1 hover:bg-accent rounded"
                    title="Copy PDA address"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <div className="font-mono text-xs bg-muted p-2 rounded-lg border">
                  {truncateAddress(agentInfo.agentPda)}
                </div>
              </div>

              <div className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground font-medium">Owner:</span>
                  <button
                    onClick={() => copyToClipboard(agentInfo.owner)}
                    className="p-1 hover:bg-accent rounded"
                    title="Copy owner address"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <div className="font-mono text-xs bg-muted p-2 rounded-lg border">
                  {truncateAddress(agentInfo.owner)}
                </div>
              </div>

              <div className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground font-medium">Bump Seed:</span>
                </div>
                <div className="font-mono text-xs bg-muted p-2 rounded-lg border">
                  {agentInfo.bump}
                </div>
              </div>

              <div className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground font-medium">Transaction:</span>
                  <button
                    onClick={() => copyToClipboard(agentInfo.txSignature)}
                    className="p-1 hover:bg-accent rounded"
                    title="Copy transaction signature"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <div className="font-mono text-xs bg-muted p-2 rounded-lg border">
                  {truncateAddress(agentInfo.txSignature)}
                </div>
              </div>

              <a
                href={`https://explorer.solana.com/tx/${agentInfo.txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center text-xs py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                View on Solana Explorer
              </a>
            </div>
          </>
        )}
      </CardContent>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-primary !w-3 !h-3"
      />
    </Card>
  );
}
