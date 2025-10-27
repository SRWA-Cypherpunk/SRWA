# SRWA Protocol

> Native, institution-ready security tokens on Solana

**SRWA** (Solana Real-World Assets) brings real-world assets to DeFi without bridges or intermediaries. Our tokens embed offering rules, compliance policies, investor restrictions, and institutional governance directly on-chain, enabling issuers and investors to interact with programmable RWAs that stay 100% on Solana.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solana](https://img.shields.io/badge/Solana-Blockchain-9945FF)](https://solana.com)
[![Anchor](https://img.shields.io/badge/Anchor-0.31.1-purple)](https://www.anchor-lang.com/)

---

## 🚀 Why SRWA?

Traditional RWA wrappers lack enforceable rules, accountability, and on-chain auditability. **SRWA introduces a Solana-native token standard** that carries governance, compliance, and distribution logic inside the asset itself.

### Key Benefits

- **🔒 Built-in Compliance**: Transfer hooks enforce KYC/AML at the token level
- **🏦 Institutional Grade**: Designed for regulated financial institutions
- **⚡ Lightning Fast**: Leverages Solana's 400ms block time and low fees
- **🔗 DeFi Compatible**: Works seamlessly with MarginFi, Solend, Jupiter, and more
- **🛡️ On-chain Governance**: Transparent, auditable, and programmable

---

## 📦 Repository Structure

\`\`\`
programs/              # Anchor smart contracts (SRWA standard)
  ├── srwa_factory/        # Token factory with SPL Token-2022
  ├── identity_claims/     # KYC/AML identity registry
  ├── compliance_modules/  # Jurisdiction, sanctions, lockups
  ├── srwa_controller/     # Transfer hook orchestrator
  ├── offering_pool/       # Capital formation lifecycle
  ├── purchase_order/      # OTC-style order flow
  └── ...

frontend/              # React + Vite institutional dashboard
  ├── src/
  │   ├── components/      # UI components
  │   ├── hooks/           # Solana & SRWA hooks
  │   ├── contexts/        # Wallet & program contexts
  │   └── pages/           # Dashboard pages
  └── ...

tests/                 # Anchor integration tests
examples/              # End-to-end scripts
\`\`\`

---

## 🏗️ Architecture

### Smart Contract Stack

All programs are written in Rust with Anchor. Program IDs are configured in \`Anchor.toml\` and loaded dynamically in the frontend.

| Program | Purpose | Key Instructions |
|---------|---------|------------------|
| **srwa_factory** | Token factory for SPL Token-2022 with transfer hooks, metadata, offering state | \`create_srwa\`, \`request_srwa\`, \`approve_srwa\`, \`register_user\` |
| **identity_claims** | Identity registry with topic-based claims (KYC, AML, Accredited) | \`register_identity\`, \`add_claim\`, \`revoke_claim\`, \`is_verified\` |
| **compliance_modules** | Pluggable policies: jurisdictions, sanctions, lockups, investor limits | \`configure_jurisdiction\`, \`set_sanctions\`, \`set_lockup\` |
| **srwa_controller** | Token-2022 transfer hook orchestrator for compliance checks | \`on_transfer\`, \`transfer_checked\` |
| **offering_pool** | Capital formation lifecycle (open, subscribe, lock, settle, refund) | \`open\`, \`subscribe\`, \`lock\`, \`settle\`, \`refund\` |
| **purchase_order** | OTC-style order flow with SOL escrow | \`create_order\`, \`approve_order\`, \`cancel_order\` |

### Core Data Accounts

- \`SRWAConfig\`, \`OfferingState\`, \`ValuationData\`: Per-mint configuration PDAs
- \`PlatformAdminRegistry\`, \`KYCProviderRegistry\`, \`IssuerKYCConfig\`: Governance registries
- \`UserRegistry\`: Wallet-level role, KYC status, activation flags
- \`IdentityAccount\` & \`ClaimAccount\`: Identity graph with topic IDs
- \`JurisdictionConfig\`, \`SanctionsList\`, \`LockupAccount\`: Modular compliance state

---

## 🎯 Use Cases

### For Issuers / Banks
- Single integration surface for DeFi-ready distribution
- Force transfer, freeze, lockups with event logging
- Built-in compliance eliminates manual checks

### For Investors
- Deposit SRWA as collateral, borrow stablecoins
- Access to Solana DeFi: lending, swaps, yield
- Transparent pricing and compliance status

### For DeFi Protocols
- Plug-and-play SRWA support via transfer hooks
- Pre-flight eligibility checks avoid failed transactions
- Integration allowlist for authorized protocols

---

## 🛠️ Getting Started

### Prerequisites

- Rust 1.75+
- Solana CLI 1.18+
- Anchor CLI 0.31.1+
- Node.js 18+ (Node 22 recommended)

### Install Tooling

\`\`\`bash
# Install Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor --tag v0.31.1 anchor-cli

# Configure Solana
solana-install init 1.18.0
solana config set --url devnet
\`\`\`

### Build Smart Contracts

\`\`\`bash
# Clone repository
git clone https://github.com/your-org/srwa-protocol
cd srwa-protocol

# Build all programs
anchor build

# Run tests
anchor test
\`\`\`

### Deploy Contracts

\`\`\`bash
# Deploy to devnet
anchor deploy --provider.cluster devnet

# Or deploy to localnet
solana-test-validator --reset
anchor deploy --provider.cluster localnet
\`\`\`

---

## 💻 Frontend Development

The frontend is a React 18 + Vite 7 + TypeScript institutional dashboard with Solana wallet integration.

### Quick Start

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

### Environment Configuration

Create \`frontend/.env\`:

\`\`\`bash
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_ENABLE_DASHBOARD=true
\`\`\`

### Wallet Support

Integrated with \`@solana/wallet-adapter\`:
- Phantom
- Backpack
- Solflare
- Torus

### Build for Production

\`\`\`bash
npm run build

# Output in frontend/dist/
\`\`\`

---

## 🔐 Security & Compliance

### Compliance Flow

Every SRWA transfer triggers compliance checks:

1. **Global Pause Check**: System-wide pause state
2. **Account Frozen Check**: Individual account freeze
3. **Integration Allowlist**: Authorized protocol check
4. **Identity Verification**: KYC/AML claim validation
5. **Jurisdiction Module**: Geographic restrictions
6. **Sanctions Module**: OFAC/sanctions list
7. **Accredited Module**: Investor accreditation
8. **Lockup Module**: Time-based restrictions
9. **Max Holders Module**: Holder count limits

### Error Codes

\`\`\`
0   OK
10  PAUSED
11  FROZEN_FROM
12  FROZEN_TO
13  NOT_ALLOWED_OPERATOR
14  FROM_NOT_VERIFIED
15  TO_NOT_VERIFIED
20  SANCTIONS_DENY
21  JURISDICTION_DENY
22  WINDOW_CLOSED
23  NOT_ACCREDITED
24  LOCKUP_ACTIVE
25  MAX_HOLDERS_EXCEEDED
\`\`\`

---

## 📚 Workflows

### Issuer Flow

1. Connect wallet → Register role (requires admin approval)
2. Submit \`request_srwa\` with token config
3. Admin approves via \`approve_srwa\`
4. Open offering, accept subscriptions
5. Settle distribution to investors

### Investor Flow

1. Register identity → Obtain KYC/AML claims
2. Subscribe to offerings
3. Receive SRWA via settlement
4. Hold or transfer (subject to compliance)

### Admin Flow

1. Initialize \`PlatformAdminRegistry\`
2. Manage KYC providers and allowlists
3. Approve/reject SRWA requests
4. Monitor compliance events

---

## 🎨 Design System

The frontend uses a modern glassmorphism design with Solana branding:

### Colors

- **Primary Purple**: \`#9945FF\` (Solana brand)
- **Secondary Green**: \`#14F195\` (Success)
- **Accent Orange**: \`#FF6B35\`
- **Background**: Deep black \`#0A0A0A\`

### Components

- Built with Radix UI primitives
- Styled with TailwindCSS
- Glassmorphism effects and gradients
- Animated transitions and micro-interactions

---

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core smart contracts deployed
- ✅ Transfer hook compliance pipeline
- ✅ Identity claims & KYC registry
- ✅ Frontend dashboard MVP
- 🔄 Integration testing

### Phase 2 (Q2 2025)
- [ ] Pyth Oracle integration
- [ ] Yield adapter (MarginFi/Solend)
- [ ] Offering pool treasury logic
- [ ] Advanced analytics dashboard
- [ ] Cashflow engine for structured products

### Phase 3 (Q3 2025)
- [ ] Mainnet deployment
- [ ] Institutional partnerships
- [ ] Governance enhancements
- [ ] Mobile app
- [ ] Additional compliance modules

---

## 📖 Documentation

- **Smart Contracts**: See inline documentation in \`programs/\`
- **Frontend**: Component docs in \`frontend/src/components/\`
- **API Reference**: TypeScript types in \`frontend/src/types/\`
- **Integration Guide**: Examples in \`examples/\`

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

### Development Guidelines

- Follow Rust and TypeScript best practices
- Write tests for new features
- Update documentation
- Maintain consistent code style

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙋 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/your-org/srwa-protocol/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/srwa-protocol/discussions)
- **Discord**: [Join our community](https://discord.gg/srwa)
- **Twitter**: [@SRWAProtocol](https://twitter.com/SRWAProtocol)

---

## 🌟 Acknowledgments

Built with:
- [Anchor](https://www.anchor-lang.com/) - Solana development framework
- [SPL Token-2022](https://spl.solana.com/token-2022) - Next-gen token standard
- [Solana](https://solana.com) - High-performance blockchain
- [React](https://react.dev) - UI framework
- [Vite](https://vitejs.dev) - Build tool

---

<div align="center">

**Built with Anchor ⚓ on Solana ☀️**

*Bringing institutional RWAs to programmable DeFi liquidity*

</div>
