# SRWA - Solana Real-World Asset Platform

A comprehensive platform for tokenizing real-world assets (RWA) on the Solana blockchain with on-chain compliance and institutional-grade security.

## 🎯 The Problem

Traditional real-world asset tokenization faces critical challenges:
- **Fragmented Compliance**: Manual KYC/AML processes that don't scale
- **Liquidity Barriers**: Isolated markets with poor price discovery
- **Technical Complexity**: High barriers to entry for asset originators
- **Trust Deficit**: Opaque verification and settlement processes

## 💡 The Solution

SRWA provides an end-to-end platform for RWA tokenization on Solana:

- **On-Chain Compliance**: Automated KYC/AML verification with jurisdictional controls
- **Unified Marketplace**: Integrated trading, lending, and liquidity pools
- **Token Factory**: No-code wizard for creating compliant security tokens
- **Real-Time Settlement**: Instant finality with Solana's 400ms block times
- **Oracle Integration**: Live pricing via Pyth Network for accurate valuations

Built for asset managers, fund operators, and institutional investors who need speed, compliance, and transparency.

## 🏗️ Architecture

### Tech Stack

**Frontend**
- React 18 + TypeScript - Type-safe component architecture
- Vite 5 - Lightning-fast builds and HMR
- Tailwind CSS - Utility-first styling with custom design system
- Framer Motion - Smooth animations and transitions
- Solana Wallet Adapter - Multi-wallet support (Phantom, Backpack, Solflare, etc.)
- React Query - Server state management with caching
- Zustand - Client state management
- Recharts - Interactive data visualizations

**Blockchain**
- Solana Web3.js - Blockchain interactions
- Anchor Framework (planned) - Smart contract development
- Pyth Network - Decentralized price oracles

### Architecture Patterns

Following best practices from [agarIoCryptoStacksChain](https://github.com/pedro-gattai/agarIoCryptoStacksChain):

```
frontend/
├── src/
│   ├── contexts/          # React Context providers
│   │   ├── wallet/        # Wallet connection & state
│   │   └── CombinedProvider.tsx  # Aggregated providers
│   │
│   ├── services/          # Business logic layer
│   │   ├── solanaService.ts
│   │   ├── lendingService.ts
│   │   └── rwaTokenService.ts
│   │
│   ├── components/        # Feature-based organization
│   │   ├── wallet/
│   │   ├── rwa/
│   │   ├── markets/
│   │   └── sections/
│   │
│   ├── hooks/             # Domain-organized custom hooks
│   │   ├── ui/
│   │   ├── wallet/
│   │   ├── markets/
│   │   └── rwa/
│   │
│   ├── styles/            # CSS architecture
│   │   ├── base/          # Variables, reset, typography
│   │   ├── components/    # Reusable component styles
│   │   └── features/      # Feature-specific styles
│   │
│   ├── pages/             # Route components
│   ├── lib/               # Utilities and helpers
│   └── config.ts          # Centralized configuration
│
└── public/
    ├── _headers           # Security headers for Cloudflare
    └── _redirects         # SPA routing configuration
```

**Key Architectural Decisions:**

- **Contexts Layer**: Aggregated providers for wallet, settings, and global state
- **Services Layer**: Business logic abstracted from components for testability
- **Feature-Based Organization**: Components and hooks grouped by domain, not type
- **CSS Architecture**: Layered approach (Variables → Components → Features)
- **Centralized Config**: All environment variables accessed via `config.ts`
- **Chunk Splitting**: Optimized vendor bundles (react, solana, ui, state)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Cloudflare account (for production deployment)

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/SRWA-Cypherpunk/SRWA.git
cd SRWA

# Install dependencies
cd frontend
npm install

# Configure environment variables
cp ../.env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

Access the app at: http://localhost:8080

### Build for Production

```bash
cd frontend
npm run build

# Preview production build locally
npm run preview
```

The production build will be optimized with:
- Code splitting by vendor (react, solana, ui, state)
- Asset compression and minification
- Tree-shaking for minimal bundle size

## 🌐 Deployment

### Cloudflare Pages (Recommended)

SRWA is optimized for deployment on Cloudflare Pages with built-in security headers, caching, and SPA routing.

**Configuration Steps:**

1. **Connect Repository**
   - Go to Cloudflare Pages dashboard
   - Click "Create a project" → "Connect to Git"
   - Select your SRWA repository

2. **Configure Build Settings**
   ```
   Root directory:       frontend
   Build command:        npm run build
   Build output:         dist
   ```

3. **Environment Variables**

   Add these in Cloudflare Pages → Settings → Environment variables:

   ```bash
   # Node.js version
   NODE_VERSION=20

   # Solana Network (devnet for staging, mainnet-beta for production)
   VITE_SOLANA_NETWORK=devnet
   VITE_SOLANA_RPC_URL_DEVNET=https://api.devnet.solana.com
   VITE_SOLANA_RPC_URL_MAINNET_BETA=https://your-private-rpc.com

   # Feature flags
   VITE_ENABLE_LENDING=true
   VITE_ENABLE_MARKETPLACE=true
   VITE_ENABLE_KYC=false
   VITE_ENABLE_COMPLIANCE=false

   # Smart contract program IDs (add when deployed)
   # VITE_RWA_TOKEN_PROGRAM_ID=
   # VITE_COMPLIANCE_PROGRAM_ID=
   # VITE_LENDING_PROGRAM_ID=
   ```

4. **Deploy**
   - Click "Save and Deploy"
   - Cloudflare will automatically build and deploy
   - Future commits to `main` will auto-deploy

**Production Checklist:**

- [ ] Use private RPC endpoint (Helius, QuickNode, or Alchemy)
- [ ] Set `VITE_SOLANA_NETWORK=mainnet-beta`
- [ ] Configure program IDs after smart contract deployment
- [ ] Enable KYC/Compliance features when ready
- [ ] Test all features on staging environment first

**Security Features:**

The `frontend/public/_headers` file configures:
- X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- Content Security Policy (CSP) for script and style sources
- Permissions Policy (restricting camera, geolocation, etc.)
- Cache-Control headers (immutable assets, no-cache HTML)

## ⚙️ Configuration

### Environment Variables

See `.env.example` for all available configuration options.

**Essential Variables:**

```bash
# Network selection
VITE_SOLANA_NETWORK=devnet  # devnet | testnet | mainnet-beta

# RPC endpoints (use private for production)
VITE_SOLANA_RPC_URL_DEVNET=https://api.devnet.solana.com
VITE_SOLANA_RPC_URL_MAINNET_BETA=https://api.mainnet-beta.solana.com

# Feature flags
VITE_ENABLE_LENDING=true
VITE_ENABLE_MARKETPLACE=true
VITE_ENABLE_KYC=false
```

**Advanced Configuration:**

```bash
# API endpoints
VITE_BACKEND_URL=http://localhost:3000
VITE_PYTH_URL=https://hermes.pyth.network
VITE_JUPITER_URL=https://quote-api.jup.ag/v6

# Compliance settings
VITE_REQUIRE_KYC=false
VITE_ALLOWED_JURISDICTIONS=US,EU,UK,BR
VITE_RESTRICTED_COUNTRIES=

# Smart contract program IDs
VITE_RWA_TOKEN_PROGRAM_ID=
VITE_COMPLIANCE_PROGRAM_ID=
VITE_LENDING_PROGRAM_ID=
VITE_TOKEN_FACTORY_PROGRAM_ID=
```

All environment variables are centralized in `frontend/src/config.ts` for type-safe access.

## 📦 Features

### Implemented ✅

- **Landing Page**: Interactive roadmap with project timeline
- **Wallet Integration**: Multi-wallet support (Phantom, Backpack, Solflare, Coinbase, etc.)
- **RWA Dashboard**: Token overview with real-time metrics
- **Token Factory**: Step-by-step wizard for creating RWA tokens
- **Markets**: Trading interface with order books and charts
- **Lending**: Collateralized lending with liquidation protection
- **Portfolio**: Holdings tracker with performance analytics
- **Responsive Design**: Optimized for mobile, tablet, and desktop

### In Development 🚧

- **KYC System**: Identity verification with accreditation checks
- **On-Chain Compliance**: Jurisdictional controls and transfer restrictions
- **Smart Contracts**: Anchor programs for token issuance and trading
- **Oracle Integration**: Pyth Network price feeds for accurate valuations
- **Liquidity Pools**: Automated market making with yield generation

## 🧪 Development

### Code Quality

```bash
# Linting
npm run lint

# Type checking
npm run build  # TypeScript errors will fail the build

# Production build test
npm run build && npm run preview
```

### Project Standards

- **TypeScript**: Strict mode enabled, no implicit `any`
- **Component Architecture**: Functional components with hooks
- **State Management**: React Query for server state, Zustand for client state
- **Styling**: Tailwind with custom CSS for complex layouts
- **Code Organization**: Feature-based folders, barrel exports via `index.ts`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Coding Guidelines:**
- Follow the existing architecture patterns (contexts, services, feature-based)
- Use TypeScript strictly (no `any` types)
- Write descriptive commit messages
- Test on both desktop and mobile viewports
- Ensure production build succeeds before submitting PR

## 📄 License

This project is private and proprietary.

## 🔗 Links

- **Website**: [https://srwa.pages.dev](https://srwa.pages.dev) (coming soon)
- **Documentation**: [https://docs.srwa.io](https://docs.srwa.io) (in development)
- **GitHub**: [https://github.com/SRWA-Cypherpunk/SRWA](https://github.com/SRWA-Cypherpunk/SRWA)

## 👥 Team

Developed by SRWA Cypherpunk Team

---

**Last Updated**: 2025-10-18
**Version**: 1.0.0
**Status**: 🚀 Active Development
