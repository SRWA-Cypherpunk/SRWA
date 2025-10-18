# ☁️ Configuração Cloudflare Pages - Passo a Passo

## ✅ Status: Pronto para Deploy

O repositório está 100% configurado para deploy no Cloudflare Pages.

---

## 📋 Pré-Deploy Checklist

- [x] Build testado localmente (funcionando)
- [x] `package.json` na raiz criado
- [x] `wrangler.toml` configurado
- [x] `_headers` e `_redirects` criados
- [x] `.env.example` documentado
- [x] `.gitignore` atualizado
- [x] Documentação completa (DEPLOY.md, README.md)

---

## 🚀 Deploy no Cloudflare Pages

### Passo 1: Acessar Cloudflare Dashboard

1. Acesse https://dash.cloudflare.com/
2. Faça login na sua conta
3. Vá em **Pages** no menu lateral
4. Clique em **Create a project**

### Passo 2: Conectar Repositório GitHub

1. Selecione **Connect to Git**
2. Autorize o Cloudflare a acessar sua conta GitHub
3. Selecione o repositório: `SRWA-Cypherpunk/SRWA`
4. Clique em **Begin setup**

### Passo 3: Configurar Build Settings

**⚠️ CONFIGURAÇÃO CRÍTICA - Copie exatamente:**

```
Project name: srwa-frontend

Production branch: main

Framework preset: Vite

Build command: npm run build

Build output directory: dist

Root directory (advanced): frontend     👈 IMPORTANTE!
```

**Por que "frontend"?**
O Cloudflare precisa saber que o código está na pasta `/frontend`, não na raiz do repositório.

### Passo 4: Environment Variables

Clique em **Environment variables (advanced)** e adicione:

#### Para Production & Preview:

```bash
NODE_VERSION=20
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL_DEVNET=https://api.devnet.solana.com
VITE_ENABLE_LENDING=true
VITE_ENABLE_MARKETPLACE=true
VITE_ENABLE_KYC=false
VITE_ENABLE_COMPLIANCE=false
```

#### Quando for para Mainnet:

```bash
VITE_SOLANA_NETWORK=mainnet-beta
VITE_SOLANA_RPC_URL_MAINNET_BETA=https://api.mainnet-beta.solana.com
# Ou use um RPC privado para melhor performance:
# VITE_SOLANA_RPC_URL_MAINNET_BETA=https://your-helius-rpc.com
```

### Passo 5: Iniciar Deploy

1. Clique em **Save and Deploy**
2. Aguarde o build (~2-3 minutos)
3. ✅ Deploy completo!

---

## 🔍 Verificar Deploy

### Logs de Build

Durante o deploy, você verá:

```
18:02:01 Cloning repository...
18:02:02 Success: Finished cloning repository files
18:02:03 Executing user command: npm run build
18:02:10 > cd frontend && npm install && npm run build
18:02:15 Installing dependencies...
18:02:45 Building production bundle...
18:03:00 ✓ 8297 modules transformed.
18:03:05 ✓ built in 5.61s
18:03:06 Uploading...
18:03:10 ✅ Deployment complete!
```

### Acessar Aplicação

Após o deploy, você receberá URLs:

**Production:**
```
https://srwa-frontend.pages.dev
```

**Preview (branches):**
```
https://feature-nome.srwa-frontend.pages.dev
```

---

## 🎯 Testar Funcionalidades

Após deploy, teste:

- [ ] Landing page carrega corretamente
- [ ] Roadmap interativo funciona
- [ ] Conectar carteira Phantom/Solflare
- [ ] Navegação entre páginas
- [ ] Responsividade mobile
- [ ] Assets carregam (imagens, CSS)

---

## 🔧 Troubleshooting

### Problema: Build falha com "Could not read package.json"

**Solução:**
- Verifique se `Root directory` está configurado como `frontend`
- Se não aparecer a opção, use `wrangler.toml`:
  ```toml
  [build]
  command = "npm run build"
  cwd = "frontend"
  ```

### Problema: "Module not found" errors

**Solução:**
- Verifique as variáveis de ambiente
- Certifique-se de que `NODE_VERSION=20` está configurado

### Problema: Página em branco após deploy

**Solução:**
1. Abra o Console do navegador (F12)
2. Verifique erros de JavaScript
3. Geralmente é falta de variável de ambiente
4. Adicione `VITE_SOLANA_NETWORK=devnet`

### Problema: CSS não carrega

**Solução:**
- Verifique se `Build output directory` está como `dist` (não `frontend/dist`)
- Limpe cache do Cloudflare: Pages → Settings → Clear cache

---

## 📊 Após Deploy Bem-Sucedido

### 1. Custom Domain (Opcional)

Para usar seu próprio domínio:

1. Pages → Seu projeto → **Custom domains**
2. Clique em **Set up a custom domain**
3. Digite: `app.seudominio.com`
4. Siga as instruções de DNS
5. SSL é automático ✅

### 2. Analytics

Habilite Web Analytics:

1. Pages → Seu projeto → **Analytics**
2. Enable Web Analytics
3. Veja métricas de uso, performance, etc.

### 3. Preview Deployments

Todo push para qualquer branch cria um preview automático:

```bash
git checkout -b feature/new-ui
git push origin feature/new-ui
```

Preview URL será gerado automaticamente.

### 4. Proteção de Branches

Configure em Settings → Deployments:

- **Production branch**: `main` (somente)
- **Preview branches**: Todas as outras
- Opcionalmente: Require approval for production deploys

---

## 🔐 Segurança

### Headers Configurados

O arquivo `_headers` já configura:
- ✅ X-Frame-Options
- ✅ Content-Security-Policy
- ✅ X-Content-Type-Options
- ✅ Permissions-Policy

### Recomendações

1. **Não commite secrets**: Use Environment variables
2. **Use RPC privado**: Para mainnet, evite RPC público
3. **Enable Bot Fight Mode**: Cloudflare Dashboard → Security
4. **Rate Limiting**: Configure se necessário

---

## 📈 Performance

### Otimizações Já Implementadas

✅ **Chunk Splitting**:
- `react-vendor.js` (162 KB)
- `solana-vendor.js` (415 KB)
- `ui-vendor.js` (544 KB)
- `state-vendor.js` (36 KB)

✅ **Cache Headers**:
- Assets: 1 ano de cache
- HTML: Sem cache (sempre atualizado)

✅ **Cloudflare CDN**:
- 275+ data centers globalmente
- HTTP/3 habilitado
- Brotli compression

### Performance Score Esperado

- **Lighthouse Score**: 90+ (Performance, SEO, Accessibility)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s

---

## 🔄 Atualizações Futuras

### Deploy Automático

Após configuração inicial, deployséautomáticos:

```bash
# Fazer mudanças
git add .
git commit -m "feat: add new feature"
git push origin main

# Cloudflare detecta e faz deploy automaticamente
# Acompanhe em: Cloudflare Dashboard → Pages → Deployments
```

### Rollback

Se algo der errado:

1. Pages → Seu projeto → **Deployments**
2. Encontre o deploy anterior que funcionava
3. Clique nos 3 pontos → **Rollback to this deployment**
4. Confirme

---

## ✅ Checklist Final

Após completar o setup:

- [ ] Aplicação acessível em `*.pages.dev`
- [ ] Carteiras Solana conectam corretamente
- [ ] Roadmap interativo funciona
- [ ] Mobile responsivo
- [ ] Performance boa (teste no PageSpeed Insights)
- [ ] Sem erros no Console
- [ ] Analytics habilitado
- [ ] Team notificado sobre URL de produção

---

## 📞 Suporte

**Problemas?**

1. Verifique os logs de build no Cloudflare Dashboard
2. Consulte [DEPLOY.md](./DEPLOY.md) para guia completo
3. Revise [README.md](./README.md) para arquitetura
4. Cloudflare Docs: https://developers.cloudflare.com/pages/

---

**Configurado por**: Claude Code
**Data**: 2025-10-18
**Status**: ✅ Pronto para Produção
