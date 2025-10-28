# 🪙 Como Criar Wrapped SOL para Testar Pool Solend

Para criar um pool de lending de SOL, você precisa de **Wrapped SOL (wSOL)** na sua carteira.

## Comandos para criar wSOL na devnet:

```bash
# 1. Criar uma conta de token para wSOL (So11111111111111111111111111111111111111112)
spl-token create-account So11111111111111111111111111111111111111112

# 2. Fazer wrap de 1 SOL em wSOL (ajuste a quantidade conforme necessário)
spl-token wrap 1

# 3. Verificar saldo de wSOL
spl-token balance So11111111111111111111111111111111111111112
```

Após ter wSOL na carteira, você pode usar no pool Solend:
- **Mint**: So11111111111111111111111111111111111111112
- **Liquidez inicial**: 0.1 (ou quanto você quiser depositar)

## ⚠️ Problema com Pyth Oracle na Devnet

O erro "Pyth oracle price is stale" acontece porque:
- Oráculos Pyth na devnet nem sempre estão atualizados
- O programa Solend rejeita preços desatualizados por segurança

### Soluções:

**Opção A: Usar Switchboard (RECOMENDADO)**

Crie um feed Switchboard com preço fixo para teste:
1. Acesse https://app.switchboard.xyz/solana/devnet
2. Conecte sua wallet
3. Crie um novo feed "Pull" (on-demand)
4. Configure fonte: "Manual/Fixed Price" = $100 (para simular SOL)
5. Copie o endereço do feed
6. Cole no campo "Switchboard Feed" do formulário

**Opção B: Atualizar Pyth manualmente (temporário)**

```bash
# Instalar Pyth CLI
npm install -g @pythnetwork/client

# Atualizar feed SOL/USD na devnet (precisa ser feito frequentemente)
pyth-client update-price-feed \
  --cluster devnet \
  --feed-id J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix
```

**Opção C: Usar pool Solend existente (mais fácil)**

Em vez de criar um novo pool, você pode interagir com o pool principal do Solend que já existe na devnet.

## 🎯 Para o Hackathon

Se o objetivo é demonstrar a integração, recomendo:
1. Criar um feed Switchboard simples (Opção A)
2. Usar preço fixo de $1 USD para o token RWA
3. Demonstrar que o pool foi criado e está funcional
4. Mencionar que em produção usaria Pyth ou feeds Switchboard atualizados

---

**Agora tente criar o pool novamente com wSOL ou crie um feed Switchboard!**
