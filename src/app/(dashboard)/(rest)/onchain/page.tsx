"use client";

import { useState } from "react";
import { PublicKey, VersionedTransaction, Connection } from "@solana/web3.js";
import { createPaymentHandler } from "@faremeter/payment-solana/exact";
import { wrap as wrapFetch } from "@faremeter/fetch";
import { lookupKnownSPLToken } from "@faremeter/info/solana";

export default function SolanaPayment() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function connectAndPay() {
    setLoading(true);
    try {
      if (!window.phantom?.solana) {
        throw new Error("Phantom wallet not installed");
      }

      const phantom = window.phantom.solana;
      await phantom.connect();

      const network = "mainnet-beta";
      const connection = new Connection("https://api.mainnet-beta.solana.com");

      const usdcInfo = lookupKnownSPLToken(network, "USDC");
      if (!usdcInfo) {
        throw new Error(`Couldn't look up USDC on ${network}`);
      }
      const usdcMint = new PublicKey(usdcInfo.address);

      const wallet = {
        network,
        publicKey: phantom.publicKey,
        updateTransaction: async (tx: VersionedTransaction) => {
          const signedTx = await phantom.signTransaction(tx);
          return signedTx;
        },
      };

      const handler = createPaymentHandler(wallet, usdcMint, connection);
      const fetchWithPayer = wrapFetch(fetch, {
        handlers: [handler],
      });

      const response = await fetchWithPayer("https://api.devnet.solana.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getBlockHeight",
        }),
      });
      const data = await response.json();

      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Solana Payment with Phantom</h1>
      <button onClick={connectAndPay} disabled={loading}>
        {loading ? "Processing..." : "Connect & Pay"}
      </button>
      {result && <pre>{result}</pre>}
    </div>
  );
}