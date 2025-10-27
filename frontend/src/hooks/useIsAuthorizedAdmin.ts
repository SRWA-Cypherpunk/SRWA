import { useMemo } from 'react';
import { useWallet } from '@/contexts/wallet/WalletContext';
import { useAdminRegistry } from './solana/useAdminRegistry';

/**
 * Hook to check if the connected wallet is an authorized admin
 * Verifies on-chain against the admin registry
 */
export const useIsAuthorizedAdmin = (): boolean => {
  const { publicKey } = useWallet();
  const { data: adminRegistry } = useAdminRegistry();

  return useMemo(() => {
    if (!publicKey || !adminRegistry?.authorizedAdmins) {
      return false;
    }

    // Check if current wallet is in the authorized admins list
    return adminRegistry.authorizedAdmins.some(
      (admin) => admin.toBase58() === publicKey.toBase58()
    );
  }, [publicKey, adminRegistry]);
};
