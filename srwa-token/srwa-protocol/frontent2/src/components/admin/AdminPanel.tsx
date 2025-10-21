import { useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useIssuanceRequests } from '../../hooks/useIssuanceRequests';
import type { RequestStatus } from '../../hooks/useIssuanceRequests';
import { AdminAllowlistPanel } from './AdminAllowlistPanel';
import './AdminPanel.css';

type Tab = 'pending' | 'deployed' | 'rejected' | 'allowlist';

function mapStatus(status: any): RequestStatus {
  if (!status) return 'pending';
  if (status.deployed !== undefined) return 'deployed';
  if (status.rejected !== undefined) return 'rejected';
  return 'pending';
}

function mapProtocol(protocol: any): string {
  if (!protocol) return 'marginfi';
  if (protocol.solend !== undefined) return 'solend';
  return 'marginfi';
}

export function AdminPanel() {
  const { publicKey } = useWallet();
  const issuance = useIssuanceRequests();
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const buckets: Record<RequestStatus, typeof issuance.requests> = {
      pending: [],
      rejected: [],
      deployed: [],
    };
    issuance.requests.forEach((req) => {
      const status = mapStatus(req.account.status);
      buckets[status] = [...buckets[status], req];
    });
    return buckets;
  }, [issuance.requests]);

  const handleApprove = async (request: any) => {
    try {
      setError(null);
      await issuance.approveSrwa(request);
      setSuccess('Solicitação aprovada e implantada.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReject = async (request: any) => {
    try {
      setError(null);
      const reason = prompt('Motivo da rejeição (opcional):') || '';
      await issuance.rejectSrwa(request, reason);
      setSuccess('Solicitação rejeitada.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!publicKey) {
    return (
      <div className="admin-panel">
        <h1>Admin Panel</h1>
        <div className="error">Conecte a carteira de admin para revisar solicitações.</div>
      </div>
    );
  }

  const renderCards = (requests: typeof issuance.requests, status: RequestStatus) => (
    <div className="requests-grid">
      {requests.map((request) => {
        const yieldProtocol = mapProtocol(request.account.yieldConfig?.protocol);
        const targetApy = Number(request.account.yieldConfig?.targetApyBps ?? 0) / 100;
        const config = request.account.config;
        const offering = request.account.offering;

        // KYC Topics mapping
        const topicNames: { [key: number]: string } = {
          1: 'KYC', 2: 'AML', 3: 'ACCREDITED',
          4: 'RESIDENCY', 5: 'PEP', 6: 'SANCTIONS_CLEAR', 7: 'KYB'
        };

        return (
          <div key={request.publicKey.toBase58()} className={`request-card status-${status}`}>
            <header>
              <strong>{request.account.name} ({request.account.symbol})</strong>
              <small>Issuer: {request.account.issuer?.toBase58?.()?.slice(0, 8)}...</small>
            </header>

            {/* Basic Info */}
            <div className="section">
              <h4>Token Info</h4>
              <p><strong>Mint:</strong> <span className="mono-small">{request.account.mint.toBase58().slice(0, 8)}...</span></p>
              <p><strong>Decimals:</strong> {request.account.decimals}</p>
              <p><strong>Created:</strong> {new Date(request.account.createdAt * 1000).toLocaleDateString()}</p>
            </div>

            {/* Config Info */}
            {config && (
              <div className="section">
                <h4>Configuration</h4>
                <p><strong>Admin:</strong> <span className="mono-small">{config.roles?.issuerAdmin?.toBase58?.()?.slice(0, 8)}...</span></p>
                <p><strong>Compliance Officer:</strong> <span className="mono-small">{config.roles?.complianceOfficer?.toBase58?.()?.slice(0, 8)}...</span></p>
                <p><strong>Default Frozen:</strong> {config.defaultFrozen ? 'Yes' : 'No'}</p>
                <p><strong>Metadata URI:</strong> {config.metadataUri ? '✓ Set' : '✗ Not set'}</p>
              </div>
            )}

            {/* KYC Requirements */}
            {config?.requiredTopics && config.requiredTopics.length > 0 && (
              <div className="section kyc-section">
                <h4>🔐 KYC Requirements</h4>
                <div className="kyc-topics">
                  {config.requiredTopics.map((topic: number) => (
                    <span key={topic} className="topic-badge">
                      {topicNames[topic] || `Topic ${topic}`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Offering Info */}
            {offering && (
              <div className="section">
                <h4>Offering Details</h4>
                <p><strong>Soft Cap:</strong> {offering.target?.softCap?.toString?.()} USDC</p>
                <p><strong>Hard Cap:</strong> {offering.target?.hardCap?.toString?.()} USDC</p>
                <p><strong>Min Ticket:</strong> {offering.rules?.minTicket?.toString?.()} USDC</p>
                <p><strong>Max Investors:</strong> {offering.rules?.maxInvestors?.toString?.()}</p>
                <p><strong>Unit Price:</strong> {offering.pricing?.unitPrice?.toString?.()} USDC</p>
                <p><strong>Start:</strong> {offering.window?.startTs ? new Date(offering.window.startTs * 1000).toLocaleDateString() : 'N/A'}</p>
                <p><strong>End:</strong> {offering.window?.endTs ? new Date(offering.window.endTs * 1000).toLocaleDateString() : 'N/A'}</p>
              </div>
            )}

            {/* Yield Config */}
            <div className="section">
              <h4>Yield Strategy</h4>
              <p><strong>Protocol:</strong> {yieldProtocol}</p>
              <p><strong>Target APY:</strong> {targetApy}%</p>
            </div>

            {status === 'pending' && (
              <div className="actions">
                <button className="approve" onClick={() => handleApprove(request)}>Approve</button>
                <button className="reject" onClick={() => handleReject(request)}>Reject</button>
              </div>
            )}

            {status === 'deployed' && request.account.srwaConfig && (
              <div className="deployment-info">
                <p><strong>✓ Deployed Successfully</strong></p>
                <p className="mono-small">Config: {request.account.srwaConfig.toBase58().slice(0, 16)}...</p>
                <p className="mono-small">Offering: {request.account.offeringState?.toBase58?.()?.slice(0, 16) ?? '—'}...</p>
              </div>
            )}

            {status === 'rejected' && request.account.rejectReason && (
              <p className="request-note error">Rejeitado: {request.account.rejectReason}</p>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>

      <div className="tabs">
        <button className={activeTab === 'pending' ? 'active' : ''} onClick={() => setActiveTab('pending')}>
          Pendentes ({grouped.pending.length})
        </button>
        <button className={activeTab === 'deployed' ? 'active' : ''} onClick={() => setActiveTab('deployed')}>
          Implantados ({grouped.deployed.length})
        </button>
        <button className={activeTab === 'rejected' ? 'active' : ''} onClick={() => setActiveTab('rejected')}>
          Rejeitados ({grouped.rejected.length})
        </button>
        <button className={activeTab === 'allowlist' ? 'active' : ''} onClick={() => setActiveTab('allowlist')}>
          Admin Allowlist
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="tab-content approvals">
        {activeTab === 'pending' && (
          <>
            {grouped.pending.length === 0 && <p className="placeholder">Nenhuma solicitação pendente.</p>}
            {renderCards(grouped.pending, 'pending')}
          </>
        )}
        {activeTab === 'deployed' && (
          <>
            {grouped.deployed.length === 0 && <p className="placeholder">Nenhum token implantado ainda.</p>}
            {renderCards(grouped.deployed, 'deployed')}
          </>
        )}
        {activeTab === 'rejected' && (
          <>
            {grouped.rejected.length === 0 && <p className="placeholder">Nenhuma solicitação rejeitada.</p>}
            {renderCards(grouped.rejected, 'rejected')}
          </>
        )}
        {activeTab === 'allowlist' && (
          <div className="allowlist-section">
            <AdminAllowlistPanel />
          </div>
        )}
      </div>
    </div>
  );
}
