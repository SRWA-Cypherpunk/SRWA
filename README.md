# SRWA Protocol

Native, institution-ready security tokens on Solana. SRWA was born to open DeFi liquidity for real-world assets without bridges or intermediaries. Our tokens embed offering rules, compliance policies, investor restrictions, and institutional governance directly into the mint so issuers and investors can interact with programmable RWAs that stay 100% on-chain.

## Why SRWA

- Traditional RWA wrappers lack enforceable rules, accountability, and on-chain auditability.
- SRWA introduces a Solana-native token standard that carries governance, compliance, and distribution logic inside the asset itself.
- Issuers can customize every control while investors tap straight into Solana DeFi venues (MarginFi, Solend, Jupiter, Meteora, Marinade) for yield and liquidity.
- Mission: merge traditional capital with DeFi innovation—fully decentralized, no centralized bridges, no compromises.

## Repository Overview

```
programs/              Anchor smart contracts that implement the SRWA standard
frontend/              React 18 + Vite institutional dashboard
examples/              End-to-end scripts (e.g., admin/KYC flow)
tests/                 Anchor integration tests (work in progress)
docs (Markdown)        Process, flow, and deployment guides
```

Key reference documents:

- `ADMIN_KYC_GUIDE.md` – admin allowlist and KYC provider management.
- `FLOW_REFACTORING.md` – user journey redesign for investor/issuer/admin.
- `IMPLEMENTATION_SUMMARY.md` – frontend component library and UX improvements.
- `CLOUDFLARE_DEPLOY.md` – production deployment checklist for the dashboard.

## Smart-Contract Architecture

All programs are written in Rust with Anchor. IDs are configured in `Anchor.toml` and loaded dynamically on the frontend (`frontend/src/lib/solana/anchor.ts`).

| Program | Purpose | Highlighted Instructions |
|---------|---------|--------------------------|
| `srwa_factory` | Token factory for SPL Token-2022 mints with transfer hooks, metadata, offering state, admin/KYC registries, and user onboarding (`programs/srwa_factory/src/lib.rs`) | `create_srwa`, `request_srwa`, `approve_srwa`, `initialize_admin_registry`, `add_kyc_provider`, `register_user` |
| `identity_claims` | Identity registry and topic-based claims (KYC, AML, Accredited, etc.) with revocation/expiry controls (`programs/identity_claims/src/lib.rs`) | `register_identity`, `add_claim`, `revoke_claim`, `is_verified` |
| `compliance_modules` | Pluggable compliance policies for jurisdictions, sanctions, lockups, investor limits, program/account allowlists (`programs/compliance_modules/src/lib.rs`) | `configure_jurisdiction`, `set_sanctions`, `set_lockup`, `set_volume_caps`, `set_transfer_window` |
| `srwa_controller` | Token-2022 transfer hook that orchestrates compliance checks at transfer time (`programs/srwa_controller/src/lib.rs`) | `on_transfer`, `transfer_checked` (logic scaffolding in place) |
| `offering_pool` | Capital formation life-cycle (open, subscribe, lock, settle, refund). Currently a minimal scaffold for future yield strategies (`programs/offering_pool/src/lib.rs`) | `open`, `subscribe`, `lock`, `settle`, `refund` |
| `yield_adapter` | Interface for depositing idle capital into protocols such as MarginFi or Solend (future work) |
| `valuation_oracle` | NAV publisher and price composition guardrails (Pyth integration planned) |
| `cashflow_engine` | Phase 2 roadmap for waterfall distribution of structured products (FIDC-style cashflows) |
| `purchase_order` | OTC-style order flow that escrows SOL until an admin approves issuance and transfers SRWA (`programs/purchase_order/src/lib.rs`) |

### Core Data Accounts

- `SRWAConfig`, `OfferingState`, `ValuationData`: per-mint configuration PDAs.
- `PlatformAdminRegistry`, `KYCProviderRegistry`, `IssuerKYCConfig`: governance and compliance registries.
- `UserRegistry`: wallet-level role, KYC status, activation flags.
- `IdentityAccount` & `ClaimAccount`: identity graph with topic IDs (see `identity_claims::topics`).
- `JurisdictionConfig`, `SanctionsList`, `LockupAccount`, `VolumeCapsConfig`, `ProgramAllowlist`, `AccountAllowlist`, `InvestorProfile`: modular compliance state.
- `PurchaseOrder`: per-order escrow and status audit trail.

## Frontend Platform

- React 18 + Vite 7 + TypeScript 5, styled with TailwindCSS and Radix primitives (`frontend/package.json`).
- Wallet support: Phantom, Backpack, Solflare, Torus via `@solana/wallet-adapter` (`frontend/src/contexts/wallet/WalletContext.tsx`).
- Context providers load Anchor programs dynamically once a wallet connects (`frontend/src/contexts/ProgramContext.tsx`).
- Institutional-grade UI components and dashboards covering metrics, markets, portfolios, and role-based actions (`IMPLEMENTATION_SUMMARY.md`).
- Feature flags (e.g., `VITE_ENABLE_DASHBOARD`) gate unfinished routes in production builds (`frontend/src/App.tsx`, `frontend/.env`).

## Embedded Compliance & Governance

- On-chain admin allowlist with super-admin control and UI management panel (`frontend/src/components/srwa/AdminAllowlistPanel.tsx`).
- KYC provider registry and issuer-specific compliance requirements executed at transfer or investment time (`ADMIN_KYC_GUIDE.md`).
- Role-based access (Issuer, Investor, Admin) enforced across programs and frontend guards (`FLOW_REFACTORING.md`).
- Planned transfer hook pipeline: pause/freeze checks, identity validation, offering phase logic, investor caps, lockups, time windows, and DeFi allowlists.

## End-to-End Workflows

**Issuer**
1. Connect wallet → register role (guarded by on-chain admin tag if necessary).
2. Submit `request_srwa` with token, offering, yield, and KYC configurations.
3. Authorized admin approves request (`approve_srwa`), minting configurations and PDAs.
4. Open offering, accept subscriptions, optionally farm idle funds, settle distribution.

**Investor**
1. Register identity → obtain required claims from approved providers.
2. Subscribe to offerings (`offering_pool::subscribe`) and monitor allocations.
3. Receive SRWA via settlement or approved purchase orders.
4. Hold or transfer tokens subject to on-chain compliance enforced by the transfer hook.

**Admin / Platform**
1. Initialize `PlatformAdminRegistry` and manage allowlist membership.
2. Curate KYC providers and configure per-issuer requirements.
3. Approve or reject SRWA requests, monitor compliance events, and manage system status from the dashboard.

Sequence diagrams for issuance, KYC, capital formation, and compliant transfers are captured in `README.md` (this document) and the flow refactoring guide.

## Getting Started

### Prerequisites

- Rust 1.75+
- Solana CLI 1.18+
- Anchor CLI 0.31.1+
- Node.js 18+ (Node 22 recommended for the frontend, see `.nvmrc`)

### Install Tooling

```bash
# Install Anchor CLI (if not already available)
cargo install --git https://github.com/coral-xyz/anchor --tag v0.31.1 anchor-cli

# Configure Solana
solana-install init 1.18.0
solana config set --url devnet
```

### Build Smart Contracts

```bash
anchor build
```

### Run Tests (WIP)

```bash
anchor test
```

> Note: The current test suite (`tests/`) is a placeholder and needs to be updated to cover the deployed programs.

### Start Local Validator (optional)

```bash
solana-test-validator --reset
anchor deploy --provider.cluster localnet
```

## Frontend Development

```bash
cd frontend
npm install
npm run dev
```

Environment variables live in `frontend/.env`. Key values:

```
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_ENABLE_DASHBOARD=true
```

A full list of feature flags and API endpoints is available in `frontend/src/config.ts`.

### Production Build & Deploy (Cloudflare Pages)

Follow `CLOUDFLARE_DEPLOY.md` for detailed steps. Highlights:

1. Configure Cloudflare Pages with `Root Directory: frontend`, `Build Command: npm ci && npm run build`, `Build Output: dist`.
2. Set `NODE_VERSION=22` in the environment.
3. Leave `VITE_ENABLE_DASHBOARD` unset in production to hide unfinished dashboard routes.

## Deployment to Devnet or Mainnet

```bash
anchor deploy --provider.cluster devnet
```

Edit `Anchor.toml` to target the desired cluster and wallet. Program IDs are preconfigured in both `Anchor.toml` and the frontend’s Anchor client.

## Roadmap & Known Gaps

- Implement full transfer-hook compliance pipeline (CPIs into identity and compliance modules).
- Integrate Pyth oracles, valuation guards, and final price computation.
- Complete offering pool logic (treasury movement, yield adapters, refunds).
- Replace mocked frontend data with real program queries (`useSRWAMarkets`, `useBlendPools`, etc.).
- Expand automated tests (unit + integration) for contracts and React components.
- Phase 2: cashflow engine waterfall for FIDC-like products, governance enhancements, indexer/analytics (Helius), in-app notifications, and configurable dashboards.

See the checklists in `README`, `IMPLEMENTATION_SUMMARY.md`, and `FLOW_REFACTORING.md` for more context.

## Additional Resources

- `examples/admin-kyc-flow.ts`: end-to-end script for initializing admin registry, adding KYC providers, configuring issuer requirements, and verifying investors.
- `frontend/src/lib/solana/adminAllowlist.ts`: TS service layer mirroring on-chain governance calls.
- `frontend/src/hooks/solana`: high-level hooks (`useIssuer`, `useInvestor`, `usePurchaseOrders`, `useAdminRegistry`) that wrap Anchor interactions.

## License & Contact

- License: MIT
- Need help or want to collaborate? Open an issue or reach out to the SRWA team.

---

Built with Anchor ⚓ on Solana ☀️ — bringing institutional RWAs to programmable DeFi liquidity.
