# Step de KYC no Wizard - Guia de Uso

## ✅ O que foi implementado

Adicionamos um **Step 4: KYC** no wizard de criação de tokens, onde o issuer pode configurar os requisitos de KYC para seus investors.

## 🎯 Fluxo Completo

### 1. Issuer Cria Token (com KYC Config)

O wizard agora tem 5 steps:

```
1. Token      → Configurações básicas (nome, símbolo, etc.)
2. Offering   → Valores de investimento (min/max, target)
3. Yield      → Estratégia de yield (Marginfi/Solend)
4. KYC        → ⭐ NOVO: Configuração de KYC
5. Complete   → Confirmação e submissão
```

### Step 4: KYC Configuration

No step de KYC, o issuer pode:

#### ✅ Ativar/Desativar KYC Obrigatório
```typescript
<checkbox> Require KYC for investors
```

#### ✅ Selecionar Claim Topics Obrigatórios
```typescript
Required Claim Topics:
☑ KYC                    (topic: 1)
☑ AML                    (topic: 2)
☐ ACCREDITED             (topic: 3)
☐ RESIDENCY              (topic: 4)
☐ PEP                    (topic: 5)
☑ SANCTIONS_CLEAR        (topic: 6)
☐ KYB                    (topic: 7)
```

#### ✅ Adicionar KYC Providers Aprovados (opcional)
```typescript
Approved KYC Providers (one per line):
<textarea>
HMQ7gf8VzTYzJhyXQV8R9X9vkYQwK3eXhTZ7VfDC2z3T
8ZvE9xj2m3qR7YtN4pW6fK1sL5dH9vC3aB2gT8xU4yV
</textarea>
```

**Nota:** Os providers podem ser configurados depois via `KYCProviderSelector` component.

### 2. Submissão e Storage

Quando o issuer clica em "Enviar para aprovação":

```typescript
const result = await issuer.submitRequest(
  tokenConfig,
  offeringConfig,
  yieldStrategy,
  kycConfig  // ⭐ Incluído
);

// Retorna: { requestId, mint, kycConfig }
```

A configuração de KYC é retornada e pode ser armazenada localmente para configuração posterior.

### 3. Após Aprovação do Admin

Após o admin aprovar via `approve_srwa`, o issuer deve configurar o KYC on-chain:

```typescript
import { configureKYCAfterApproval } from './lib/postApprovalKYC';

// Quando detectar que o token foi aprovado
await configureKYCAfterApproval(program, provider, {
  mint: approvedMintAddress,
  requireKyc: true,
  approvedProviders: [
    'HMQ7gf8VzTYzJhyXQV8R9X9vkYQwK3eXhTZ7VfDC2z3T',
    '8ZvE9xj2m3qR7YtN4pW6fK1sL5dH9vC3aB2gT8xU4yV'
  ],
  requiredTopics: [1, 2, 6], // KYC, AML, SANCTIONS_CLEAR
});
```

## 📋 Configuração Padrão

O wizard inicia com configuração padrão de KYC:

```typescript
{
  requireKyc: true,
  approvedProviders: [],
  requiredTopics: [1, 2, 6]  // KYC + AML + SANCTIONS_CLEAR
}
```

## 🎨 Interface do Step KYC

### Quando KYC está ATIVO (requireKyc = true):

```
┌─────────────────────────────────────────┐
│ KYC Configuration                       │
├─────────────────────────────────────────┤
│                                         │
│ ☑ Require KYC for investors             │
│                                         │
│ Required Claim Topics                   │
│ ┌───────────────────────────────────┐   │
│ │ ☑ KYC          ☑ AML             │   │
│ │ ☐ ACCREDITED   ☐ RESIDENCY       │   │
│ │ ☐ PEP          ☑ SANCTIONS_CLEAR │   │
│ │ ☐ KYB                             │   │
│ └───────────────────────────────────┘   │
│                                         │
│ Approved KYC Providers                  │
│ ┌───────────────────────────────────┐   │
│ │ HMQ7gf8Vz...                      │   │
│ │ 8ZvE9xj2m...                      │   │
│ │                                   │   │
│ └───────────────────────────────────┘   │
│                                         │
│ Note: You can configure this later via  │
│ the KYC Provider Selector               │
│                                         │
│ [Enviar para aprovação]                 │
└─────────────────────────────────────────┘
```

### Quando KYC está DESATIVADO (requireKyc = false):

```
┌─────────────────────────────────────────┐
│ KYC Configuration                       │
├─────────────────────────────────────────┤
│                                         │
│ ☐ Require KYC for investors             │
│                                         │
│ [Enviar para aprovação]                 │
└─────────────────────────────────────────┘
```

## 🔄 Fluxo Completo End-to-End

### 1. Issuer preenche wizard
```typescript
Token:    "Real Estate Fund"
Symbol:   "REF"
Offering: $100 - $100,000 (target: $1M)
Yield:    Marginfi @ 5% APY
KYC:      ✅ Required
          Topics: KYC, AML, SANCTIONS_CLEAR
          Providers: (pode deixar vazio por enquanto)
```

### 2. Issuer submete request
```typescript
const { requestId, mint, kycConfig } = await submitRequest(...);

// Salvar no localStorage para uso posterior
localStorage.setItem(
  `kyc_pending_${mint}`,
  JSON.stringify(kycConfig)
);
```

### 3. Admin aprova o token
```typescript
await admin.approveSrwa(requestPDA);
// Isso cria: srwa_config, offering_state, valuation_data
```

### 4. Issuer configura KYC (automático ou manual)

**Opção A: Automático** (via event listener)
```typescript
program.addEventListener('TokenCreated', async (event) => {
  const mint = event.mint;
  const pendingKYC = localStorage.getItem(`kyc_pending_${mint}`);

  if (pendingKYC) {
    await configureKYCAfterApproval(program, provider, {
      mint,
      ...JSON.parse(pendingKYC)
    });
    localStorage.removeItem(`kyc_pending_${mint}`);
  }
});
```

**Opção B: Manual** (via botão na UI)
```typescript
// Quando token status === 'deployed'
<button onClick={() => configureKYC(mint, kycConfig)}>
  Configure KYC
</button>
```

### 5. Investor tenta investir
```typescript
// Sistema verifica automaticamente
const hasValidKYC = await verifyInvestorKYC(mint);

if (hasValidKYC) {
  // Permite investimento
} else {
  // Mostra: "Complete KYC primeiro"
}
```

## 🎯 Benefícios

### Para o Issuer:
- ✅ Configura KYC durante criação do token (tudo em um fluxo)
- ✅ Não precisa lembrar de configurar depois
- ✅ Pode revisar/modificar via KYCProviderSelector depois

### Para o Investor:
- ✅ Vê claramente quais verificações são necessárias
- ✅ Sabe quais providers são aceitos
- ✅ Pode completar KYC antes de tentar investir

### Para a Plataforma:
- ✅ Conformidade garantida desde o início
- ✅ Menos erros (investors sem KYC tentando investir)
- ✅ Melhor experiência do usuário

## 📝 Modificando KYC Depois da Criação

Se o issuer quiser mudar a configuração de KYC depois:

```typescript
import { KYCProviderSelector } from './components/issuer/KYCProviderSelector';

<KYCProviderSelector
  mintAddress={tokenMintAddress}
  onConfigured={() => {
    alert('KYC configuration updated!');
  }}
/>
```

Este componente permite:
- Adicionar/remover providers aprovados
- Modificar topics obrigatórios
- Ativar/desativar KYC requirement

## 🧪 Testando

### 1. Criar token com KYC
```bash
npm run dev
# Navegar para /issuer
# Preencher wizard até step KYC
# Configurar KYC
# Submeter
```

### 2. Verificar configuração salva
```typescript
// No console do browser
const pendingKYC = localStorage.getItem('kyc_pending_MINT_ADDRESS');
console.log(JSON.parse(pendingKYC));
```

### 3. Após aprovação, configurar KYC
```typescript
// Via console ou UI
await configureKYCAfterApproval(program, provider, {
  mint: new PublicKey('MINT_ADDRESS'),
  requireKyc: true,
  approvedProviders: ['PROVIDER_1', 'PROVIDER_2'],
  requiredTopics: [1, 2, 6]
});
```

### 4. Verificar on-chain
```typescript
const config = await kycService.getIssuerKYCConfig(mint);
console.log(config);
```

## 🔍 Troubleshooting

### "KYC config not found"
- O admin precisa aprovar o token primeiro
- Espere a aprovação antes de configurar KYC

### "Invalid provider address"
- Verifique se os providers estão registrados no KYC registry
- Use `kycService.getKYCProviders()` para ver providers disponíveis

### "Missing required topics"
- Selecione pelo menos 1 topic
- Topics comuns: KYC (1), AML (2), SANCTIONS_CLEAR (6)

## 🚀 Próximos Passos

1. **Auto-detect Approval**: Implementar listener que detecta quando admin aprovou e configura KYC automaticamente

2. **Provider Discovery**: Buscar providers disponíveis do KYC registry e mostrar lista

3. **Validation**: Validar public keys de providers antes de salvar

4. **Preview**: Mostrar preview da config de KYC na tela de confirmação

---

**Status**: ✅ Step KYC implementado e funcional!

**Arquivos modificados**:
- `hooks/useIssuer.ts` (+ KYCConfigInput)
- `components/issuer/IssuerWizard.tsx` (+ step kyc)
- `components/issuer/IssuerWizard.css` (+ estilos)
- `lib/postApprovalKYC.ts` (novo helper)
