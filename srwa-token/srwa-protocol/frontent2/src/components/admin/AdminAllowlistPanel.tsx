import React, { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useProgramsSafe } from '../../contexts/ProgramContext';
import { getProvider } from '../../lib/anchor';
import { AdminAllowlistServiceImpl } from '../../lib/adminAllowlist';
import './AdminAllowlistPanel.css';

interface AdminAllowlistPanelProps {
  className?: string;
}

export const AdminAllowlistPanel: React.FC<AdminAllowlistPanelProps> = ({ className }) => {
  const wallet = useAnchorWallet();
  const { programs, hasPrograms } = useProgramsSafe();
  const [adminService, setAdminService] = useState<AdminAllowlistServiceImpl | null>(null);
  const [adminRegistry, setAdminRegistry] = useState<any>(null);
  const [newAdminAddress, setNewAdminAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (wallet && hasPrograms && programs.srwaFactory) {
      const provider = getProvider(wallet);
      const service = new AdminAllowlistServiceImpl(programs.srwaFactory, provider);
      setAdminService(service);
      loadAdminRegistry(service);
    }
  }, [wallet, hasPrograms, programs]);

  const loadAdminRegistry = async (service: AdminAllowlistServiceImpl) => {
    try {
      const registry = await service.getAdminRegistry();
      setAdminRegistry(registry);
    } catch (error) {
      console.error('Error loading admin registry:', error);
    }
  };

  const handleInitializeRegistry = async () => {
    if (!adminService) return;

    setLoading(true);
    setMessage(null);

    try {
      const tx = await adminService.initializeAdminRegistry();
      setMessage({ type: 'success', text: `Registry initialized! TX: ${tx}` });
      await loadAdminRegistry(adminService);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to initialize registry' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!adminService || !newAdminAddress) return;

    setLoading(true);
    setMessage(null);

    try {
      const adminPubkey = new PublicKey(newAdminAddress);
      const tx = await adminService.addPlatformAdmin(adminPubkey);
      setMessage({ type: 'success', text: `Admin added! TX: ${tx}` });
      setNewAdminAddress('');
      await loadAdminRegistry(adminService);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to add admin' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminAddress: string) => {
    if (!adminService) return;

    setLoading(true);
    setMessage(null);

    try {
      const adminPubkey = new PublicKey(adminAddress);
      const tx = await adminService.removePlatformAdmin(adminPubkey);
      setMessage({ type: 'success', text: `Admin removed! TX: ${tx}` });
      await loadAdminRegistry(adminService);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to remove admin' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`admin-allowlist-panel ${className || ''}`}>
      <h2 className="text-2xl font-bold mb-6">Platform Admin Allowlist</h2>

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

      {!adminRegistry ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
          <p className="mb-4">Admin registry not initialized yet.</p>
          <button
            onClick={handleInitializeRegistry}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Initializing...' : 'Initialize Admin Registry'}
          </button>
        </div>
      ) : (
        <>
          <div className="bg-gray-50 rounded p-4 mb-6">
            <h3 className="font-semibold mb-2">Super Admin:</h3>
            <p className="font-mono text-sm">{adminRegistry.superAdmin.toString()}</p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-3">Add New Admin:</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAdminAddress}
                onChange={(e) => setNewAdminAddress(e.target.value)}
                placeholder="Enter admin public key"
                className="flex-1 border rounded px-3 py-2"
              />
              <button
                onClick={handleAddAdmin}
                disabled={loading || !newAdminAddress}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Admin'}
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">
              Authorized Admins ({adminRegistry.authorizedAdmins.length}):
            </h3>
            <div className="space-y-2">
              {adminRegistry.authorizedAdmins.map((admin: PublicKey, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white border rounded p-3"
                >
                  <span className="font-mono text-sm">{admin.toString()}</span>
                  {admin.toString() !== adminRegistry.superAdmin.toString() && (
                    <button
                      onClick={() => handleRemoveAdmin(admin.toString())}
                      disabled={loading}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
