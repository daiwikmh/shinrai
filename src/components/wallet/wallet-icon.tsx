"use client";

import { WalletStandardAdapterProvider } from "@mysten/wallet-standard";
import Image from "next/image";
import { WalletIcon } from "lucide-react";

interface WalletIconComponentProps {
  wallet: WalletStandardAdapterProvider;
  className?: string;
}

export function WalletIconComponent({ wallet, className = "h-6 w-6" }: WalletIconComponentProps) {
  if (wallet.icon) {
    return (
      <div className={`relative ${className}`}>
        <Image
          src={wallet.icon}
          alt={wallet.name}
          fill
          className="object-contain"
        />
      </div>
    );
  }

  return <WalletIcon className={className} />;
}
