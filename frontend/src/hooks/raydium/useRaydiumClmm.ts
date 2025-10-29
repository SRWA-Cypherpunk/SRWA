import { useCallback } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useWallet } from '@/contexts/wallet/WalletContext';
import { Raydium, TxVersion, DEVNET_PROGRAM_ID } from '@raydium-io/raydium-sdk-v2';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import Decimal from 'decimal.js';

export interface ClmmPoolResult {
  poolId: string;
  txId: string;
}

/**
 * Hook for Raydium CLMM (Concentrated Liquidity) pools
 *
 * CLMM has FULL Token-2022 support!
 * Unsupported extensions:
 * - Permanent Delegate
 * - Non-Transferable
 * - Default Account State
 * - Confidential Transfers
 * - Transfer Hook
 */
export function useRaydiumClmm() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const loadSdk = useCallback(async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    const raydium = await Raydium.load({
      connection,
      owner: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      cluster: 'devnet',
      disableFeatureCheck: true,
      disableLoadToken: false,
      blockhashCommitment: 'finalized',
    });

    return raydium;
  }, [connection, wallet]);

  /**
   * Create a CLMM pool with full Token-2022 support
   *
   * @param tokenMintA - First token mint address
   * @param tokenMintB - Second token mint address
   * @param initialPrice - Initial price (tokenB per tokenA)
   * @param feeTier - Fee tier: 100 (0.01%), 500 (0.05%), 2500 (0.25%), 10000 (1%)
   */
  const createClmmPool = useCallback(
    async (
      tokenMintA: PublicKey,
      tokenMintB: PublicKey,
      initialPrice: number,
      feeTier: 100 | 500 | 2500 | 10000 = 2500
    ): Promise<ClmmPoolResult> => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error('Wallet not connected');
      }

      console.log('Creating Raydium CLMM pool with:', {
        tokenA: tokenMintA.toBase58(),
        tokenB: tokenMintB.toBase58(),
        initialPrice,
        feeTier: `${feeTier / 100}%`,
      });

      // Detectar o programa de cada token e pegar decimais
      const [accountAInfo, accountBInfo] = await Promise.all([
        connection.getAccountInfo(tokenMintA),
        connection.getAccountInfo(tokenMintB),
      ]);

      if (!accountAInfo || !accountBInfo) {
        throw new Error('Token não encontrado');
      }

      const programIdA = accountAInfo.owner;
      const programIdB = accountBInfo.owner;

      // Importar getMint para obter decimais
      const { getMint } = await import('@solana/spl-token');
      const [mintAInfo, mintBInfo] = await Promise.all([
        getMint(connection, tokenMintA, 'confirmed', programIdA),
        getMint(connection, tokenMintB, 'confirmed', programIdB),
      ]);

      console.log('Token programs and decimals detected:', {
        tokenA: programIdA.toBase58(),
        tokenB: programIdB.toBase58(),
        decimalsA: mintAInfo.decimals,
        decimalsB: mintBInfo.decimals,
      });

      const raydium = await loadSdk();

      try {
        // Get CLMM configs for the fee tier
        const clmmConfigs = await raydium.api.getClmmConfigs();

        console.log('Available CLMM configs (FULL):', clmmConfigs);

        let ammConfig = clmmConfigs.find((c) => c.feeRate === feeTier);

        if (!ammConfig) {
          console.warn(`Fee tier ${feeTier} not found, using first available config`);
          ammConfig = clmmConfigs[0];
        }

        if (!ammConfig) {
          throw new Error('No CLMM configs available');
        }

        console.log('Using CLMM config (FULL):', ammConfig);

        // Convert price to Decimal
        const priceDecimal = new Decimal(initialPrice.toString());
        console.log('Initial price as Decimal:', priceDecimal.toString());

        // Prepare config - converter strings para PublicKey onde necessário
        const configForPool: any = {
          id: new PublicKey(ammConfig.id),
          index: ammConfig.index,
          protocolFeeRate: ammConfig.protocolFeeRate,
          tradeFeeRate: ammConfig.tradeFeeRate,
          tickSpacing: ammConfig.tickSpacing,
          fundFeeRate: ammConfig.fundFeeRate,
        };

        // Adicionar fundOwner apenas se existir
        if (ammConfig.fundOwner) {
          configForPool.fundOwner = new PublicKey(ammConfig.fundOwner);
        }

        console.log('Config prepared for pool creation:', configForPool);

        // Use devnet CLMM program ID
        const clmmProgramId = DEVNET_PROGRAM_ID.CLMM_PROGRAM_ID;

        console.log('Using CLMM Program ID:', clmmProgramId.toBase58());

        const poolParams = {
          programId: clmmProgramId,
          mint1: {
            address: tokenMintA.toBase58(),
            programId: programIdA.toBase58(),
            decimals: mintAInfo.decimals,
          },
          mint2: {
            address: tokenMintB.toBase58(),
            programId: programIdB.toBase58(),
            decimals: mintBInfo.decimals,
          },
          ammConfig: configForPool,
          initialPrice: priceDecimal,
          startTime: new BN(0),
          txVersion: TxVersion.V0,
        };

        console.log('Full pool params BEFORE createPool:', {
          ...poolParams,
          initialPrice: priceDecimal.toString(),
          startTime: poolParams.startTime.toString(),
        });

        // Create the pool
        const { execute, extInfo } = await raydium.clmm.createPool(poolParams);

        console.log('CLMM extInfo structure:', extInfo);

        // extInfo.address is an object with pool address, not a PublicKey directly
        // Need to find the correct property
        let poolAddress: string;
        if (extInfo.address?.poolId) {
          poolAddress = typeof extInfo.address.poolId === 'string'
            ? extInfo.address.poolId
            : extInfo.address.poolId.toBase58();
        } else if (extInfo.address?.toBase58) {
          poolAddress = extInfo.address.toBase58();
        } else if (typeof extInfo.address === 'string') {
          poolAddress = extInfo.address;
        } else {
          console.error('Unknown extInfo.address structure:', extInfo.address);
          throw new Error('Could not determine pool address from extInfo');
        }

        console.log('Pool address extracted:', poolAddress);

        // Execute the transaction
        const { txId } = await execute({ sendAndConfirm: true });

        console.log('CLMM Pool created successfully!', {
          poolId: poolAddress,
          txId,
        });

        return {
          poolId: poolAddress,
          txId,
        };
      } catch (error: any) {
        console.error('Error creating CLMM pool:', error);
        throw new Error(`Failed to create CLMM pool: ${error.message || error}`);
      }
    },
    [wallet, loadSdk, connection]
  );

  return {
    createClmmPool,
  };
}

// Constants
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');
