# Instruções para Redeploy do srwa_factory

## Contexto
Foi adicionado o campo `token_program` na instrução `approve_srwa` para corrigir o erro "An account required by the instruction is missing".

## Mudanças Feitas

### Programa Rust (srwa_factory)
- ✅ Adicionado `pub token_program: AccountInfo<'info>` na estrutura `ApproveSrwa`
- ✅ Atualizada função `initialise_token_2022_mint` para receber `token_program_info`
- ✅ Build completo: `anchor build --program-name srwa_factory`

### Frontend
- ✅ Adicionado `tokenProgram: TOKEN_2022_PROGRAM_ID` na chamada da instrução
- ✅ IDL atualizado copiado para `frontend/public/idl/`

## Aguardando

⏳ **Deploy do programa para devnet**

O deploy está falhando devido a problemas temporários no RPC da devnet (timeout/503 errors).

## Quando o RPC estabilizar, execute:

```bash
# Opção 1: Usar Anchor
cd /home/inteli/Desktop/SRWA
anchor deploy --provider.cluster devnet --program-name srwa_factory

# Opção 2: Usar Solana CLI diretamente
solana program deploy target/deploy/srwa_factory.so \
  --program-id DgNZ6dzLSXzunGiaFnpUhS63B6Wu9WNZ79KF6fW3ETgY \
  --url devnet \
  --keypair ~/.config/solana/temp-keypair.json
```

## Verificar Deploy

```bash
solana program show DgNZ6dzLSXzunGiaFnpUhS63B6Wu9WNZ79KF6fW3ETgY --url devnet
```

## Após o Deploy

1. Recarregue o frontend (Ctrl+R ou Cmd+R)
2. Tente aprovar um token SRWA novamente
3. O erro "An account required by the instruction is missing" deve estar resolvido

## Status Atual

- ✅ Código corrigido
- ✅ Build completo
- ✅ Frontend atualizado
- ⏳ Aguardando deploy na devnet (RPC temporariamente indisponível)
