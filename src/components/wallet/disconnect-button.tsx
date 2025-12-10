"use client";

import { useCurrentWallet, useDisconnectWallet } from "@mysten/dapp-kit";
import { LogOutIcon } from "lucide-react";

export function DisconnectButton() {
  const { currentWallet } = useCurrentWallet();
  const { mutate: disconnect } = useDisconnectWallet();

  return (
    <button
      onClick={() => disconnect()}
      className="flex items-center px-4 py-2 text-sm hover:bg-accent text-destructive w-full"
    >
      <LogOutIcon className="mr-2 h-4 w-4" />
      Disconnect {currentWallet?.name ?? ""}
    </button>
  );
}
