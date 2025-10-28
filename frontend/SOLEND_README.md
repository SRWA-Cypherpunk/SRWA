# 🏦 Integração Solend - SRWA

## ✅ O Que Está Implementado

### **SolendPoolCreator** - Criação de Lending Pools

Localização: `src/components/srwa/admin/SolendPoolCreator.tsx`

Interface administrativa completa para criar lending pools no Solend usando instruções nativas do programa token-lending.

## 🎯 Funcionalidades

### 1. Criar Lending Market
- Novo market isolado ou reutilizar existente
- Configurar moeda de cotação (USD, etc)
- Especificar programas de oráculo (Pyth, Switchboard)

### 2. Adicionar Reserves
- Listar tokens SRWA como reserves
- Depositar liquidez inicial
- Conectar oráculos de preço

### 3. Configurar Parâmetros de Risco
- **Utilization**: Optimal (80%), Max (95%)
- **Loan-to-Value**: 70% (quanto pode emprestar)
- **Liquidation Threshold**: 85% (quando ocorre liquidação)
- **Interest Rates**: Min 0%, Optimal 6%, Max 45%
- **Liquidation Bonus**: 8-10%
- **Protocol Fees**: Liquidation fee, Take rate

### 4. Parâmetros Avançados
- Deposit/Borrow limits
- Added borrow weight
- Scaled price offset
- Extra oracles
- Attributed borrow limits

## 🔧 Como Usar

### Passo 1: Acesse o Admin Panel
```
http://localhost:8082/admin
```

### Passo 2: Vá para Aba "Solend Pools"

### Passo 3: Preencher Formulário

#### **Market Configuration:**
- [x] Create New Market (ou desmarque para usar existente)
- Quote Currency: `USD`
- Oracle Program: Pyth devnet (padrão)
- Switchboard Program: Switchboard devnet (padrão)

#### **Reserve Configuration:**
- Mint do token SRWA: `[Seu mint address]`
- Liquidez inicial: `100` (tokens para depositar)
- Pyth Price Account: `[Feed de preço Pyth]`
- Switchboard Feed: `[Feed Switchboard]` (opcional)
- Fee Receiver: (opcional, usa sua ATA por padrão)

#### **Risk Parameters:**
Valores recomendados já vêm preenchidos. Ajuste conforme necessário.

### Passo 4: Criar Pool

Clique em **"Criar pool Solend"** e assine as transações.

✅ Sucesso! Seu pool foi criado. Copie os endereços gerados.

## 📍 Informações Importantes

### Devnet

- **Program ID**: `ALend7Ketfx5bxh6ghsCDXAoDrhvEmsXT3cynB6aPLgx`
- **Pyth Oracle**: `gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s`
- **Switchboard**: `7azgmy1pFXHikv36q1zZASvFq5vFa39TT9NweVugKKTU`

### Custos Estimados

- Criar Market: ~0.01 SOL (rent)
- Criar Reserve: ~0.05 SOL (rent + contas)
- Switchboard Feed: ~0.04 SOL/dia (se usar)

## 🎤 Para o Hackathon

Use esta integração para demonstrar:

1. ✅ **Composabilidade DeFi**: Tokens RWA participam do ecossistema
2. ✅ **Permissionless**: Qualquer um pode criar pools
3. ✅ **Configurável**: Controle total sobre parâmetros de risco
4. ✅ **Oráculos descentralizados**: Pyth e Switchboard
5. ✅ **Produção-ready**: Usando o programa oficial do Solend

## 🔗 Recursos

- Documentação Solend: https://docs.solend.fi/
- Token Lending Program: https://github.com/solendprotocol/solana-program-library
- Pyth Network: https://pyth.network/
- Switchboard: https://docs.switchboard.xyz/

## 💡 Próximos Passos (Pós-Hackathon)

Para uma integração completa em produção, considere:

1. Implementar liquidador automático
2. Adicionar interface pública (não só admin)
3. Integrar com SDK oficial quando estabilizar
4. Adicionar gráficos e analytics
5. Implementar notificações de liquidação

---

✅ **Integração funcional e pronta para demonstração!**
