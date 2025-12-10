# Shinrai - Crypto Workflow Canvas on Walrus

> A decentralized platform for crypto experimentation, trading, and data visualization powered by Walrus storage and Telegram automation.

## Overview

Shinrai is an innovative **canvas-based platform** that enables users to experiment with crypto markets, visualize data, and automate workflows through Telegram bots - all backed by **Walrus decentralized storage**. Build custom workflows visually, connect them to Telegram, and run queries without touching the app interface.

### Why Walrus?

**Walrus** is a decentralized storage network built on Sui blockchain that provides:
- **High Availability**: Files are encoded with erasure coding and distributed across storage nodes
- **Permanent Storage**: Data stored for configurable epochs (1 epoch ≈ 24 hours on testnet)
- **Trustless & Censorship-Resistant**: No central authority controls your data
- **Cost-Effective**: Pay only for storage epochs you need with WAL tokens
- **Sui Integration**: Seamless blockchain-based file registration and certification

In Shinrai, we use Walrus to:
- **Store Telegram files permanently** - Images, documents, videos sent to your bot are uploaded to Walrus
- **Decentralize workflow data** - Your workflow outputs and artifacts live on a distributed network
- **Enable public accessibility** - Files get unique blob IDs accessible via aggregator URLs
- **Ensure data integrity** - Cryptographic verification of stored files

## Key Features

### 🎨 Visual Workflow Canvas
- Drag-and-drop workflow builder
- Connect nodes to create complex automation
- Real-time execution visualization
- Support for multiple workflow types

### 📊 Crypto Data Visualization
- **Trades**: Real-time and historical trade data
- **Chains**: Cross-chain analytics and monitoring
- **Markets**: Market depth, order books, price charts
- **News**: Aggregated crypto news feeds
- **Sentiments**: Social sentiment analysis

### 🤖 Telegram Bot Integration
- Create workflows that respond to Telegram messages
- Process files (images, documents, videos) sent to your bot
- Run custom queries via Telegram - no app UI needed
- Automated responses and notifications

### 💾 Walrus Storage Integration
- **Automatic file uploads**: Files sent via Telegram → stored on Walrus
- **Decentralized persistence**: Data lives on Sui testnet
- **Upload relay**: No SUI needed for gas fees, only WAL tokens
- **Blob ID retrieval**: Get permanent URLs for stored files
- **Metadata tracking**: Content type, size, epochs stored

## How It Works

### Workflow Execution Flow

```
User sends file to Telegram Bot
         ↓
Workflow triggered (via Inngest)
         ↓
File downloaded from Telegram
         ↓
Uploaded to Walrus Storage
         ↓
Blob ID & URL returned
         ↓
Response sent back to Telegram
```

### Walrus Storage Process

1. **Trigger**: User sends a file to your Telegram bot
2. **Download**: Workflow fetches the file from Telegram servers
3. **Prepare**: File is converted to `WalrusFile` format with metadata
4. **Upload**: Using the workflow's dedicated wallet, file is uploaded via Walrus relay
5. **Certification**: Transaction recorded on Sui blockchain
6. **Access**: File accessible at `https://aggregator.walrus-testnet.walrus.space/v1/{blobId}`

### Architecture

```
┌─────────────────┐
│  Telegram Bot   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Next.js App    │
│  (Frontend)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│   Inngest       │◄────►│   PostgreSQL     │
│  (Workflows)    │      │   (Prisma)       │
└────────┬────────┘      └──────────────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Walrus SDK     │◄────►│   Sui Testnet    │
│  (@mysten)      │      │   (Blockchain)   │
└────────┬────────┘      └──────────────────┘
         │
         ▼
┌─────────────────┐
│ Walrus Storage  │
│   Network       │
└─────────────────┘
```

## Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **React Flow** - Visual workflow canvas
- **Recharts** - Data visualization

### Backend
- **tRPC** - End-to-end typesafe APIs
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Relational database
- **Inngest** - Workflow orchestration and background jobs

### Blockchain & Storage
- **Walrus** - Decentralized storage network
- **Sui SDK** - Blockchain interaction
- **@mysten/dapp-kit** - Wallet connectivity
- **@mysten/walrus** - Walrus file operations

### Integrations
- **Telegram Bot API** - Bot automation
- **Sentry** - Error tracking and monitoring

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database
- Sui wallet (for testnet)
- WAL tokens (from https://faucet.walrus.site/)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/shinrai.git
cd shinrai

# Install dependencies
bun install
# or
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Telegram Bot
TELEGRAM_BOT_TOKEN="your_bot_token"

# Sui & Walrus (Testnet)
SUI_NETWORK="testnet"
WALRUS_UPLOAD_RELAY="https://upload-relay.testnet.walrus.space"

# Inngest
INNGEST_EVENT_KEY="..."
INNGEST_SIGNING_KEY="..."

# Sentry (Optional)
SENTRY_DSN="..."
```

### Database Setup

```bash
# Generate Prisma client
bunx prisma generate

# Run migrations
bunx prisma migrate deploy

# (Optional) Open Prisma Studio
bunx prisma studio
```

### Running the App

```bash
# Development mode
bun dev

# Production build
bun build
bun start
```

The app will be available at `http://localhost:3000`

## Walrus Configuration

### Setting Up Walrus Storage

The Walrus client is configured in `src/config/connect.tsx`:

```typescript
import { getFullnodeUrl } from '@mysten/sui/client';
import { walrus } from '@mysten/walrus';
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';

export const client = new SuiJsonRpcClient({
  url: getFullnodeUrl('testnet'),
  network: 'testnet',
}).$extend(walrus({
  uploadRelay: {
    host: 'https://upload-relay.testnet.walrus.space',
    sendTip: {
      max: 1_000, // Maximum tip in MIST
    },
  },
}));
```

### Next.js Configuration for Walrus

In `next.config.ts`, Walrus packages must be externalized:

```typescript
const nextConfig: NextConfig = {
  serverExternalPackages: ['@mysten/walrus', '@mysten/walrus-wasm'],
  // ... other config
};
```

This prevents Next.js from bundling the WASM files, allowing proper server-side usage.

### Workflow Wallet Setup

Each workflow has its own Sui wallet for autonomous operations:

1. **Create a workflow** in the app
2. **Get the wallet address** from workflow settings
3. **Fund it with WAL tokens** from https://faucet.walrus.site/
4. The workflow can now upload files to Walrus autonomously

## Usage

### Creating a Workflow

1. Navigate to `/workflows`
2. Click **"New Workflow"**
3. Add a **Telegram Trigger** node
4. Add a **Walrus Storage** node
5. Connect the nodes
6. Save and activate the workflow

### Connecting to Telegram

1. Create a Telegram bot via [@BotFather](https://t.me/BotFather)
2. Copy the bot token
3. In your workflow, configure the Telegram trigger with your bot token
4. Send files to your bot - they'll be uploaded to Walrus!

### Retrieving Stored Files

Files uploaded to Walrus can be accessed via:

```
https://aggregator.walrus-testnet.walrus.space/v1/{blobId}
```

Example:
```
https://aggregator.walrus-testnet.walrus.space/v1/C6xHH8CZzFMKQpd4TKq5jNUdHCVdnbZJGbVLlVMYYbg
```

## Project Structure

```
shinrai/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── (dashboard)/        # Dashboard layout
│   │   │   └── workflows/      # Workflow management
│   │   └── api/                # API routes
│   │       └── inngest/        # Inngest webhook
│   ├── components/             # React components
│   │   └── ui/                 # Shadcn UI components
│   ├── config/                 # Configuration
│   │   └── connect.tsx         # Walrus & Sui client
│   ├── features/               # Feature modules
│   │   ├── executions/         # Workflow execution
│   │   │   └── components/
│   │   │       └── walrus-nodes/  # Walrus upload executor
│   │   └── workflows/          # Workflow management
│   ├── inngest/                # Inngest functions
│   │   ├── functions.ts        # Workflow executor
│   │   └── channels/           # Event channels
│   ├── lib/                    # Utilities
│   │   └── db.ts               # Prisma client
│   ├── server/                 # Server-side code
│   │   └── api/                # tRPC routers
│   └── trpc/                   # tRPC configuration
├── prisma/                     # Database schema
├── public/                     # Static assets
├── next.config.ts              # Next.js config (Walrus externals)
└── package.json
```

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### "Not enough coins" error

**Cause**: Workflow wallet lacks WAL tokens

**Solution**:
1. Check workflow wallet address in logs
2. Visit https://faucet.walrus.site/
3. Request WAL tokens for that address
4. Retry the workflow

### WASM file not found error

**Cause**: Next.js trying to bundle Walrus WASM files

**Solution**: Ensure `next.config.ts` has:
```typescript
serverExternalPackages: ['@mysten/walrus', '@mysten/walrus-wasm']
```

### Client is undefined error

**Cause**: Walrus client not initialized properly

**Solution**: Remove `"use client"` directive from `src/config/connect.tsx`

## Resources

- [Walrus Documentation](https://sdk.mystenlabs.com/walrus)
- [Sui Documentation](https://docs.sui.io)
- [Walrus Testnet Faucet](https://faucet.walrus.site/)
- [Sui Testnet Faucet](https://faucet.testnet.sui.io/)
- [Inngest Documentation](https://www.inngest.com/docs)

## License

MIT License - see LICENSE file for details

## Status

🚧 **Under Active Development** 🚧

This project is in active development. Features and APIs may change.

---

Built with ❤️ using Walrus, Sui, and Next.js
