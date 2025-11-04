import { useEffect, useState, useCallback } from 'react';
import { PublicKey, SystemProgram, Keypair } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { BN, Program } from '@coral-xyz/anchor';
import { useProgramsSafe } from '@/contexts';
import { toast } from 'sonner';

const DISTRIBUTION_CONFIG_SEED = 'distribution_config';

export interface DistributionConfig {
  publicKey: PublicKey;
  account: {
    bump: number;
    authority: PublicKey;
    mint: PublicKey;
    poolVault: PublicKey;
    issuer: PublicKey;
    threshold: BN;
    lastDistribution: BN;
    totalDistributed: BN;
    distributionCount: BN;
  };
}

export function usePoolDistribution() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { programs } = useProgramsSafe();
  const [configs, setConfigs] = useState<DistributionConfig[]>([]);
  const [loading, setLoading] = useState(false);

  const program = programs.poolDistribution;

  // Fetch all distribution configs
  const fetchConfigs = useCallback(async () => {
    if (!program) {
      setConfigs([]);
      return;
    }

    try {
      setLoading(true);
      const allConfigs = await program.account.distributionConfig.all();
      setConfigs(allConfigs as any);
    } catch (err: any) {
      console.error('[usePoolDistribution] Error fetching configs:', err);
    } finally {
      setLoading(false);
    }
  }, [program]);

  // Fetch single config by mint
  const getConfigByMint = useCallback(
    async (mint: PublicKey): Promise<DistributionConfig | null> => {
      if (!program) return null;

      try {
        const [configPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from(DISTRIBUTION_CONFIG_SEED), mint.toBuffer()],
          program.programId
        );

        const account = await program.account.distributionConfig.fetch(configPDA);
        return {
          publicKey: configPDA,
          account: account as any,
        };
      } catch (err) {
        console.error('[usePoolDistribution] Config not found for mint:', mint.toBase58());
        return null;
      }
    },
    [program]
  );

  // Get pool vault balance
  const getPoolVaultBalance = useCallback(
    async (poolVault: PublicKey): Promise<number> => {
      try {
        return await connection.getBalance(poolVault);
      } catch (err) {
        console.error('[usePoolDistribution] Error getting pool balance:', err);
        return 0;
      }
    },
    [connection]
  );

  // Initialize distribution config
  const initialize = useCallback(
    async (params: {
      mint: PublicKey;
      threshold: number; // in lamports
      issuer: PublicKey;
    }) => {
      if (!publicKey || !program) {
        throw new Error('Wallet not connected or program not loaded');
      }

      const { mint, threshold, issuer } = params;

      // Create a PDA for pool vault to ensure uniqueness and security
      const [poolVault] = PublicKey.findProgramAddressSync(
        [Buffer.from('pool_vault'), mint.toBuffer()],
        program.programId
      );

      const [configPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(DISTRIBUTION_CONFIG_SEED), mint.toBuffer()],
        program.programId
      );

      console.log('[usePoolDistribution] Initializing config:', {
        mint: mint.toBase58(),
        poolVault: poolVault.toBase58(),
        threshold,
        issuer: issuer.toBase58(),
        configPDA: configPDA.toBase58(),
      });

      const tx = await program.methods
        .initialize(new BN(threshold), issuer)
        .accounts({
          authority: publicKey,
          mint,
          poolVault,
          distributionConfig: configPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('[usePoolDistribution] Config initialized:', tx);
      await fetchConfigs();
      return tx;
    },
    [publicKey, program, fetchConfigs]
  );

  // Distribute to issuer (permissionless)
  const distributeToIssuer = useCallback(
    async (params: {
      mint: PublicKey;
      poolVault: Keypair; // Must be signer
    }) => {
      if (!publicKey || !program) {
        throw new Error('Wallet not connected or program not loaded');
      }

      const { mint, poolVault } = params;

      const config = await getConfigByMint(mint);
      if (!config) {
        throw new Error('Distribution config not found for this mint');
      }

      // Check pool balance
      const poolBalance = await getPoolVaultBalance(poolVault.publicKey);
      const threshold = config.account.threshold.toNumber();

      if (poolBalance < threshold) {
        throw new Error(
          `Pool balance (${poolBalance / 1e9} SOL) is below threshold (${threshold / 1e9} SOL)`
        );
      }

      console.log('[usePoolDistribution] Distributing:', {
        poolBalance: `${poolBalance / 1e9} SOL`,
        threshold: `${threshold / 1e9} SOL`,
        issuer: config.account.issuer.toBase58(),
      });

      const tx = await program.methods
        .distributeToIssuer()
        .accounts({
          caller: publicKey,
          distributionConfig: config.publicKey,
          poolVault: poolVault.publicKey,
          issuer: config.account.issuer,
          systemProgram: SystemProgram.programId,
        })
        .signers([poolVault])
        .rpc();

      console.log('[usePoolDistribution] Distribution completed:', tx);
      await fetchConfigs();
      return tx;
    },
    [publicKey, program, getConfigByMint, getPoolVaultBalance, fetchConfigs]
  );

  // Update threshold
  const updateThreshold = useCallback(
    async (params: { mint: PublicKey; newThreshold: number }) => {
      if (!publicKey || !program) {
        throw new Error('Wallet not connected or program not loaded');
      }

      const { mint, newThreshold } = params;

      const config = await getConfigByMint(mint);
      if (!config) {
        throw new Error('Distribution config not found');
      }

      const tx = await program.methods
        .updateThreshold(new BN(newThreshold))
        .accounts({
          authority: publicKey,
          distributionConfig: config.publicKey,
        })
        .rpc();

      console.log('[usePoolDistribution] Threshold updated:', tx);
      await fetchConfigs();
      return tx;
    },
    [publicKey, program, getConfigByMint, fetchConfigs]
  );

  // Update issuer
  const updateIssuer = useCallback(
    async (params: { mint: PublicKey; newIssuer: PublicKey }) => {
      if (!publicKey || !program) {
        throw new Error('Wallet not connected or program not loaded');
      }

      const { mint, newIssuer } = params;

      const config = await getConfigByMint(mint);
      if (!config) {
        throw new Error('Distribution config not found');
      }

      const tx = await program.methods
        .updateIssuer(newIssuer)
        .accounts({
          authority: publicKey,
          distributionConfig: config.publicKey,
        })
        .rpc();

      console.log('[usePoolDistribution] Issuer updated:', tx);
      await fetchConfigs();
      return tx;
    },
    [publicKey, program, getConfigByMint, fetchConfigs]
  );

  // Auto-fetch on mount
  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  return {
    configs,
    loading,
    initialize,
    distributeToIssuer,
    updateThreshold,
    updateIssuer,
    getConfigByMint,
    getPoolVaultBalance,
    fetchConfigs,
  };
}
