import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { useInvestor } from '../../hooks/useInvestor';
import { useProgramsSafe } from '../../contexts/ProgramContext';
import './InvestorDashboard.css';

export function InvestorDashboard() {
  const { publicKey } = useWallet();
  const { programs, loading: programsLoading, hasPrograms } = useProgramsSafe();
  const { registerIdentity, isVerified, subscribe, getSubscription, claimTokens } = useInvestor();

  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kycStep, setKycStep] = useState<'check' | 'register' | 'verify' | 'complete'>('check');

  // Subscription state
  const [poolAddress, setPoolAddress] = useState('');
  const [subscriptionAmount, setSubscriptionAmount] = useState('');
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    if (publicKey && hasPrograms && programs.identityClaims) {
      checkKycStatus();
    } else if (publicKey && !hasPrograms) {
      // Wallet connected but programs not loaded yet - wait
      setKycStep('check');
    } else if (!publicKey) {
      setKycStep('register');
      setVerified(false);
    }
  }, [publicKey, hasPrograms, programs.identityClaims]);

  const checkKycStatus = async () => {
    if (!publicKey) {
      setError('Wallet not connected');
      return;
    }

    try {
      setError(null);
      const status = await isVerified();
      setVerified(status);
      setKycStep(status ? 'complete' : 'register');
    } catch (err: any) {
      console.error('Error checking KYC status:', err);
      setKycStep('register');
      // Don't show error if it's just account not found
      if (!err.message?.includes('Account does not exist')) {
        setError(err.message);
      }
    }
  };

  const handleRegisterIdentity = async () => {
    try {
      setLoading(true);
      setError(null);
      await registerIdentity();
      setKycStep('verify');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      setError(null);

      const mint = new PublicKey(poolAddress);
      const amount = new BN(parseFloat(subscriptionAmount) * 10 ** 6);

      const result = await subscribe(mint, amount);
      alert(`Subscribed! Signature: ${result.signature}`);

      // Refresh subscription
      const sub = await getSubscription(mint);
      setSubscription(sub);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimTokens = async () => {
    if (!subscription) return;

    try {
      setLoading(true);
      setError(null);

      const mint = new PublicKey(poolAddress);

      const result = await claimTokens(mint);
      alert(`Tokens claimed! Signature: ${result.signature}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show wallet connection prompt if not connected
  if (!publicKey) {
    return (
      <div className="investor-dashboard">
        <h1>Investor Dashboard</h1>
        <div className="warning" style={{
          padding: '2rem',
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          textAlign: 'center',
          margin: '2rem 0'
        }}>
          <h2>🔌 Wallet Not Connected</h2>
          <p>Please connect your wallet to access the Investor Dashboard.</p>
        </div>
      </div>
    );
  }

  // Show loading state while programs are being loaded
  if (programsLoading || !hasPrograms) {
    return (
      <div className="investor-dashboard">
        <h1>Investor Dashboard</h1>
        <div style={{
          padding: '2rem',
          background: '#e3f2fd',
          border: '1px solid #2196f3',
          borderRadius: '8px',
          textAlign: 'center',
          margin: '2rem 0'
        }}>
          <h2>⏳ Loading Programs...</h2>
          <p>Please wait while we load the blockchain programs.</p>
        </div>
      </div>
    );
  }

  // Check if identity claims program is loaded
  if (!programs.identityClaims) {
    return (
      <div className="investor-dashboard">
        <h1>Investor Dashboard</h1>
        <div className="error" style={{
          padding: '2rem',
          background: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          textAlign: 'center',
          margin: '2rem 0',
          color: '#721c24'
        }}>
          <h2>❌ Identity Claims Program Not Available</h2>
          <p>The Identity Claims program is required but not loaded.</p>
          <p style={{ fontSize: '0.875rem', marginTop: '1rem' }}>
            Please ensure the program is deployed and try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="investor-dashboard">
      <h1>Investor Dashboard</h1>

      {error && <div className="error" style={{
        padding: '1rem',
        background: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '4px',
        color: '#721c24',
        marginBottom: '1rem'
      }}>{error}</div>}

      {/* KYC Section */}
      <div className="section">
        <h2>KYC Status</h2>
        {kycStep === 'check' && <p>Checking KYC status...</p>}

        {kycStep === 'register' && (
          <div>
            <p>You need to register your identity to participate in offerings.</p>
            <button onClick={handleRegisterIdentity} disabled={loading}>
              {loading ? 'Registering...' : 'Register Identity'}
            </button>
          </div>
        )}

        {kycStep === 'verify' && (
          <div>
            <p className="warning">
              Identity registered! You need to get verified by a trusted issuer to participate.
            </p>
            <p>Contact a KYC provider to add claims to your identity.</p>
          </div>
        )}

        {kycStep === 'complete' && (
          <div className="success">
            <p>✓ Your identity is verified! You can participate in offerings.</p>
          </div>
        )}
      </div>

      {/* Subscription Section */}
      {verified && (
        <div className="section">
          <h2>Subscribe to Offering</h2>
          <div className="form-group">
            <label>Token Mint Address</label>
            <input
              type="text"
              value={poolAddress}
              onChange={(e) => setPoolAddress(e.target.value)}
              placeholder="Token Mint PublicKey"
            />
          </div>
          <div className="form-group">
            <label>Amount (USDC)</label>
            <input
              type="number"
              value={subscriptionAmount}
              onChange={(e) => setSubscriptionAmount(e.target.value)}
              placeholder="1000"
            />
          </div>
          <button onClick={handleSubscribe} disabled={loading || !poolAddress || !subscriptionAmount}>
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>
      )}

      {/* Subscription Status */}
      {subscription && (
        <div className="section">
          <h2>Your Subscription</h2>
          <div className="subscription-info">
            <p><strong>Amount:</strong> {subscription.amount.toString()} USDC</p>
            <p><strong>Status:</strong> {subscription.claimed ? 'Claimed' : 'Pending'}</p>
            {!subscription.claimed && (
              <button onClick={handleClaimTokens} disabled={loading}>
                {loading ? 'Claiming...' : 'Claim Tokens'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Portfolio */}
      <div className="section">
        <h2>Your SRWA Holdings</h2>
        <p className="placeholder">Connect to view your holdings</p>
      </div>
    </div>
  );
}
