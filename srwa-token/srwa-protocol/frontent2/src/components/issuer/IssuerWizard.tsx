import { useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useIssuer } from '../../hooks/useIssuer';
import type { SRWAConfigInput, OfferingConfigInput, YieldStrategyInput, KYCConfigInput } from '../../hooks/useIssuer';
import type { RequestStatus } from '../../hooks/useIssuanceRequests';
import './IssuerWizard.css';

type Step = 'token' | 'offering' | 'yield' | 'kyc' | 'complete';

type YieldProtocol = 'marginfi' | 'solend';

function mapStatus(status: any): RequestStatus {
  if (!status) return 'pending';
  if (status.deployed !== undefined) return 'deployed';
  if (status.rejected !== undefined) return 'rejected';
  return 'pending';
}

function mapProtocol(protocol: any): YieldProtocol {
  if (!protocol) return 'marginfi';
  if (protocol.solend !== undefined) return 'solend';
  return 'marginfi';
}

export function IssuerWizard() {
  const { connected, publicKey } = useWallet();
  const issuer = useIssuer();

  const [currentStep, setCurrentStep] = useState<Step>('token');
  const [error, setError] = useState<string | null>(null);
  const [lastSubmission, setLastSubmission] = useState<{ name: string; symbol: string; status: RequestStatus } | null>(null);

  const [tokenConfig, setTokenConfig] = useState<SRWAConfigInput>({
    name: '',
    symbol: '',
    uri: '',
    decimals: 6,
  });

  const [offeringConfig, setOfferingConfig] = useState<OfferingConfigInput>({
    minInvestment: 100,
    maxInvestment: 100000,
    targetAmount: 1000000,
    lockPeriodDays: 30,
  });

  const [yieldStrategy, setYieldStrategy] = useState<YieldStrategyInput>({
    protocol: 'marginfi',
    targetApy: 5,
  });

  const [kycConfig, setKycConfig] = useState<KYCConfigInput>({
    requireKyc: true,
    approvedProviders: [],
    requiredTopics: [1, 2, 6], // KYC, AML, SANCTIONS_CLEAR por padrão
  });

  const issuerRequests = useMemo(() => {
    if (!publicKey) return [];
    return issuer.requests.filter((req) => req.account.issuer?.equals?.(publicKey));
  }, [issuer.requests, publicKey]);

  if (!connected) {
    return (
      <div className="issuer-wizard">
        <h1>Create SRWA Token</h1>
        <div className="error">
          <p>Connect your wallet to submit a token for approval.</p>
        </div>
      </div>
    );
  }

  const ensureTokenStep = () => {
    if (!tokenConfig.name || !tokenConfig.symbol || !tokenConfig.uri) {
      throw new Error('Fill in name, symbol and metadata URI.');
    }
  };

  const handleTokenNext = () => {
    try {
      setError(null);
      ensureTokenStep();
      setCurrentStep('offering');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleOfferingNext = () => {
    try {
      setError(null);
      ensureTokenStep();
      setCurrentStep('yield');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleYieldNext = () => {
    try {
      setError(null);
      ensureTokenStep();
      setCurrentStep('kyc');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      const result = await issuer.submitRequest(tokenConfig, offeringConfig, yieldStrategy, kycConfig);
      setLastSubmission({ name: tokenConfig.name, symbol: tokenConfig.symbol, status: 'pending' });
      setCurrentStep('complete');
      return result;
    } catch (err: any) {
      setError(err.message);
    }
  };

  const renderStep = () => {
    if (currentStep === 'token') {
      return (
        <div className="step-content">
          <h2>Token Configuration</h2>
          <div className="form-group">
            <label>Token Name</label>
            <span className="helper-text">Display name for investors</span>
            <input
              type="text"
              value={tokenConfig.name}
              onChange={(e) => setTokenConfig({ ...tokenConfig, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Symbol</label>
            <span className="helper-text">Ticker (max 12 chars)</span>
            <input
              type="text"
              value={tokenConfig.symbol}
              onChange={(e) => setTokenConfig({ ...tokenConfig, symbol: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Metadata URI</label>
            <span className="helper-text">HTTPS/Arweave/IPFS URL hosting token metadata JSON</span>
            <input
              type="text"
              value={tokenConfig.uri}
              onChange={(e) => setTokenConfig({ ...tokenConfig, uri: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Decimals</label>
            <input
              type="number"
              value={tokenConfig.decimals}
              onChange={(e) => setTokenConfig({ ...tokenConfig, decimals: parseInt(e.target.value) || 0 })}
            />
          </div>
          <button onClick={handleTokenNext}>Próximo: Oferta</button>
        </div>
      );
    }

    if (currentStep === 'offering') {
      return (
        <div className="step-content">
          <h2>Offering Configuration</h2>
          <div className="form-columns">
            <div className="form-group">
              <label>Min Ticket (USDC)</label>
              <span className="helper-text">Investimento mínimo por investidor</span>
              <input
                type="number"
                value={offeringConfig.minInvestment}
                onChange={(e) => setOfferingConfig({ ...offeringConfig, minInvestment: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label>Max Ticket (USDC)</label>
              <span className="helper-text">Investimento máximo por investidor</span>
              <input
                type="number"
                value={offeringConfig.maxInvestment}
                onChange={(e) => setOfferingConfig({ ...offeringConfig, maxInvestment: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="form-columns">
            <div className="form-group">
              <label>Capital Target (USDC)</label>
              <input
                type="number"
                value={offeringConfig.targetAmount}
                onChange={(e) => setOfferingConfig({ ...offeringConfig, targetAmount: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label>Lockup (dias)</label>
              <input
                type="number"
                value={offeringConfig.lockPeriodDays}
                onChange={(e) => setOfferingConfig({ ...offeringConfig, lockPeriodDays: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <button onClick={handleOfferingNext}>Próximo: Yield</button>
        </div>
      );
    }

    if (currentStep === 'yield') {
      return (
        <div className="step-content">
          <h2>Yield Strategy</h2>
          <div className="form-group">
            <label>Yield Protocol</label>
            <span className="helper-text">Caixa provisório até liquidação</span>
            <select
              value={yieldStrategy.protocol}
              onChange={(e) => setYieldStrategy({ ...yieldStrategy, protocol: e.target.value as YieldProtocol })}
            >
              <option value="marginfi">MarginFi (Soroswap)</option>
              <option value="solend">Solend (Lending)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Meta de APY (%)</label>
            <input
              type="number"
              step="0.1"
              value={yieldStrategy.targetApy}
              onChange={(e) => setYieldStrategy({ ...yieldStrategy, targetApy: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <button onClick={handleYieldNext}>Próximo: KYC</button>
        </div>
      );
    }

    if (currentStep === 'kyc') {
      const TOPIC_NAMES: { [key: number]: string } = {
        1: 'KYC',
        2: 'AML',
        3: 'ACCREDITED',
        4: 'RESIDENCY',
        5: 'PEP',
        6: 'SANCTIONS_CLEAR',
        7: 'KYB',
      };

      const toggleTopic = (topic: number) => {
        setKycConfig({
          ...kycConfig,
          requiredTopics: kycConfig.requiredTopics.includes(topic)
            ? kycConfig.requiredTopics.filter(t => t !== topic)
            : [...kycConfig.requiredTopics, topic],
        });
      };

      return (
        <div className="step-content">
          <h2>KYC Configuration</h2>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={kycConfig.requireKyc}
                onChange={(e) => setKycConfig({ ...kycConfig, requireKyc: e.target.checked })}
              />
              <span>Require KYC for investors</span>
            </label>
          </div>

          {kycConfig.requireKyc && (
            <>
              <div className="form-group">
                <label>Required Claim Topics</label>
                <span className="helper-text">Select which verifications investors must have</span>
                <div className="kyc-topics-grid">
                  {Object.entries(TOPIC_NAMES).map(([topic, name]) => (
                    <label key={topic} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={kycConfig.requiredTopics.includes(Number(topic))}
                        onChange={() => toggleTopic(Number(topic))}
                      />
                      <span>{name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Approved KYC Providers</label>
                <span className="helper-text">Add public keys of approved KYC providers (one per line)</span>
                <textarea
                  rows={4}
                  value={kycConfig.approvedProviders.join('\n')}
                  onChange={(e) => setKycConfig({
                    ...kycConfig,
                    approvedProviders: e.target.value.split('\n').filter(p => p.trim()),
                  })}
                  placeholder="Enter KYC provider public keys (one per line)"
                />
                <small className="note">Note: You can configure this later via the KYC Provider Selector</small>
              </div>
            </>
          )}

          <button onClick={handleSubmit}>Enviar para aprovação</button>
        </div>
      );
    }

    return (
      <div className="step-content">
        <h2>✓ Solicitação enviada!</h2>
        <p>O admin analisará suas regras de KYC/Oferta antes de implantar o token.</p>
        {lastSubmission && (
          <div className="results results-complete">
            <p><strong>Token:</strong> {lastSubmission.name} ({lastSubmission.symbol})</p>
            <p><strong>Status:</strong> {lastSubmission.status}</p>
          </div>
        )}
        <button onClick={() => {
          setTokenConfig({ name: '', symbol: '', uri: '', decimals: 6 });
          setOfferingConfig({ minInvestment: 100, maxInvestment: 100000, targetAmount: 1000000, lockPeriodDays: 30 });
          setYieldStrategy({ protocol: 'marginfi', targetApy: 5 });
          setKycConfig({ requireKyc: true, approvedProviders: [], requiredTopics: [1, 2, 6] });
          setCurrentStep('token');
        }}>Criar nova solicitação</button>
      </div>
    );
  };

  return (
    <div className="issuer-wizard">
      <h1>Create SRWA Token</h1>

      <div className="wizard-steps">
        <div className={`step ${currentStep === 'token' ? 'active' : ''}`}>1. Token</div>
        <div className={`step ${currentStep === 'offering' ? 'active' : ''}`}>2. Offering</div>
        <div className={`step ${currentStep === 'yield' ? 'active' : ''}`}>3. Yield</div>
        <div className={`step ${currentStep === 'kyc' ? 'active' : ''}`}>4. KYC</div>
        <div className={`step ${currentStep === 'complete' ? 'active' : ''}`}>5. Complete</div>
      </div>

      {error && <div className="error">{error}</div>}

      {renderStep()}

      <section className="issuer-requests">
        <h2>Minhas solicitações</h2>
        <button className="refresh-button" onClick={() => issuer.refresh()}>Atualizar status</button>
        {issuerRequests.length === 0 && <p className="placeholder">Nenhuma solicitação enviada.</p>}
        <div className="requests-grid">
          {issuerRequests.map((request) => {
            const status = mapStatus(request.account.status);
            const yieldProtocol = mapProtocol(request.account.yieldConfig?.protocol);
            const targetApy = Number(request.account.yieldConfig?.targetApyBps ?? 0) / 100;
            return (
              <div key={request.publicKey.toBase58()} className={`request-card status-${status}`}>
                <header>
                  <span className="badge">{status.toUpperCase()}</span>
                  <small>
                    {(() => {
                      const createdAt = request.account.createdAt;
                      const unix = typeof createdAt?.toNumber === 'function'
                        ? createdAt.toNumber()
                        : 0;
                      return new Date(unix * 1000).toLocaleString();
                    })()}
                  </small>
                </header>
                <h3>{request.account.name} ({request.account.symbol})</h3>
                <p className="request-field"><strong>Mint:</strong> {request.account.mint.toBase58()}</p>
                <p className="request-field"><strong>Yield:</strong> {yieldProtocol} ({targetApy}% APY)</p>
                <p className="request-field"><strong>Target:</strong> {request.account.offering?.target?.hardCap?.toString?.() ?? 'N/A'} USDC</p>
                {status === 'rejected' && request.account.rejectReason && (
                  <p className="request-note error">Rejeitado: {request.account.rejectReason}</p>
                )}
                {status === 'deployed' && (
                  <div className="deployment-info">
                    <p><strong>Config PDA:</strong> {request.account.srwaConfig?.toBase58?.() ?? '—'}</p>
                    <p><strong>Offering PDA:</strong> {request.account.offeringState?.toBase58?.() ?? '—'}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
