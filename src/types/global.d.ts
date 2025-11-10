// types/global.d.ts
export {};

declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom?: boolean;
        connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>;
        disconnect: () => Promise<void>;
        publicKey?: any;
        signTransaction: (tx: any) => Promise<any>;
        signAllTransactions?: (txs: any[]) => Promise<any[]>;
      };
    };
  }
}
