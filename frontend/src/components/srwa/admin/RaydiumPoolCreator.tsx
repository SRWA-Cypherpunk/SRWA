import { FormEvent, useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TokenSelect } from './TokenSelect';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useRaydiumPools } from '@/hooks/solana/useRaydiumPools';
import { PublicKey, Transaction } from '@solana/web3.js';
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  unpackMint,
  getMint,
  getAccount
} from '@solana/spl-token';
import { toast } from 'sonner';
import { Loader2, ExternalLink, Info, Copy, RefreshCw, ArrowDownUp, Plus, Minus } from 'lucide-react';
import {
  Raydium,
  TxVersion,
  CREATE_CPMM_POOL_PROGRAM,
  CREATE_CPMM_POOL_FEE_ACC,
  DEVNET_PROGRAM_ID,
  getCpmmPdaAmmConfigId,
  ApiV3PoolInfoStandardItemCpmm,
  Percent
} from '@raydium-io/raydium-sdk-v2';
import BN from 'bn.js';

type FormState = {
  tokenAMint: string;
  tokenBMint: string;
  tokenAAmount: string;
  tokenBAmount: string;
  initialPrice: string;
};

const DEFAULT_FORM_STATE: FormState = {
  tokenAMint: '',
  tokenBMint: 'So11111111111111111111111111111111111111112', // wSOL
  tokenAAmount: '1000',
  tokenBAmount: '1',
  initialPrice: '0.001',
};

type PoolInfoExtended = {
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
};

export function RaydiumPoolCreator() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { registerPool } = useRaydiumPools();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [loadingPool, setLoadingPool] = useState(false);
  const [result, setResult] = useState<{
    poolId: string;
    signature: string;
  } | null>(null);
  const [poolInfo, setPoolInfo] = useState<PoolInfoExtended | null>(null);
  const [swapForm, setSwapForm] = useState({
    inputAmount: '',
    slippage: '1',
    direction: 'AtoB' as 'AtoB' | 'BtoA',
  });
  const [liquidityForm, setLiquidityForm] = useState({
    amount: '',
    slippage: '1',
  });
  const [manualPoolId, setManualPoolId] = useState('');

  const updateForm = (updates: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const handleLoadManualPool = async () => {
    if (!manualPoolId.trim()) {
      toast.error('Informe um Pool ID válido');
      return;
    }

    try {
      await loadPoolInfo(manualPoolId.trim());
      setResult({ poolId: manualPoolId.trim(), signature: '' });
    } catch (error: any) {
      console.error('[RaydiumPoolCreator] Error loading manual pool:', error);
    }
  };

  const loadPoolInfo = async (poolId: string) => {
    if (!wallet.publicKey) return;

    setLoadingPool(true);
    try {
      toast.info('Carregando informações do pool...');

      const raydium = await Raydium.load({
        owner: wallet.publicKey,
        connection,
        cluster: 'devnet',
        disableFeatureCheck: true,
        disableLoadToken: false,
        blockhashCommitment: 'finalized',
      });

      const poolData = await raydium.cpmm.getPoolInfoFromRpc(new PublicKey(poolId));

      console.log('[RaydiumPoolCreator] Pool data loaded:', poolData);

      const { poolInfo: loadedPoolInfo, poolKeys } = poolData;

      console.log('[RaydiumPoolCreator] poolKeys structure:', poolKeys);

      // SDK returns formatted numbers already, not raw lamports
      // Just parse them directly
      const mintAAmount = Number(loadedPoolInfo.mintAmountA);
      const mintBAmount = Number(loadedPoolInfo.mintAmountB);

      console.log('[RaydiumPoolCreator] Calculated amounts:', {
        mintAAmount,
        mintBAmount,
        rawA: loadedPoolInfo.mintAmountA,
        rawB: loadedPoolInfo.mintAmountB,
        decimalsA: loadedPoolInfo.mintA.decimals,
        decimalsB: loadedPoolInfo.mintB.decimals,
      });

      const price = mintAAmount > 0 ? mintBAmount / mintAAmount : 0;

      // Helper to convert to base58 if it's a PublicKey, or return as-is if string
      const toBase58 = (value: any): string => {
        if (typeof value === 'string') return value;
        if (value?.toBase58) return value.toBase58();
        return value?.toString() || '';
      };

      // Format amounts with appropriate decimal places
      const formatAmount = (amount: number, decimals: number) => {
        // Show up to 'decimals' decimal places, but remove trailing zeros
        return amount.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: decimals,
        });
      };

      setPoolInfo({
        poolId,
        mintA: {
          address: loadedPoolInfo.mintA.address,
          decimals: loadedPoolInfo.mintA.decimals,
          symbol: 'Token A',
        },
        mintB: {
          address: loadedPoolInfo.mintB.address,
          decimals: loadedPoolInfo.mintB.decimals,
          symbol: 'Token B',
        },
        vaultA: toBase58(poolKeys.vault?.A || poolKeys.vaultA),
        vaultB: toBase58(poolKeys.vault?.B || poolKeys.vaultB),
        mintAmountA: formatAmount(mintAAmount, loadedPoolInfo.mintA.decimals),
        mintAmountB: formatAmount(mintBAmount, loadedPoolInfo.mintB.decimals),
        lpMint: loadedPoolInfo.lpMint.address,
        lpSupply: formatAmount(Number(loadedPoolInfo.lpAmount), 6),
        price,
      });

      toast.success('Pool carregado com sucesso!');
    } catch (error: any) {
      console.error('[RaydiumPoolCreator] Error loading pool:', error);

      let errorMessage = 'Erro desconhecido';
      if (error.message?.includes('fetch pool info error')) {
        errorMessage = 'Pool não encontrado. Verifique se o Pool ID está correto e se o pool existe na devnet.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error('Erro ao carregar pool: ' + errorMessage);
      setPoolInfo(null);
      setResult(null);
    } finally {
      setLoadingPool(false);
    }
  };

  useEffect(() => {
    if (result?.poolId && wallet.publicKey) {
      loadPoolInfo(result.poolId);
    }
  }, [result?.poolId, wallet.publicKey]);

  const handleSwap = async () => {
    if (!wallet.publicKey || !wallet.signTransaction || !poolInfo) {
      toast.error('Conecte sua wallet e crie um pool primeiro');
      return;
    }

    if (!swapForm.inputAmount || parseFloat(swapForm.inputAmount) <= 0) {
      toast.error('Informe um valor válido para swap');
      return;
    }

    setLoading(true);
    try {
      toast.info('Preparando swap...');

      const raydium = await Raydium.load({
        owner: wallet.publicKey,
        connection,
        cluster: 'devnet',
        disableFeatureCheck: true,
        disableLoadToken: false,
        blockhashCommitment: 'finalized',
        signAllTransactions: async (txs) => {
          return await wallet.signAllTransactions!(txs);
        },
      });

      const poolData = await raydium.cpmm.getPoolInfoFromRpc(new PublicKey(poolInfo.poolId));

      const inputMint = swapForm.direction === 'AtoB' ? poolInfo.mintA : poolInfo.mintB;
      const inputAmountRaw = Math.floor(parseFloat(swapForm.inputAmount) * (10 ** inputMint.decimals));

      const { execute } = await raydium.cpmm.swap({
        poolInfo: poolData.poolInfo,
        poolKeys: poolData.poolKeys,
        inputAmount: new BN(inputAmountRaw),
        slippage: new Percent(parseFloat(swapForm.slippage), 100),
        baseIn: swapForm.direction === 'AtoB',
        txVersion: TxVersion.V0,
      });

      toast.info('Enviando transação de swap...');
      const { txId } = await execute({ sendAndConfirm: true });

      toast.success('Swap realizado com sucesso!');
      console.log('[RaydiumPoolCreator] Swap txId:', txId);

      // Reload pool info
      await loadPoolInfo(poolInfo.poolId);
      setSwapForm({ inputAmount: '', slippage: '1', direction: 'AtoB' });
    } catch (error: any) {
      console.error('[RaydiumPoolCreator] Swap error:', error);
      toast.error('Erro ao fazer swap: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddLiquidity = async () => {
    if (!wallet.publicKey || !wallet.signTransaction || !poolInfo) {
      toast.error('Conecte sua wallet e crie um pool primeiro');
      return;
    }

    if (!liquidityForm.amount || parseFloat(liquidityForm.amount) <= 0) {
      toast.error('Informe um valor válido');
      return;
    }

    setLoading(true);
    try {
      toast.info('Adicionando liquidez...');

      const raydium = await Raydium.load({
        owner: wallet.publicKey,
        connection,
        cluster: 'devnet',
        disableFeatureCheck: true,
        disableLoadToken: false,
        blockhashCommitment: 'finalized',
        signAllTransactions: async (txs) => {
          return await wallet.signAllTransactions!(txs);
        },
      });

      const poolData = await raydium.cpmm.getPoolInfoFromRpc(new PublicKey(poolInfo.poolId));
      const tokenAAmountRaw = Math.floor(parseFloat(liquidityForm.amount) * (10 ** poolInfo.mintA.decimals));

      const { execute } = await raydium.cpmm.addLiquidity({
        poolInfo: poolData.poolInfo,
        poolKeys: poolData.poolKeys,
        inputAmount: new BN(tokenAAmountRaw),
        slippage: new Percent(parseFloat(liquidityForm.slippage), 100),
        baseIn: true,
        txVersion: TxVersion.V0,
      });

      toast.info('Enviando transação...');
      const { txId } = await execute({ sendAndConfirm: true });

      toast.success('Liquidez adicionada com sucesso!');
      console.log('[RaydiumPoolCreator] Add liquidity txId:', txId);

      // Reload pool info
      await loadPoolInfo(poolInfo.poolId);
      setLiquidityForm({ amount: '', slippage: '1' });
    } catch (error: any) {
      console.error('[RaydiumPoolCreator] Add liquidity error:', error);
      toast.error('Erro ao adicionar liquidez: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!wallet.publicKey || !wallet.signTransaction || !poolInfo) {
      toast.error('Conecte sua wallet e crie um pool primeiro');
      return;
    }

    if (!liquidityForm.amount || parseFloat(liquidityForm.amount) <= 0) {
      toast.error('Informe um valor válido de LP tokens');
      return;
    }

    setLoading(true);
    try {
      toast.info('Removendo liquidez...');

      const raydium = await Raydium.load({
        owner: wallet.publicKey,
        connection,
        cluster: 'devnet',
        disableFeatureCheck: true,
        disableLoadToken: false,
        blockhashCommitment: 'finalized',
        signAllTransactions: async (txs) => {
          return await wallet.signAllTransactions!(txs);
        },
      });

      const poolData = await raydium.cpmm.getPoolInfoFromRpc(new PublicKey(poolInfo.poolId));

      // Get LP mint decimals
      const lpMintInfo = await getMint(connection, new PublicKey(poolInfo.lpMint), 'confirmed', TOKEN_PROGRAM_ID);
      const lpAmountRaw = Math.floor(parseFloat(liquidityForm.amount) * (10 ** lpMintInfo.decimals));

      const { execute } = await raydium.cpmm.removeLiquidity({
        poolInfo: poolData.poolInfo,
        poolKeys: poolData.poolKeys,
        lpAmount: new BN(lpAmountRaw),
        slippage: new Percent(parseFloat(liquidityForm.slippage), 100),
        txVersion: TxVersion.V0,
      });

      toast.info('Enviando transação...');
      const { txId } = await execute({ sendAndConfirm: true });

      toast.success('Liquidez removida com sucesso!');
      console.log('[RaydiumPoolCreator] Remove liquidity txId:', txId);

      // Reload pool info
      await loadPoolInfo(poolInfo.poolId);
      setLiquidityForm({ amount: '', slippage: '1' });
    } catch (error: any) {
      console.error('[RaydiumPoolCreator] Remove liquidity error:', error);
      toast.error('Erro ao remover liquidez: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!wallet.publicKey || !wallet.signTransaction) {
      toast.error('Conecte sua wallet primeiro');
      return;
    }

    if (!form.tokenAMint.trim()) {
      toast.error('Informe o endereço do token SRWA (Token A)');
      return;
    }

    setLoading(true);

    try {
      const tokenAMint = new PublicKey(form.tokenAMint.trim());
      const tokenBMint = new PublicKey(form.tokenBMint.trim());

      // Obter decimais dos tokens usando getMint (funciona com Token e Token-2022)
      toast.info('Verificando tokens...');

      // Verificar qual programa cada token usa
      const [accountAInfo, accountBInfo] = await Promise.all([
        connection.getAccountInfo(tokenAMint),
        connection.getAccountInfo(tokenBMint),
      ]);

      if (!accountAInfo || !accountBInfo) {
        throw new Error('Um ou ambos os tokens não foram encontrados');
      }

      const programA = accountAInfo.owner;
      const programB = accountBInfo.owner;

      console.log('[RaydiumPoolCreator] Token programs:', {
        tokenA: programA.toBase58(),
        tokenB: programB.toBase58(),
      });

      // Usar getMint que funciona para ambos programas
      const [mintAData, mintBData] = await Promise.all([
        getMint(connection, tokenAMint, 'confirmed', programA),
        getMint(connection, tokenBMint, 'confirmed', programB),
      ]);

      const mintADecimals = mintAData.decimals;
      const mintBDecimals = mintBData.decimals;

      console.log('[RaydiumPoolCreator] Token decimals:', {
        mintADecimals,
        mintBDecimals,
        mintASupply: mintAData.supply.toString(),
        mintBSupply: mintBData.supply.toString(),
      });

      // Inicializar Raydium SDK
      toast.info('Inicializando Raydium SDK...');
      const raydium = await Raydium.load({
        owner: wallet.publicKey,
        connection,
        cluster: 'devnet',
        disableFeatureCheck: true,
        disableLoadToken: false, // Habilitar para que SDK carregue os tokens
        blockhashCommitment: 'finalized',
        signAllTransactions: async (txs) => {
          return await wallet.signAllTransactions!(txs);
        },
      });

      console.log('[RaydiumPoolCreator] Raydium SDK loaded');
      console.log('[RaydiumPoolCreator] SDK owner:', raydium.owner);

      toast.info('Carregando informações dos tokens...');

      // Carregar info dos tokens via SDK
      const mintA = {
        address: tokenAMint.toBase58(),
        programId: programA.toBase58(),
        decimals: mintADecimals,
      };

      const mintB = {
        address: tokenBMint.toBase58(),
        programId: programB.toBase58(),
        decimals: mintBDecimals,
      };

      console.log('[RaydiumPoolCreator] Mint info:', { mintA, mintB });

      // Obter fee configs
      toast.info('Carregando fee configs...');
      const feeConfigs = await raydium.api.getCpmmConfigs();

      // Para devnet, ajustar os config IDs
      if (raydium.cluster === 'devnet') {
        feeConfigs.forEach((config) => {
          config.id = getCpmmPdaAmmConfigId(
            DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM,
            config.index
          ).publicKey.toBase58();
        });
      }

      console.log('[RaydiumPoolCreator] Fee configs:', feeConfigs);

      if (feeConfigs.length === 0) {
        throw new Error('Nenhuma configuração de fee encontrada');
      }

      // Usar a primeira config (padrão)
      const feeConfig = feeConfigs[0];

      toast.info('Criando pool CPMM no Raydium...');

      // Converter amounts para formato correto (considerar decimais)
      const tokenAAmountRaw = Math.floor(parseFloat(form.tokenAAmount) * (10 ** mintADecimals));
      const tokenBAmountRaw = Math.floor(parseFloat(form.tokenBAmount) * (10 ** mintBDecimals));

      console.log('[RaydiumPoolCreator] Raw amounts:', {
        tokenAAmountRaw,
        tokenBAmountRaw,
        tokenAAmountBN: new BN(tokenAAmountRaw).toString(),
        tokenBAmountBN: new BN(tokenBAmountRaw).toString(),
      });

      const poolParams = {
        programId: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM,
        poolFeeAccount: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_FEE_ACC,
        mintA,
        mintB,
        mintAAmount: new BN(tokenAAmountRaw),
        mintBAmount: new BN(tokenBAmountRaw),
        startTime: new BN(Math.floor(Date.now() / 1000)),
        feeConfig: {
          id: new PublicKey(feeConfig.id),
          index: feeConfig.index,
          protocolFeeRate: feeConfig.protocolFeeRate,
          tradeFeeRate: feeConfig.tradeFeeRate,
          fundFeeRate: feeConfig.fundFeeRate,
          createPoolFee: new BN(feeConfig.createPoolFee),
        },
        ownerInfo: {
          feePayer: wallet.publicKey,
          useSOLBalance: true,
        },
        txVersion: TxVersion.V0,
      };

      console.log('[RaydiumPoolCreator] Pool params:', poolParams);

      // Criar pool CPMM (Constant Product Market Maker)
      const { execute, extInfo } = await raydium.cpmm.createPool(poolParams);

      console.log('[RaydiumPoolCreator] Pool creation prepared:', extInfo);

      toast.info('Enviando transação...');

      // Executar transação
      const { txId } = await execute({ sendAndConfirm: true });

      console.log('[RaydiumPoolCreator] Pool created! TxId:', txId);

      const poolId = extInfo.address.poolId.toBase58();

      setResult({
        poolId,
        signature: txId,
      });

      toast.success('Pool Raydium criado com sucesso!');

      // Register pool on-chain in yield_adapter program
      try {
        toast.info('Registrando pool on-chain...');
        const poolIdPubkey = new PublicKey(poolId);
        const tokenMintPubkey = new PublicKey(form.tokenAMint);
        const baseMintPubkey = new PublicKey(form.tokenBMint);

        await registerPool(poolIdPubkey, tokenMintPubkey, baseMintPubkey);

        toast.success('Pool registrada on-chain! Agora ela aparecerá automaticamente no dashboard.');
        console.log('[RaydiumPoolCreator] Pool registered on-chain');
      } catch (registerError: any) {
        console.error('[RaydiumPoolCreator] Failed to register pool on-chain:', registerError);
        toast.warning('Pool criada com sucesso, mas falha ao registrar on-chain: ' + registerError.message);
      }

      // Reset form
      setForm({
        ...DEFAULT_FORM_STATE,
        tokenAMint: form.tokenAMint, // Keep token A
      });

    } catch (error: any) {
      console.error('[RaydiumPoolCreator] Error:', error);
      if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao criar pool Raydium');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-institutional">
      <CardHeader>
        <CardTitle>Integração Raydium (Devnet)</CardTitle>
        <CardDescription>
          Crie um pool de liquidez CPMM (Constant Product Market Maker) no Raydium para tokens SRWA.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Load Existing Pool */}
          {!poolInfo && (
            <Card className="border-2 border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Carregar Pool Existente</CardTitle>
                <CardDescription className="text-xs">
                  Se você já criou um pool anteriormente, insira o Pool ID para gerenciá-lo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Pool ID (endereço do pool)"
                    value={manualPoolId}
                    onChange={(e) => setManualPoolId(e.target.value)}
                    disabled={loadingPool}
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={handleLoadManualPool}
                    disabled={loadingPool || !manualPoolId.trim()}
                    variant="outline"
                  >
                    {loadingPool ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Carregar'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {result && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
              <AlertDescription className="space-y-2">
                <p className="font-semibold text-green-700 dark:text-green-300">
                  ✅ Pool criado com sucesso!
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
                    <div className="flex-1">
                      <span className="font-medium block mb-1">Pool ID:</span>
                      <code className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded block break-all">
                        {result.poolId}
                      </code>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(result.poolId);
                        toast.success('Pool ID copiado!');
                      }}
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <span className="font-medium">Transaction:</span>{' '}
                    <a
                      href={`https://explorer.solana.com/tx/${result.signature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      {result.signature.slice(0, 8)}...{result.signature.slice(-8)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {poolInfo && (
            <div className="space-y-4">
              {/* Pool Statistics */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Informações do Pool</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadPoolInfo(poolInfo.poolId)}
                      disabled={loadingPool}
                    >
                      {loadingPool ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Token A Balance</p>
                      <p className="text-xl font-bold">{poolInfo.mintAmountA}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {poolInfo.mintA.address.slice(0, 8)}...
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Token B Balance</p>
                      <p className="text-xl font-bold">{poolInfo.mintAmountB}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {poolInfo.mintB.address.slice(0, 8)}...
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Preço (B/A)</p>
                      <p className="text-xl font-bold">{poolInfo.price.toFixed(6)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        1 Token A = {poolInfo.price.toFixed(6)} Token B
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">LP Supply</p>
                    <p className="text-sm font-mono">{poolInfo.lpSupply}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Pool Management Tabs */}
              <Tabs defaultValue="swap" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="swap">
                    <ArrowDownUp className="h-4 w-4 mr-2" />
                    Swap
                  </TabsTrigger>
                  <TabsTrigger value="add">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Liquidez
                  </TabsTrigger>
                  <TabsTrigger value="remove">
                    <Minus className="h-4 w-4 mr-2" />
                    Remover Liquidez
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="swap" className="space-y-4">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="space-y-2">
                        <Label>Direção do Swap</Label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={swapForm.direction === 'AtoB' ? 'default' : 'outline'}
                            onClick={() => setSwapForm({ ...swapForm, direction: 'AtoB' })}
                            className="flex-1"
                          >
                            Token A → Token B
                          </Button>
                          <Button
                            type="button"
                            variant={swapForm.direction === 'BtoA' ? 'default' : 'outline'}
                            onClick={() => setSwapForm({ ...swapForm, direction: 'BtoA' })}
                            className="flex-1"
                          >
                            Token B → Token A
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="swapAmount">Quantidade</Label>
                        <Input
                          id="swapAmount"
                          type="number"
                          step="any"
                          placeholder="0.0"
                          value={swapForm.inputAmount}
                          onChange={(e) => setSwapForm({ ...swapForm, inputAmount: e.target.value })}
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="swapSlippage">Slippage (%)</Label>
                        <Input
                          id="swapSlippage"
                          type="number"
                          step="0.1"
                          value={swapForm.slippage}
                          onChange={(e) => setSwapForm({ ...swapForm, slippage: e.target.value })}
                          disabled={loading}
                        />
                      </div>
                      <Button
                        onClick={handleSwap}
                        disabled={loading || !wallet.connected}
                        className="w-full"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          'Fazer Swap'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="add" className="space-y-4">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Você adicionará liquidez proporcional ao ratio atual do pool.
                        </AlertDescription>
                      </Alert>
                      <div className="space-y-2">
                        <Label htmlFor="addAmount">Quantidade Token A</Label>
                        <Input
                          id="addAmount"
                          type="number"
                          step="any"
                          placeholder="0.0"
                          value={liquidityForm.amount}
                          onChange={(e) => setLiquidityForm({ ...liquidityForm, amount: e.target.value })}
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="addSlippage">Slippage (%)</Label>
                        <Input
                          id="addSlippage"
                          type="number"
                          step="0.1"
                          value={liquidityForm.slippage}
                          onChange={(e) => setLiquidityForm({ ...liquidityForm, slippage: e.target.value })}
                          disabled={loading}
                        />
                      </div>
                      <Button
                        onClick={handleAddLiquidity}
                        disabled={loading || !wallet.connected}
                        className="w-full"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          'Adicionar Liquidez'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="remove" className="space-y-4">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Informe a quantidade de LP tokens que deseja queimar.
                        </AlertDescription>
                      </Alert>
                      <div className="space-y-2">
                        <Label htmlFor="removeAmount">Quantidade LP Tokens</Label>
                        <Input
                          id="removeAmount"
                          type="number"
                          step="any"
                          placeholder="0.0"
                          value={liquidityForm.amount}
                          onChange={(e) => setLiquidityForm({ ...liquidityForm, amount: e.target.value })}
                          disabled={loading}
                        />
                        <p className="text-xs text-muted-foreground">
                          Disponível: {poolInfo.lpSupply} LP
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="removeSlippage">Slippage (%)</Label>
                        <Input
                          id="removeSlippage"
                          type="number"
                          step="0.1"
                          value={liquidityForm.slippage}
                          onChange={(e) => setLiquidityForm({ ...liquidityForm, slippage: e.target.value })}
                          disabled={loading}
                        />
                      </div>
                      <Button
                        onClick={handleRemoveLiquidity}
                        disabled={loading || !wallet.connected}
                        className="w-full"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          'Remover Liquidez'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Token A (SRWA)</Label>
                  <TokenSelect
                    value={form.tokenAMint}
                    onValueChange={(value) => updateForm({ tokenAMint: value })}
                    placeholder="Selecione um token SRWA"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Selecione qual token RWA você quer adicionar no pool
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tokenBMint">Token B (Base)</Label>
                  <Input
                    id="tokenBMint"
                    placeholder="Endereço do token base (SOL, USDC...)"
                    value={form.tokenBMint}
                    onChange={(e) => updateForm({ tokenBMint: e.target.value })}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Token de par (padrão: wSOL)
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tokenAAmount">Quantidade Token A</Label>
                  <Input
                    id="tokenAAmount"
                    type="number"
                    step="any"
                    placeholder="1000"
                    value={form.tokenAAmount}
                    onChange={(e) => updateForm({ tokenAAmount: e.target.value })}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Liquidez inicial do token SRWA
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tokenBAmount">Quantidade Token B</Label>
                  <Input
                    id="tokenBAmount"
                    type="number"
                    step="any"
                    placeholder="1"
                    value={form.tokenBAmount}
                    onChange={(e) => updateForm({ tokenBAmount: e.target.value })}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Liquidez inicial do token base (define preço)
                  </p>
                </div>
              </div>

              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">
                  <span className="font-medium">Preço inicial estimado:</span>{' '}
                  1 Token A ≈ {(parseFloat(form.tokenBAmount) / parseFloat(form.tokenAAmount) || 0).toFixed(6)} Token B
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  O preço será determinado pela razão entre as quantidades depositadas
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !wallet.connected}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando pool...
                </>
              ) : (
                'Criar Pool Raydium'
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
