/**
 * Helper para configurar KYC após a aprovação do token pelo admin
 */

import { PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { KYCProviderServiceImpl } from "./kycProvider";

export interface PostApprovalKYCConfig {
  mint: PublicKey;
  requireKyc: boolean;
  approvedProviders: string[]; // Public key strings
  requiredTopics: number[];
}

/**
 * Configura KYC para um token aprovado
 *
 * IMPORTANTE: Esta função deve ser chamada APÓS o admin aprovar o token
 * via approve_srwa. A aprovação cria as contas necessárias (srwa_config, etc.)
 *
 * @param program - Programa srwa_factory
 * @param provider - Anchor provider
 * @param config - Configuração de KYC
 * @returns Transaction signature
 */
export async function configureKYCAfterApproval(
  program: Program,
  provider: AnchorProvider,
  config: PostApprovalKYCConfig
): Promise<string> {
  const kycService = new KYCProviderServiceImpl(program, provider);

  // Converter strings para PublicKeys
  const providerPubkeys = config.approvedProviders.map(
    (p) => new PublicKey(p)
  );

  // Configurar KYC
  const tx = await kycService.configureIssuerKYC(
    config.mint,
    providerPubkeys,
    config.requiredTopics,
    config.requireKyc
  );

  console.log("KYC configured for token:", config.mint.toString());
  console.log("Transaction:", tx);

  return tx;
}

/**
 * Exemplo de uso no wizard após aprovação:
 *
 * ```typescript
 * // 1. Issuer submete request
 * const { requestId, mint, kycConfig } = await issuer.submitRequest(
 *   tokenConfig,
 *   offeringConfig,
 *   yieldStrategy,
 *   kycConfig // Salvar isso localmente!
 * );
 *
 * // 2. Admin aprova (via approve_srwa)
 * await admin.approveSrwa(requestPDA);
 *
 * // 3. Issuer configura KYC (automaticamente ou manualmente)
 * if (kycConfig) {
 *   await configureKYCAfterApproval(program, provider, {
 *     mint,
 *     requireKyc: kycConfig.requireKyc,
 *     approvedProviders: kycConfig.approvedProviders,
 *     requiredTopics: kycConfig.requiredTopics,
 *   });
 * }
 * ```
 */

/**
 * Hook para detectar quando um token foi aprovado e configurar KYC automaticamente
 */
export function useAutoKYCConfig(
  program: Program | null,
  provider: AnchorProvider | null
) {
  // Ouvir eventos de TokenCreated
  // Quando detectar, verificar se há KYC config pendente no localStorage
  // Se sim, configurar automaticamente

  // TODO: Implementar listener de eventos
  // program?.addEventListener('TokenCreated', async (event) => { ... })
}
