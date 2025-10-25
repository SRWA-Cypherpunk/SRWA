import { Address, TransferContext, IdentityClaim } from './srwa-contracts';

// Resultado de verificação de compliance
export interface ComplianceCheckResult {
  is_compliant: boolean;
  failing_modules: string[];
  error_details: ComplianceError[];
  can_force_transfer: boolean; // Se admin pode forçar transfer
}

// Erro específico de compliance
export interface ComplianceError {
  module: string;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

// Interface base para módulos de compliance
export interface ComplianceModule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  configure(params: any): void;
  check(context: TransferContext): Promise<boolean>;
}

// Módulo de Jurisdição
export interface JurisdictionModule extends ComplianceModule {
  id: 'jurisdiction';
  config: {
    allowed_jurisdictions: string[];
    denied_jurisdictions: string[];
  };
}

// Módulo de Lockup
export interface LockupModule extends ComplianceModule {
  id: 'lockup';
  config: {
    lockup_schedules: LockupSchedule[];
  };
}

export interface LockupSchedule {
  holder: Address;
  locked_amount: string;
  unlock_time: number;
  reason: string;
}

// Módulo de Max Holders
export interface MaxHoldersModule extends ComplianceModule {
  id: 'max_holders';
  config: {
    max_holders: number;
    current_holders: number;
    whitelist: Address[]; // Addresses que não contam para o limite
  };
}

// Módulo de Pause/Freeze
export interface PauseFreezeModule extends ComplianceModule {
  id: 'pause_freeze';
  config: {
    global_paused: boolean;
    frozen_addresses: FrozenAddress[];
  };
}

export interface FrozenAddress {
  address: Address;
  frozen_amount: string; // Quantidade frozen, 0 = completamente frozen
  reason: string;
  frozen_at: number;
}

// Módulo de Sanctions/Blacklist
export interface SanctionsModule extends ComplianceModule {
  id: 'sanctions';
  config: {
    blacklisted_addresses: Address[];
    sanctions_lists: string[]; // OFAC, EU, etc.
    auto_update: boolean;
  };
}

// Status completo de compliance de um token
export interface TokenComplianceStatus {
  token_address: Address;
  is_paused: boolean;
  modules: {
    jurisdiction: JurisdictionModuleStatus;
    lockup: LockupModuleStatus;
    max_holders: MaxHoldersModuleStatus;
    pause_freeze: PauseFreezeModuleStatus;
    sanctions: SanctionsModuleStatus;
  };
  overall_health: 'healthy' | 'warning' | 'critical';
}

// Status específico de cada módulo
export interface JurisdictionModuleStatus {
  enabled: boolean;
  allowed_count: number;
  denied_count: number;
  default_policy: 'allow' | 'deny';
}

export interface LockupModuleStatus {
  enabled: boolean;
  total_locked_addresses: number;
  total_locked_amount: string;
  upcoming_unlocks: number; // Próximos 30 dias
}

export interface MaxHoldersModuleStatus {
  enabled: boolean;
  current_holders: number;
  max_holders: number;
  utilization_percentage: number;
}

export interface PauseFreezeModuleStatus {
  enabled: boolean;
  is_paused: boolean;
  frozen_addresses_count: number;
  total_frozen_amount: string;
}

export interface SanctionsModuleStatus {
  enabled: boolean;
  blacklisted_count: number;
  last_update: number;
  auto_update_enabled: boolean;
}

// Dados para configuração de compliance
export interface ComplianceConfiguration {
  modules: {
    jurisdiction?: JurisdictionConfig;
    lockup?: LockupConfig;
    max_holders?: MaxHoldersConfig;
    pause_freeze?: PauseFreezeConfig;
    sanctions?: SanctionsConfig;
  };
}

export interface JurisdictionConfig {
  enabled: boolean;
  allowed_jurisdictions: string[];
  denied_jurisdictions: string[];
  require_jurisdiction_claim: boolean;
}

export interface LockupConfig {
  enabled: boolean;
  allow_partial_unlocks: boolean;
  lockup_schedules: LockupSchedule[];
}

export interface MaxHoldersConfig {
  enabled: boolean;
  max_holders: number;
  count_zero_balances: boolean;
  admin_addresses_exempt: Address[];
}

export interface PauseFreezeConfig {
  enabled: boolean;
  allow_admin_transfers_when_paused: boolean;
  freeze_addresses: FrozenAddress[];
}

export interface SanctionsConfig {
  enabled: boolean;
  check_on_transfer: boolean;
  check_on_mint: boolean;
  auto_update_lists: boolean;
  custom_blacklist: Address[];
}

// Ações de compliance para admin
export interface ComplianceAction {
  type: 'pause' | 'unpause' | 'freeze' | 'unfreeze' | 'add_lockup' | 'remove_lockup' | 'update_jurisdiction' | 'add_sanctions';
  target?: Address;
  params?: any;
  reason: string;
  executed_by: Address;
  executed_at?: number;
}

// Log de ações de compliance
export interface ComplianceLog {
  id: string;
  action: ComplianceAction;
  transaction_hash: string;
  block_number: number;
  success: boolean;
  error_message?: string;
}

// Relatório de compliance
export interface ComplianceReport {
  token_address: Address;
  report_date: number;
  period_start: number;
  period_end: number;
  
  summary: {
    total_transfers: number;
    blocked_transfers: number;
    compliance_rate: number; // Percentage
    unique_addresses: number;
  };
  
  module_performance: {
    jurisdiction: ModulePerformance;
    lockup: ModulePerformance;
    max_holders: ModulePerformance;
    pause_freeze: ModulePerformance;
    sanctions: ModulePerformance;
  };
  
  incidents: ComplianceIncident[];
}

export interface ModulePerformance {
  enabled: boolean;
  checks_performed: number;
  checks_passed: number;
  checks_failed: number;
  avg_check_time_ms: number;
}

export interface ComplianceIncident {
  id: string;
  type: 'blocked_transfer' | 'sanctions_hit' | 'jurisdiction_violation' | 'lockup_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  addresses_involved: Address[];
  timestamp: number;
  resolved: boolean;
  resolution_notes?: string;
}

// Configurações de template para compliance
export const COMPLIANCE_TEMPLATES = {
  rwa_equity: {
    jurisdiction: { enabled: true, require_jurisdiction_claim: true },
    lockup: { enabled: true, allow_partial_unlocks: false },
    max_holders: { enabled: true, max_holders: 2000 },
    pause_freeze: { enabled: true, allow_admin_transfers_when_paused: true },
    sanctions: { enabled: true, auto_update_lists: true },
  },
  rwa_debt: {
    jurisdiction: { enabled: false },
    lockup: { enabled: false },
    max_holders: { enabled: false },
    pause_freeze: { enabled: true, allow_admin_transfers_when_paused: true },
    sanctions: { enabled: true, auto_update_lists: true },
  },
  fund_share: {
    jurisdiction: { enabled: true, require_jurisdiction_claim: true },
    lockup: { enabled: true, allow_partial_unlocks: true },
    max_holders: { enabled: true, max_holders: 500 },
    pause_freeze: { enabled: true, allow_admin_transfers_when_paused: false },
    sanctions: { enabled: true, auto_update_lists: true },
  },
  permissioned_stable: {
    jurisdiction: { enabled: false },
    lockup: { enabled: false },
    max_holders: { enabled: false },
    pause_freeze: { enabled: true, allow_admin_transfers_when_paused: true },
    sanctions: { enabled: true, auto_update_lists: true },
  },
} as const;