import { tool } from 'ai';
import { z } from 'zod';
import { Transaction } from '@mysten/sui/transactions';
import { client } from '@/config/connect';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

/**
 * Transfer SUI or objects to a recipient address
 */
export const transferObjectsTool = tool({
  description: 'Transfer SUI coins or objects to a recipient address on Sui blockchain',
  parameters: z.object({
    recipient: z.string().describe('The recipient Sui address (0x...)'),
    amount: z.number().optional().describe('Amount of SUI to transfer (in MIST, 1 SUI = 1_000_000_000 MIST)'),
    objectIds: z.array(z.string()).optional().describe('Array of object IDs to transfer'),
    signerPrivateKey: z.string().describe('The private key of the signer (workflow wallet)'),
  }),
  execute: async ({ recipient, amount, objectIds, signerPrivateKey }) => {
    try {
      const signer = Ed25519Keypair.fromSecretKey(signerPrivateKey);
      const tx = new Transaction();

      if (amount) {
        // Transfer SUI coins
        const [coin] = tx.splitCoins(tx.gas, [amount]);
        tx.transferObjects([coin], recipient);
      } else if (objectIds && objectIds.length > 0) {
        // Transfer specific objects
        const objects = objectIds.map((id : any)  => tx.object(id));
        tx.transferObjects(objects, recipient);
      } else {
        throw new Error('Either amount or objectIds must be provided');
      }

      const result = await client.signAndExecuteTransaction({
        signer,
        transaction: tx,
      });

      return {
        success: true,
        digest: result.digest,
        recipient,
        amount,
        objectIds,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

/**
 * Split coins into multiple smaller coins
 */
export const splitCoinsTool = tool({
  description: 'Split a coin into multiple smaller coins with specified amounts',
  parameters: z.object({
    amounts: z.array(z.number()).describe('Array of amounts to split (in MIST)'),
    sourceObject: z.string().optional().describe('Source coin object ID (defaults to gas coin)'),
    signerPrivateKey: z.string().describe('The private key of the signer'),
  }),
  execute: async ({ amounts, sourceObject, signerPrivateKey }) => {
    try {
      const signer = Ed25519Keypair.fromSecretKey(signerPrivateKey);
      const tx = new Transaction();

      const source = sourceObject ? tx.object(sourceObject) : tx.gas;
      const coins = tx.splitCoins(source, amounts);

      const result = await client.signAndExecuteTransaction({
        signer,
        transaction: tx,
      });

      return {
        success: true,
        digest: result.digest,
        amounts,
        sourceObject,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

/**
 * Merge multiple coins into one
 */
export const mergeCoinsTool = tool({
  description: 'Merge multiple coins into a single destination coin',
  parameters: z.object({
    destinationCoin: z.string().describe('The destination coin object ID'),
    sourceCoins: z.array(z.string()).describe('Array of source coin object IDs to merge'),
    signerPrivateKey: z.string().describe('The private key of the signer'),
  }),
  execute: async ({ destinationCoin, sourceCoins, signerPrivateKey }) => {
    try {
      const signer = Ed25519Keypair.fromSecretKey(signerPrivateKey);
      const tx = new Transaction();

      const destination = tx.object(destinationCoin);
      const sources = sourceCoins.map(id => tx.object(id));

      tx.mergeCoins(destination, sources);

      const result = await client.signAndExecuteTransaction({
        signer,
        transaction: tx,
      });

      return {
        success: true,
        digest: result.digest,
        destinationCoin,
        sourceCoins,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

/**
 * Call a Move function on the Sui blockchain
 */
export const moveCallTool = tool({
  description: 'Execute a Move function call on the Sui blockchain',
  parameters: z.object({
    target: z.string().describe('The Move function target (package::module::function)'),
    arguments: z.array(z.union([z.string(), z.number(), z.boolean()])).optional().describe('Array of arguments for the function (strings, numbers, or booleans)'),
    typeArguments: z.array(z.string()).optional().describe('Array of type arguments'),
    signerPrivateKey: z.string().describe('The private key of the signer'),
  }),
  execute: async ({ target, arguments: args, typeArguments, signerPrivateKey }) => {
    try {
      const signer = Ed25519Keypair.fromSecretKey(signerPrivateKey);
      const tx = new Transaction();

      tx.moveCall({
        target,
        arguments: args?.map(arg => {
          if (typeof arg === 'string' && arg.startsWith('0x')) {
            return tx.object(arg);
          }
          return tx.pure(arg);
        }) || [],
        typeArguments: typeArguments || [],
      });

      const result = await client.signAndExecuteTransaction({
        signer,
        transaction: tx,
      });

      return {
        success: true,
        digest: result.digest,
        target,
        arguments: args,
        typeArguments,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

/**
 * Batch transfer to multiple recipients
 */
export const batchTransferTool = tool({
  description: 'Transfer SUI to multiple recipients in a single transaction',
  parameters: z.object({
    transfers: z.array(
      z.object({
        to: z.string().describe('Recipient address'),
        amount: z.number().describe('Amount in MIST'),
      })
    ).describe('Array of transfers to execute'),
    signerPrivateKey: z.string().describe('The private key of the signer'),
  }),
  execute: async ({ transfers, signerPrivateKey }) => {
    try {
      const signer = Ed25519Keypair.fromSecretKey(signerPrivateKey);
      const tx = new Transaction();

      // Split coins for all transfers
      const coins = tx.splitCoins(
        tx.gas,
        transfers.map(t => t.amount)
      );

      // Transfer each coin to its recipient
      transfers.forEach((transfer, index) => {
        tx.transferObjects([coins[index]], transfer.to);
      });

      const result = await client.signAndExecuteTransaction({
        signer,
        transaction: tx,
      });

      return {
        success: true,
        digest: result.digest,
        transferCount: transfers.length,
        transfers,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

/**
 * Get transaction details
 */
export const getTransactionTool = tool({
  description: 'Get details of a transaction by its digest',
  parameters: z.object({
    digest: z.string().describe('The transaction digest'),
  }),
  execute: async ({ digest }) => {
    try {
      const txDetails = await client.getTransactionBlock({
        digest,
        options: {
          showEffects: true,
          showInput: true,
          showEvents: true,
          showObjectChanges: true,
          showBalanceChanges: true,
        },
      });

      return {
        success: true,
        transaction: txDetails,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
