# Refatoração de Fluxos - SRWA Protocol

## Resumo das Mudanças

Este documento descreve a refatoração completa dos fluxos de usuário (Admin, Issuer, Investor) implementada no SRWA Protocol.

---

## 🎯 Objetivos da Refatoração

### Problemas Identificados e Resolvidos

1. ✅ **Fluxo de Registro Incorreto**
   - **Antes**: Usuários eram redirecionados para páginas específicas por role após registro
   - **Depois**: Todos são redirecionados para `/dashboard` independente do role

2. ✅ **Componente "Já Registrado" Desnecessário**
   - **Antes**: Mostrava card com botões "Ir para minha página" e "Ir para Dashboard"
   - **Depois**: Auto-redirect automático para dashboard se já registrado

3. ✅ **Rotas Desorganizadas**
   - **Antes**: Dashboard, Markets, Portfolio em rotas separadas sem hierarquia
   - **Depois**: Estrutura organizada com rotas principais e sub-rotas

4. ✅ **Funcionalidades Misturadas**
   - **Antes**: Botão "Create SRWA" visível para todos os usuários
   - **Depois**: Funcionalidades específicas por role, com guards e visibilidade condicional

5. ✅ **Admin Flow sem Verificação**
   - **Antes**: Qualquer um podia selecionar role "Admin" no registro
   - **Depois**: Role Admin só aparece se wallet estiver autorizada on-chain

6. ✅ **KYC Forçado para Investor**
   - **Antes**: KYC aparecia logo no início para investor
   - **Depois**: KYC só é solicitado ao investir em pools que o exigem

---

## 📁 Estrutura de Arquivos Criados/Modificados

### **Novos Componentes**

```
frontend/src/components/
├── guards/
│   ├── AdminTagGuard.tsx         ✅ Novo - Verifica tag de admin on-chain
│   ├── RoleGuard.tsx              ✅ Novo - Verifica role do usuário
│   ├── KYCGuard.tsx               ✅ Novo - Verifica e redireciona para KYC
│   └── index.ts                   ✅ Novo - Exports
│
└── dashboard/
    └── RoleBasedActionCard.tsx    ✅ Novo - Card de ação condicional por role
```

### **Novos Hooks**

```
frontend/src/hooks/
└── useIsAuthorizedAdmin.ts        ✅ Novo - Verifica autorização de admin on-chain
```

### **Novas Páginas**

```
frontend/src/pages/
└── issuer/
    ├── CreateSRWA.tsx             ✅ Novo - Página de criação de SRWA (Issuer only)
    ├── MyTokens.tsx               ✅ Novo - Tokens criados pelo issuer
    └── IssuerDashboard.tsx        ✅ Novo - Dashboard do issuer com stats
```

### **Componentes Modificados**

```
✏️  frontend/src/components/auth/RegistrationWizard.tsx
    - Adiciona verificação de admin tag
    - Filtra roles disponíveis baseado em autorização
    - Sempre redireciona para /dashboard

✏️  frontend/src/components/auth/ProtectedRoute.tsx
    - Remove redirecionamentos específicos por role
    - Sempre redireciona para /dashboard se não autorizado

✏️  frontend/src/components/layout/Header.tsx
    - Adiciona navegação condicional por role
    - Mostra "Create SRWA" e "My Tokens" só para Issuer
    - Mostra "Admin Panel" só para Admin

✏️  frontend/src/components/srwa/InvestorDashboard.tsx
    - Remove KYC status card do início
    - KYC só é mostrado quando explicitamente solicitado
```

### **Páginas Modificadas**

```
✏️  frontend/src/pages/Register.tsx
    - Remove componente "já registrado"
    - Adiciona auto-redirect para /dashboard

✏️  frontend/src/pages/dashboard/DashboardOverview.tsx
    - Adiciona role-based action cards
    - Remove botão global "Create SRWA"
```

### **Configurações Modificadas**

```
✏️  frontend/src/lib/constants/routes.ts
    - Adiciona ISSUER_ROUTES
    - Adiciona INVESTOR_ROUTES
    - Atualiza ADMIN_ROUTES

✏️  frontend/src/App.tsx
    - Reorganiza estrutura de rotas
    - Adiciona rotas do Issuer (/issuer/*)
    - Adiciona rotas do Investor (/investor/*)
    - Mantém rotas legacy para compatibilidade
```

---

## 🗺️ Nova Estrutura de Rotas

### **Rotas Públicas**
```
/                       - Hero page (index)
/home                   - Home alternativa
/docs                   - Documentação
/srwa-demo             - Demo
/srwa-test             - Test form
```

### **Rotas de Autenticação**
```
/register              - Seleção de role e registro
```

### **Dashboard (Comum a Todos)**
```
/dashboard             - Overview com stats e action cards
/dashboard/markets     - Markets view
/dashboard/portfolio   - Portfolio view
```

### **Rotas de Markets/Pools (Comuns)**
```
/markets               - Listagem de markets
/market/:id            - Detalhe de market
/pools                 - Listagem de pools
/pool/:id              - Detalhe de pool
/portfolio             - Portfolio detalhado
```

### **Rotas do Issuer (Role-Protected)**
```
/issuer                - Dashboard do issuer
/issuer/create-srwa    - Criação de token SRWA (IssuerWizard)
/issuer/my-tokens      - Tokens criados
/issuer/create-pool    - Criação de pool
```

### **Rotas do Investor**
```
/investor              - Dashboard do investor
/investor/investments  - Investimentos
/investor/kyc          - KYC (só acessível via redirect)
```

### **Rotas do Admin (Tag-Protected)**
```
/admin                 - Dashboard admin
/admin/token-requests  - Aprovação de tokens
/admin/allowlist       - Gerenciar admins
/admin/analytics       - Analytics
```

### **Rotas Legacy (Compatibilidade)**
```
/srwa-issuance         - Redireciona para /issuer/create-srwa
/create-pool           - Redireciona para /issuer/create-pool
/kyc                   - KYC standalone
```

---

## 🔐 Sistema de Guards e Permissões

### **AdminTagGuard**
```tsx
<AdminTagGuard>
  {/* Conteúdo só visível para admins autorizados on-chain */}
</AdminTagGuard>
```

### **RoleGuard**
```tsx
<RoleGuard allowedRoles={[UserRole.Issuer, UserRole.Admin]}>
  {/* Conteúdo só visível para roles permitidos */}
</RoleGuard>
```

### **KYCGuard**
```tsx
<KYCGuard requireKYC={pool.kycRequired} returnUrl={currentPath}>
  {/* Conteúdo protegido por KYC */}
</KYCGuard>
```

---

## 📊 Fluxos de Navegação

### **1. Fluxo de Registro**
```
Conecta wallet
  ↓
Não registrado? → /register
  ↓
Seleciona role (Issuer ou Investor)
  ↓
[Admin só aparece se wallet tem tag on-chain]
  ↓
registerUser() on-chain
  ↓
SEMPRE → /dashboard
```

### **2. Dashboard (Hub Universal)**
```
Todos os roles veem dashboard
  ↓
Diferença: Action Cards baseados em role
  - Issuer: "Create SRWA" + "My Tokens"
  - Admin: "Admin Panel"
  - Investor: Nenhum action card
```

### **3. Fluxo de Criação de SRWA (Issuer)**
```
Issuer no /dashboard
  ↓
Vê action card "Create SRWA"
  ↓
Clica → /issuer/create-srwa
  ↓
IssuerWizard (5 steps)
  ↓
Submit → Request pendente
  ↓
Volta para /dashboard
```

### **4. Fluxo de Investimento (Investor)**
```
Investor em /markets
  ↓
Seleciona pool
  ↓
Clica "Invest"
  ↓
Pool requer KYC?
  ├─ Não → Modal de compra direta
  └─ Sim → Verifica KYC do investor
      ├─ KYC OK → Modal de compra
      └─ KYC não feito → Redirect /investor/kyc
          ↓
          Completa KYC
          ↓
          Volta para pool e investe
```

### **5. Fluxo de Admin (Tag-Protected)**
```
Admin conecta wallet
  ↓
Verifica on-chain authorizedAdmins[]
  ├─ Não autorizado → Role Admin NÃO aparece
  └─ Autorizado → Role Admin disponível
      ↓
      Seleciona Admin → registerUser()
      ↓
      Redireciona → /dashboard
      ↓
      Vê action card "Admin Panel"
      ↓
      Clica → /admin
```

---

## 🎨 Navegação no Header

### **Menu Desktop**
```
[Logo] Home | Dashboard | [Role-Specific] | Documentation | [Wallet]

Role-Specific:
- Issuer: "Create SRWA" (azul) + "My Tokens"
- Admin: "Admin Panel" (roxo)
- Investor: nada extra
```

### **Menu Mobile**
```
[Logo]                                    [☰]
  ↓ (ao clicar no menu)
┌─────────────────────────────────────┐
│ Home                                 │
│ Dashboard                            │
│ [Role-Specific Items]                │
│ Documentation                        │
│ ──────────────────────────────────  │
│ [Wallet Button]                      │
└─────────────────────────────────────┘
```

---

## 🧩 Action Cards no Dashboard

### **Issuer Dashboard**
```
┌──────────────────┐  ┌──────────────────┐
│ Create SRWA      │  │ My Tokens        │
│ [Plus Icon]      │  │ [Chart Icon]     │
│ Criar novo token │  │ Ver meus tokens  │
└──────────────────┘  └──────────────────┘
```

### **Admin Dashboard**
```
┌──────────────────────┐
│ Admin Panel          │
│ [Shield Icon]        │
│ Gerencie aprovações  │
└──────────────────────┘
```

### **Investor Dashboard**
```
(Sem action cards específicos)
Vê apenas stats globais e markets
```

---

## ✨ Benefícios da Refatoração

### **1. Performance**
- ✅ Rotas separadas = lazy loading eficiente
- ✅ Componentes carregados sob demanda

### **2. UX (User Experience)**
- ✅ Fluxo linear e intuitivo para cada role
- ✅ Dashboard como hub universal
- ✅ KYC só quando necessário (não invasivo)
- ✅ Navegação clara e específica por role

### **3. Segurança**
- ✅ Guards on-chain para admin (verificação de tag)
- ✅ Role-based rendering no frontend
- ✅ ProtectedRoute com verificação de roles
- ✅ Admin tag verificada antes de mostrar opções

### **4. Manutenção**
- ✅ Código organizado por feature e role
- ✅ Componentes reutilizáveis (Guards, ActionCards)
- ✅ Rotas bem estruturadas e documentadas
- ✅ Fácil adicionar novos roles ou features

### **5. Escalabilidade**
- ✅ Fácil adicionar novos fluxos
- ✅ Sistema de guards extensível
- ✅ Rotas organizadas hierarquicamente
- ✅ Action cards configuráveis

---

## 🧪 Como Testar os Fluxos

### **Teste 1: Registro como Investor**
```
1. Conecte uma wallet nova
2. Vá para /register
3. Selecione "Investor"
4. Confirme registro
5. Verifique redirect para /dashboard
6. Confirme que NÃO vê action cards de Issuer/Admin
```

### **Teste 2: Registro como Issuer**
```
1. Conecte uma wallet nova
2. Vá para /register
3. Selecione "Issuer"
4. Confirme registro
5. Verifique redirect para /dashboard
6. Confirme que vê action cards "Create SRWA" e "My Tokens"
7. Teste navegação no header: "Create SRWA" e "My Tokens" visíveis
```

### **Teste 3: Admin Tag Protection**
```
1. Conecte uma wallet NÃO autorizada
2. Vá para /register
3. Confirme que role "Admin" NÃO aparece
4. Conecte uma wallet autorizada (admin tag on-chain)
5. Vá para /register
6. Confirme que role "Admin" aparece
7. Registre como Admin
8. Confirme action card "Admin Panel" no dashboard
```

### **Teste 4: KYC On-Demand**
```
1. Registre como Investor
2. Vá para /investor (dashboard)
3. Confirme que NÃO há card de KYC status
4. Vá para /markets
5. Tente investir em pool que requer KYC
6. Verifique redirect para /investor/kyc
7. Complete KYC
8. Verifique retorno ao pool para completar investimento
```

### **Teste 5: Header Navigation**
```
1. Conecte e registre como cada role
2. Verifique itens visíveis no header:
   - Investor: Home, Dashboard, Docs
   - Issuer: Home, Dashboard, Create SRWA, My Tokens, Docs
   - Admin: Home, Dashboard, Admin Panel, Docs
3. Teste em desktop e mobile
```

### **Teste 6: Auto-Redirect**
```
1. Registre um usuário
2. Tente acessar /register novamente
3. Confirme redirect automático para /dashboard
4. Não deve ver componente "já registrado"
```

---

## 📝 Checklist de Implementação

- [x] Criar guards (AdminTagGuard, RoleGuard, KYCGuard)
- [x] Criar hook useIsAuthorizedAdmin
- [x] Refatorar RegistrationWizard (admin tag check + redirect dashboard)
- [x] Refatorar Register.tsx (auto-redirect)
- [x] Refatorar ProtectedRoute (redirect universal para dashboard)
- [x] Atualizar constants/routes.ts
- [x] Criar páginas do Issuer (CreateSRWA, MyTokens, IssuerDashboard)
- [x] Criar RoleBasedActionCard
- [x] Adicionar action cards no DashboardOverview
- [x] Reorganizar rotas em App.tsx
- [x] Modificar Header (navegação condicional)
- [x] Remover KYC status card do InvestorDashboard
- [ ] Implementar KYC check em MarketDetail (próxima etapa)
- [ ] Testar fluxos completos

---

## 🚀 Próximos Passos

### **Curto Prazo**
1. Implementar verificação de KYC em MarketDetail antes de investir
2. Adicionar testes automatizados para os fluxos
3. Melhorar feedback visual durante transições de fluxo
4. Adicionar analytics para tracking de fluxos

### **Médio Prazo**
1. Criar dashboard analytics por role
2. Implementar notificações in-app para cada role
3. Adicionar onboarding tutorial por role
4. Criar sistema de permissões granulares

### **Longo Prazo**
1. Sistema de roles customizáveis
2. Multi-sig para operações críticas de admin
3. Dashboard configurável por usuário
4. Sistema de badges e achievements por role

---

## 📚 Referências

- Código: `/frontend/src/`
- Documentação de Rotas: `/frontend/src/lib/constants/routes.ts`
- Tipos: `/frontend/src/types/srwa-contracts.ts`
- Hooks Solana: `/frontend/src/hooks/solana/`

---

**Data da Refatoração**: 25 de Outubro de 2025
**Versão**: 1.0.0
**Status**: ✅ Implementado
