# Guia de Admin Allowlist e KYC Provider System

Este guia explica como usar o sistema de Admin Allowlist e KYC Providers implementado no protocolo SRWA.

## Visão Geral

O sistema consiste em duas funcionalidades principais:

1. **Admin Allowlist**: Controla quem pode aprovar a criação de tokens/pools
2. **KYC Provider System**: Permite que issuers escolham KYC providers e validem investors

## 1. Admin Allowlist

### Conceito

A Admin Allowlist é um registro global que mantém uma lista de administradores autorizados a aprovar solicitações de criação de tokens SRWA. Apenas esses administradores podem executar a instrução `approve_srwa`.

### Estrutura

```rust
pub struct PlatformAdminRegistry {
    pub super_admin: Pubkey,           // Super admin que pode adicionar/remover admins
    pub authorized_admins: Vec<Pubkey>, // Lista de admins autorizados
    pub created_at: i64,
    pub updated_at: i64,
    pub bump: u8,
}
```

### Como Usar

#### 1. Inicializar o Registry (Uma vez apenas)

```typescript
import { AdminAllowlistServiceImpl } from './lib/adminAllowlist';

const adminService = new AdminAllowlistServiceImpl(program, provider);
const tx = await adminService.initializeAdminRegistry();
console.log('Registry initialized:', tx);
```

**O que acontece:**
- Cria o PDA `admin_registry`
- Define a carteira que chamou como super_admin
- Adiciona o super_admin à lista de authorized_admins

#### 2. Adicionar um Admin

Apenas o super_admin pode adicionar novos admins:

```typescript
const newAdminPubkey = new PublicKey('ADMIN_PUBLIC_KEY_HERE');
const tx = await adminService.addPlatformAdmin(newAdminPubkey);
console.log('Admin added:', tx);
```

#### 3. Remover um Admin

Apenas o super_admin pode remover admins (exceto ele mesmo):

```typescript
const adminToRemove = new PublicKey('ADMIN_PUBLIC_KEY_HERE');
const tx = await adminService.removePlatformAdmin(adminToRemove);
console.log('Admin removed:', tx);
```

#### 4. Verificar se um Admin está Autorizado

```typescript
const isAuthorized = await adminService.isAdminAuthorized(adminPubkey);
console.log('Admin authorized:', isAuthorized);
```

### Interface de Usuário

Use o componente `AdminAllowlistPanel` para gerenciar a allowlist:

```tsx
import { AdminAllowlistPanel } from './components/admin/AdminAllowlistPanel';

function AdminPage() {
  return (
    <div>
      <AdminAllowlistPanel />
    </div>
  );
}
```

**Funcionalidades da UI:**
- Inicializar o registry (se ainda não existe)
- Ver o super admin atual
- Adicionar novos admins via input de public key
- Listar todos os admins autorizados
- Remover admins da lista

## 2. KYC Provider System

### Conceito

O KYC Provider System permite que:
- A plataforma registre KYC providers disponíveis
- Issuers escolham quais KYC providers eles aceitam
- Issuers definam quais claims (KYC, AML, etc.) são obrigatórios
- Investors sejam validados antes de investir

### Estruturas

```rust
// Registry global de KYC providers
pub struct KYCProviderRegistry {
    pub authority: Pubkey,
    pub providers: Vec<KYCProviderInfo>,
    pub bump: u8,
}

// Informação de cada KYC provider
pub struct KYCProviderInfo {
    pub provider_pubkey: Pubkey,
    pub name: String,
    pub metadata_uri: String,
    pub active: bool,
    pub added_at: i64,
}

// Configuração de KYC específica por issuer/token
pub struct IssuerKYCConfig {
    pub mint: Pubkey,
    pub issuer: Pubkey,
    pub approved_providers: Vec<Pubkey>,    // Providers que o issuer aceita
    pub required_claim_topics: Vec<u32>,    // Topics obrigatórios (KYC, AML, etc.)
    pub require_kyc: bool,
    pub bump: u8,
}
```

### Fluxo de Uso

#### 1. Platform Admin: Inicializar KYC Registry

```typescript
import { KYCProviderServiceImpl } from './lib/kycProvider';

const kycService = new KYCProviderServiceImpl(program, provider);
const tx = await kycService.initializeKYCRegistry();
console.log('KYC Registry initialized:', tx);
```

#### 2. Platform Admin: Adicionar KYC Providers

```typescript
const providerPubkey = new PublicKey('PROVIDER_WALLET_ADDRESS');
const name = 'KYC Provider Inc.';
const metadataUri = 'https://provider.com/metadata.json';

const tx = await kycService.addKYCProvider(providerPubkey, name, metadataUri);
console.log('KYC Provider added:', tx);
```

#### 3. Issuer: Configurar KYC para seu Token

```typescript
const mint = new PublicKey('TOKEN_MINT_ADDRESS');

// Selecionar providers aprovados
const approvedProviders = [
  new PublicKey('PROVIDER_1_ADDRESS'),
  new PublicKey('PROVIDER_2_ADDRESS'),
];

// Definir claim topics obrigatórios
const requiredTopics = [
  1, // KYC
  2, // AML
  6, // SANCTIONS_CLEAR
];

const requireKyc = true; // KYC é obrigatório

const tx = await kycService.configureIssuerKYC(
  mint,
  approvedProviders,
  requiredTopics,
  requireKyc
);
console.log('Issuer KYC configured:', tx);
```

#### 4. Verificar KYC do Investor

```typescript
const mint = new PublicKey('TOKEN_MINT_ADDRESS');
const isKycValid = await kycService.verifyInvestorKYC(mint);

if (isKycValid) {
  console.log('Investor has valid KYC - can invest');
} else {
  console.log('Investor does NOT have valid KYC - cannot invest');
}
```

### Interface de Usuário para Issuer

Use o componente `KYCProviderSelector`:

```tsx
import { KYCProviderSelector } from './components/issuer/KYCProviderSelector';

function IssuerTokenConfig() {
  const mintAddress = 'YOUR_TOKEN_MINT_ADDRESS';

  return (
    <div>
      <KYCProviderSelector
        mintAddress={mintAddress}
        onConfigured={() => {
          console.log('KYC configuration saved!');
        }}
      />
    </div>
  );
}
```

**Funcionalidades da UI:**
- Toggle para ativar/desativar KYC obrigatório
- Seleção de múltiplos KYC providers aprovados
- Seleção de claim topics obrigatórios (KYC, AML, ACCREDITED, etc.)
- Visualização da configuração atual
- Salvar configuração on-chain

## 3. Claim Topics Disponíveis

Os claim topics são definidos no programa `identity_claims`:

```rust
pub const KYC: u32 = 1;              // Know Your Customer
pub const AML: u32 = 2;              // Anti-Money Laundering
pub const ACCREDITED: u32 = 3;       // Accredited Investor
pub const RESIDENCY: u32 = 4;        // Residency verification
pub const PEP: u32 = 5;              // Politically Exposed Person check
pub const SANCTIONS_CLEAR: u32 = 6;  // Sanctions screening
pub const KYB: u32 = 7;              // Know Your Business
```

## 4. Fluxo Completo de Criação de Token com KYC

### Passo a Passo

1. **Platform Setup (Uma vez)**
   ```typescript
   // Inicializar admin registry
   await adminService.initializeAdminRegistry();

   // Inicializar KYC registry
   await kycService.initializeKYCRegistry();

   // Adicionar KYC providers
   await kycService.addKYCProvider(provider1, 'Provider 1', 'uri1');
   await kycService.addKYCProvider(provider2, 'Provider 2', 'uri2');
   ```

2. **Issuer: Request Token**
   ```typescript
   // Issuer submete request de criação de token
   await program.methods.requestSrwa(...)
     .accounts({...})
     .rpc();
   ```

3. **Issuer: Configure KYC**
   ```typescript
   // Issuer escolhe KYC providers e requirements
   await kycService.configureIssuerKYC(
     mint,
     [provider1Pubkey, provider2Pubkey],
     [1, 2, 6], // KYC, AML, SANCTIONS_CLEAR
     true
   );
   ```

4. **Admin: Approve Token**
   ```typescript
   // Apenas admins na allowlist podem aprovar
   await program.methods.approveSrwa()
     .accounts({
       admin: adminWallet,
       adminRegistry, // Verifica se admin está na allowlist
       request,
       ...
     })
     .rpc();
   ```

5. **Investor: Complete KYC**
   ```typescript
   // Investor precisa obter claims de um dos providers aprovados
   // Isso é feito através do programa identity_claims
   await identityClaimsProgram.methods.addClaim(
     topic: 1, // KYC
     dataHash,
     validUntil
   )
   .accounts({
     issuer: kycProviderWallet, // Provider aprovado pelo issuer
     userIdentity,
     claimAccount,
     ...
   })
   .rpc();
   ```

6. **Investor: Invest**
   ```typescript
   // Sistema verifica automaticamente se investor tem KYC válido
   // antes de permitir investimento
   const hasValidKYC = await kycService.verifyInvestorKYC(mint);

   if (hasValidKYC) {
     // Permitir investimento
     await offeringProgram.methods.invest(...)
       .accounts({...})
       .rpc();
   }
   ```

## 5. Integrando com Offering Pool

Para integrar a validação de KYC no fluxo de investimento, adicione a verificação antes de permitir depósitos:

```typescript
// No programa offering_pool, adicionar constraint:
#[account(
    seeds = [b"issuer_kyc", mint.key().as_ref()],
    bump,
)]
pub issuer_kyc_config: Account<'info, IssuerKYCConfig>,

// E no handler:
if issuer_kyc_config.require_kyc {
    // Fazer CPI para srwa_factory::verify_investor_kyc
    // Ou verificar claims diretamente via identity_claims
}
```

## 6. Endpoints REST API (Opcional)

Se você quiser criar um backend REST para facilitar o uso:

```typescript
// POST /api/admin/initialize
// Inicializa admin registry

// POST /api/admin/add
// Body: { adminAddress: string }
// Adiciona admin à allowlist

// DELETE /api/admin/:address
// Remove admin da allowlist

// GET /api/admin/list
// Lista todos admins autorizados

// POST /api/kyc/initialize
// Inicializa KYC registry

// POST /api/kyc/providers
// Body: { providerAddress: string, name: string, metadataUri: string }
// Adiciona KYC provider

// GET /api/kyc/providers
// Lista todos KYC providers

// POST /api/kyc/configure/:mint
// Body: { providers: string[], topics: number[], requireKyc: boolean }
// Configura KYC para um token

// GET /api/kyc/verify/:mint/:investor
// Verifica se investor tem KYC válido para o token
```

## 7. Testes

```bash
# Build dos programas
cd srwa-protocol
anchor build

# Deploy local
solana-test-validator &
anchor deploy

# Executar testes
anchor test
```

## 8. Security Considerations

1. **Super Admin**: O super_admin tem controle total sobre quem pode aprovar tokens. Proteja essa chave!

2. **KYC Providers**: Apenas adicione providers confiáveis ao registry. Eles terão poder de emitir claims.

3. **Claim Validation**: A verificação de claims deve sempre validar:
   - O claim não está revogado
   - O claim não expirou (valid_until)
   - O issuer do claim está na lista de providers aprovados
   - O topic do claim está nos required_topics

4. **Rate Limiting**: Considere implementar rate limiting para operações de admin.

## 9. Troubleshooting

### "Admin registry not initialized"
- Execute `initializeAdminRegistry()` primeiro

### "Admin not in allowlist"
- A carteira tentando aprovar não está na allowlist
- Use `addPlatformAdmin()` para adicionar

### "KYC provider not found"
- O provider precisa ser adicionado ao KYC registry primeiro
- Use `addKYCProvider()`

### "Investor does not have required KYC claims"
- Investor precisa obter claims de um provider aprovado
- Os claims devem cobrir todos os topics obrigatórios

## Conclusão

Este sistema fornece controle granular sobre:
- ✅ Quem pode aprovar tokens/pools (Admin Allowlist)
- ✅ Quais KYC providers são aceitos (por token)
- ✅ Quais verificações são obrigatórias (KYC, AML, etc.)
- ✅ Validação automática antes de permitir investimentos

Para dúvidas ou suporte, consulte a documentação ou abra uma issue no repositório.
