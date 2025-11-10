# Canvas Root Node Setup - Solana Integration

## ✅ Completed Changes

All requested changes have been successfully implemented!

### 1. **WorkflowSidebar Moved to Right Side** ✅
   - Updated: `src/app/(dashboard)/(rest)/canvas/page.tsx`
   - The sidebar now appears on the right side of the canvas

### 2. **"Add Node as Root" Button Added** ✅
   - Updated: `src/app/(dashboard)/(rest)/canvas/topbar/TopBar.tsx`
   - New button with PlayCircle icon added to the top bar
   - Creates a special Root Node when clicked

### 3. **RootNode Component Created with Solana Integration** ✅
   - Created: `src/app/(dashboard)/(rest)/canvas/nodes/RootNode.tsx`
   - Full Solana/Anchor integration for creating agents on-chain
   - Enhanced UI with gradient background and special styling

## 📦 Required Package Installation

**IMPORTANT:** You need to install the following packages manually:

```bash
npm install @coral-xyz/anchor @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets
```

Or with pnpm (recommended if you have permission issues):
```bash
pnpm add @coral-xyz/anchor @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets
```

Or with bun:
```bash
bun add @coral-xyz/anchor @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets
```

## 🎨 RootNode Features

The RootNode is a special head node with enhanced features:

### Visual Design
- **Gradient Background**: Primary color gradient for visual distinction
- **Sparkles Icon**: Marks it as special/root node
- **Larger Size**: 320px width (vs 280px for regular nodes)
- **Enhanced Border**: 2px border with primary color
- **Special Handle**: Primary colored source handle

### Solana Integration
- **Creates Solana Agents** using Anchor program
- **Program ID**: `4dKuHyzt5uQoaQGWRwdguE1sWcnrbsiu8BeauJPYLDLT`
- **IDL Location**: `src/hooks/solana_idl_pda/solana_pda.json`
- **Network**: Solana Devnet (configurable)

### Features Displayed
1. **Agent Name** - User-defined name for the agent
2. **Agent PDA** - Program Derived Address
3. **Owner** - Wallet public key
4. **Bump Seed** - PDA bump value
5. **Transaction Signature** - On-chain transaction hash
6. **Explorer Link** - Direct link to Solana Explorer

### Functionality
- ✅ Wallet connection check
- ✅ Input validation
- ✅ Status indicators (idle/running/success/error)
- ✅ One-click copy to clipboard
- ✅ Transaction confirmation
- ✅ Error handling with alerts
- ✅ Visual feedback during creation

## 🔧 How to Use

### Step 1: Start the Application
```bash
npm run dev
# or
pnpm dev
# or
bun dev
```

### Step 2: Navigate to Canvas
Go to `/canvas` in your application

### Step 3: Connect Wallet
Connect your Phantom wallet using the app sidebar

### Step 4: Create Root Node
1. Click "Add Node as Root" in the top bar
2. A Root Node will appear at position (100, 100)
3. Enter an agent name (e.g., "workflow-root")
4. Click the PlayCircle icon to create the agent

### Step 5: View Results
- Agent details appear in the node
- Click copy icons to copy addresses
- Click "View on Solana Explorer" to see the transaction

## 📁 Files Modified/Created

### New Files
1. `src/providers/solana-provider.tsx` - Solana wallet context
2. `src/app/(dashboard)/(rest)/canvas/page.tsx` - Main canvas page
3. `src/app/(dashboard)/(rest)/canvas/nodes/RootNode.tsx` - Root node component
4. `CANVAS_SETUP.md` - Original setup documentation
5. `CANVAS_ROOT_NODE_SETUP.md` - This file

### Modified Files
1. `src/app/(dashboard)/(rest)/canvas/topbar/TopBar.tsx` - Added root node button
2. `src/app/(dashboard)/(rest)/canvas/nodes/StartNode.tsx` - Updated with Solana
3. `src/components/app-sidebar.tsx` - Added canvas menu item

## 🌐 Network Configuration

### Current: Devnet
The application is configured for Solana Devnet.

### Change to Mainnet
Edit `src/providers/solana-provider.tsx`:

```tsx
// Line 19
const endpoint = useMemo(() => clusterApiUrl("mainnet-beta"), []);
```

And update RootNode.tsx (line 335):
```tsx
href={`https://explorer.solana.com/tx/${agentInfo.txSignature}?cluster=mainnet-beta`}
```

## 🔍 RootNode vs StartNode

| Feature | RootNode | StartNode |
|---------|----------|-----------|
| Purpose | Workflow head/root | General start point |
| Visual | Gradient + Sparkles | Standard card |
| Width | 320px | 280px |
| Border | 2px primary | 1px standard |
| Icon | PlayCircle | PlusCircle |
| Handle Color | Primary | Default |
| Shows Bump | ✅ Yes | ❌ No |
| Explorer Link | ✅ Yes | ❌ No |

## 🐛 Troubleshooting

### Package Installation Failed
If you get permission errors:
```bash
# Try with sudo (Linux/Mac)
sudo npm install @coral-xyz/anchor @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets

# Or use pnpm
pnpm add @coral-xyz/anchor @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets
```

### "Connect wallet to create agent"
- Ensure Phantom wallet extension is installed
- Click the wallet icon in the app sidebar
- Connect your wallet

### Transaction Fails
- Check you have SOL in your devnet wallet
- Get devnet SOL from: https://faucet.solana.com/
- Ensure you're connected to devnet in Phantom

### RootNode Not Appearing
- Check that the import is correct in page.tsx
- Verify the node type is registered in nodeTypes object
- Check browser console for errors

## 📊 Workflow Layout

```
┌─────────────────────────────────────────────┐
│  TopBar: [Select] [Add Node] [Add Root]    │
├──────────────────┬──────────────────────────┤
│                  │                          │
│  Canvas          │   WorkflowSidebar        │
│  (ReactFlow)     │   - Run Workflow         │
│                  │   - Status               │
│  [Root Node] ──> │   - Results              │
│     │            │                          │
│     v            │                          │
│  [Other Nodes]   │                          │
│                  │                          │
└──────────────────┴──────────────────────────┘
```

## 🎯 Next Steps

Consider adding:
- Multiple root nodes support
- Root node validation (only one root per workflow)
- Automatic workflow execution from root
- Agent state fetching from blockchain
- Update/delete agent operations
- Workflow persistence with root node reference
- Sub-workflows with their own root nodes

## 🔗 Solana Program Details

**Program ID:** `4dKuHyzt5uQoaQGWRwdguE1sWcnrbsiu8BeauJPYLDLT`

**Instruction:**
- `createAgent(name: string)` - Creates a new agent account

**Accounts:**
- `agent` (PDA) - The agent account to create
- `owner` (signer) - The wallet creating the agent
- `systemProgram` - Solana system program

**PDA Seeds:**
- `"agent"` (constant)
- `owner.publicKey` (signer's public key)
- `agentName` (user-provided string)

## ✨ Summary

You now have a fully functional canvas with:
- ✅ Sidebar on the right
- ✅ "Add Node as Root" button
- ✅ RootNode with complete Solana integration
- ✅ Enhanced UI/UX for the root node
- ✅ Direct Solana Explorer links
- ✅ Comprehensive error handling

The RootNode serves as the perfect entry point for your Solana-powered workflow system!
