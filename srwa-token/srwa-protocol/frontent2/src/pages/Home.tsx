import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import './Home.css';

export function Home() {
  const { connected } = useWallet();

  return (
    <div className="home">
      <div className="hero">
        <h1>SRWA Protocol</h1>
        <p className="subtitle">Security Token Real World Assets on Solana</p>
        <p className="description">
          Create, manage, and invest in compliant security tokens with built-in
          KYC/AML, compliance modules, and yield generation strategies.
        </p>
      </div>

      {!connected && (
        <div className="cta">
          <p>Connect your wallet to get started</p>
        </div>
      )}

      {connected && (
        <div className="features">
          <Link to="/issuer" className="feature-card">
            <h2>For Issuers</h2>
            <p>Create SRWA tokens with compliance built-in</p>
            <ul>
              <li>Token wizard with customizable parameters</li>
              <li>Offering pool configuration</li>
              <li>Yield strategy integration (MarginFi/Solend)</li>
              <li>Real-time funding tracking</li>
            </ul>
          </Link>

          <Link to="/investor" className="feature-card">
            <h2>For Investors</h2>
            <p>Participate in compliant token offerings</p>
            <ul>
              <li>KYC/AML verification</li>
              <li>Subscribe to offerings</li>
              <li>Track lock-up periods and yield</li>
              <li>Claim tokens after settlement</li>
            </ul>
          </Link>

          <Link to="/admin" className="feature-card">
            <h2>For Administrators</h2>
            <p>Manage compliance and security</p>
            <ul>
              <li>Claims providers management</li>
              <li>Compliance modules (jurisdiction, lockup, etc.)</li>
              <li>Allowlist/blocklist control</li>
              <li>Oracle management</li>
              <li>Emergency pause/unpause</li>
            </ul>
          </Link>
        </div>
      )}

      <div className="info-section">
        <h2>Key Features</h2>
        <div className="info-grid">
          <div className="info-card">
            <h3>🔒 Compliance First</h3>
            <p>Built-in KYC/AML, transfer restrictions, and jurisdiction controls</p>
          </div>
          <div className="info-card">
            <h3>📈 Yield Generation</h3>
            <p>Integrate with MarginFi and Solend for automated yield during lock-up</p>
          </div>
          <div className="info-card">
            <h3>⚡ Solana Speed</h3>
            <p>Fast, low-cost transactions on the Solana blockchain</p>
          </div>
          <div className="info-card">
            <h3>🛡️ Security</h3>
            <p>Audited smart contracts with emergency controls</p>
          </div>
        </div>
      </div>
    </div>
  );
}
