import { FormEvent, useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { toast } from 'sonner';
import { Loader2, ExternalLink, ArrowDownUp, Plus, Minus, RefreshCw } from 'lucide-react';
import { Raydium, TxVersion, Percent } from '@raydium-io/raydium-sdk-v2';
import BN from 'bn.js';

type PoolInfo = {
  poolId: string;
  mintA: {
    address: string;
    symbol: string;
    decimals: number;
    balance: string;
  };
  mintB: {
    address: string;
    symbol: string;
    decimals: number;
    balance: string;
  };
  lpMint: string;
  lpSupply: string;
  price: string;
};

type SwapForm = {
  inputAmount: string;
  outputAmount: string;
  slippage: string;
};

type LiquidityForm = {
  tokenAAmount: string;
  tokenBAmount: string;
  lpAmount: string;
};

const DEFAULT_POOL_ID = ''; // Será preenchido pelo usuário

export function RaydiumPoolManager() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [poolId, setPoolId] = useState(DEFAULT_POOL_ID);
  const [poolInfo, setPoolInfo] = useState<PoolInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [swapForm, setSwapForm] = useState<SwapForm>({
    inputAmount: '',
    outputAmount: '',
    slippage: '1',
  });
  const [liquidityForm, setLiquidityForm] = useState<LiquidityForm>({
    tokenAAmount: '',
    tokenBAmount: '',
    lpAmount: '',
  });
  const [swapDirection, setSwapDirection] = useState<'AtoB' | 'BtoA'>('AtoB');

  const loadPoolInfo = async () => {
    if (!poolId.trim()) {
      toast.error('Informe o Pool ID');
      return;
    }

    setLoading(true);
    try {
      const poolPubkey = new PublicKey(poolId.trim());

      // Verificar se a conta existe
      const accountInfo = await connection.getAccountInfo(poolPubkey);
      if (!accountInfo) {
        throw new Error('Pool não encontrado na blockchain');
      }

      console.log('[RaydiumPoolManager] Pool account owner:', accountInfo.owner.toBase58());
      console.log('[RaydiumPoolManager] Pool account data length:', accountInfo.data.length);

      // Verificar se a conta pertence ao programa CPMM
      const CPMM_PROGRAM_ID = 'DRaycpLY18LhpbydsBWbVJtxpNv9oXPgjRSfpF2bWpYb';
      if (accountInfo.owner.toBase58() !== CPMM_PROGRAM_ID) {
        throw new Error(`Esta conta não é um pool CPMM. Owner: ${accountInfo.owner.toBase58()}`);
      }

      const raydium = await Raydium.load({
        owner: wallet.publicKey || PublicKey.default,
        connection,
        cluster: 'devnet',
        disableFeatureCheck: true,
        disableLoadToken: true, // Não carregar tokens via API
        blockhashCommitment: 'finalized',
      });

      // Buscar informações do pool (sem usar API - apenas RPC)
      let poolData;
      try {
        poolData = await raydium.cpmm.getRpcPoolInfo(poolPubkey, false);
      } catch (deserializeError) {
        console.error('[RaydiumPoolManager] Deserialization error:', deserializeError);
        throw new Error('Erro ao ler dados do pool. O pool pode não estar inicializado corretamente.');
      }

      console.log('[RaydiumPoolManager] Pool data:', poolData);

      if (!poolData) {
        throw new Error('Pool não retornou dados');
      }

      // Extrair informações (a estrutura é diferente - mintA/B são PublicKeys diretos)
      const mintAAddress = poolData.mintA.toBase58();
      const mintBAddress = poolData.mintB.toBase58();
      const vaultAAmount = poolData.vaultAAmount.toString();
      const vaultBAmount = poolData.vaultBAmount.toString();
      const decimalsA = poolData.mintDecimalA;
      const decimalsB = poolData.mintDecimalB;

      setPoolInfo({
        poolId: poolId.trim(),
        mintA: {
          address: mintAAddress,
          symbol: mintAAddress === 'So11111111111111111111111111111111111111112' ? 'SOL' : 'Token A',
          decimals: decimalsA,
          balance: (Number(vaultAAmount) / (10 ** decimalsA)).toFixed(4),
        },
        mintB: {
          address: mintBAddress,
          symbol: mintBAddress === 'So11111111111111111111111111111111111111112' ? 'SOL' : 'Token B',
          decimals: decimalsB,
          balance: (Number(vaultBAmount) / (10 ** decimalsB)).toFixed(4),
        },
        lpMint: poolData.mintLp.toBase58(),
        lpSupply: poolData.lpAmount?.toString() || '0',
        price: (Number(vaultBAmount) / (10 ** decimalsB) / (Number(vaultAAmount) / (10 ** decimalsA))).toFixed(6),
      });

      toast.success('Pool carregado com sucesso!');
    } catch (error: any) {
      console.error('[RaydiumPoolManager] Error loading pool:', error);
      toast.error(error?.message || 'Erro ao carregar pool');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async (event: FormEvent) => {
    event.preventDefault();

    if (!wallet.publicKey || !wallet.signTransaction) {
      toast.error('Conecte sua wallet primeiro');
      return;
    }

    if (!poolInfo) {
      toast.error('Carregue o pool primeiro');
      return;
    }

    if (!swapForm.inputAmount || parseFloat(swapForm.inputAmount) <= 0) {
      toast.error('Informe a quantidade a trocar');
      return;
    }

    setLoading(true);
    try {
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

      const inputMint = swapDirection === 'AtoB' ? poolInfo.mintA : poolInfo.mintB;
      const inputDecimals = inputMint.decimals;
      const inputAmountRaw = Math.floor(parseFloat(swapForm.inputAmount) * (10 ** inputDecimals));

      toast.info('Executando swap...');

      // Buscar poolInfo e poolKeys
      const poolData = await raydium.cpmm.getPoolInfoFromRpc(new PublicKey(poolInfo.poolId));

      const { execute } = await raydium.cpmm.swap({
        poolInfo: poolData.poolInfo,
        poolKeys: poolData.poolKeys,
        inputAmount: new BN(inputAmountRaw),
        slippage: new Percent(parseFloat(swapForm.slippage), 100), // Ex: 1% = Percent(1, 100)
        baseIn: swapDirection === 'AtoB',
        txVersion: TxVersion.V0,
      });

      const { txId } = await execute({ sendAndConfirm: true });

      toast.success('Swap executado com sucesso!');
      console.log('[RaydiumPoolManager] Swap tx:', txId);

      // Recarregar pool info
      await loadPoolInfo();

      // Limpar form
      setSwapForm({
        inputAmount: '',
        outputAmount: '',
        slippage: '1',
      });
    } catch (error: any) {
      console.error('[RaydiumPoolManager] Swap error:', error);
      toast.error(error?.message || 'Erro ao executar swap');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLiquidity = async (event: FormEvent) => {
    event.preventDefault();

    if (!wallet.publicKey || !wallet.signTransaction) {
      toast.error('Conecte sua wallet primeiro');
      return;
    }

    if (!poolInfo) {
      toast.error('Carregue o pool primeiro');
      return;
    }

    if (!liquidityForm.tokenAAmount || !liquidityForm.tokenBAmount) {
      toast.error('Informe as quantidades de ambos os tokens');
      return;
    }

    setLoading(true);
    try {
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

      const tokenAAmountRaw = Math.floor(parseFloat(liquidityForm.tokenAAmount) * (10 ** poolInfo.mintA.decimals));

      toast.info('Adicionando liquidez...');

      // Buscar poolInfo e poolKeys
      const poolData = await raydium.cpmm.getPoolInfoFromRpc(new PublicKey(poolInfo.poolId));

      const { execute } = await raydium.cpmm.addLiquidity({
        poolInfo: poolData.poolInfo,
        poolKeys: poolData.poolKeys,
        inputAmount: new BN(tokenAAmountRaw),
        slippage: new Percent(1, 100), // 1%
        baseIn: true, // Usar token A como base
        txVersion: TxVersion.V0,
      });

      const { txId } = await execute({ sendAndConfirm: true });

      toast.success('Liquidez adicionada com sucesso!');
      console.log('[RaydiumPoolManager] Add liquidity tx:', txId);

      // Recarregar pool info
      await loadPoolInfo();

      // Limpar form
      setLiquidityForm({
        tokenAAmount: '',
        tokenBAmount: '',
        lpAmount: '',
      });
    } catch (error: any) {
      console.error('[RaydiumPoolManager] Add liquidity error:', error);
      toast.error(error?.message || 'Erro ao adicionar liquidez');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLiquidity = async (event: FormEvent) => {
    event.preventDefault();

    if (!wallet.publicKey || !wallet.signTransaction) {
      toast.error('Conecte sua wallet primeiro');
      return;
    }

    if (!poolInfo) {
      toast.error('Carregue o pool primeiro');
      return;
    }

    if (!liquidityForm.lpAmount) {
      toast.error('Informe a quantidade de LP tokens para remover');
      return;
    }

    setLoading(true);
    try {
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

      const lpAmountRaw = Math.floor(parseFloat(liquidityForm.lpAmount) * (10 ** 9)); // LP tokens geralmente têm 9 decimais

      toast.info('Removendo liquidez...');

      // Buscar poolInfo e poolKeys
      const poolData = await raydium.cpmm.getPoolInfoFromRpc(new PublicKey(poolInfo.poolId));

      const { execute } = await raydium.cpmm.removeLiquidity({
        poolInfo: poolData.poolInfo,
        poolKeys: poolData.poolKeys,
        lpAmount: new BN(lpAmountRaw),
        slippage: new Percent(1, 100), // 1%
        txVersion: TxVersion.V0,
      });

      const { txId } = await execute({ sendAndConfirm: true });

      toast.success('Liquidez removida com sucesso!');
      console.log('[RaydiumPoolManager] Remove liquidity tx:', txId);

      // Recarregar pool info
      await loadPoolInfo();

      // Limpar form
      setLiquidityForm({
        tokenAAmount: '',
        tokenBAmount: '',
        lpAmount: '',
      });
    } catch (error: any) {
      console.error('[RaydiumPoolManager] Remove liquidity error:', error);
      toast.error(error?.message || 'Erro ao remover liquidez');
    } finally {
      setLoading(false);
    }
  };

  const toggleSwapDirection = () => {
    setSwapDirection((prev) => (prev === 'AtoB' ? 'BtoA' : 'AtoB'));
    setSwapForm({
      inputAmount: '',
      outputAmount: '',
      slippage: swapForm.slippage,
    });
  };

  return (
    <div className="space-y-6">
      {/* Pool Selector */}
      <Card className="card-institutional">
        <CardHeader>
          <CardTitle>Pool Raydium CPMM</CardTitle>
          <CardDescription>
            Interaja com seu pool de liquidez: faça swaps, adicione ou remova liquidez
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="poolId">Pool ID</Label>
                <Input
                  id="poolId"
                  placeholder="Endereço do pool CPMM"
                  value={poolId}
                  onChange={(e) => setPoolId(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={loadPoolInfo} disabled={loading || !poolId.trim()}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="ml-2">Carregar Pool</span>
                </Button>
              </div>
            </div>

            {poolInfo && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
                <AlertDescription>
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-green-700 dark:text-green-300">
                      ✅ Pool carregado
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-medium">{poolInfo.mintA.symbol}:</span>{' '}
                        {poolInfo.mintA.balance}
                      </div>
                      <div>
                        <span className="font-medium">{poolInfo.mintB.symbol}:</span>{' '}
                        {poolInfo.mintB.balance}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Preço:</span> 1 {poolInfo.mintA.symbol} ≈{' '}
                        {poolInfo.price} {poolInfo.mintB.symbol}
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pool Actions */}
      {poolInfo && (
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

          {/* Swap Tab */}
          <TabsContent value="swap">
            <Card>
              <CardHeader>
                <CardTitle>Swap Tokens</CardTitle>
                <CardDescription>Troque entre {poolInfo.mintA.symbol} e {poolInfo.mintB.symbol}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSwap} className="space-y-4">
                  <div className="space-y-2">
                    <Label>De (Input)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={swapForm.inputAmount}
                        onChange={(e) => setSwapForm({ ...swapForm, inputAmount: e.target.value })}
                        disabled={loading}
                      />
                      <Badge variant="outline">
                        {swapDirection === 'AtoB' ? poolInfo.mintA.symbol : poolInfo.mintB.symbol}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={toggleSwapDirection}
                      disabled={loading}
                    >
                      <ArrowDownUp className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Para (Output estimado)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        placeholder="~0.00"
                        value={swapForm.outputAmount}
                        disabled
                      />
                      <Badge variant="outline">
                        {swapDirection === 'AtoB' ? poolInfo.mintB.symbol : poolInfo.mintA.symbol}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Slippage (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={swapForm.slippage}
                      onChange={(e) => setSwapForm({ ...swapForm, slippage: e.target.value })}
                      disabled={loading}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading || !wallet.connected}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Executando swap...
                      </>
                    ) : (
                      'Swap'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Liquidity Tab */}
          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Liquidez</CardTitle>
                <CardDescription>Deposite tokens e ganhe fees de swap</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddLiquidity} className="space-y-4">
                  <div className="space-y-2">
                    <Label>{poolInfo.mintA.symbol}</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={liquidityForm.tokenAAmount}
                      onChange={(e) => setLiquidityForm({ ...liquidityForm, tokenAAmount: e.target.value })}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{poolInfo.mintB.symbol}</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={liquidityForm.tokenBAmount}
                      onChange={(e) => setLiquidityForm({ ...liquidityForm, tokenBAmount: e.target.value })}
                      disabled={loading}
                    />
                  </div>

                  <Alert>
                    <AlertDescription className="text-xs">
                      💡 As quantidades devem manter a proporção atual do pool (~{poolInfo.price})
                    </AlertDescription>
                  </Alert>

                  <Button type="submit" className="w-full" disabled={loading || !wallet.connected}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adicionando liquidez...
                      </>
                    ) : (
                      'Adicionar Liquidez'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Remove Liquidity Tab */}
          <TabsContent value="remove">
            <Card>
              <CardHeader>
                <CardTitle>Remover Liquidez</CardTitle>
                <CardDescription>Retire seus tokens LP e receba os tokens de volta</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRemoveLiquidity} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Quantidade de LP Tokens</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={liquidityForm.lpAmount}
                      onChange={(e) => setLiquidityForm({ ...liquidityForm, lpAmount: e.target.value })}
                      disabled={loading}
                    />
                  </div>

                  <Alert>
                    <AlertDescription className="text-xs">
                      ⚠️ Você receberá ambos os tokens proporcionalmente à sua participação no pool
                    </AlertDescription>
                  </Alert>

                  <Button type="submit" className="w-full" disabled={loading || !wallet.connected}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Removendo liquidez...
                      </>
                    ) : (
                      'Remover Liquidez'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
