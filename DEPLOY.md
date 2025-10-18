# SRWA Frontend - Guia de Deploy no Cloudflare Pages

## 📋 Pré-requisitos

- Conta no [Cloudflare](https://dash.cloudflare.com/)
- Repositório GitHub conectado ao Cloudflare Pages
- Node.js 18+ localmente (para testes)

---

## 🚀 Opção 1: Configuração via Dashboard (RECOMENDADA)

### Passo 1: Conectar Repositório

1. Acesse [Cloudflare Pages Dashboard](https://dash.cloudflare.com/)
2. Vá em **Pages** → **Create a project**
3. Conecte seu repositório GitHub `SRWA`
4. Selecione o repositório

### Passo 2: Configurar Build Settings

Configure as seguintes opções:

| Setting | Value |
|---------|-------|
| **Project name** | `srwa-frontend` (ou nome de sua preferência) |
| **Production branch** | `main` |
| **Framework preset** | `Vite` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `frontend` ⚠️ **IMPORTANTE** |

### Passo 3: Environment Variables

Adicione as seguintes variáveis (Settings → Environment variables):

#### Produção (Production)
```bash
NODE_VERSION=20
VITE_SOLANA_NETWORK=mainnet-beta

# RPC URLs (opcional - use RPC privado para melhor performance)
VITE_SOLANA_RPC_URL_MAINNET_BETA=https://api.mainnet-beta.solana.com

# Feature Flags
VITE_ENABLE_KYC=false
VITE_ENABLE_COMPLIANCE=false
VITE_ENABLE_LENDING=true
VITE_ENABLE_MARKETPLACE=true

# Contract Addresses (quando deployar os contratos)
# VITE_RWA_TOKEN_PROGRAM_ID=<seu-program-id>
# VITE_COMPLIANCE_PROGRAM_ID=<seu-program-id>
# VITE_LENDING_PROGRAM_ID=<seu-program-id>
# VITE_TOKEN_FACTORY_PROGRAM_ID=<seu-program-id>
```

#### Preview/Desenvolvimento
```bash
NODE_VERSION=20
VITE_SOLANA_NETWORK=devnet

# RPC URLs
VITE_SOLANA_RPC_URL_DEVNET=https://api.devnet.solana.com

# Feature Flags
VITE_ENABLE_KYC=false
VITE_ENABLE_COMPLIANCE=false
VITE_ENABLE_LENDING=true
VITE_ENABLE_MARKETPLACE=true

# Devnet Contract Addresses
# VITE_RWA_TOKEN_PROGRAM_ID=<devnet-program-id>
```

### Passo 4: Deploy

1. Clique em **Save and Deploy**
2. Aguarde o build completar (~2-3 minutos)
3. Acesse a URL fornecida pelo Cloudflare

---

## 🔧 Opção 2: Configuração via Arquivo (Alternativa)

Se preferir configurar via arquivo `wrangler.toml`:

### Passo 1: Usar Arquivos Criados

Os arquivos `package.json` e `wrangler.toml` na raiz do repositório já estão configurados.

### Passo 2: Configurar no Dashboard

| Setting | Value |
|---------|-------|
| **Build command** | `npm run build` |
| **Build output directory** | `frontend/dist` |
| **Root directory** | *(deixe vazio)* |

### Passo 3: Deploy via Wrangler CLI (Opcional)

```bash
# Instalar Wrangler
npm install -g wrangler

# Login no Cloudflare
wrangler login

# Deploy
wrangler pages deploy frontend/dist --project-name=srwa-frontend
```

---

## 🧪 Testar Localmente Antes do Deploy

```bash
# Na raiz do repositório
npm run build

# Ou no diretório frontend
cd frontend
npm install
npm run build
npm run preview
```

Acesse: http://localhost:4173

---

## 📊 Monitoramento Pós-Deploy

### Verificar Build Logs

1. Cloudflare Dashboard → Pages → Seu Projeto
2. Veja **Deployments** para logs detalhados
3. Verifique **Analytics** para métricas de uso

### Troubleshooting Comum

**Erro: "Could not read package.json"**
- ✅ **Solução**: Certifique-se de configurar `Root directory` como `frontend`

**Erro: "Module not found"**
- ✅ **Solução**: Verifique se todas as variáveis de ambiente estão configuradas

**Build lento ou timeout**
- ✅ **Solução**: Use Node 20, configure `NODE_VERSION=20`

**CSS não carrega**
- ✅ **Solução**: Verifique se `dist` está corretamente configurado como output

---

## 🔐 Segurança

### Variáveis de Ambiente Sensíveis

⚠️ **NUNCA** commite as seguintes informações:

- RPC URLs privadas
- API Keys
- Private Keys
- Contract addresses sensíveis

Configure sempre via **Cloudflare Dashboard → Environment variables**.

### Headers de Segurança

O Cloudflare Pages já inclui headers de segurança por padrão:
- `X-Frame-Options`
- `X-Content-Type-Options`
- `X-XSS-Protection`

Para headers customizados, crie `frontend/public/_headers`:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

## 🌐 Custom Domain (Opcional)

### Configurar Domínio Próprio

1. Cloudflare Dashboard → Pages → Seu Projeto
2. **Custom domains** → **Set up a custom domain**
3. Adicione seu domínio (ex: `app.srwa.com`)
4. Siga as instruções para atualizar DNS

### SSL/TLS

O Cloudflare fornece **SSL gratuito** automaticamente via Let's Encrypt.

---

## 📈 Performance

### Otimizações Já Implementadas

✅ **Chunk Splitting**:
- `react-vendor.js` - React core libraries
- `solana-vendor.js` - Wallet adapters
- `ui-vendor.js` - UI libraries
- `state-vendor.js` - State management

✅ **Build Optimizations**:
- Minificação via esbuild
- Tree-shaking automático
- CSS otimizado

### Cloudflare Performance Features

- **CDN Global**: ~275 data centers
- **HTTP/3 & QUIC**: Habilitado por padrão
- **Brotli Compression**: Automático
- **Edge Caching**: Configurável

---

## 🔄 CI/CD Automático

Após configurar, todo push para `main` dispara deploy automático:

```bash
git add .
git commit -m "feat: update landing page"
git push origin main
```

Cloudflare detecta automaticamente e faz o deploy.

### Branch Previews

Pushes para outras branches criam **preview deployments**:
```bash
git checkout -b feature/new-ui
git push origin feature/new-ui
```

Preview URL: `https://feature-new-ui.srwa-frontend.pages.dev`

---

## 📞 Suporte

**Problemas?**

1. Verifique [Cloudflare Pages Status](https://www.cloudflarestatus.com/)
2. Consulte [Documentação Oficial](https://developers.cloudflare.com/pages/)
3. Revise os logs de build no dashboard

---

## ✅ Checklist de Deploy

- [ ] Repositório conectado ao Cloudflare Pages
- [ ] Root directory configurado como `frontend`
- [ ] Build command: `npm run build`
- [ ] Build output: `dist`
- [ ] Variáveis de ambiente configuradas
- [ ] NODE_VERSION=20 definido
- [ ] Build local testado (`npm run build`)
- [ ] Preview local funciona (`npm run preview`)
- [ ] Primeiro deploy realizado com sucesso
- [ ] URL de produção acessível
- [ ] Todas as funcionalidades testadas

---

**Data de Criação**: 2025-10-18
**Versão**: 1.0.0
**Última Atualização**: Após reestruturação seguindo padrão agarIoCryptoStacksChain
