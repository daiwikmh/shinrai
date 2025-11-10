# Canvas Setup - Solana Integration

## Overview
The canvas has been successfully updated to use Solana with Anchor instead of Ethereum. The StartNode now creates Solana agents using the program at address `4dKuHyzt5uQoaQGWRwdguE1sWcnrbsiu8BeauJPYLDLT`.

## Required Package Installations

You need to install the following packages to make the Solana integration work:

```bash
npm install @coral-xyz/anchor @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets
```

Or with pnpm:

```bash
pnpm add @coral-xyz/anchor @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets
```

Or with bun:

```bash
bun add @coral-xyz/anchor @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets
```

## Files Created/Modified

### 1. **src/providers/solana-provider.tsx** (NEW)
   - Solana wallet adapter context provider
   - Configures Phantom wallet
   - Uses Solana devnet (change to mainnet-beta for production)

### 2. **src/app/(dashboard)/(rest)/canvas/page.tsx** (NEW)
   - Main canvas page with ReactFlow setup
   - Includes WorkflowSidebar and TopBar
   - Wrapped with SolanaProvider for wallet functionality
   - Supports all node types: agent, pool, poolwatcher, trigger, start, output, test

### 3. **src/app/(dashboard)/(rest)/canvas/nodes/StartNode.tsx** (UPDATED)
   - Now uses Solana with Anchor
   - Creates agents on Solana blockchain
   - Uses the IDL from `src/hooks/solana_idl_pda/solana_pda.json`
   - Derives PDA for agent accounts
   - Displays agent info including:
     - Agent name
     - Agent PDA address
     - Owner address
     - Transaction signature

### 4. **src/components/app-sidebar.tsx** (UPDATED)
   - Added "canvas" menu item

## How It Works

1. **Connect Wallet**: Users connect their Phantom wallet through the Solana wallet adapter
2. **Create Agent**: In the StartNode, users enter an agent name and click the create button
3. **PDA Derivation**: The node derives a Program Derived Address (PDA) using:
   - "agent" seed
   - Owner's public key
   - Agent name
4. **Transaction**: Creates and sends a transaction to the Solana program
5. **Display Results**: Shows the agent PDA, owner, and transaction signature

## Network Configuration

The current setup uses **Solana Devnet**. To change to mainnet:

Edit `src/providers/solana-provider.tsx`:

```tsx
// Change from devnet to mainnet-beta
const endpoint = useMemo(() => clusterApiUrl("mainnet-beta"), []);
```

## IDL Location

The Anchor IDL is located at: `src/hooks/solana_idl_pda/solana_pda.json`

Program structure:
- Instruction: `createAgent(name: string)`
- Account: `Agent` with fields: `owner`, `name`, `bump`

## Usage

1. Navigate to `/canvas` in your application
2. Connect your Phantom wallet
3. Click "Add Node" and select "Start Node"
4. Enter an agent name in the StartNode
5. Click the plus icon to create the agent on Solana
6. View the created agent's details (PDA, owner, transaction)

## Troubleshooting

- **"Connect wallet to create agent"**: Make sure Phantom wallet is installed and connected
- **Transaction fails**: Check that you have SOL in your wallet for transaction fees
- **Network mismatch**: Ensure your wallet is connected to the same network (devnet/mainnet) as configured in the provider

## Next Steps

Consider adding:
- Error handling with toast notifications instead of alerts
- Transaction confirmation loading states
- Link to Solana Explorer for transaction verification
- Ability to fetch and display existing agents
- Additional agent operations (update, delete, etc.)
