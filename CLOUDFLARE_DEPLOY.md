# Cloudflare Pages - Guia de Deploy

## Problema Resolvido

O erro no Cloudflare Pages foi causado por conflito entre `yarn.lock` na raiz (para smart contracts Solana) e `package-lock.json` no frontend (React app).

## Solução Implementada

Convertemos o projeto para **Yarn Workspaces** (monorepo), que é a melhor prática para projetos com múltiplos pacotes.

### Mudanças Realizadas

1. ✅ `package.json` da raiz atualizado com workspace
2. ✅ `package-lock.json` do frontend removido
3. ✅ `.gitignore` atualizado
4. ✅ `wrangler.toml` criado com configuração correta
5. ✅ Link do Dashboard habilitado no menu

## Configuração no Cloudflare Pages Dashboard

### Opção 1: Usar wrangler.toml (Recomendado)

O arquivo `wrangler.toml` já está configurado. O Cloudflare detectará automaticamente.

### Opção 2: Configuração Manual no Dashboard

Se preferir configurar manualmente:

1. **Framework preset**: `None` (ou deixe em branco)

2. **Build command**:
   ```
   yarn workspace solana-rwa-frontend build
   ```

3. **Build output directory**:
   ```
   dist
   ```

4. **Root directory (advanced)**:
   ```
   frontend
   ```

5. **Environment variables**:
   - `NODE_VERSION`: `22`
   - **NÃO adicione** `VITE_ENABLE_DASHBOARD` (Dashboard ficará oculto em produção)

## Deploy

### Via Git (Automático)

```bash
git add .
git commit -m "fix: configurar yarn workspace e habilitar dashboard"
git push
```

O Cloudflare Pages fará o build automaticamente.

### Via Wrangler CLI

```bash
# Instalar wrangler globalmente (se necessário)
npm install -g wrangler

# Deploy
wrangler pages deploy frontend/dist --project-name=srwa-frontend
```

## Desenvolvimento Local

### Problema com @swc/core no macOS

O erro de "code signature invalid" é específico do macOS local e **NÃO afetará o deploy no Cloudflare** (que usa Linux).

### Solução Temporária para Desenvolvimento Local

Enquanto o problema do workspace persiste localmente, use:

```bash
cd frontend
npm install
npm run dev
```

Isso instalará as dependências localmente no frontend, ignorando o workspace da raiz.

## Feature Flags

### Dashboard (Controle de Visibilidade)

O Dashboard pode ser habilitado/desabilitado via variável de ambiente:

- **Variável**: `VITE_ENABLE_DASHBOARD`
- **Valores**: `true` ou `false` (string)
- **Comportamento padrão**:
  - **Desenvolvimento** (com `.env` file): `true` - Dashboard visível
  - **Produção** (sem env var): `false` - Dashboard oculto

#### Para Habilitar Dashboard em Produção (Cloudflare)

Se quiser testar o Dashboard em produção, adicione nas **Environment variables** do Cloudflare:
```
VITE_ENABLE_DASHBOARD=true
```

**⚠️ IMPORTANTE**: Por padrão, **NÃO adicione** essa variável no Cloudflare para manter o Dashboard oculto na versão pública.

## Verificação Pós-Deploy

Após o deploy, verifique:

1. ✅ Build completou sem erros
2. ✅ Site está acessível
3. ✅ Link "Dashboard" no menu **NÃO aparece** (se VITE_ENABLE_DASHBOARD não foi configurada)
4. ✅ Conectar wallet Solana funciona
5. ✅ Outras páginas funcionam normalmente

## Troubleshooting

### Build falha com erro de yarn

Certifique-se que:
- `yarn.lock` está commitado na raiz
- `package-lock.json` do frontend foi removido
- Build command usa `yarn workspace`

### Dashboard não carrega

Verifique:
- Rota `/dashboard` está configurada
- Wallet Solana está conectada
- Usuário está registrado no sistema

## Estrutura do Projeto

```
SRWA/
├── package.json          # Root workspace config
├── yarn.lock            # Yarn workspace lock file
├── wrangler.toml        # Cloudflare Pages config
├── programs/            # Solana smart contracts
│   └── srwa-contracts/
└── frontend/            # React frontend
    ├── package.json     # Frontend dependencies
    ├── vite.config.ts
    └── src/
```

## Próximos Passos

1. Fazer commit das mudanças
2. Push para GitHub
3. Verificar build no Cloudflare Pages
4. Testar funcionalidade do Dashboard
5. Se necessário, ajustar variáveis de ambiente

## Suporte

Se encontrar problemas:
- Verifique logs de build no Cloudflare Pages
- Confira se todas as dependências estão no `package.json`
- Valide se o comando de build funciona localmente
