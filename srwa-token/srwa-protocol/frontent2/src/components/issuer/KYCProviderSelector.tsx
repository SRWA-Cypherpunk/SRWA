import React, { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useProgramsSafe } from '../../contexts/ProgramContext';
import { getProvider } from '../../lib/anchor';
import { KYCProviderServiceImpl, KYCProviderInfo } from '../../lib/kycProvider';

interface KYCProviderSelectorProps {
  mintAddress: string;
  onConfigured?: () => void;
  className?: string;
}

// Common KYC claim topics based on identity_claims program
const CLAIM_TOPICS = {
  KYC: 1,
  AML: 2,
  ACCREDITED: 3,
  RESIDENCY: 4,
  PEP: 5,
  SANCTIONS_CLEAR: 6,
  KYB: 7,
};

export const KYCProviderSelector: React.FC<KYCProviderSelectorProps> = ({
  mintAddress,
  onConfigured,
  className,
}) => {
  const wallet = useAnchorWallet();
  const { programs, hasPrograms } = useProgramsSafe();
  const [kycService, setKycService] = useState<KYCProviderServiceImpl | null>(null);
  const [providers, setProviders] = useState<KYCProviderInfo[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<number[]>([CLAIM_TOPICS.KYC]);
  const [requireKyc, setRequireKyc] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentConfig, setCurrentConfig] = useState<any>(null);

  useEffect(() => {
    if (wallet && hasPrograms && programs.srwaFactory) {
      const provider = getProvider(wallet);
      const service = new KYCProviderServiceImpl(programs.srwaFactory, provider);
      setKycService(service);
      loadProviders(service);
      loadCurrentConfig(service);
    }
  }, [wallet, hasPrograms, programs, mintAddress]);

  const loadProviders = async (service: KYCProviderServiceImpl) => {
    try {
      const providersList = await service.getKYCProviders();
      setProviders(providersList.filter(p => p.active));
    } catch (error) {
      console.error('Error loading KYC providers:', error);
    }
  };

  const loadCurrentConfig = async (service: KYCProviderServiceImpl) => {
    try {
      const mint = new PublicKey(mintAddress);
      const config = await service.getIssuerKYCConfig(mint);
      if (config) {
        setCurrentConfig(config);
        setSelectedProviders(config.approvedProviders.map(p => p.toString()));
        setSelectedTopics(config.requiredClaimTopics);
        setRequireKyc(config.requireKyc);
      }
    } catch (error) {
      console.error('Error loading current config:', error);
    }
  };

  const handleToggleProvider = (providerAddress: string) => {
    setSelectedProviders(prev =>
      prev.includes(providerAddress)
        ? prev.filter(p => p !== providerAddress)
        : [...prev, providerAddress]
    );
  };

  const handleToggleTopic = (topic: number) => {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleSaveConfiguration = async () => {
    if (!kycService || selectedProviders.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one KYC provider' });
      return;
    }

    if (selectedTopics.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one claim topic' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const mint = new PublicKey(mintAddress);
      const providerPubkeys = selectedProviders.map(p => new PublicKey(p));

      const tx = await kycService.configureIssuerKYC(
        mint,
        providerPubkeys,
        selectedTopics,
        requireKyc
      );

      setMessage({ type: 'success', text: `KYC configuration saved! TX: ${tx}` });
      await loadCurrentConfig(kycService);
      onConfigured?.();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save configuration' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`kyc-provider-selector ${className || ''}`}>
      <h2 className="text-2xl font-bold mb-6">KYC Provider Configuration</h2>

      {message && (
        <div
          className={`p-4 mb-4 rounded ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mb-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={requireKyc}
            onChange={(e) => setRequireKyc(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="font-semibold">Require KYC for investors</span>
        </label>
      </div>

      {requireKyc && (
        <>
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Select Approved KYC Providers:</h3>
            {providers.length === 0 ? (
              <p className="text-gray-500">No KYC providers available</p>
            ) : (
              <div className="space-y-2">
                {providers.map((provider, index) => (
                  <label
                    key={index}
                    className="flex items-start gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProviders.includes(provider.providerPubkey.toString())}
                      onChange={() => handleToggleProvider(provider.providerPubkey.toString())}
                      className="mt-1 w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-sm text-gray-600 font-mono">
                        {provider.providerPubkey.toString()}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-3">Required Claim Topics:</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(CLAIM_TOPICS).map(([name, value]) => (
                <label
                  key={value}
                  className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes(value)}
                    onChange={() => handleToggleTopic(value)}
                    className="w-4 h-4"
                  />
                  <span>{name}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      <button
        onClick={handleSaveConfiguration}
        disabled={loading || (requireKyc && selectedProviders.length === 0)}
        className="w-full bg-blue-500 text-white px-4 py-3 rounded font-semibold hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Saving Configuration...' : 'Save KYC Configuration'}
      </button>

      {currentConfig && (
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h4 className="font-semibold mb-2">Current Configuration:</h4>
          <div className="text-sm space-y-1">
            <p>
              <strong>KYC Required:</strong> {currentConfig.requireKyc ? 'Yes' : 'No'}
            </p>
            <p>
              <strong>Approved Providers:</strong> {currentConfig.approvedProviders.length}
            </p>
            <p>
              <strong>Required Topics:</strong> {currentConfig.requiredClaimTopics.join(', ')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
