# Fluxo de KYC para Investors

## Como Investor Adiciona Informações de KYC

Este guia explica como um investor passa pelo processo de KYC e obtém as claims necessárias para investir.

## Visão Geral do Fluxo

```
Investor → KYC Provider → Identity Claims → Pode Investir
```

1. **Investor** se registra com um KYC Provider aprovado
2. **KYC Provider** valida a identidade do investor (off-chain)
3. **KYC Provider** emite claims on-chain via programa `identity_claims`
4. **Investor** pode investir (sistema verifica claims automaticamente)

## Passo a Passo Detalhado

### STEP 1: Investor - Registrar Identidade

Primeiro, o investor precisa criar sua conta de identidade no programa `identity_claims`:

```typescript
import { Program, web3 } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

const identityClaimsProgram = anchor.workspace.IdentityClaims as Program;

// Derivar o PDA da identidade do investor
const [identityAccount] = PublicKey.findProgramAddressSync(
  [Buffer.from("identity"), investor.publicKey.toBuffer()],
  identityClaimsProgram.programId
);

// Registrar identidade
const metadata = Buffer.from("Investor basic info"); // metadata opcional

const tx = await identityClaimsProgram.methods
  .registerIdentity(Array.from(metadata))
  .accounts({
    user: investor.publicKey,
    identity: identityAccount,
    systemProgram: web3.SystemProgram.programId,
  })
  .signers([investor])
  .rpc();

console.log("Identity registered:", tx);
```

**O que acontece:**
- Cria o PDA `identity` para o investor
- Inicializa a conta de identidade
- Investor agora pode receber claims

### STEP 2: Investor - Submeter KYC ao Provider (Off-chain)

O investor precisa submeter seus documentos ao KYC Provider fora da blockchain:

```typescript
// Exemplo de integração com KYC Provider
const kycSubmission = {
  investorWallet: investor.publicKey.toString(),
  documents: {
    fullName: "John Doe",
    dateOfBirth: "1990-01-01",
    nationality: "US",
    governmentId: "encrypted_document_hash",
    proofOfAddress: "encrypted_document_hash",
    selfie: "encrypted_document_hash",
  },
  requiredClaims: [1, 2, 6], // KYC, AML, SANCTIONS_CLEAR
};

// Provider valida os documentos (off-chain)
// Pode usar serviços como:
// - Onfido, Jumio, Veriff (identity verification)
// - ComplyAdvantage, Elliptic (AML/sanctions screening)
// - Accredited Investor verification services

const response = await fetch("https://kyc-provider.com/api/submit", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(kycSubmission),
});

const result = await response.json();
console.log("KYC Status:", result.status); // "pending" | "approved" | "rejected"
```

### STEP 3: KYC Provider - Emitir Claims On-chain

Após validar a identidade off-chain, o KYC Provider emite claims on-chain:

```typescript
// Este código roda no backend do KYC Provider

import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import * as crypto from "crypto";

const identityClaimsProgram = anchor.workspace.IdentityClaims as Program;
const kycProvider = anchor.web3.Keypair.fromSecretKey(
  // Secret key do KYC Provider (guardada com segurança)
  Uint8Array.from([...])
);

// Investor que foi aprovado no KYC
const investorPubkey = new PublicKey("INVESTOR_PUBLIC_KEY");

// Derivar accounts
const [identityAccount] = PublicKey.findProgramAddressSync(
  [Buffer.from("identity"), investorPubkey.toBuffer()],
  identityClaimsProgram.programId
);

// Para cada claim topic aprovado
async function issueKYCClaim(
  topic: number, // 1 = KYC, 2 = AML, etc.
  validDays: number = 365
) {
  // Hash dos dados do KYC (off-chain)
  const kycData = {
    investor: investorPubkey.toString(),
    topic,
    verifiedAt: Date.now(),
    documentHashes: ["hash1", "hash2"],
  };

  const dataHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(kycData))
    .digest();

  // Derivar claim account
  const [claimAccount] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("claim"),
      investorPubkey.toBuffer(),
      kycProvider.publicKey.toBuffer(),
      Buffer.from([topic, 0, 0, 0]), // u32 topic
    ],
    identityClaimsProgram.programId
  );

  // Data de validade
  const validUntil = Math.floor(Date.now() / 1000) + validDays * 24 * 60 * 60;

  // Emitir claim on-chain
  const tx = await identityClaimsProgram.methods
    .addClaim(topic, Array.from(dataHash), new anchor.BN(validUntil))
    .accounts({
      issuer: kycProvider.publicKey,
      user: investorPubkey,
      identity: identityAccount,
      claim: claimAccount,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([kycProvider])
    .rpc();

  console.log(`Claim ${topic} issued:`, tx);
  return tx;
}

// Emitir claims aprovados
await issueKYCClaim(1, 365); // KYC - válido por 1 ano
await issueKYCClaim(2, 365); // AML - válido por 1 ano
await issueKYCClaim(6, 365); // SANCTIONS_CLEAR - válido por 1 ano
```

**O que acontece:**
- Provider cria um hash dos dados de KYC
- Provider emite claim on-chain para cada topic aprovado
- Claim tem data de expiração
- Claim fica vinculado ao investor e ao provider

### STEP 4: Investor - Verificar Claims Recebidos

O investor pode verificar quais claims possui:

```typescript
import { Program, web3 } from "@coral-xyz/anchor";

async function getInvestorClaims(investorPubkey: PublicKey) {
  const identityClaimsProgram = anchor.workspace.IdentityClaims as Program;

  // Buscar todas as contas de claim do investor
  const claims = await identityClaimsProgram.account.claimAccount.all([
    {
      memcmp: {
        offset: 8, // Pula o discriminator
        bytes: investorPubkey.toBase58(),
      },
    },
  ]);

  console.log(`Investor tem ${claims.length} claims:`);

  claims.forEach((claim) => {
    const topicNames = {
      1: "KYC",
      2: "AML",
      3: "ACCREDITED",
      4: "RESIDENCY",
      5: "PEP",
      6: "SANCTIONS_CLEAR",
      7: "KYB",
    };

    console.log({
      topic: topicNames[claim.account.topic] || claim.account.topic,
      issuer: claim.account.issuer.toString(),
      issuedAt: new Date(claim.account.issuedAt.toNumber() * 1000),
      validUntil: new Date(claim.account.validUntil.toNumber() * 1000),
      revoked: claim.account.revoked,
    });
  });

  return claims;
}

const claims = await getInvestorClaims(investor.publicKey);
```

### STEP 5: Sistema - Validar KYC Antes de Investir

Quando o investor tenta investir, o sistema automaticamente verifica:

```typescript
// No programa offering_pool ou srwa_controller

#[derive(Accounts)]
pub struct Invest<'info> {
    #[account(mut)]
    pub investor: Signer<'info>,

    // ... outras contas ...

    // Configuração de KYC do issuer
    #[account(
        seeds = [b"issuer_kyc", mint.key().as_ref()],
        bump,
    )]
    pub issuer_kyc_config: Account<'info, IssuerKYCConfig>,

    /// CHECK: Identity account do investor
    pub investor_identity: UncheckedAccount<'info>,

    /// CHECK: Identity claims program
    pub identity_claims_program: UncheckedAccount<'info>,
}

pub fn invest_handler(ctx: Context<Invest>, amount: u64) -> Result<()> {
    let issuer_kyc_config = &ctx.accounts.issuer_kyc_config;

    // Se KYC é obrigatório, validar
    if issuer_kyc_config.require_kyc {
        // CPI para identity_claims::is_verified
        let required_topics = issuer_kyc_config.required_claim_topics.clone();

        // Verificar se investor tem todos os claims necessários
        // de um dos providers aprovados
        let is_verified = verify_investor_kyc_cpi(
            &ctx.accounts.identity_claims_program,
            &ctx.accounts.investor,
            &ctx.accounts.investor_identity,
            &issuer_kyc_config.approved_providers,
            &required_topics,
        )?;

        require!(is_verified, ErrorCode::MissingKYCClaims);
    }

    // Processar investimento...
    msg!("Investor KYC verified, processing investment of {}", amount);

    Ok(())
}
```

## Componente React para Investor

Crie uma interface para o investor verificar seu status de KYC:

```typescript
// frontend/src/components/investor/KYCStatus.tsx

import React, { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useProgram } from '../../contexts/ProgramContext';

export const KYCStatus: React.FC<{ mintAddress: string }> = ({ mintAddress }) => {
  const { program, provider } = useProgram();
  const [claims, setClaims] = useState<any[]>([]);
  const [kycConfig, setKycConfig] = useState<any>(null);
  const [canInvest, setCanInvest] = useState(false);

  useEffect(() => {
    loadKYCStatus();
  }, [mintAddress]);

  const loadKYCStatus = async () => {
    // 1. Buscar configuração de KYC do token
    const [issuerKycConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from("issuer_kyc"), new PublicKey(mintAddress).toBuffer()],
      program.programId
    );

    try {
      const config = await program.account.issuerKycConfig.fetch(issuerKycConfig);
      setKycConfig(config);

      // 2. Buscar claims do investor
      const identityClaimsProgram = new PublicKey("Hr4S5caMKqLZFPRuJXu4rCktC9UfR3VxEDkU9JiQiCzv");
      const investorClaims = await fetchInvestorClaims(provider.wallet.publicKey);
      setClaims(investorClaims);

      // 3. Verificar se pode investir
      const hasAllRequiredClaims = config.requiredClaimTopics.every(topic =>
        investorClaims.some(claim =>
          claim.topic === topic &&
          !claim.revoked &&
          claim.validUntil > Date.now() / 1000 &&
          config.approvedProviders.some(provider =>
            provider.toString() === claim.issuer.toString()
          )
        )
      );

      setCanInvest(hasAllRequiredClaims || !config.requireKyc);
    } catch (error) {
      console.error("Error loading KYC status:", error);
    }
  };

  const TOPIC_NAMES = {
    1: "KYC",
    2: "AML",
    3: "ACCREDITED",
    4: "RESIDENCY",
    5: "PEP",
    6: "SANCTIONS_CLEAR",
    7: "KYB",
  };

  return (
    <div className="kyc-status">
      <h3>Your KYC Status</h3>

      {kycConfig && kycConfig.requireKyc ? (
        <>
          <div className={`status-badge ${canInvest ? 'approved' : 'pending'}`}>
            {canInvest ? '✅ Approved to Invest' : '⏳ KYC Required'}
          </div>

          <div className="required-claims">
            <h4>Required Verifications:</h4>
            {kycConfig.requiredClaimTopics.map(topic => {
              const hasClaim = claims.some(c =>
                c.topic === topic &&
                !c.revoked &&
                c.validUntil > Date.now() / 1000
              );

              return (
                <div key={topic} className="claim-requirement">
                  {hasClaim ? '✅' : '❌'} {TOPIC_NAMES[topic]}
                </div>
              );
            })}
          </div>

          {!canInvest && (
            <div className="kyc-action">
              <h4>Complete Your KYC:</h4>
              <p>Choose an approved KYC provider:</p>
              {kycConfig.approvedProviders.map((provider, idx) => (
                <button
                  key={idx}
                  onClick={() => window.open(`https://kyc-provider.com?wallet=${provider.wallet.publicKey}`, '_blank')}
                  className="provider-button"
                >
                  Start KYC with Provider {idx + 1}
                </button>
              ))}
            </div>
          )}

          <div className="your-claims">
            <h4>Your Current Claims ({claims.length}):</h4>
            {claims.map((claim, idx) => (
              <div key={idx} className="claim-item">
                <strong>{TOPIC_NAMES[claim.topic]}</strong>
                <div className="claim-details">
                  <span>Issued: {new Date(claim.issuedAt * 1000).toLocaleDateString()}</span>
                  <span>Expires: {new Date(claim.validUntil * 1000).toLocaleDateString()}</span>
                  <span className={claim.revoked ? 'revoked' : 'active'}>
                    {claim.revoked ? 'Revoked' : 'Active'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="no-kyc-required">
          ✅ No KYC required for this token
        </div>
      )}
    </div>
  );
};
```

## Renovação de Claims

Claims expiram. O investor deve renovar periodicamente:

```typescript
// Provider backend - renovar claim expirado

async function renewClaim(
  investorPubkey: PublicKey,
  topic: number,
  additionalDays: number = 365
) {
  // 1. Revogar claim antigo
  const [oldClaimAccount] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("claim"),
      investorPubkey.toBuffer(),
      kycProvider.publicKey.toBuffer(),
      Buffer.from([topic, 0, 0, 0]),
    ],
    identityClaimsProgram.programId
  );

  await identityClaimsProgram.methods
    .revokeClaim(topic)
    .accounts({
      issuer: kycProvider.publicKey,
      user: investorPubkey,
      identity: identityAccount,
      claim: oldClaimAccount,
    })
    .signers([kycProvider])
    .rpc();

  // 2. Emitir novo claim
  await issueKYCClaim(topic, additionalDays);

  console.log(`Claim ${topic} renewed for ${additionalDays} days`);
}
```

## Fluxo Completo - Diagrama

```
┌─────────────┐
│  INVESTOR   │
└──────┬──────┘
       │ 1. Register Identity
       ▼
┌─────────────────────┐
│ identity_claims     │
│ - Create identity   │
│ - Ready for claims  │
└─────────────────────┘
       │
       │ 2. Submit KYC Documents (off-chain)
       ▼
┌──────────────────┐
│  KYC PROVIDER    │
│ - Validate docs  │
│ - Check AML      │
│ - Verify identity│
└────────┬─────────┘
         │ 3. Issue Claims (on-chain)
         ▼
┌─────────────────────┐
│ identity_claims     │
│ - add_claim(KYC)    │
│ - add_claim(AML)    │
│ - add_claim(...)    │
└─────────────────────┘
         │
         │ 4. Investor attempts to invest
         ▼
┌──────────────────────┐
│ offering_pool        │
│ - Check issuer_kyc   │
│ - Verify claims      │
│ - Allow/Deny invest  │
└──────────────────────┘
```

## Resumo dos Steps

| Step | Quem | O Que | Onde |
|------|------|-------|------|
| 1 | Investor | Registra identidade | `identity_claims::register_identity` |
| 2 | Investor | Submete KYC | Off-chain (website do provider) |
| 3 | Provider | Valida documentos | Off-chain (backend do provider) |
| 4 | Provider | Emite claims | `identity_claims::add_claim` |
| 5 | Investor | Verifica claims | Query `identity_claims` accounts |
| 6 | Sistema | Valida antes de investir | `offering_pool::invest` (com verificação) |

---

Agora o fluxo está completo! O investor:
1. ✅ Registra sua identidade
2. ✅ Submete KYC ao provider
3. ✅ Recebe claims on-chain
4. ✅ Pode investir (após validação automática)
