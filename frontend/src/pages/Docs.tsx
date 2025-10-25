import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import {
  Search,
  BookOpen,
  Shield,
  AlertTriangle,
  Info,
  ExternalLink,
  Copy,
  Check,
  Menu,
  ChevronRight,
  Code2,
  FileText,
  Lock,
  Database,
  Settings,
  TrendingUp,
  Users,
  Layers,
  BarChart3,
  DollarSign,
  Map,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FlywheelDiagram from '@/assets/diagrams/ecossystem-flyweel.png';
import StakeholdersDiagram from '@/assets/diagrams/stakeholders.png';
import ArchitectureDiagram from '@/assets/diagrams/architecture.png';
import ComplianceFlowDiagram from '@/assets/diagrams/compliance-interaction-flow.png';
import OfferingDiagram from '@/assets/diagrams/principal-diagram.jpeg';
import DataModelDiagram from '@/assets/diagrams/onchain-and-offchain-data-model.png';
import DeFiDiagram from '@/assets/diagrams/dfi-integrations.png';
import GovernanceDiagram from '@/assets/diagrams/governance.png';

/**
 * Documentation section structure
 */
interface DocSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'Getting Started' | 'Core Concepts' | 'Integration' | 'Advanced' | 'Reference';
  content: string;
  features?: string[];
  subsections?: Array<{
    title: string;
    content: string;
    code?: string;
  }>;
  riskMatrix?: Array<{
    risk: string;
    vector: string;
    mitigation: string;
  }>;
  image?: string;
}

/**
 * Code block component with copy functionality
 */
function CodeBlock({ code, language = 'typescript' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="absolute top-2 right-2 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <pre className="bg-bg-elev-2 rounded-lg p-4 overflow-x-auto border border-stroke-line">
        <code className="text-sm text-fg-secondary font-mono">{code}</code>
      </pre>
    </div>
  );
}

/**
 * Modern Documentation Page
 * Follows industry standards: GitBook, Docusaurus, Mintlify
 */
export default function Docs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('executive-summary');

  // Documentation sections organized by category
  const sections: DocSection[] = [
    {
      id: 'executive-summary',
      title: 'Executive Summary & Thesis',
      icon: BookOpen,
      category: 'Getting Started',
      content:
        'SRWA turns institutional real-world assets into programmable Solana instruments with compliance encoded into every token move. The platform compresses issuance time, lowers distribution cost, and unlocks DeFi-native liquidity while preserving regulatory guard rails.',
      features: [
        'Token-level compliance enforced by Solana Transfer Hooks',
        'Capital formation through locked offerings with automated settlement',
        'Hybrid valuation stack: custodian-signed NAV + guarded market data',
        'One interface serving issuers, investors, integrators, and regulators',
      ],
      subsections: [
        {
          title: 'Investment Thesis in One Page',
          content:
            '• Issuers tap always-on USDC liquidity with programmable compliance.\n• Investors access curated credit, real estate, and receivable deals with controlled exits.\n• DeFi venues gain high-quality collateral with deterministic risk parameters.\n• Auditors and regulators receive a verifiable, tamper-evident event trail.',
        },
        {
          title: 'North-Star Outcomes',
          content:
            'Issue in hours instead of weeks, achieve <1 compliance exception per 1,000 transfers, and maintain on-chain health metrics (oracle freshness, adapter utilization, governance response time) inside predefined thresholds.',
        },
      ],
      image: OfferingDiagram,
    },
    {
      id: 'stakeholder-playbooks',
      title: 'Stakeholder Playbooks',
      icon: Users,
      category: 'Getting Started',
      content:
        'SRWA serves multiple desks. Each playbook summarises what success looks like for the audience and which tooling matters most.',
      features: [
        'Issuer wizard covers mint creation, compliance modules, and idle-yield policies',
        'Investor UX connects KYC → subscription → secondary or collateral flows',
        'Business and sales assets emphasise transparency, fees, and guard rails',
        'Regulatory users receive attestation feeds, audit-ready exports, and timelock notices',
      ],
      subsections: [
        {
          title: 'Issuers & Originators',
          content:
            'Configure SRWA mints, offerings, allocation rules, lockups, and yield adapters in a guided flow. Governance policies (multisig + timelock) are baked in, and ready-made disclosures are hash-anchored on-chain.',
        },
        {
          title: 'Investors & Treasury Teams',
          content:
            'Undergo reusable KYC/KYB, subscribe through capital-efficient offerings, monitor lock yield, receive SRWA with lock schedules, and optionally post tokens as collateral or exit through permissioned DEX pools.',
        },
        {
          title: 'Developers & Integrators',
          content:
            'SDK surfaces offering state, compliance checks, valuation data, and DeFi endpoints. IDLs, type definitions, sandbox scripts, and Postman collections live in the Dev Portal.',
        },
        {
          title: 'Auditors, Legal & Regulators',
          content:
            'Event streams, compliance violation logs, NAV attestations, and governance diffs are exportable. Timelock queues provide advance notice for parameter changes.',
        },
      ],
      image: StakeholdersDiagram,
    },
    {
      id: 'market-opportunity',
      title: 'Market Problem & Opportunity',
      icon: TrendingUp,
      category: 'Core Concepts',
      content:
        'Traditional structured credit is slow, opaque, and geographically constrained; crypto markets are fast but lack enforceable compliance. SRWA closes the gap by codifying eligibility, valuation, and lifecycle rules directly in Solana programs.',
      features: [
        'Digitise FIDC/CRI/CRA processes end-to-end with deterministic state machines',
        'Reduce intermediaries and reconcile events in near real-time',
        'Give DeFi lenders and market makers clear risk primitives (LTV, haircuts, liquidity buffers)',
      ],
      subsections: [
        {
          title: 'Pain Points We Remove',
          content:
            'Slow fundraising, fragmented KYC/AML, manual allocation spreadsheets, outdated NAV reports, liquidity deserts, and expensive compliance attestations.',
        },
        {
          title: 'Opportunity Flywheel',
          content:
            'More offerings → more high-quality collateral → deeper liquidity & yields → attracts more qualified investors → encourages more issuers. Compliance certainty keeps the loop regulated.',
        },
      ],
    },
    {
      id: 'product-pillars',
      title: 'Product Pillars',
      icon: Layers,
      category: 'Core Concepts',
      content:
        'Every release maps back to four pillars that keep the platform balanced across compliance, product velocity, and liquidity.',
      features: [
        'Compliant Tokenization: SPL-2022 mints with hooks, allowlists, and permanent delegates',
        'Programmable Offering Engine: phases, caps, allocation rules, lock yield, automated settlement',
        'Trusted Valuation: NAV publisher + Pyth guards + price floors/haircuts',
        'DeFi Connectivity: certified integrations with marginfi, Solend, Raydium/Meteora/Orca',
      ],
      subsections: [
        {
          title: 'Configurable per Series',
          content:
            'Roles, required claims, module parameters, valuation guard rails, fee structures, and DeFi allowlists are stored in dedicated PDAs (e.g., SRWAConfig, OfferingState, Valuation).',
        },
        {
          title: 'Observability by Default',
          content:
            'Every critical action emits structured events. Indexers pipe data into dashboards for compliance, operations, and risk teams.',
        },
      ],
    },
    {
      id: 'architecture-overview',
      title: 'Architecture Overview',
      icon: Database,
      category: 'Core Concepts',
      content:
        'A modular Solana stack keeps control and data planes separated. Each domain (token, compliance, offering, valuation, adapters) owns its PDAs and upgrade cadence.',
      image: ArchitectureDiagram,
      subsections: [
        {
          title: 'Control Plane',
          content:
            'SRWA Factory writes configuration PDAs, assigns multisig roles, and enables compliance modules. Timelocks protect upgrades and parameter shifts.',
        },
        {
          title: 'Data Plane',
          content:
            'SRWA Controller enforces compliance on each transfer, Offering Pool manages subscriptions and settlement, Valuation Oracle publishes guarded prices, and adapters interact with DeFi venues.',
        },
      ],
    },
    {
      id: 'compliance-identity',
      title: 'Compliance & Identity Framework',
      icon: Shield,
      category: 'Core Concepts',
      content:
        'Claims, modules, and hooks translate regulatory requirements into deterministic checks without leaking personal data on-chain.',
      features: [
        'Claims registry supports KYC, AML, KYB, Accreditation, Residency, Sanctions, PEP, MiFID categories, and audit attestations',
        'Modules enforce jurisdiction, sanctions, lockups, caps, transfer windows, and per-investor limits',
        'Transfer Hook short-circuits failures (paused, missing claim, jurisdiction blocked, sanctions hit, lockup active, not allowlisted)',
      ],
      subsections: [
        {
          title: 'Identity Life Cycle',
          content:
            'Trusted issuers push and revoke claims. Cache invalidation keeps hook checks fresh. All PII stays off-chain; only hashes and validity windows are recorded.',
        },
        {
          title: 'Compliance Pipeline',
          content:
            'Sanctions → Identity → Jurisdiction → Offering rules → Lockups/Caps → Allowlist → Oracle guard. Every rejection emits a machine-readable reason code.',
        },
      ],
      image: ComplianceFlowDiagram,
    },
    {
      id: 'offering-lifecycle',
      title: 'Offering Lifecycle & Locked Funding',
      icon: FileText,
      category: 'Core Concepts',
      content:
        'Offerings progress through deterministic states: Draft → Pre-Offer → Open → Locked → Closed → Settlement/Refund. Idle funds earn yield through controlled adapters.',
      image: FlywheelDiagram,
      features: [
        'Supports FCFS, Pro-Rata, and priority bucket allocations with deterministic refunds',
        'Lock yield strategies integrate with marginfi/Solend under max allocation and withdrawal SLA policies',
        'Settlement batches mint SRWA, distribute principal/fees/yield splits, and export full audit logs',
      ],
      subsections: [
        {
          title: 'State Machine',
          content:
            'Transitions require explicit instructions and time guards. Settlement only executes when soft cap is hit and adapters report zero outstanding balance.',
        },
        {
          title: 'Operational Safeguards',
          content:
            'Grace modes tackle adapter outages, refunds follow snapshotted subscription PDAs, and dust accounts reconcile rounding differences.',
        },
      ],
    },
    {
      id: 'valuation-oracles',
      title: 'Valuation, NAV & Oracles',
      icon: BarChart3,
      category: 'Core Concepts',
      content:
        'Hybrid valuation marries auditor-signed NAV snapshots with Pyth FX/benchmark feeds. Guards clamp market data to secure envelopes.',
      image: DataModelDiagram,
      features: [
        'NAV Published events carry attestation hashes, signer identities, and timestamps',
        'Final price modes: NAV_ONLY, HYBRID (NAV + benchmarks), MARKET_GUARDED (TWAP subject to gap limits)',
        'Haircuts, price floors, and heartbeat/confidence guards prevent stale or manipulated readings',
      ],
      subsections: [
        {
          title: 'Integration with Lenders',
          content:
            'marginfi and Solend consume FinalPrice with minted LTV/LT/liquidation bonus configs. Degraded mode freezes new borrows until feeds recover.',
        },
        {
          title: 'Operational SLAs',
          content:
            'NAV frequency by asset class (monthly → real estate, weekly → credit, daily → short duration) and Pyth heartbeat ≤120s keep price hygiene intact.',
        },
      ],
    },
    {
      id: 'defi-integrations',
      title: 'DeFi Integrations & Connectivity',
      icon: Settings,
      category: 'Integration',
      content:
        'Certified adapters align idle-yield, collateralisation, and secondary liquidity with SRWA compliance rules.',
      image: DeFiDiagram,
      features: [
        'marginfi/Solend banks configured with isolation mode, conservative LTVs, and automatic guard rail enforcement',
        'Permissioned DEX pools (Raydium, Meteora, Orca) only accept allowlisted SRWA/USDC venues',
        'Adapter orchestrator rebalances allocations, enforces utilization caps, and monitors withdrawal SLAs',
      ],
      subsections: [
        {
          title: 'Collateral Workflow',
          content:
            'Deposits trigger hook checks (eligibility + allowlist). Health factors and liquidation behaviour follow pre-approved parameters stored in CollateralProfile PDAs.',
        },
        {
          title: 'Secondary Liquidity',
          content:
            'CLMM ranges sit around NAV, with pre-agreed depth targets. TWAP feeds inform the oracle but never override compliance gates.',
        },
      ],
    },
    {
      id: 'developer-quickstart',
      title: 'Developer Quick Start',
      icon: Code2,
      category: 'Integration',
      content:
        'Start building with the TypeScript SDK in minutes. The SDK mirrors Solana IDLs and exposes helpers for compliance checks, offerings, valuation, and DeFi endpoints.',
      subsections: [
        {
          title: 'Install & Bootstrap',
          content: 'Add the SDK to your project and configure the client:',
          code: `npm install @srwa/sdk\n# or\nyarn add @srwa/sdk\n\nimport { SRWAClient } from '@srwa/sdk';\n\nconst srwa = new SRWAClient({\n  connection: 'https://api.mainnet-beta.solana.com',\n  wallet, // Anchor-compatible wallet\n});`,
        },
        {
          title: 'Read Offering State',
          content: 'Pull the live state of an offering (caps, phase, subscriptions):',
          code: `const offering = await srwa.offerings.fetch({ mint: srwaMint });\nconsole.log(offering.phase, offering.raised.toString());`,
        },
        {
          title: 'Compliance Check Before Transfer',
          content:
            'Validate whether two parties can transfer SRWA before submitting a transaction:',
          code: `const canTransfer = await srwa.compliance.simulate({\n  mint: srwaMint,\n  from: investorA,\n  to: investorB,\n  amount: 1_000_000,\n});\n\nif (!canTransfer.ok) {\n  console.error(canTransfer.reason);\n}`,
        },
      ],
    },
    {
      id: 'security-governance',
      title: 'Security & Governance',
      icon: Lock,
      category: 'Advanced',
      content:
        'Security combines least-privilege roles, multisig + timelock governance, comprehensive logging, and rehearsed runbooks.',
      image: GovernanceDiagram,
      features: [
        'Roles: issuer_admin, compliance_officer, transfer_agent, nav_feeder, emergency_council, governor',
        'Timelocks (24–72h) wrap module changes, oracle updates, role rotations, and program upgrades',
        'Emergency council can pause transfers, trigger clawbacks with evidence hashes, and coordinate backouts',
      ],
      subsections: [
        {
          title: 'Upgrade Process',
          content:
            'Propose → queue in timelock → audit window → execute upgrade with hash validation. Rollback binaries and pause procedures are documented.',
        },
        {
          title: 'Incident Playbooks',
          content:
            'Oracle stale → switch to NAV_ONLY + freeze borrows. Adapter outage → grace mode + settlement pause. Compliance false positives → rollback params + notify investors.',
        },
      ],
    },
    {
      id: 'economic-model',
      title: 'Economic Model & Fees',
      icon: DollarSign,
      category: 'Advanced',
      content:
        'Transparent revenue levers align protocol sustainability with issuer success and investor protection.',
      features: [
        'Creation, offering, platform AUM, oracle service, adapter carry, and secondary liquidity fees are parameterised per series',
        'Splits across protocol, issuer, and partners recorded in Treasury PDAs with event-level reconciliation',
        'Performance fees tied to high-water marks and hurdles; no hidden take on investor principal',
      ],
      subsections: [
        {
          title: 'Fee Controls',
          content:
            'All fee parameters sit behind governance. Reports reconcile treasury movements with event logs, enabling external audits.',
        },
        {
          title: 'Unit Economics Targets',
          content:
            'Aim for creation + offering fees to cover CAC, platform AUM to fund operations, and adapter carry to seed risk reserves.',
        },
      ],
    },
    {
      id: 'risk-management',
      title: 'Risk Management & Stress Testing',
      icon: AlertTriangle,
      category: 'Reference',
      content:
        'A risk library maps threats to controls, metrics, and replayable stress scenarios for price, liquidity, compliance, and operational incidents.',
      riskMatrix: [
        {
          risk: 'Compliance bypass',
          vector: 'Attempting transfers through non-approved programs or expired claims',
          mitigation:
            'Transfer Hook short-circuits, module parameters versioned, claims revocation invalidates caches, audits monitor violation logs',
        },
        {
          risk: 'Oracle degradation',
          vector: 'NAV publisher outage, stale FX, or manipulated DEX ranges',
          mitigation:
            'Heartbeat/confidence guards trigger NAV_ONLY mode, lenders freeze borrows, alerting escalates to operations',
        },
        {
          risk: 'Liquidity crunch',
          vector: 'Heavy redemptions or thin DEX depth during liquidation',
          mitigation:
            'Permissioned pools with depth commitments, partial liquidation engine, backstop market makers, utilisation caps',
        },
        {
          risk: 'Operational failure',
          vector: 'Adapter withdraw timeout or governance key compromise',
          mitigation:
            'Grace windows, runbooks, risk reserves, multisig + timelock rotations, emergency council overrides',
        },
      ],
    },
    {
      id: 'roadmap',
      title: 'Roadmap & Milestones',
      icon: Map,
      category: 'Advanced',
      content:
        'Roadmap prioritises production-readiness (Fase 1) and structured securitisation (Fase 2). Each gate requires audits, partner sign-off, and dry-runs.',
      features: [
        'Phase 1: Token/compliance/valuation/offering stack live with devnet → testnet → mainnet progression',
        'Phase 1.2: Listings with marginfi, Solend, and permissioned DEX pools; TA export and observability SLOs',
        'Phase 2: Vaults, tranches, waterfalls, servicing oracle, DAO governance for FIDC-grade products',
      ],
      subsections: [
        {
          title: 'Gate Criteria',
          content:
            'Devnet → Testnet: IDLs frozen, test suite green, dashboards deployed. Testnet → Mainnet: external audit passed, governance live, KYC/TA partners active. Phase 2 launch: waterfall simulations validated, DAO quorums configured.',
        },
      ],
    },
    {
      id: 'resource-hub',
      title: 'Resource Hub',
      icon: Info,
      category: 'Reference',
      content:
        'Essential links, templates, and contacts to keep teams aligned across legal, product, risk, and engineering.',
      features: [
        'Dev Portal: IDLs, SDK docs, sample env configs, and testing harnesses',
        'Compliance Center: claim schemas, module defaults, KYC/AML provider integrations',
        'Operations Desk: runbooks, monitoring dashboards, incident communication templates',
        'Business Enablement: investor decks, FAQs, fee calculator, case studies',
      ],
      subsections: [
        {
          title: 'Contact Channels',
          content:
            'Technical support: devrel@srwa.io. Compliance & legal: compliance@srwa.io. Partnership inquiries: growth@srwa.io.',
        },
      ],
    },
  ];

  // Group sections by category
  const searchValue = searchTerm.trim().toLowerCase();

  const matchesSearch = (section: DocSection) => {
    if (!searchValue) return true;

    const haystack = [
      section.title,
      section.content,
      ...(section.features ?? []),
      ...(section.subsections?.flatMap((sub) => [sub.title, sub.content]) ?? []),
      ...(section.riskMatrix?.flatMap((risk) => [risk.risk, risk.vector, risk.mitigation]) ??
        []),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(searchValue);
  };

  const filteredSections = searchValue ? sections.filter(matchesSearch) : sections;
  const sectionsForRender = filteredSections.length > 0 ? filteredSections : sections;
  const noMatches = searchValue.length > 0 && filteredSections.length === 0;

  useEffect(() => {
    if (!sectionsForRender.some((section) => section.id === activeSection)) {
      setActiveSection(sectionsForRender[0]?.id ?? sections[0].id);
    }
  }, [sectionsForRender, activeSection, sections]);

  const sectionsByCategory = sectionsForRender.reduce((acc, section) => {
    if (!acc[section.category]) {
      acc[section.category] = [];
    }
    acc[section.category].push(section);
    return acc;
  }, {} as Record<string, DocSection[]>);

  const categories = [
    'Getting Started',
    'Core Concepts',
    'Integration',
    'Advanced',
    'Reference',
  ] as const;

  const activeDoc =
    sectionsForRender.find((section) => section.id === activeSection) ?? sections[0];
  const activeIndex = sectionsForRender.findIndex((section) => section.id === activeSection);
  const prevDoc = activeIndex > 0 ? sectionsForRender[activeIndex - 1] : null;
  const nextDoc =
    activeIndex >= 0 && activeIndex < sectionsForRender.length - 1
      ? sectionsForRender[activeIndex + 1]
      : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex">
        {/* Sidebar Navigation */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="hidden lg:block fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 border-r border-stroke-line bg-card overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fg-muted" />
                  <Input
                    placeholder="Search docs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-9 text-sm"
                  />
                </div>

                {/* Navigation by Category */}
                <nav className="space-y-6">
                  {categories.map((category) => {
                    const categorySections = sectionsByCategory[category] || [];
                    if (categorySections.length === 0) return null;

                    return (
                      <div key={category}>
                        <h3 className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-3">
                          {category}
                        </h3>
                        <ul className="space-y-1">
                          {categorySections.map((section) => {
                            const Icon = section.icon;
                            return (
                              <li key={section.id}>
                                <button
                                  onClick={() => setActiveSection(section.id)}
                                  className={cn(
                                    'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors',
                                    activeSection === section.id
                                      ? 'bg-gradient-to-r from-brand-600 via-brand-500 to-orange-500 text-white font-medium shadow-[0_12px_30px_rgba(153,69,255,0.25)]'
                                      : 'text-fg-secondary hover:bg-bg-elev-1 hover:text-fg-primary'
                                  )}
                                >
                                  <Icon className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{section.title}</span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </nav>

                {/* External Links */}
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-3">
                    External Resources
                  </h3>
                  <a
                    href="https://github.com/SRWA-Cypherpunk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-fg-secondary hover:bg-bg-elev-1 hover:text-fg-primary transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    GitHub
                  </a>
                  <a
                    href="https://x.com/SRWAdotsol"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-fg-secondary hover:bg-bg-elev-1 hover:text-fg-primary transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Twitter
                  </a>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main
          className={cn(
            'flex-1 transition-all duration-300',
            sidebarOpen ? 'lg:ml-64' : 'ml-0'
          )}
        >
          <div className="container max-w-4xl mx-auto px-6 py-12">
            {/* Mobile Menu Toggle */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden mb-6"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-4 w-4 mr-2" />
              Menu
            </Button>

            {activeDoc && (
              <article className="space-y-8">
                {noMatches && (
                  <Card className="card-institutional border-amber-500/40 bg-amber-500/5">
                    <div className="p-6 space-y-2">
                      <h2 className="text-h3 font-semibold text-amber-300">
                        No direct matches for “{searchTerm.trim()}”
                      </h2>
                      <p className="text-body-2 text-amber-100/80">
                        Showing the full knowledge base so you can continue browsing. Try
                        searching for product pillar names, stakeholder roles, or integration
                        keywords.
                      </p>
                    </div>
                  </Card>
                )}
                {/* Header */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-fg-muted">
                    <span>{activeDoc.category}</span>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-fg-primary">{activeDoc.title}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-orange-500 shadow-[0_18px_40px_rgba(153,69,255,0.35)] flex items-center justify-center">
                      <activeDoc.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-h1 font-semibold text-fg-primary">
                        {activeDoc.title}
                      </h1>
                      <Badge variant="secondary" className="mt-2">
                        {activeDoc.category}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Content */}
                <div className="prose prose-invert max-w-none space-y-8">
                  <p className="text-body-1 text-fg-secondary leading-relaxed">
                    {activeDoc.content}
                  </p>

                  {/* Image */}
                  {activeDoc.image && (
                    <div className="my-8">
                      <img
                        src={activeDoc.image}
                        alt={activeDoc.title}
                        className="w-full rounded-lg border border-stroke-line"
                      />
                    </div>
                  )}

                  {/* Features */}
                  {activeDoc.features && (
                    <Card className="card-institutional">
                      <div className="p-6 space-y-4">
                        <h3 className="text-h3 font-semibold text-fg-primary">
                          Key Features
                        </h3>
                        <ul className="space-y-3">
                          {activeDoc.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-3 text-body-2 text-fg-secondary"
                            >
                              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[0_10px_22px_rgba(153,69,255,0.35)]">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  )}

                  {/* Subsections */}
                  {activeDoc.subsections && (
                    <div className="space-y-6">
                      {activeDoc.subsections.map((subsection, idx) => (
                        <div key={idx} className="space-y-4">
                          <h3 className="text-h3 font-semibold text-fg-primary">
                            {subsection.title}
                          </h3>
                          <p className="text-body-2 text-fg-secondary">
                            {subsection.content}
                          </p>
                          {subsection.code && <CodeBlock code={subsection.code} />}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Risk Matrix */}
                  {activeDoc.riskMatrix && (
                    <Card className="card-institutional overflow-hidden">
                      <div className="p-6 space-y-4">
                        <h3 className="text-h3 font-semibold text-fg-primary">
                          Risk Assessment Matrix
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-stroke-line">
                                <th className="text-left p-3 text-sm font-semibold text-fg-primary">
                                  Risk
                                </th>
                                <th className="text-left p-3 text-sm font-semibold text-fg-primary">
                                  Vector
                                </th>
                                <th className="text-left p-3 text-sm font-semibold text-fg-primary">
                                  Mitigation
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeDoc.riskMatrix.map((risk, idx) => (
                                <tr
                                  key={idx}
                                  className="border-b border-stroke-line hover:bg-bg-elev-1 transition-colors"
                                >
                                  <td className="p-3 text-sm font-medium text-fg-primary">
                                    {risk.risk}
                                  </td>
                                  <td className="p-3 text-sm text-fg-secondary">
                                    {risk.vector}
                                  </td>
                                  <td className="p-3 text-sm text-fg-secondary">
                                    {risk.mitigation}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>

                {/* Navigation */}
                <Separator />
                <div className="flex justify-between items-center pt-8">
                  {prevDoc ? (
                    <Button
                      variant="outline"
                      onClick={() => setActiveSection(prevDoc.id)}
                      className="flex items-center gap-2"
                    >
                      <ChevronRight className="h-4 w-4 rotate-180" />
                      <div className="text-left">
                        <div className="text-xs text-fg-muted">Previous</div>
                        <div className="font-medium">{prevDoc.title}</div>
                      </div>
                    </Button>
                  ) : (
                    <div />
                  )}

                  {nextDoc && (
                    <Button
                      variant="outline"
                      onClick={() => setActiveSection(nextDoc.id)}
                      className="flex items-center gap-2"
                    >
                      <div className="text-right">
                        <div className="text-xs text-fg-muted">Next</div>
                        <div className="font-medium">{nextDoc.title}</div>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </article>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
