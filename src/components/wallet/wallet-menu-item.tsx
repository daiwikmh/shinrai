"use client";

import Image from "next/image";

type WalletMenuItemProps = {
  wallet: {
    name: string;
    icon?: string;
  };
  onConnect: (wallet: { name: string; icon?: string }) => void;
};

export function WalletMenuItem({ wallet, onConnect }: WalletMenuItemProps) {
  return (
    <button
      onClick={() => onConnect(wallet)}
      className="flex items-center px-4 py-2 text-sm hover:bg-accent w-full"
    >
      {wallet.icon && (
        <div className="mr-2 h-5 w-5 relative">
          <Image
            src={wallet.icon}
            alt={wallet.name}
            fill
            className="object-contain"
          />
        </div>
      )}
      <span>{wallet.name}</span>
    </button>
  );
}
