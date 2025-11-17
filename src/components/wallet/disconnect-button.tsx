"use client";

import { WalletStandardAdapterProvider } from "@mysten/wallet-standard";
import { LogOutIcon } from "lucide-react";

interface DisconnectButtonProps {
  wallet: WalletStandardAdapterProvider;
  onDisconnect: () => void;
}

export function DisconnectButton({ wallet, onDisconnect }: DisconnectButtonProps) {
  return (
    <button
      onClick={onDisconnect}
      className="flex items-center px-4 py-2 text-sm hover:bg-accent text-destructive w-full"
    >
      <LogOutIcon className="mr-2 h-4 w-4" />
      Disconnect {wallet.name}
    </button>
  );
}
