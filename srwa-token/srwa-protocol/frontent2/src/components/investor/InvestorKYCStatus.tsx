import React, { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useProgramsSafe } from '../../contexts/ProgramContext';
import { getProvider } from '../../lib/anchor';
import { KYCProviderServiceImpl } from '../../lib/kycProvider';

interface InvestorKYCStatusProps {
  mintAddress: string;
  className?: string;
}

interface Claim {
  topic: number;
  issuer: PublicKey;
  issuedAt: number;
  validUntil: number;
  revoked: boolean;
}

const TOPIC_NAMES: { [key: number]: string } = {
  1: 'KYC (Know Your Customer)',
  2: 'AML (Anti-Money Laundering)',
  3: 'ACCREDITED (Accredited Investor)',
  4: 'RESIDENCY (Residency Verification)',
  5: 'PEP (Politically Exposed Person)',
  6: 'SANCTIONS_CLEAR (Sanctions Screening)',
  7: 'KYB (Know Your Business)',
};

export const InvestorKYCStatus: React.FC<InvestorKYCStatusProps> = ({
  mintAddress,
  className,
}) => {
  const wallet = useAnchorWallet();
  const { programs, hasPrograms } = useProgramsSafe();
  const [kycService, setKycService] = useState<KYCProviderServiceImpl | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [kycConfig, setKycConfig] = useState<any>(null);
  const [canInvest, setCanInvest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [needsRegistration, setNeedsRegistration] = useState(false);

  useEffect(() => {
    if (wallet && hasPrograms && programs.srwaFactory) {
      const provider = getProvider(wallet);
      const service = new KYCProviderServiceImpl(programs.srwaFactory, provider);
      setKycService(service);
      loadKYCStatus(service);
    }
  }, [wallet, hasPrograms, programs, mintAddress]);

  const loadKYCStatus = async (service: KYCProviderServiceImpl) => {
    setLoading(true);

    try {
      const mint = new PublicKey(mintAddress);

      // 1. Buscar configuração de KYC do token
      const config = await service.getIssuerKYCConfig(mint);
      setKycConfig(config);

      if (!config || !config.requireKyc) {
        setCanInvest(true);
        setLoading(false);
        return;
      }

      // 2. Buscar claims do investor
      const investorClaims = await fetchInvestorClaims();
      setClaims(investorClaims);

      // 3. Verificar se pode investir
      const hasAllRequiredClaims = config.requiredClaimTopics.every((topic: number) =>
        investorClaims.some(
          (claim) =>
            claim.topic === topic &&
            !claim.revoked &&
            claim.validUntil > Date.now() / 1000 &&
            config.approvedProviders.some(
              (approvedProvider: PublicKey) =>
                approvedProvider.toString() === claim.issuer.toString()
            )
        )
      );

      setCanInvest(hasAllRequiredClaims);
    } catch (error: any) {
      console.error('Error loading KYC status:', error);
      if (error.message?.includes('Account does not exist')) {
        setNeedsRegistration(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestorClaims = async (): Promise<Claim[]> => {
    // TODO: Implementar busca de claims do identity_claims program
    // Por enquanto, retorna array vazio
    // Na implementação real, você faria:
    /*
    const identityClaimsProgramId = new PublicKey("Hr4S5caMKqLZFPRuJXu4rCktC9UfR3VxEDkU9JiQiCzv");
    const identityClaimsProgram = new Program(idl, identityClaimsProgramId, provider);

    const claims = await identityClaimsProgram.account.claimAccount.all([
      {
        memcmp: {
          offset: 8,
          bytes: provider.wallet.publicKey.toBase58(),
        },
      },
    ]);

    return claims.map(c => c.account);
    */

    return [];
  };

  const handleRegisterIdentity = async () => {
    // TODO: Implementar registro de identidade
    console.log('Registering identity...');
    alert('Identity registration - To be implemented');
  };

  const getClaimStatus = (topic: number): 'complete' | 'expired' | 'missing' => {
    const claim = claims.find((c) => c.topic === topic);

    if (!claim) return 'missing';
    if (claim.revoked || claim.validUntil <= Date.now() / 1000) return 'expired';
    return 'complete';
  };

  if (loading) {
    return (
      <div className={`investor-kyc-status ${className || ''}`}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3">Loading KYC status...</span>
        </div>
      </div>
    );
  }

  if (needsRegistration) {
    return (
      <div className={`investor-kyc-status ${className || ''}`}>
        <div className="bg-yellow-50 border border-yellow-200 rounded p-6">
          <h3 className="text-lg font-semibold mb-3">Identity Not Registered</h3>
          <p className="mb-4">
            You need to register your identity before you can complete KYC verification.
          </p>
          <button
            onClick={handleRegisterIdentity}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Register Identity
          </button>
        </div>
      </div>
    );
  }

  if (!kycConfig || !kycConfig.requireKyc) {
    return (
      <div className={`investor-kyc-status ${className || ''}`}>
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <span className="text-green-700 font-semibold">
              No KYC required for this token
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`investor-kyc-status ${className || ''}`}>
      <h3 className="text-2xl font-bold mb-4">Your KYC Status</h3>

      {/* Status Badge */}
      <div
        className={`p-4 rounded-lg mb-6 ${
          canInvest
            ? 'bg-green-100 border-2 border-green-400'
            : 'bg-yellow-100 border-2 border-yellow-400'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{canInvest ? '✅' : '⏳'}</span>
          <div>
            <div className="font-bold text-lg">
              {canInvest ? 'Approved to Invest' : 'KYC Verification Required'}
            </div>
            <div className="text-sm">
              {canInvest
                ? 'You have completed all required verifications'
                : 'Complete the required verifications below to invest'}
            </div>
          </div>
        </div>
      </div>

      {/* Required Claims */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 text-lg">Required Verifications:</h4>
        <div className="space-y-2">
          {kycConfig.requiredClaimTopics.map((topic: number) => {
            const status = getClaimStatus(topic);
            const claim = claims.find((c) => c.topic === topic);

            return (
              <div
                key={topic}
                className="flex items-center justify-between p-3 border rounded bg-white"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {status === 'complete' ? '✅' : status === 'expired' ? '⚠️' : '❌'}
                  </span>
                  <div>
                    <div className="font-medium">{TOPIC_NAMES[topic] || `Topic ${topic}`}</div>
                    {claim && (
                      <div className="text-sm text-gray-600">
                        {status === 'complete' && (
                          <span>
                            Expires: {new Date(claim.validUntil * 1000).toLocaleDateString()}
                          </span>
                        )}
                        {status === 'expired' && (
                          <span className="text-red-600">Expired - Please renew</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {status !== 'complete' && (
                  <span className="text-sm text-blue-600 font-medium">Required</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* KYC Providers */}
      {!canInvest && (
        <div className="mb-6">
          <h4 className="font-semibold mb-3 text-lg">Complete Your KYC:</h4>
          <p className="text-sm text-gray-600 mb-3">
            Choose an approved KYC provider to complete your verification:
          </p>
          <div className="space-y-2">
            {kycConfig.approvedProviders.map((provider: PublicKey, idx: number) => (
              <button
                key={idx}
                onClick={() => {
                  const url = `https://kyc-provider.com?wallet=${provider.wallet.publicKey}&return=${window.location.href}`;
                  window.open(url, '_blank');
                }}
                className="w-full p-4 border-2 border-blue-400 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-blue-900">KYC Provider {idx + 1}</div>
                    <div className="text-sm text-gray-600 font-mono">
                      {provider.toString().slice(0, 20)}...
                    </div>
                  </div>
                  <div className="text-blue-600 font-semibold">Start KYC →</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Claims */}
      {claims.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3 text-lg">
            Your Current Claims ({claims.length}):
          </h4>
          <div className="space-y-2">
            {claims.map((claim, idx) => (
              <div key={idx} className="p-3 border rounded bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{TOPIC_NAMES[claim.topic] || `Topic ${claim.topic}`}</span>
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      claim.revoked || claim.validUntil <= Date.now() / 1000
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {claim.revoked
                      ? 'Revoked'
                      : claim.validUntil <= Date.now() / 1000
                      ? 'Expired'
                      : 'Active'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Issued: {new Date(claim.issuedAt * 1000).toLocaleDateString()}</div>
                  <div>Expires: {new Date(claim.validUntil * 1000).toLocaleDateString()}</div>
                  <div className="font-mono text-xs">Issuer: {claim.issuer.toString().slice(0, 20)}...</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
