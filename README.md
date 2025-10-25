# SRWA Protocol - Security Token on Solana

## 🎯 Visão Geral

Sistema completo de **Security Token (SRWA)** implementado em Rust + Solana + Anchor, baseado no padrão SPL Token-2022 com compliance on-chain, offering pools, yield adapters e integração nativa com DeFi (marginfi/Solend).

## 📦 Arquitetura de Programas

### 1. **srwa_factory**
Fábrica de tokens SRWA com SPL Token-2022 + Transfer Hook
- Cria mint com extensões (frozen, permanent delegate, metadata)
- Inicializa PDAs de configuração (SRWAConfig, OfferingState, ValuationData)
- Define roles (issuer_admin, compliance_officer, transfer_agent)
- Gerencia trusted issuers e módulos de compliance

**Instruções principais:**
- `create_srwa()` - Cria novo SRWA token
- `update_trusted_issuer()` - Adiciona/remove issuers de KYC
- `enable_module()` / `disable_module()` - Ativa módulos de compliance
- `set_oracle_cfg()` - Configura oráculos (Pyth + NAV feeder)
- `rotate_role()` - Rotaciona permissões (multisig)

### 2. **identity_claims**
Gerenciamento de identidade e claims (KYC/AML/Accredited)
- PDAs por usuário (IdentityAccount) e por claim (ClaimAccount)
- Claims assinadas por trusted issuers
- Suporte para revogação e expiração

**Instruções principais:**
- `register_identity()` - Registra nova identidade
- `add_claim()` - Adiciona claim (KYC, AML, Accredited, etc)
- `revoke_claim()` - Revoga claim
- `is_verified()` - Verifica se usuário possui todas claims necessárias

### 3. **compliance_modules**
Módulos configuráveis de compliance
- Jurisdiction (allow/deny por país ISO)
- Sanctions (lista de endereços bloqueados)
- Accredited (requerimento de investidor qualificado)
- Lockup (períodos de lock por usuário)
- Volume Caps (limites diários/mensais/por tx)
- Transfer Window (janelas de tempo permitidas)
- Program/Account Allowlist (DEX/lending permitidos)

**Instruções principais:**
- `configure_jurisdiction()` - Configura países permitidos/bloqueados
- `set_sanctions()` - Define lista de sanções
- `set_lockup()` - Define período de lockup para usuário
- `set_volume_caps()` - Caps globais de volume
- `set_transfer_window()` - Janelas permitidas de transferência
- `set_program_allowlist()` - Allowlist de programas DeFi
- `set_account_allowlist()` - Allowlist de vaults/pools

### 4. **srwa_controller** (Transfer Hook)
Hook executado em **todas** as transferências do token
- Integra-se com Token-2022 Transfer Hook extension
- Pipeline de verificação:
  1. Pause/freeze checks
  2. Identity verification (KYC/AML via CPI)
  3. Offering rules (fase, caps, elegibilidade)
  4. Investor limits
  5. Lockup verification
  6. Transfer window validation
  7. Allowlist checks

**Instruções principais:**
- `on_transfer()` - Hook automático em transferências
- `transfer_checked()` - Transferência com compliance

### 5. **offering_pool**
Pool de captação com lock period e settlement
- Gerencia subscriptions de investidores
- Lock period com yield farming (idle strategy)
- Settlement: distribui tokens + transfere capital ao emissor
- Refund em caso de falha (< soft_cap)

**Instruções principais:**
- `open()` - Abre oferta para subscrições
- `subscribe()` - Investidor subscreve com USDC
- `lock()` - Encerra subscrições e lock de capital
- `settle()` - Distribui tokens (pro-rata) e capital ao emissor
- `refund()` - Reembolsa investidor (se < soft_cap)

### 6. **yield_adapter**
Adaptadores para protocolos de yield (marginfi/Solend)
- Deposita USDC do pool em protocolos de lending durante lock
- Retira yield ao final do período
- Abstrai CPIs para diferentes protocolos

**Instruções principais:**
- `deposit_marginfi()` / `withdraw_marginfi()`
- `deposit_solend()` / `withdraw_solend()`
- `skim_yield()` - Coleta yield acumulado

### 7. **valuation_oracle**
Oráculos de valuation (NAV + Pyth)
- NAV assinado por feeder institucional
- Integração com Pyth para FX rates
- Guards (heartbeat, max deviation)

**Instruções principais:**
- `publish_nav()` - Publica NAV total e per-token
- `compute_final_price()` - Compõe preço final (NAV + FX)

### 8. **cashflow_engine** (Fase 2 - FIDC completo)
Engine de cashflow com waterfall
- Schedule de cupons/pagamentos
- Waterfall distribution: fees → senior → mezz → equity

**Instruções principais:**
- `schedule_coupon()` - Agenda cupom recorrente
- `record_payment()` - Registra pagamento
- `distribute()` - Executa waterfall

## 🚀 Build & Deploy

### Requisitos
- Rust 1.75+
- Solana CLI 1.18+
- Anchor 0.31.1+
- Node.js 18+

### Build
```bash
cd srwa-protocol
anchor build
```

### Testes
```bash
anchor test
```

### Deploy (Devnet)
```bash
anchor deploy --provider.cluster devnet
```

## 📊 Fluxos E2E

### 1. **Emissão de SRWA Token**
```
Issuer → srwa_factory::create_srwa()
  ↓
Cria Mint Token-2022 + PDAs (Config, Offering, Valuation)
  ↓
Configura Transfer Hook → srwa_controller
  ↓
Define trusted issuers, módulos, oracles
```

### 2. **KYC de Investidor**
```
Trusted Issuer → identity_claims::add_claim(user, KYC)
                                          ↓
                            identity_claims::add_claim(user, AML)
                                          ↓
                            identity_claims::add_claim(user, Accredited)
```

### 3. **Oferta & Captação**
```
Issuer → offering_pool::open()
  ↓
Investidor → offering_pool::subscribe(1000 USDC)
  ↓
Issuer → offering_pool::lock() [capital rende em marginfi]
  ↓
Issuer → offering_pool::settle()
  ↓
  - Investidor recebe SRWA tokens (pro-rata)
  - Emissor recebe USDC (hard_cap - fees)
  - Yield distribuído
```

### 4. **Transferência com Compliance**
```
User A → transfer(SRWA, User B)
  ↓
srwa_controller::on_transfer() [Transfer Hook automático]
  ↓
Pipeline de verificação:
  1. ✓ Pause/freeze
  2. ✓ KYC/AML (CPI → identity_claims)
  3. ✓ Offering rules
  4. ✓ Investor limits
  5. ✓ Lockup
  6. ✓ Transfer window
  7. ✓ Allowlist
  ↓
Transfer aprovada ✅
```

## 🔐 Segurança & Governança

- **Roles multi-sig**: issuer_admin, compliance_officer, transfer_agent
- **Timelock**: mudanças críticas com delay
- **Pause/Freeze**: emergency circuit-breaker
- **Events**: todos os contratos emitem logs estruturados
- **Auditable**: cap table e compliance trail on-chain

## 📚 PDAs Principais

```
SRWAConfig: [b"srwa_config", mint]
OfferingState: [b"offering", mint]
ValuationData: [b"valuation", mint]
PoolVault: [b"pool_vault", mint]

IdentityAccount: [b"identity", user]
ClaimAccount: [b"claim", user, topic]

JurisdictionConfig: [b"jurisdiction", mint]
SanctionsList: [b"sanctions", mint]
LockupAccount: [b"lockup", mint, user]
Subscription: [b"subscription", mint, user]
```

## 🎯 Casos de Uso

- **CRI/CRA** (Certificados de Recebíveis Imobiliários/Agro)
- **FIDC** (Fundos de Investimento em Direitos Creditórios)
- **Debêntures** tokenizadas
- **Real Estate** fracionado
- **Crédito Privado** on-chain

## 🌐 Integrações DeFi

- **marginfi**: Lending/borrowing com SRWA como colateral
- **Solend**: Reserve pools para SRWA
- **Raydium/Meteora/Orca**: Pools de liquidez (allowlisted)
- **Pyth**: Price feeds FX/benchmark

## 📝 Próximos Passos

- [ ] Implementar lógica completa de Transfer Hook com CPIs
- [ ] Integrar Pyth oracles
- [ ] Adicionar testes de integração
- [ ] Deploy em devnet
- [ ] Auditoria de segurança
- [ ] Frontend (Next.js + wallet-adapter)
- [ ] Indexer/analytics (Helius)
- [ ] Governança (Squads/Realms)

## 📄 Licença

MIT

## 👥 Contato

Para dúvidas ou colaborações, abra uma issue no repositório.

---

**Built with Anchor ⚓ on Solana ☀️**
