import { useState } from 'react';
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
  Zap,
  Lock,
  Database,
  Settings,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [activeSection, setActiveSection] = useState('overview');

  // Documentation sections organized by category
  const sections: DocSection[] = [
    {
      id: 'overview',
      title: 'Platform Overview',
      icon: BookOpen,
      category: 'Getting Started',
      content:
        'SRWA Platform introduces institutional-grade Real-World Asset tokenization with built-in compliance. Built on Solana for high performance and low costs.',
      features: [
        'Token-first Compliance: Built-in compliance at the asset layer',
        'Solana Performance: Sub-second finality, ultra-low fees',
        'Institutional Grade: Designed for regulated financial institutions',
        'Modular Architecture: Flexible compliance modules',
        'DeFi Native: Seamless integration with Solana DeFi',
      ],
    },
    {
      id: 'quickstart',
      title: 'Quick Start Guide',
      icon: Zap,
      category: 'Getting Started',
      content: 'Get started with SRWA Platform in minutes. This guide covers installation, setup, and your first transaction.',
      subsections: [
        {
          title: 'Installation',
          content: 'Install the SRWA SDK using npm or yarn:',
          code: `npm install @srwa/sdk\n# or\nyarn add @srwa/sdk`,
        },
        {
          title: 'Initialize SDK',
          content: 'Configure and initialize the SDK with your credentials:',
          code: `import { SRWA } from '@srwa/sdk';\n\nconst srwa = new SRWA({\n  network: 'mainnet',\n  apiKey: process.env.SRWA_API_KEY,\n});`,
        },
        {
          title: 'First Transaction',
          content: 'Execute your first supply transaction:',
          code: `const tx = await srwa.supply({\n  asset: 'SRWA-USDC',\n  amount: 1000,\n});\n\nconsole.log('Transaction:', tx.signature);`,
        },
      ],
    },
    {
      id: 'architecture',
      title: 'System Architecture',
      icon: Database,
      category: 'Core Concepts',
      content:
        'SRWA follows a token-first compliance architecture with core layers including Token Layer, Compliance Engine, Identity Registry, and DeFi Integration.',
      image: '/docs/photo2Doc.png',
      subsections: [
        {
          title: 'Core Layer',
          content:
            'SRWA Token: Solana SPL token with built-in compliance. Compliance Engine: Real-time compliance checks. Identity Registry: KYC/AML verification system.',
        },
        {
          title: 'Integration Layer',
          content:
            'Money Markets: Isolated lending pools for different RWA classes. DEX Integration: Seamless swaps and liquidity. Oracle Network: Hybrid pricing with NAV clamping.',
        },
      ],
    },
    {
      id: 'compliance',
      title: 'Compliance Framework',
      icon: Shield,
      category: 'Core Concepts',
      content:
        'Comprehensive compliance framework ensuring regulatory adherence for institutional RWA trading.',
      subsections: [
        {
          title: 'KYC/AML Verification',
          content:
            'Multi-tier verification system with jurisdiction controls, sanctions screening, and accreditation requirements.',
        },
        {
          title: 'Transfer Restrictions',
          content:
            'Time-based lockups, transfer windows, maximum holder limits, and jurisdiction-based allowlists.',
        },
        {
          title: 'Audit Trail',
          content:
            'Complete on-chain audit trail with structured events for every compliance decision and state change.',
        },
      ],
    },
    {
      id: 'lending-integration',
      title: 'Lending Protocol Integration',
      icon: TrendingUp,
      category: 'Integration',
      content:
        'Integrate SRWA tokens with lending protocols for supply, borrow, and liquidation flows.',
      subsections: [
        {
          title: 'Supply Assets',
          content: 'Supply SRWA tokens as collateral with risk-adjusted parameters:',
          code: `const supply = await srwa.lending.supply({\n  pool: 'SRWA-TBill',\n  amount: 10000,\n  onBehalfOf: wallet.publicKey,\n});`,
        },
        {
          title: 'Borrow Against Collateral',
          content: 'Borrow USDC against SRWA collateral:',
          code: `const borrow = await srwa.lending.borrow({\n  pool: 'SRWA-TBill',\n  amount: 7500, // 75% LTV\n  to: wallet.publicKey,\n});`,
        },
        {
          title: 'Health Factor Monitoring',
          content: 'Monitor position health and avoid liquidation:',
          code: `const position = await srwa.lending.getPosition(wallet.publicKey);\nconsole.log('Health Factor:', position.healthFactor);\n// HF > 1.5: Safe\n// HF < 1.2: At Risk\n// HF < 1.0: Liquidatable`,
        },
      ],
    },
    {
      id: 'oracle-system',
      title: 'Oracle & Pricing',
      icon: Code2,
      category: 'Integration',
      content:
        'Hybrid oracle system combining on-chain TWAP with custodian-signed NAV for accurate RWA pricing.',
      subsections: [
        {
          title: 'Price Calculation',
          content:
            'Effective price is clamped between NAV bands with haircut applied for conservative valuations.',
          code: `// Pricing Formula\nP_spot = TWAP_Oracle\nNAV_net = NAV_custodian * (1 - haircut)\nBand_low = NAV_net * (1 - band)\nBand_high = NAV_net * (1 + band)\nEffective = clamp(P_spot, Band_low, Band_high)`,
        },
        {
          title: 'Degraded Mode',
          content:
            'System enters degraded mode when oracle data is stale, restricting new borrows and adjusting LTVs.',
        },
      ],
    },
    {
      id: 'security',
      title: 'Security Best Practices',
      icon: Lock,
      category: 'Advanced',
      content:
        'Security considerations and best practices for building on SRWA Platform.',
      subsections: [
        {
          title: 'Wallet Security',
          content:
            'Use hardware wallets for production, implement multisig for treasury operations, rotate API keys regularly.',
        },
        {
          title: 'Transaction Safety',
          content:
            'Always set slippage limits, use deadline parameters, implement front-running protection.',
          code: `const tx = await srwa.swap({\n  from: 'SRWA',\n  to: 'USDC',\n  amount: 1000,\n  slippage: 0.5, // 0.5% max slippage\n  deadline: Date.now() + 60000, // 60s\n});`,
        },
        {
          title: 'Error Handling',
          content:
            'Implement proper error handling and retry logic for failed transactions.',
          code: `try {\n  const tx = await srwa.supply({ ... });\n} catch (error) {\n  if (error.code === 'INSUFFICIENT_BALANCE') {\n    // Handle insufficient balance\n  } else if (error.code === 'COMPLIANCE_FAILED') {\n    // Handle compliance rejection\n  }\n}`,
        },
      ],
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      icon: FileText,
      category: 'Reference',
      content: 'Complete API reference for SRWA SDK and smart contracts.',
      subsections: [
        {
          title: 'SDK Methods',
          content: 'Core SDK methods for interacting with SRWA Protocol:',
          code: `// Supply assets\nawait srwa.supply({ pool, amount })\n\n// Borrow assets\nawait srwa.borrow({ pool, amount })\n\n// Repay debt\nawait srwa.repay({ pool, amount })\n\n// Withdraw collateral\nawait srwa.withdraw({ pool, amount })\n\n// Get position\nawait srwa.getPosition(address)\n\n// Get pool info\nawait srwa.getPool(poolId)`,
        },
        {
          title: 'Error Codes',
          content: 'Standard error codes returned by the protocol:',
          code: `// Compliance Errors\n10: PAUSED\n11: FROZEN_FROM\n12: FROZEN_TO\n14: FROM_NOT_VERIFIED\n15: TO_NOT_VERIFIED\n\n// Transaction Errors\n30: NOT_AUTHORIZED\n31: INSUFFICIENT_BALANCE\n32: INSUFFICIENT_ALLOWANCE`,
        },
      ],
    },
    {
      id: 'risks',
      title: 'Risk Assessment',
      icon: AlertTriangle,
      category: 'Reference',
      content:
        'Comprehensive risk assessment matrix covering protocol risks and mitigations.',
      riskMatrix: [
        {
          risk: 'R-1 Compliance Bypass',
          vector: 'dApp calls transfer without compliance checks',
          mitigation:
            'All balance-changing operations require compliance.canTransfer() approval with unit test coverage',
        },
        {
          risk: 'R-2 Oracle Failure',
          vector: 'Custodian outage or feed lag',
          mitigation:
            'Degraded mode with staleness guards, NAV haircuts, TWAP fallback, automated alerts',
        },
        {
          risk: 'R-3 Liquidity Shock',
          vector: 'Thin liquidity during liquidations',
          mitigation:
            'Partial liquidations with lot limits, pre-trade quotes, backstop configuration',
        },
        {
          risk: 'R-4 Smart Contract Risk',
          vector: 'Contract vulnerabilities',
          mitigation:
            'Multiple audits, bug bounty program, formal verification, timelock upgrades',
        },
      ],
    },
  ];

  // Group sections by category
  const sectionsByCategory = sections.reduce((acc, section) => {
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

  // Filter sections based on search
  const filteredSections = sections.filter((section) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      section.title.toLowerCase().includes(searchLower) ||
      section.content.toLowerCase().includes(searchLower)
    );
  });

  const activeDoc = sections.find((s) => s.id === activeSection);
  const activeIndex = sections.findIndex((s) => s.id === activeSection);
  const prevDoc = activeIndex > 0 ? sections[activeIndex - 1] : null;
  const nextDoc = activeIndex < sections.length - 1 ? sections[activeIndex + 1] : null;

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
                                      ? 'bg-brand-500/10 text-brand-400 font-medium'
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
                    href="https://github.com/srwa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-fg-secondary hover:bg-bg-elev-1 hover:text-fg-primary transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    GitHub
                  </a>
                  <a
                    href="https://discord.gg/srwa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-fg-secondary hover:bg-bg-elev-1 hover:text-fg-primary transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Discord
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
                {/* Header */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-fg-muted">
                    <span>{activeDoc.category}</span>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-fg-primary">{activeDoc.title}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <activeDoc.icon className="h-10 w-10 text-brand-400" />
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
                              <div className="w-5 h-5 rounded-full bg-brand-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Check className="h-3 w-3 text-brand-400" />
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
