# Sui Blockchain Tools for Vercel AI SDK

This directory contains Vercel AI SDK-compatible tools for interacting with the Sui blockchain. These tools enable AI agents to execute transactions and query blockchain data.

## Overview

The tools are designed to work with workflow executors that have access to a **signer/keypair** (similar to the Walrus executor pattern). All transaction tools require a `signerPrivateKey` parameter.

## Available Tools

### Transaction Tools (`sui-transaction.ts`)

#### 1. `transferObjectsTool`
Transfer SUI coins or objects to a recipient.

**Parameters:**
- `recipient` (string): Recipient Sui address
- `amount` (number, optional): Amount in MIST (1 SUI = 1,000,000,000 MIST)
- `objectIds` (string[], optional): Object IDs to transfer
- `signerPrivateKey` (string): Signer's private key

**Example:**
```typescript
await transferObjectsTool.execute({
  recipient: '0x742d35cc6634c0532925a3b844bc9e7202e0b3e3',
  amount: 1_000_000_000, // 1 SUI
  signerPrivateKey: workflow.privateKey,
});
```

#### 2. `splitCoinsTool`
Split a coin into multiple smaller coins.

**Parameters:**
- `amounts` (number[]): Array of amounts in MIST
- `sourceObject` (string, optional): Source coin object ID
- `signerPrivateKey` (string): Signer's private key

**Example:**
```typescript
await splitCoinsTool.execute({
  amounts: [100_000_000, 200_000_000, 300_000_000],
  signerPrivateKey: workflow.privateKey,
});
```

#### 3. `mergeCoinsTool`
Merge multiple coins into one.

**Parameters:**
- `destinationCoin` (string): Destination coin object ID
- `sourceCoins` (string[]): Source coin object IDs
- `signerPrivateKey` (string): Signer's private key

#### 4. `moveCallTool`
Execute a Move function on Sui.

**Parameters:**
- `target` (string): Function target (package::module::function)
- `arguments` (any[], optional): Function arguments
- `typeArguments` (string[], optional): Type arguments
- `signerPrivateKey` (string): Signer's private key

**Example:**
```typescript
await moveCallTool.execute({
  target: '0x2::coin::transfer',
  arguments: ['0xobjectid', '0xrecipient'],
  signerPrivateKey: workflow.privateKey,
});
```

#### 5. `batchTransferTool`
Transfer to multiple recipients in one transaction.

**Parameters:**
- `transfers` (array): Array of `{ to: string, amount: number }`
- `signerPrivateKey` (string): Signer's private key

**Example:**
```typescript
await batchTransferTool.execute({
  transfers: [
    { to: '0xaddr1', amount: 1_000_000 },
    { to: '0xaddr2', amount: 2_000_000 },
  ],
  signerPrivateKey: workflow.privateKey,
});
```

#### 6. `getTransactionTool`
Get transaction details by digest.

**Parameters:**
- `digest` (string): Transaction digest

---

### GraphQL Query Tools (`sui-graphql.ts`)

#### 1. `queryAddressTool`
Query address information including balance and objects.

**Parameters:**
- `address` (string): Sui address to query

**Example:**
```typescript
const result = await queryAddressTool.execute({
  address: '0x742d35cc6634c0532925a3b844bc9e7202e0b3e3',
});
```

#### 2. `queryObjectTool`
Get object details by object ID.

**Parameters:**
- `objectId` (string): Object ID

#### 3. `queryTransactionTool`
Get transaction details by digest (using GraphQL).

**Parameters:**
- `digest` (string): Transaction digest

#### 4. `queryCoinBalanceTool`
Query coin balance for a specific coin type.

**Parameters:**
- `address` (string): Sui address
- `coinType` (string, optional): Coin type (defaults to SUI)

**Example:**
```typescript
const balance = await queryCoinBalanceTool.execute({
  address: '0x742d35cc6634c0532925a3b844bc9e7202e0b3e3',
  coinType: '0x8270feb7375eee355e64fdb69c50abb6b5f9393a722883c1cf45f8e26048810a::wal::WAL',
});
```

#### 5. `queryEventsTool`
Query blockchain events.

**Parameters:**
- `eventType` (string, optional): Event type filter
- `sender` (string, optional): Sender address filter
- `limit` (number, optional): Max results (default: 10)

#### 6. `getChainIdentifierTool`
Get the Sui network chain identifier.

#### 7. `customGraphQLQueryTool`
Execute a custom GraphQL query.

**Parameters:**
- `query` (string): GraphQL query string
- `variables` (object, optional): Query variables

---

## Usage in Workflow Executors

### Basic Example

```typescript
import { allSuiTools } from './tools';
import { generateText } from 'ai';

// In your executor
const workflow = await prisma.workflow.findUnique({
  where: { id: workflowId },
});

const result = await generateText({
  model: anthropic('claude-3-5-sonnet-20241022'),
  tools: allSuiTools,
  prompt: 'Transfer 1 SUI to 0x742d35cc6634c0532925a3b844bc9e7202e0b3e3',
  // Pass the signer private key to tools that need it
  toolContext: {
    signerPrivateKey: workflow.privateKey,
  },
});
```

### With Specific Tools

```typescript
import { transferObjectsTool, queryCoinBalanceTool } from './tools';

const tools = {
  transfer: transferObjectsTool,
  checkBalance: queryCoinBalanceTool,
};

const result = await generateText({
  model: anthropic('claude-3-5-sonnet-20241022'),
  tools,
  prompt: 'Check my balance and transfer 0.5 SUI to Alice',
});
```

## Signer Pattern

All transaction tools follow the same pattern as the Walrus executor:

```typescript
// 1. Get workflow from database
const workflow = await prisma.workflow.findUnique({
  where: { id: workflowId },
});

// 2. Reconstruct signer from private key
const signer = Ed25519Keypair.fromSecretKey(workflow.privateKey);

// 3. Execute transaction
const tx = new Transaction();
// ... build transaction ...

const result = await client.signAndExecuteTransaction({
  signer,
  transaction: tx,
});
```

## Configuration

### Sui Client
Tools use the client from `@/config/connect.tsx`:
```typescript
export const client = new SuiJsonRpcClient({
  url: getFullnodeUrl('testnet'),
  network: 'testnet',
});
```

### GraphQL Client
GraphQL tools connect to Sui testnet:
```typescript
const gqlClient = new SuiGraphQLClient({
  url: 'https://sui-testnet.mystenlabs.com/graphql',
});
```

## Error Handling

All tools return a result object with `success` field:

```typescript
{
  success: true,
  digest: '...',
  // ... other data
}

// Or on error:
{
  success: false,
  error: 'Error message'
}
```

## Security Notes

- **Private Keys**: Never log or expose private keys
- **Testnet Only**: These tools are configured for Sui testnet
- **Validation**: Tools validate inputs with Zod schemas
- **Non-Retriable**: Use `NonRetriableError` for permanent failures

## Resources

- [Sui TypeScript SDK - Transactions](https://sdk.mystenlabs.com/typescript/transaction-building/basics)
- [Sui TypeScript SDK - GraphQL](https://sdk.mystenlabs.com/typescript/graphql)
- [Vercel AI SDK - Tools](https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling)
- [Sui Documentation](https://docs.sui.io)

## Examples

### Transfer with Balance Check

```typescript
// 1. Check balance
const balanceResult = await queryCoinBalanceTool.execute({
  address: workflow.address,
});

// 2. Transfer if sufficient
if (balanceResult.success && balanceResult.data.balance.totalBalance > 1_000_000_000) {
  await transferObjectsTool.execute({
    recipient: '0xrecipient',
    amount: 1_000_000_000,
    signerPrivateKey: workflow.privateKey,
  });
}
```

### Multi-Step Transaction

```typescript
// 1. Split coins
await splitCoinsTool.execute({
  amounts: [500_000_000, 500_000_000],
  signerPrivateKey: workflow.privateKey,
});

// 2. Batch transfer
await batchTransferTool.execute({
  transfers: [
    { to: '0xalice', amount: 500_000_000 },
    { to: '0xbob', amount: 500_000_000 },
  ],
  signerPrivateKey: workflow.privateKey,
});
```
