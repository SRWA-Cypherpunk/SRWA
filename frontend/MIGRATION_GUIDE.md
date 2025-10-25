# Guia de Migração - Integrações Solana/Anchor

Este documento descreve a migração das integrações com smart contracts Solana do `frontent2` para o `frontend` principal.

## 🎯 Objetivo

Migrar todas as integrações funcionais com os smart contracts Solana/Anchor do `frontent2` para o `frontend`, mantendo a estética e design existentes.

## 📦 O Que Foi Migrado

### 1. **IDLs dos Smart Contracts**
- **Localização**: `frontend/public/idl/`
- **Arquivos**:
  - `cashflow_engine.json`
  - `compliance_modules.json`
  - `identity_claims.json`
  - `offering_pool.json`
  - `srwa_controller.json`
  - `srwa_factory.json`
  - `valuation_oracle.json`
  - `yield_adapter.json`

### 2. **Biblioteca Anchor**
- **Arquivo**: `frontend/src/lib/solana/anchor.ts`
- **Conteúdo**:
  - `SRWAClient` - Cliente principal para gerenciar programas Anchor
  - `PROGRAM_IDS` - IDs dos programas deployed
  - `getProvider()` - Função para criar provider Anchor
  - `loadPrograms()` - Carrega todos os programas
  - Airdrop automático para localhost

### 3. **Context Provider**
- **Arquivo**: `frontend/src/contexts/ProgramContext.tsx`
- **Exports**:
  - `ProgramProvider` - Provider React
  - `usePrograms()` - Hook que requer programas carregados
  - `useProgramsSafe()` - Hook seguro com verificação
  - `useProgramsOptional()` - Hook opcional

### 4. **Hooks de Integração**
Todos em `frontend/src/hooks/solana/`:

#### `useIssuer.ts`
- `submitRequest()` - Submeter pedido de SRWA
- `approveSrwa()` - Aprovar SRWA
- `rejectSrwa()` - Rejeitar SRWA

#### `useInvestor.ts`
- `registerIdentity()` - Registrar identidade
- `addClaim()` - Adicionar claim KYC
- `isVerified()` - Verificar se está verificado
- `subscribe()` - Subscrever a offering
- `getSubscription()` - Obter subscription
- `claimTokens()` - Reivindicar tokens

#### `useAdmin.ts`
- `addJurisdictionRule()` - Adicionar regra de jurisdição
- `setMaxHolders()` - Definir máximo de holders
- `setLockup()` - Definir lockup
- `pauseToken()` / `unpauseToken()` - Pausar/Despausar token
- `updatePrice()` - Atualizar preço oracle
- `addToAllowlist()` / `removeFromAllowlist()` - Gerenciar allowlist

#### `useIssuanceRequests.ts`
- `requestSrwa()` - Fazer request de SRWA
- `approveSrwa()` - Aprovar SRWA
- `rejectSrwa()` - Rejeitar SRWA
- `refresh()` - Atualizar lista de requests

## 🔧 Configuração

### 1. Instalar Dependências

```bash
cd frontend
npm install
```

As novas dependências já estão no `package.json`:
- `@coral-xyz/anchor@^0.32.1`
- `buffer@^6.0.3`

### 2. Estrutura de Providers

O `CombinedProvider` já foi atualizado para incluir o `ProgramProvider`:

```tsx
<CombinedProvider>
  {/* Sua aplicação */}
</CombinedProvider>
```

Estrutura interna:
```
QueryClientProvider
  └─ TooltipProvider
      └─ WalletProvider
          └─ ProgramProvider
              └─ {children}
```

### 3. Configuração do Vite

O `vite.config.ts` foi atualizado para:
- Polyfill do Buffer
- Otimização do Anchor
- Chunks otimizados para Solana

## 📝 Como Usar

### Exemplo Básico - Usar Programas

```tsx
import { useProgramsSafe } from '@/contexts';

function MyComponent() {
  const { programs, hasPrograms, loading } = useProgramsSafe();

  if (loading) return <div>Carregando programas...</div>;
  if (!hasPrograms) return <div>Conecte sua wallet</div>;

  return <div>Programas carregados!</div>;
}
```

### Exemplo - Hook de Issuer

```tsx
import { useIssuer } from '@/hooks/solana';
import { toast } from 'sonner';

function IssuerComponent() {
  const { submitRequest, requests } = useIssuer();

  const handleSubmit = async () => {
    try {
      const result = await submitRequest(
        {
          name: "My RWA Token",
          symbol: "MRWA",
          uri: "https://...",
          decimals: 9
        },
        {
          minInvestment: 1000,
          maxInvestment: 100000,
          targetAmount: 1000000,
          lockPeriodDays: 365
        },
        {
          protocol: 'marginfi',
          targetApy: 5.0
        }
      );

      toast.success('Request submitted!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <button onClick={handleSubmit}>
      Submit SRWA Request
    </button>
  );
}
```

### Exemplo - Hook de Investor

```tsx
import { useInvestor } from '@/hooks/solana';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

function InvestorComponent() {
  const {
    registerIdentity,
    subscribe,
    isVerified
  } = useInvestor();

  const handleRegister = async () => {
    const result = await registerIdentity();
    console.log('Identity registered:', result.identity.toBase58());
  };

  const handleSubscribe = async (mintAddress: string) => {
    const mint = new PublicKey(mintAddress);
    const amount = new BN(10000); // 10k tokens

    const result = await subscribe(mint, amount);
    console.log('Subscribed:', result.signature);
  };

  return (
    <div>
      <button onClick={handleRegister}>Register Identity</button>
      <button onClick={() => handleSubscribe('...')}>Subscribe</button>
    </div>
  );
}
```

### Exemplo - Hook de Admin

```tsx
import { useAdmin } from '@/hooks/solana';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

function AdminComponent() {
  const {
    addJurisdictionRule,
    pauseToken,
    setMaxHolders
  } = useAdmin();

  const handlePause = async (mintAddress: string) => {
    const mint = new PublicKey(mintAddress);
    const result = await pauseToken(mint);
    console.log('Token paused:', result.signature);
  };

  const handleSetMaxHolders = async (mintAddress: string) => {
    const mint = new PublicKey(mintAddress);
    const maxHolders = new BN(1000);

    const result = await setMaxHolders(mint, maxHolders);
    console.log('Max holders set:', result.signature);
  };

  return (
    <div>
      <button onClick={() => handlePause('...')}>Pause Token</button>
      <button onClick={() => handleSetMaxHolders('...')}>Set Max Holders</button>
    </div>
  );
}
```

## 🌐 Endpoints

- **Localhost**: `http://127.0.0.1:8899` (configurado por padrão)
- **Program IDs**: Definidos em `frontend/src/lib/solana/anchor.ts`

## 🎨 Mantendo a Estética

A migração foi feita para **não alterar** o design existente. Todos os componentes visuais permanecem inalterados. Apenas a lógica de integração com blockchain foi adicionada.

### Onde Usar

Você pode usar os hooks em qualquer componente que já existe:
- `pages/SRWAIssuance.tsx` - Para emissão de tokens
- `pages/Admin.tsx` - Para funções administrativas
- `pages/KYC.tsx` - Para registro de identidade
- Qualquer outro componente que precise interagir com smart contracts

## 🔄 Próximos Passos

1. **Testar**: Inicie o frontend e teste as integrações
   ```bash
   npm run dev
   ```

2. **Conectar Wallet**: Use Phantom ou outra wallet Solana

3. **Interagir**: Use os hooks nos seus componentes

4. **Customizar**: Adapte os IDs dos programas se necessário em `anchor.ts`

## 📚 Arquivos Importantes

```
frontend/
├── public/idl/                    # IDLs dos contratos
├── src/
│   ├── lib/solana/
│   │   └── anchor.ts              # Cliente Anchor principal
│   ├── contexts/
│   │   ├── ProgramContext.tsx     # Context dos programas
│   │   └── CombinedProvider.tsx   # Provider combinado
│   └── hooks/solana/
│       ├── useIssuer.ts           # Hook para issuers
│       ├── useInvestor.ts         # Hook para investors
│       ├── useAdmin.ts            # Hook para admins
│       ├── useIssuanceRequests.ts # Hook para requests
│       └── index.ts               # Barrel exports
├── package.json                   # Dependências atualizadas
└── vite.config.ts                # Config com Buffer polyfill
```

## ⚠️ Notas Importantes

1. **Buffer Global**: O vite.config já configura o Buffer como global
2. **Wallet Connection**: Os hooks requerem wallet conectada
3. **Program Loading**: Programas são carregados automaticamente ao conectar wallet
4. **Error Handling**: Sempre use try/catch ao chamar os hooks
5. **Toast Messages**: Use `sonner` para feedback ao usuário

## 🐛 Troubleshooting

### "Buffer is not defined"
→ Reinicie o servidor de dev após instalar dependências

### "Wallet not connected"
→ Conecte a wallet antes de usar os hooks

### "Program not loaded"
→ Verifique se os Program IDs estão corretos em `anchor.ts`

### Airdrop falha
→ Certifique-se de que o localhost Solana está rodando

## ✅ Checklist de Migração

- [x] IDLs copiados para `frontend/public/idl/`
- [x] `anchor.ts` migrado para `frontend/src/lib/solana/`
- [x] `ProgramContext` criado
- [x] Hooks migrados (useIssuer, useInvestor, useAdmin, useIssuanceRequests)
- [x] `package.json` atualizado com dependências Anchor
- [x] `vite.config.ts` configurado com Buffer polyfill
- [x] `CombinedProvider` atualizado
- [x] Exports organizados

---

**Migração concluída com sucesso! 🎉**

As integrações Solana/Anchor agora estão disponíveis no frontend principal, mantendo toda a estética e design existentes.
