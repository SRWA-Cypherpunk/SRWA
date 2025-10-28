import { useCallback } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useWallet } from '@/contexts/wallet/WalletContext';
import { Raydium, TxVersion, Percent } from '@raydium-io/raydium-sdk-v2';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { getMint, TOKEN_PROGRAM_ID } from '@solana/spl-token';

interface LoadSdkOptions {
  requireSigner?: boolean;
}

export interface RaydiumPoolDisplay {
  poolId: string;
  mintA: {
    address: string;
    decimals: number;
    symbol?: string;
  };
  mintB: {
    address: string;
    decimals: number;
    symbol?: string;
  };
  vaultA: string;
  vaultB: string;
  mintAmountA: string;
  mintAmountB: string;
  lpMint: string;
  lpSupply: string;
  price: number;
}

export type SwapDirection = 'AtoB' | 'BtoA';

const formatAmount = (amount: number, decimals: number) =>
  amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });

export function useRaydiumCpmm() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const loadSdk = useCallback(
    async ({ requireSigner = false }: LoadSdkOptions = {}) => {
      if (!wallet.publicKey) {
        throw new Error('Wallet não conectada');
      }

      if (requireSigner && (!wallet.signAllTransactions || !wallet.signTransaction)) {
        throw new Error('Wallet não suporta assinaturas necessárias');
      }

      return await Raydium.load({
        owner: wallet.publicKey,
        connection,
        cluster: 'devnet',
        disableFeatureCheck: true,
        disableLoadToken: false,
        blockhashCommitment: 'finalized',
        signAllTransactions: wallet.signAllTransactions
          ? async (txs) => await wallet.signAllTransactions!(txs)
          : undefined,
      });
    },
    [connection, wallet.publicKey, wallet.signAllTransactions, wallet.signTransaction]
  );

  const loadPoolInfo = useCallback(
    async (poolId: string): Promise<RaydiumPoolDisplay> => {
      const sdk = await loadSdk();
      const { poolInfo, poolKeys } = await sdk.cpmm.getPoolInfoFromRpc(new PublicKey(poolId));

      const mintAAmount = Number(poolInfo.mintAmountA);
      const mintBAmount = Number(poolInfo.mintAmountB);
      const price = mintAAmount > 0 ? mintBAmount / mintAAmount : 0;

      const toBase58 = (value: any): string => {
        if (typeof value === 'string') return value;
        if (value?.toBase58) return value.toBase58();
        return value?.toString() || '';
      };

      return {
        poolId,
        mintA: {
          address: poolInfo.mintA.address,
          decimals: poolInfo.mintA.decimals,
          symbol: poolInfo.mintA.symbol,
        },
        mintB: {
          address: poolInfo.mintB.address,
          decimals: poolInfo.mintB.decimals,
          symbol: poolInfo.mintB.symbol,
        },
        vaultA: toBase58(poolKeys.vault?.A || poolKeys.vaultA),
        vaultB: toBase58(poolKeys.vault?.B || poolKeys.vaultB),
        mintAmountA: formatAmount(mintAAmount, poolInfo.mintA.decimals),
        mintAmountB: formatAmount(mintBAmount, poolInfo.mintB.decimals),
        lpMint: poolInfo.lpMint.address,
        lpSupply: formatAmount(Number(poolInfo.lpAmount), 6),
        price,
      };
    },
    [loadSdk]
  );

  const swap = useCallback(
    async (poolId: string, direction: SwapDirection, amount: string, slippage: string) => {
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Informe um valor válido para swap');
      }

      const sdk = await loadSdk({ requireSigner: true });
      const poolData = await sdk.cpmm.getPoolInfoFromRpc(new PublicKey(poolId));

      const inputMint = direction === 'AtoB' ? poolData.poolInfo.mintA : poolData.poolInfo.mintB;
      const inputAmountRaw = Math.floor(parseFloat(amount) * 10 ** inputMint.decimals);

      const { execute } = await sdk.cpmm.swap({
        poolInfo: poolData.poolInfo,
        poolKeys: poolData.poolKeys,
        inputAmount: new BN(inputAmountRaw),
        slippage: new Percent(parseFloat(slippage), 100),
        baseIn: direction === 'AtoB',
        txVersion: TxVersion.V0,
      });

      const { txId } = await execute({ sendAndConfirm: true });
      return txId;
    },
    [loadSdk]
  );

  const addLiquidity = useCallback(
    async (poolId: string, amount: string, slippage: string) => {
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Informe um valor válido');
      }

      const sdk = await loadSdk({ requireSigner: true });
      const poolData = await sdk.cpmm.getPoolInfoFromRpc(new PublicKey(poolId));
      const tokenADecimals = poolData.poolInfo.mintA.decimals;
      const tokenAAmountRaw = Math.floor(parseFloat(amount) * 10 ** tokenADecimals);

      const { execute } = await sdk.cpmm.addLiquidity({
        poolInfo: poolData.poolInfo,
        poolKeys: poolData.poolKeys,
        inputAmount: new BN(tokenAAmountRaw),
        slippage: new Percent(parseFloat(slippage), 100),
        baseIn: true,
        txVersion: TxVersion.V0,
      });

      const { txId } = await execute({ sendAndConfirm: true });
      return txId;
    },
    [loadSdk]
  );

  const removeLiquidity = useCallback(
    async (poolId: string, lpAmount: string, slippage: string) => {
      if (!lpAmount || parseFloat(lpAmount) <= 0) {
        throw new Error('Informe um valor válido de LP tokens');
      }

      const sdk = await loadSdk({ requireSigner: true });
      const poolData = await sdk.cpmm.getPoolInfoFromRpc(new PublicKey(poolId));
      const lpMint = new PublicKey(poolData.poolInfo.lpMint.address);
      const lpMintInfo = await getMint(connection, lpMint, 'confirmed', TOKEN_PROGRAM_ID);
      const lpAmountRaw = Math.floor(parseFloat(lpAmount) * 10 ** lpMintInfo.decimals);

      const { execute } = await sdk.cpmm.removeLiquidity({
        poolInfo: poolData.poolInfo,
        poolKeys: poolData.poolKeys,
        lpAmount: new BN(lpAmountRaw),
        slippage: new Percent(parseFloat(slippage), 100),
        txVersion: TxVersion.V0,
      });

      const { txId } = await execute({ sendAndConfirm: true });
      return txId;
    },
    [connection, loadSdk]
  );

  return {
    loadPoolInfo,
    swap,
    addLiquidity,
    removeLiquidity,
  };
}
