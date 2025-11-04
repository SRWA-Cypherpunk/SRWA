# Pool Distribution Program

Programa Solana para distribuição automática de SOL acumulado em pools para Issuers quando um threshold é atingido.

## 📋 Visão Geral

Este programa gerencia a distribuição automática de SOL de um pool vault para o Issuer quando o saldo da pool atinge um threshold configurável.

### Fluxo Completo

```
1. Investor compra tokens → SOL vai para Pool Vault
                         ↓
2. Pool Vault acumula SOL das compras
                         ↓
3. Quando pool.balance >= THRESHOLD
                         ↓
4. Qualquer pessoa pode chamar distribute_to_issuer()
                         ↓
5. SOL é transferido automaticamente para o Issuer
```

## 🏗️ Estrutura

### Accounts

#### `DistributionConfig`
```rust
pub struct DistributionConfig {
    pub bump: u8,
    pub authority: Pubkey,           // Admin que pode atualizar configs
    pub mint: Pubkey,                // Token SRWA associado
    pub pool_vault: Pubkey,          // Pool que acumula SOL
    pub issuer: Pubkey,              // Quem recebe SOL
    pub threshold: u64,              // Threshold em lamports (ex: 100 SOL)
    pub last_distribution: i64,      // Timestamp da última distribuição
    pub total_distributed: u64,      // Total distribuído historicamente
    pub distribution_count: u64,     // Número de distribuições
}
```

**PDA Seeds:** `["distribution_config", mint]`

## 📝 Instruções

### 1. `initialize`

Inicializa a configuração de distribuição para um token específico.

**Accounts:**
- `authority` (signer, mut) - Admin
- `mint` - Token SRWA
- `pool_vault` (mut) - Vault que acumulará SOL
- `distribution_config` (init, pda) - Config PDA
- `system_program`

**Args:**
- `threshold: u64` - Threshold mínimo em lamports
- `issuer: Pubkey` - Quem receberá o SOL

**Exemplo:**
```typescript
const threshold = 100 * 1e9; // 100 SOL
const issuer = new PublicKey("...");

await program.methods
  .initialize(new BN(threshold), issuer)
  .accounts({
    authority: admin.publicKey,
    mint: tokenMint,
    poolVault: poolVaultPDA,
    distributionConfig: configPDA,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

---

### 2. `distribute_to_issuer`

**🔓 PERMISSIONLESS** - Qualquer pessoa pode chamar quando threshold é atingido!

Distribui TODO o saldo do pool vault para o issuer.

**Accounts:**
- `caller` (signer, mut) - Qualquer pessoa
- `distribution_config` (mut, pda)
- `pool_vault` (mut) - Deve ter balance >= threshold
- `issuer` (mut) - Recebe o SOL
- `system_program`

**Constraints:**
- `pool_vault.lamports() >= config.threshold` ✅

**Exemplo:**
```typescript
// Qualquer pessoa pode executar!
await program.methods
  .distributeToIssuer()
  .accounts({
    caller: anyWallet.publicKey,
    distributionConfig: configPDA,
    poolVault: poolVaultPDA,
    issuer: config.issuer,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

**Emite evento:**
```rust
SolDistributed {
    config: Pubkey,
    mint: Pubkey,
    issuer: Pubkey,
    amount: u64,
    timestamp: i64,
    distribution_number: u64,
}
```

---

### 3. `update_threshold`

Atualiza o threshold mínimo (apenas admin).

**Accounts:**
- `authority` (signer) - Deve ser o admin original
- `distribution_config` (mut, pda)

**Args:**
- `new_threshold: u64`

**Exemplo:**
```typescript
const newThreshold = 200 * 1e9; // 200 SOL

await program.methods
  .updateThreshold(new BN(newThreshold))
  .accounts({
    authority: admin.publicKey,
    distributionConfig: configPDA,
  })
  .rpc();
```

---

### 4. `update_issuer`

Atualiza o endereço do issuer (apenas admin).

**Accounts:**
- `authority` (signer) - Deve ser o admin original
- `distribution_config` (mut, pda)

**Args:**
- `new_issuer: Pubkey`

**Exemplo:**
```typescript
const newIssuer = new PublicKey("...");

await program.methods
  .updateIssuer(newIssuer)
  .accounts({
    authority: admin.publicKey,
    distributionConfig: configPDA,
  })
  .rpc();
```

## 🎯 Exemplo de Uso Completo

### Setup Inicial

```typescript
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';

// 1. Derivar PDAs
const [configPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("distribution_config"), mint.toBuffer()],
  program.programId
);

// 2. Criar pool vault (pode ser qualquer SystemAccount)
const poolVault = Keypair.generate();

// 3. Inicializar configuração
const threshold = 100 * 1e9; // 100 SOL
const issuer = new PublicKey("IssuerWallet...");

await program.methods
  .initialize(new BN(threshold), issuer)
  .accounts({
    authority: admin.publicKey,
    mint,
    poolVault: poolVault.publicKey,
    distributionConfig: configPDA,
    systemProgram: SystemProgram.programId,
  })
  .rpc();

console.log("✅ Distribution config initialized!");
console.log(`Threshold: ${threshold / 1e9} SOL`);
console.log(`Issuer: ${issuer.toBase58()}`);
```

### Monitoramento e Distribuição

```typescript
// Monitorar saldo da pool
async function checkPoolBalance() {
  const balance = await connection.getBalance(poolVault.publicKey);
  const config = await program.account.distributionConfig.fetch(configPDA);

  console.log(`Pool balance: ${balance / 1e9} SOL`);
  console.log(`Threshold: ${config.threshold.toNumber() / 1e9} SOL`);

  if (balance >= config.threshold.toNumber()) {
    console.log("✅ Threshold met! Ready to distribute");
    return true;
  }

  return false;
}

// Executar distribuição (qualquer pessoa pode chamar!)
async function distribute() {
  const canDistribute = await checkPoolBalance();

  if (!canDistribute) {
    console.log("⏳ Threshold not met yet");
    return;
  }

  const tx = await program.methods
    .distributeToIssuer()
    .accounts({
      caller: wallet.publicKey,
      distributionConfig: configPDA,
      poolVault: poolVault.publicKey,
      issuer: (await program.account.distributionConfig.fetch(configPDA)).issuer,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log("✅ Distribution completed!");
  console.log(`TX: ${tx}`);
}
```

### Crank Bot (Automação)

```typescript
// Bot que monitora e distribui automaticamente
setInterval(async () => {
  try {
    const balance = await connection.getBalance(poolVault.publicKey);
    const config = await program.account.distributionConfig.fetch(configPDA);

    if (balance >= config.threshold.toNumber()) {
      console.log(`🤖 Threshold met! Distributing ${balance / 1e9} SOL...`);

      await program.methods
        .distributeToIssuer()
        .accounts({
          caller: crank.publicKey,
          distributionConfig: configPDA,
          poolVault: poolVault.publicKey,
          issuer: config.issuer,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("✅ Distributed!");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}, 30000); // Check a cada 30s
```

## 🔒 Segurança

### Permissões

- **initialize**: Apenas admin/authority
- **update_threshold**: Apenas admin original
- **update_issuer**: Apenas admin original
- **distribute_to_issuer**: **QUALQUER PESSOA** (permissionless)

### Validações

✅ Threshold deve ser > 0
✅ Pool vault deve ter saldo >= threshold
✅ Apenas admin pode atualizar configurações
✅ Pool vault e issuer verificados via constraint

## 📊 Eventos

### `SolDistributed`
Emitido quando SOL é distribuído para o issuer.

```rust
pub struct SolDistributed {
    pub config: Pubkey,
    pub mint: Pubkey,
    pub issuer: Pubkey,
    pub amount: u64,              // Lamports distribuídos
    pub timestamp: i64,
    pub distribution_number: u64,  // Contador de distribuições
}
```

### `ConfigUpdated`
Emitido quando threshold ou issuer são atualizados.

```rust
pub struct ConfigUpdated {
    pub config: Pubkey,
    pub mint: Pubkey,
    pub field: String,            // Ex: "threshold: 100 SOL → 200 SOL"
    pub timestamp: i64,
}
```

## 🧪 Testes

```bash
# Build
anchor build --program-name pool_distribution

# Generate IDL
anchor idl build --program-name pool_distribution

# Deploy
anchor deploy --program-name pool_distribution --provider.cluster devnet
```

## 💡 Dicas

1. **Threshold Recomendado**: Entre 50-200 SOL para evitar muitas distribuições pequenas
2. **Crank Bot**: Rode em servidor 24/7 (PM2, Docker, etc)
3. **Monitoramento**: Use eventos para tracking em tempo real
4. **Pool Vault**: Pode ser um PDA ou SystemAccount regular

## 📞 Integração com Purchase Order

Este programa trabalha em conjunto com o `purchase_order` program:

```
purchase_order.execute_purchase()
    → SOL vai para pool_vault
    → Quando threshold atingido
    → pool_distribution.distribute_to_issuer()
    → SOL vai para Issuer
```

## Program ID

**Devnet/Localnet:** `GBhbrpXQWfGTK6MSpbUUCMYh5X6hT5WWC66PDuiGx6Fm`
