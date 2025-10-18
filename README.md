# SRWA - Solana Real-World Asset Platform

Platform de tokenização de ativos do mundo real (RWA) na blockchain Solana com compliance on-chain.

## 📁 Estrutura do Projeto

```
SRWA/
├── frontend/           # Aplicação web React + Vite
│   ├── src/
│   │   ├── components/ # Componentes React organizados por feature
│   │   ├── contexts/   # Context providers (Wallet, etc.)
│   │   ├── services/   # Business logic layer
│   │   ├── hooks/      # Custom hooks organizados por domínio
│   │   ├── pages/      # Páginas da aplicação
│   │   ├── styles/     # CSS architecture (base, components, features)
│   │   ├── lib/        # Utilities e helpers
│   │   └── config.ts   # Configuração centralizada
│   └── public/         # Assets estáticos
│
├── package.json        # Monorepo configuration
├── wrangler.toml       # Cloudflare Pages config
├── DEPLOY.md           # Guia completo de deploy
└── .env.example        # Exemplo de variáveis de ambiente
```

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- npm 9+
- Conta Cloudflare (para deploy)

### Instalação e Desenvolvimento

```bash
# Clonar repositório
git clone https://github.com/SRWA-Cypherpunk/SRWA.git
cd SRWA

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example frontend/.env.local
# Edite frontend/.env.local com suas configurações

# Iniciar servidor de desenvolvimento
npm run dev

# Ou diretamente no frontend
cd frontend
npm install
npm run dev
```

Acesse: http://localhost:8080

### Build para Produção

```bash
# Na raiz do repositório
npm run build

# Ou no diretório frontend
cd frontend
npm run build

# Preview do build
npm run preview
```

## 🌐 Deploy

### Cloudflare Pages (Recomendado)

Consulte o guia completo em [DEPLOY.md](./DEPLOY.md).

**Configuração Rápida:**

1. Conecte o repositório ao Cloudflare Pages
2. Configure:
   - **Root directory**: `frontend`
   - **Build command**: `npm run build`
   - **Build output**: `dist`
3. Adicione variáveis de ambiente
4. Deploy!

## 🏗️ Arquitetura

### Frontend

Construído com:
- **React 18** - UI library
- **Vite 5** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animations
- **@solana/wallet-adapter** - Wallet integration
- **Zustand** - State management
- **React Query** - Data fetching
- **Recharts** - Charts e gráficos

### Padrões Arquiteturais

Seguindo best practices do [agarIoCryptoStacksChain](https://github.com/pedro-gattai/agarIoCryptoStacksChain):

- **Contexts Layer**: Providers agregados (Wallet, Settings, etc.)
- **Services Layer**: Lógica de negócio abstraída
- **Feature-Based Organization**: Componentes e hooks organizados por domínio
- **CSS Architecture**: Variables → Components → Features
- **Centralized Config**: Todas env vars em `config.ts`

## 📦 Funcionalidades

### Implementadas
- ✅ Landing page com roadmap interativo
- ✅ Integração com carteiras Solana (Phantom, Solflare, etc.)
- ✅ Dashboard de tokens RWA
- ✅ Wizard de criação de tokens
- ✅ Sistema de mercados/lending
- ✅ Portfolio tracking
- ✅ Responsive design (mobile/desktop)

### Em Desenvolvimento
- 🚧 Sistema KYC/Compliance
- 🚧 Integração com contratos on-chain
- 🚧 Oracle de preços (Pyth Network)
- 🚧 Liquidez pool management

## 🔧 Configuração

### Variáveis de Ambiente

Consulte `.env.example` para todas as variáveis disponíveis.

**Essenciais:**
```bash
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL_DEVNET=https://api.devnet.solana.com
VITE_ENABLE_LENDING=true
```

**Produção:**
```bash
VITE_SOLANA_NETWORK=mainnet-beta
VITE_SOLANA_RPC_URL_MAINNET_BETA=https://your-private-rpc.com
VITE_RWA_TOKEN_PROGRAM_ID=<program-id>
VITE_COMPLIANCE_PROGRAM_ID=<program-id>
```

## 🧪 Testes

```bash
cd frontend
npm run lint       # ESLint
npm run build      # Test production build
```

## 📚 Documentação

- [DEPLOY.md](./DEPLOY.md) - Guia completo de deploy no Cloudflare Pages
- [frontend/RESTRUCTURING_SUMMARY.md](./frontend/RESTRUCTURING_SUMMARY.md) - Detalhes da arquitetura

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 License

Este projeto é privado e proprietário.

## 🔗 Links

- [Website](https://srwa.pages.dev) (em breve)
- [Documentação](https://docs.srwa.io) (em desenvolvimento)
- [GitHub](https://github.com/SRWA-Cypherpunk/SRWA)

## 👥 Time

Desenvolvido por SRWA Cypherpunk Team

---

**Última Atualização**: 2025-10-18
**Versão**: 1.0.0
**Status**: 🚀 Em Desenvolvimento Ativo
