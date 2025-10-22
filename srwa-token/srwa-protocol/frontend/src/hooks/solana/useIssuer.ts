import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { Keypair } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { useIssuanceRequests } from './useIssuanceRequests';

export interface SRWAConfigInput {
  name: string;
  symbol: string;
  uri: string;
  decimals: number;
}

export interface OfferingConfigInput {
  minInvestment: number;
  maxInvestment: number;
  targetAmount: number;
  lockPeriodDays: number;
}

export interface YieldStrategyInput {
  protocol: 'marginfi' | 'solend';
  targetApy: number;
}

export interface KYCConfigInput {
  requireKyc: boolean;
  approvedProviders: string[]; // Public keys
  requiredTopics: number[];
}

export function useIssuer() {
  const wallet = useAnchorWallet();
  const issuance = useIssuanceRequests();

  const submitRequest = async (
    token: SRWAConfigInput,
    offering: OfferingConfigInput,
    yieldStrategy: YieldStrategyInput,
    kycConfig?: KYCConfigInput,
  ) => {
    if (!wallet?.publicKey) {
      throw new Error('Wallet not connected');
    }

    const requestId = Date.now();
    const mint = Keypair.generate().publicKey;

    const configInit = {
      roles: {
        issuerAdmin: wallet.publicKey,
        complianceOfficer: wallet.publicKey,
        transferAgent: wallet.publicKey,
      },
      requiredTopics: [1],
      metadataUri: token.uri,
      defaultFrozen: false,
      permanentDelegate: wallet.publicKey,
    } as any;

    const now = Math.floor(Date.now() / 1000);
    const offeringInit = {
      window: {
        startTs: new BN(now),
        endTs: new BN(now + offering.lockPeriodDays * 24 * 60 * 60),
      },
      target: {
        softCap: new BN(offering.targetAmount),
        hardCap: new BN(offering.targetAmount),
      },
      pricing: {
        model: { fixed: {} },
        unitPrice: new BN(100),
        currency: { usd: {} },
      },
      rules: {
        minTicket: new BN(offering.minInvestment),
        perInvestorCap: new BN(offering.maxInvestment),
        maxInvestors: 1000,
        eligibility: {
          jurisdictionsAllow: [],
          investorTypes: [{ accredited: {} }],
        },
      },
      oversubPolicy: { proRata: {} },
      feesBps: {
        originationBps: 100,
        platformBps: 50,
        successBps: 200,
      },
      issuerTreasury: wallet.publicKey,
      feeTreasury: wallet.publicKey,
    } as any;

    await issuance.requestSrwa({
      requestId,
      mint,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      config: configInit,
      offering: offeringInit,
      yieldConfig: yieldStrategy,
    });

    return { requestId, mint, kycConfig };
  };

  return {
    submitRequest,
    requests: issuance.requests,
    refresh: issuance.refresh,
    approveSrwa: issuance.approveSrwa,
    rejectSrwa: issuance.rejectSrwa,
  };
}
