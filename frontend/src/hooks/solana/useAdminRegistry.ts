import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useProgramsSafe } from '@/contexts';

const ADMIN_REGISTRY_SEED = 'admin_registry';

interface AdminRegistry {
  superAdmin: PublicKey;
  authorizedAdmins: PublicKey[];
  createdAt: number;
  updatedAt: number;
  bump: number;
}

export function useAdminRegistry() {
  const { programs } = useProgramsSafe();
  const [adminRegistry, setAdminRegistry] = useState<AdminRegistry | null>(null);
  const [adminRegistryPda, setAdminRegistryPda] = useState<PublicKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchAdminRegistry() {
      if (!programs.srwaFactory) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const program = programs.srwaFactory;

        // Derivar o PDA do admin registry
        const [adminRegistryPda] = PublicKey.findProgramAddressSync(
          [Buffer.from(ADMIN_REGISTRY_SEED)],
          program.programId
        );

        setAdminRegistryPda(adminRegistryPda);

        // Buscar os dados do admin registry
        const registryData = await program.account.platformAdminRegistry.fetch(adminRegistryPda);

        setAdminRegistry({
          superAdmin: registryData.superAdmin,
          authorizedAdmins: registryData.authorizedAdmins,
          createdAt: registryData.createdAt.toNumber(),
          updatedAt: registryData.updatedAt.toNumber(),
          bump: registryData.bump,
        });
      } catch (err) {
        console.error('Error fetching admin registry:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchAdminRegistry();
  }, [programs.srwaFactory]);

  const isAdmin = (wallet: PublicKey | null): boolean => {
    if (!wallet || !adminRegistry) return false;
    return adminRegistry.authorizedAdmins.some(admin => admin.equals(wallet));
  };

  const isSuperAdmin = (wallet: PublicKey | null): boolean => {
    if (!wallet || !adminRegistry) return false;
    return adminRegistry.superAdmin.equals(wallet);
  };

  return {
    adminRegistry,
    adminRegistryPda,
    loading,
    error,
    isAdmin,
    isSuperAdmin,
  };
}
