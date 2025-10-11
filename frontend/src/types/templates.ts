import { TokenTemplate, TokenConfig, ComplianceModuleConfig } from './srwa-contracts';
import { ComplianceConfiguration } from './compliance';

// Template completo com metadados
export interface RWATemplate {
  id: TokenTemplate;
  name: string;
  description: string;
  use_cases: string[];
  icon: string;
  
  // Configurações padrão
  default_config: Partial<TokenConfig>;
  compliance_config: ComplianceConfiguration;
  
  // Características
  features: TemplateFeature[];
  restrictions: TemplateRestriction[];
  
  // Campos requeridos no wizard
  required_fields: string[];
  optional_fields: string[];
  
  // Integrações suportadas
  supported_integrations: Integration[];
}

export interface TemplateFeature {
  id: string;
  name: string;
  description: string;
  enabled_by_default: boolean;
}

export interface TemplateRestriction {
  id: string;
  type: 'holder_limit' | 'jurisdiction' | 'transfer_frequency' | 'lockup_required';
  description: string;
  value?: any;
}

export interface Integration {
  id: 'blend' | 'soroswap' | 'oracle' | 'dex';
  name: string;
  supported: boolean;
  configuration?: any;
}

// Configurações específicas por template
export const RWA_TEMPLATES: Record<TokenTemplate, RWATemplate> = {
  [TokenTemplate.RwaEquity]: {
    id: TokenTemplate.RwaEquity,
    name: "RWA Equity Token",
    description: "For tokenizing equity stakes in real-world assets like real estate, companies, or investment funds",
    use_cases: [
      "Real estate tokenization",
      "Private equity shares", 
      "Startup equity tokens",
      "Infrastructure investments"
    ],
    icon: "",
    
    default_config: {
      decimals: 18,
      claim_topics: [1, 2, 3], // KYC, AML, Accredited
      max_holders: 2000,
      allowed_jurisdictions: ["US", "CA", "GB", "AU", "DE", "FR"],
      denied_jurisdictions: ["IR", "KP", "MM"],
    },
    
    compliance_config: {
      modules: {
        jurisdiction: {
          enabled: true,
          require_jurisdiction_claim: true,
          allowed_jurisdictions: ["US", "CA", "GB"],
          denied_jurisdictions: ["IR", "KP"],
        },
        lockup: {
          enabled: true,
          allow_partial_unlocks: false,
          lockup_schedules: [],
        },
        max_holders: {
          enabled: true,
          max_holders: 2000,
          count_zero_balances: false,
          admin_addresses_exempt: [],
        },
        pause_freeze: {
          enabled: true,
          allow_admin_transfers_when_paused: true,
          freeze_addresses: [],
        },
        sanctions: {
          enabled: true,
          check_on_transfer: true,
          check_on_mint: true,
          auto_update_lists: true,
          custom_blacklist: [],
        },
      },
    },
    
    features: [
      {
        id: "accredited_only",
        name: "Accredited Investor Restriction",
        description: "Only accredited investors can hold tokens",
        enabled_by_default: true,
      },
      {
        id: "lockup_schedules",
        name: "Lockup Schedules",
        description: "Support for vesting and lockup periods",
        enabled_by_default: true,
      },
      {
        id: "dividend_distribution",
        name: "Dividend Distribution",
        description: "Built-in dividend distribution mechanism",
        enabled_by_default: false,
      },
      {
        id: "voting_rights",
        name: "Voting Rights",
        description: "Token holders can participate in governance",
        enabled_by_default: false,
      },
    ],
    
    restrictions: [
      {
        id: "holder_limit",
        type: "holder_limit",
        description: "Maximum 2000 token holders to comply with securities regulations",
        value: 2000,
      },
      {
        id: "accredited_requirement",
        type: "jurisdiction",
        description: "Holders must be accredited investors in supported jurisdictions",
      },
      {
        id: "lockup_period",
        type: "lockup_required",
        description: "Initial tokens may have mandatory lockup periods",
      },
    ],
    
    required_fields: ["name", "symbol", "admin", "initial_supply"],
    optional_fields: ["max_holders", "lockup_schedules", "dividend_rate"],
    
    supported_integrations: [
      { id: "blend", name: "Blend Protocol", supported: true },
      { id: "soroswap", name: "SoroSwap", supported: true },
      { id: "oracle", name: "Price Oracles", supported: true },
    ],
  },

  [TokenTemplate.RwaDebt]: {
    id: TokenTemplate.RwaDebt,
    name: "RWA Debt Token",
    description: "For tokenizing debt instruments like bonds, loans, or other fixed-income assets",
    use_cases: [
      "Corporate bonds",
      "Government bonds",
      "Loan participations",
      "Mortgage-backed securities"
    ],
    icon: "",
    
    default_config: {
      decimals: 6,
      claim_topics: [1, 2], // KYC, AML only
      allowed_jurisdictions: [],
      denied_jurisdictions: [],
    },
    
    compliance_config: {
      modules: {
        jurisdiction: {
          enabled: false,
          require_jurisdiction_claim: false,
          allowed_jurisdictions: [],
          denied_jurisdictions: [],
        },
        lockup: {
          enabled: false,
          allow_partial_unlocks: true,
          lockup_schedules: [],
        },
        max_holders: {
          enabled: false,
          max_holders: 0,
          count_zero_balances: false,
          admin_addresses_exempt: [],
        },
        pause_freeze: {
          enabled: true,
          allow_admin_transfers_when_paused: true,
          freeze_addresses: [],
        },
        sanctions: {
          enabled: true,
          check_on_transfer: true,
          check_on_mint: true,
          auto_update_lists: true,
          custom_blacklist: [],
        },
      },
    },
    
    features: [
      {
        id: "interest_payments",
        name: "Interest Payments",
        description: "Automated interest payments to token holders",
        enabled_by_default: true,
      },
      {
        id: "maturity_date",
        name: "Maturity Date",
        description: "Tokens have a defined maturity date",
        enabled_by_default: true,
      },
      {
        id: "credit_rating",
        name: "Credit Rating",
        description: "Built-in credit rating mechanism",
        enabled_by_default: false,
      },
    ],
    
    restrictions: [
      {
        id: "no_holder_limit",
        type: "holder_limit",
        description: "No holder limit for debt instruments",
        value: null,
      },
    ],
    
    required_fields: ["name", "symbol", "admin", "maturity_date", "interest_rate"],
    optional_fields: ["credit_rating", "collateral_description"],
    
    supported_integrations: [
      { id: "blend", name: "Blend Protocol", supported: true },
      { id: "oracle", name: "Price Oracles", supported: true },
      { id: "soroswap", name: "SoroSwap", supported: false },
    ],
  },

  [TokenTemplate.FundShare]: {
    id: TokenTemplate.FundShare,
    name: "Fund Share Token",
    description: "For tokenizing shares in investment funds, hedge funds, or managed portfolios",
    use_cases: [
      "Hedge fund shares",
      "Mutual fund units",
      "Private equity fund shares",
      "Venture capital fund shares"
    ],
    icon: "",
    
    default_config: {
      decimals: 18,
      claim_topics: [1, 2, 3], // KYC, AML, Accredited
      max_holders: 500,
      allowed_jurisdictions: [],
      denied_jurisdictions: [],
    },
    
    compliance_config: {
      modules: {
        jurisdiction: {
          enabled: true,
          require_jurisdiction_claim: true,
          allowed_jurisdictions: [],
          denied_jurisdictions: [],
        },
        lockup: {
          enabled: true,
          allow_partial_unlocks: true,
          lockup_schedules: [],
        },
        max_holders: {
          enabled: true,
          max_holders: 500,
          count_zero_balances: false,
          admin_addresses_exempt: [],
        },
        pause_freeze: {
          enabled: true,
          allow_admin_transfers_when_paused: false,
          freeze_addresses: [],
        },
        sanctions: {
          enabled: true,
          check_on_transfer: true,
          check_on_mint: true,
          auto_update_lists: true,
          custom_blacklist: [],
        },
      },
    },
    
    features: [
      {
        id: "nav_tracking",
        name: "NAV Tracking",
        description: "Tracks Net Asset Value of the fund",
        enabled_by_default: true,
      },
      {
        id: "redemption_mechanism",
        name: "Redemption Mechanism",
        description: "Allow holders to redeem shares for underlying assets",
        enabled_by_default: true,
      },
      {
        id: "performance_fees",
        name: "Performance Fees",
        description: "Built-in performance fee calculation",
        enabled_by_default: false,
      },
    ],
    
    restrictions: [
      {
        id: "qualified_investors",
        type: "jurisdiction",
        description: "Only qualified investors allowed",
      },
      {
        id: "limited_holders",
        type: "holder_limit",
        description: "Limited to 500 holders for regulatory compliance",
        value: 500,
      },
    ],
    
    required_fields: ["name", "symbol", "admin", "fund_type", "management_fee"],
    optional_fields: ["performance_fee", "high_water_mark", "redemption_frequency"],
    
    supported_integrations: [
      { id: "oracle", name: "Price Oracles", supported: true },
      { id: "blend", name: "Blend Protocol", supported: false },
      { id: "soroswap", name: "SoroSwap", supported: false },
    ],
  },

  [TokenTemplate.PermissionedStable]: {
    id: TokenTemplate.PermissionedStable,
    name: "Permissioned Stablecoin",
    description: "For permissioned stablecoins with basic KYC/AML compliance",
    use_cases: [
      "Corporate stablecoins",
      "Regulated digital currencies",
      "Enterprise payment tokens",
      "Cross-border payment tokens"
    ],
    icon: "",
    
    default_config: {
      decimals: 6,
      claim_topics: [1, 2], // KYC, AML
      allowed_jurisdictions: [],
      denied_jurisdictions: [],
    },
    
    compliance_config: {
      modules: {
        jurisdiction: {
          enabled: false,
          require_jurisdiction_claim: false,
          allowed_jurisdictions: [],
          denied_jurisdictions: [],
        },
        lockup: {
          enabled: false,
          allow_partial_unlocks: true,
          lockup_schedules: [],
        },
        max_holders: {
          enabled: false,
          max_holders: 0,
          count_zero_balances: false,
          admin_addresses_exempt: [],
        },
        pause_freeze: {
          enabled: true,
          allow_admin_transfers_when_paused: true,
          freeze_addresses: [],
        },
        sanctions: {
          enabled: true,
          check_on_transfer: true,
          check_on_mint: true,
          auto_update_lists: true,
          custom_blacklist: [],
        },
      },
    },
    
    features: [
      {
        id: "price_stability",
        name: "Price Stability",
        description: "Maintains stable value through collateral backing",
        enabled_by_default: true,
      },
      {
        id: "fast_transfers",
        name: "Fast Transfers",
        description: "Optimized for frequent transfers and payments",
        enabled_by_default: true,
      },
      {
        id: "regulatory_reporting",
        name: "Regulatory Reporting",
        description: "Built-in compliance reporting for regulators",
        enabled_by_default: true,
      },
    ],
    
    restrictions: [
      {
        id: "kyc_required",
        type: "jurisdiction",
        description: "Basic KYC/AML verification required",
      },
    ],
    
    required_fields: ["name", "symbol", "admin", "collateral_type"],
    optional_fields: ["stability_mechanism", "reserve_ratio"],
    
    supported_integrations: [
      { id: "blend", name: "Blend Protocol", supported: true },
      { id: "soroswap", name: "SoroSwap", supported: true },
      { id: "oracle", name: "Price Oracles", supported: true },
      { id: "dex", name: "DEX Integration", supported: true },
    ],
  },
};

// Helper functions para trabalhar com templates
export function getTemplateById(id: TokenTemplate): RWATemplate {
  return RWA_TEMPLATES[id];
}

export function getTemplateFeatures(id: TokenTemplate): TemplateFeature[] {
  return RWA_TEMPLATES[id].features;
}

export function getTemplateCompliance(id: TokenTemplate): ComplianceConfiguration {
  return RWA_TEMPLATES[id].compliance_config;
}

export function isIntegrationSupported(templateId: TokenTemplate, integrationId: string): boolean {
  const template = RWA_TEMPLATES[templateId];
  const integration = template.supported_integrations.find(i => i.id === integrationId);
  return integration?.supported ?? false;
}