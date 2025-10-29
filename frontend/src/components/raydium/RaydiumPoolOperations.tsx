import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { HeroButton } from '@/components/ui/hero-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet } from '@/contexts/wallet/WalletContext';
import { useRaydiumCpmm, type RaydiumPoolDisplay } from '@/hooks/raydium/useRaydiumCpmm';
import { useRaydiumPools } from '@/hooks/solana';
import { useDeployedTokens } from '@/hooks/solana/useDeployedTokens';
import { Loader2, RefreshCw, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface LiquidityFormState {
  amount: string;
  slippage: string;
}

interface RaydiumPoolOperationsProps {
  poolId: string;
}

type SectionId = 'info' | 'ops' | 'onchain';

const KNOWN_BASE_TOKENS: Record<string, { symbol: string; name: string }> = {
  'So11111111111111111111111111111111111111112': { symbol: 'SOL', name: 'Wrapped SOL' },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC', name: 'USD Coin' },
  'Es9vMFrzaCER8r9nMjaJZJFQhQ4ZJqioS6Rkz4Z2QMEW': { symbol: 'USDT', name: 'Tether USD' },
};

const shortenAddress = (address: string, size = 4) =>
  `${address.slice(0, size)}...${address.slice(-size)}`;

export function RaydiumPoolOperations({ poolId }: RaydiumPoolOperationsProps) {
  const wallet = useWallet();
  const { pools, deactivatePool } = useRaydiumPools();
  const { tokens: deployedTokens } = useDeployedTokens();
  const { loadPoolInfo, addLiquidity, removeLiquidity } = useRaydiumCpmm();

  const [poolInfo, setPoolInfo] = useState<RaydiumPoolDisplay | null>(null);
  const [loading, setLoading] = useState(false);
  const [txLoading, setTxLoading] = useState(false);
  const [liquidityForm, setLiquidityForm] = useState<LiquidityFormState>({
    amount: '',
    slippage: '1',
  });

  const sections: { id: SectionId; label: string }[] = useMemo(
    () => [
      { id: 'info', label: 'Pool Details' },
      { id: 'ops', label: 'Operations' },
      { id: 'onchain', label: 'On-chain Data' },
    ],
    []
  );
  const [activeSection, setActiveSection] = useState<SectionId>('info');

  const currentPool = useMemo(() => {
    return pools.find(p => p.poolId.toBase58() === poolId);
  }, [pools, poolId]);

  const tokenLookup = useMemo(() => {
    return deployedTokens.reduce<Record<string, { symbol?: string; name?: string }>>((acc, token) => {
      acc[token.mint.toBase58()] = { symbol: token.symbol, name: token.name };
      return acc;
    }, {});
  }, [deployedTokens]);

  const resolveTokenMeta = useCallback(
    (mint?: string, fallbackSymbol?: string, defaultLabel = 'Token') => {
      if (!mint) {
        return {
          address: '',
          symbol: defaultLabel,
          name: defaultLabel,
        };
      }

      const fromLookup = tokenLookup[mint];
      if (fromLookup) {
        return {
          address: mint,
          symbol: fromLookup.symbol ?? fallbackSymbol ?? shortenAddress(mint),
          name: fromLookup.name ?? fromLookup.symbol ?? fallbackSymbol ?? shortenAddress(mint, 6),
        };
      }

      const known = KNOWN_BASE_TOKENS[mint];
      if (known) {
        return {
          address: mint,
          symbol: known.symbol,
          name: known.name,
        };
      }

      return {
        address: mint,
        symbol: fallbackSymbol ?? shortenAddress(mint),
        name: fallbackSymbol ?? shortenAddress(mint, 6),
      };
    },
    [tokenLookup]
  );

  const raydiumPool = useMemo(() => {
    return pools.find((pool) => pool.poolId.toBase58() === poolId) ?? null;
  }, [poolId, pools]);

  const tokenAMeta = useMemo(() => {
    if (!poolInfo) return null;
    return resolveTokenMeta(poolInfo.mintA.address, poolInfo.mintA.symbol ?? undefined, 'Token A');
  }, [poolInfo, resolveTokenMeta]);

  const tokenBMeta = useMemo(() => {
    if (!poolInfo) return null;
    return resolveTokenMeta(poolInfo.mintB.address, poolInfo.mintB.symbol ?? undefined, 'Token B');
  }, [poolInfo, resolveTokenMeta]);

  const refreshPoolInfo = useCallback(async () => {
    if (!poolId) {
      setPoolInfo(null);
      return;
    }

    if (!wallet.publicKey) {
      setPoolInfo(null);
      return;
    }

    setLoading(true);
    try {
      console.log('[RaydiumPoolOperations] Loading pool:', poolId);
      const info = await loadPoolInfo(poolId);
      setPoolInfo(info);
      console.log('[RaydiumPoolOperations] Pool loaded successfully:', {
        poolId,
        mintA: info.mintA.address,
        mintB: info.mintB.address,
      });
    } catch (error: any) {
      if (error?.message?.includes('Wallet não conectada')) {
        setPoolInfo(null);
        return;
      }
      console.error('[RaydiumPoolOperations] Failed to load pool:', error);
      console.error('[RaydiumPoolOperations] Pool ID that failed:', poolId);
      toast.error(error?.message ?? 'Erro ao carregar informações do pool');
    } finally {
      setLoading(false);
    }
  }, [loadPoolInfo, poolId, wallet.publicKey]);

  useEffect(() => {
    refreshPoolInfo();
  }, [refreshPoolInfo]);

  const ensureWallet = useCallback(() => {
    if (!wallet.publicKey) {
      toast.error('Conecte sua wallet para operar no pool');
      return false;
    }
    return true;
  }, [wallet.publicKey]);

  const handleAddLiquidity = async () => {
    if (!poolId || !liquidityForm.amount) {
      toast.error(`Informe a quantidade de ${tokenAMeta?.symbol ?? 'token base'}`);
      return;
    }
    if (!ensureWallet()) return;

    setTxLoading(true);
    try {
      const txId = await addLiquidity(poolId, liquidityForm.amount, liquidityForm.slippage);
      toast.success('Liquidez adicionada!', {
        action: {
          label: 'Explorer',
          onClick: () => window.open(`https://explorer.solana.com/tx/${txId}?cluster=devnet`, '_blank'),
        },
      });
      setLiquidityForm((prev) => ({ ...prev, amount: '' }));
      await refreshPoolInfo();
    } catch (error: any) {
      console.error('[RaydiumPoolOperations] Add liquidity error:', error);
      toast.error(error?.message ?? 'Erro ao adicionar liquidez');
    } finally {
      setTxLoading(false);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!poolId || !liquidityForm.amount) {
      toast.error('Informe a quantidade de LP tokens');
      return;
    }
    if (!ensureWallet()) return;

    setTxLoading(true);
    try {
      const txId = await removeLiquidity(poolId, liquidityForm.amount, liquidityForm.slippage);
      toast.success('Liquidez removida!', {
        action: {
          label: 'Explorer',
          onClick: () => window.open(`https://explorer.solana.com/tx/${txId}?cluster=devnet`, '_blank'),
        },
      });
      setLiquidityForm((prev) => ({ ...prev, amount: '' }));
      await refreshPoolInfo();
    } catch (error: any) {
      console.error('[RaydiumPoolOperations] Remove liquidity error:', error);
      toast.error(error?.message ?? 'Erro ao remover liquidez');
    } finally {
      setTxLoading(false);
    }
  };

  const isBusy = loading || txLoading;

  return (
    <div className="space-y-6">
      {/* Segmented Control Navigation */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-1 rounded-xl bg-muted/40 p-1.5 backdrop-blur-sm border border-border/50">
          {sections.map((section) => {
            const isActive = section.id === activeSection;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  relative px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap
                  transition-all duration-300 ease-out
                  ${isActive
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                  }
                `}
              >
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeSection === 'info' && (
        <Card className="border-purple-500/20 shadow-lg shadow-purple-500/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Pool Details</CardTitle>
            <Button
              variant="outline"
              size="icon"
              onClick={refreshPoolInfo}
              disabled={isBusy}
              className="hover:border-purple-500/50 hover:bg-purple-500/10 transition-colors"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin text-purple-400" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {!wallet.publicKey ? (
              <p className="text-sm text-muted-foreground">
                Connect your wallet to load pool data and execute operations.
              </p>
            ) : loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                Loading pool data...
              </div>
            ) : poolInfo ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3 space-y-2 hover:border-purple-500/30 transition-colors">
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Tokens</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="font-semibold text-sm">
                        {tokenAMeta?.symbol ?? 'Token A'}
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({tokenAMeta?.name ?? '—'})
                        </span>
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {tokenAMeta?.address ? shortenAddress(tokenAMeta.address, 6) : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {tokenBMeta?.symbol ?? 'Token B'}
                        <span className="ml-1 text-xs text-muted-foreground">({tokenBMeta?.name ?? '—'})</span>
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {tokenBMeta?.address ? shortenAddress(tokenBMeta.address, 6) : '—'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3 space-y-2 hover:border-purple-500/30 transition-colors">
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Identifiers</h3>
                  <div className="space-y-2 text-xs font-mono">
                    <p>
                      <span className="font-semibold text-muted-foreground uppercase tracking-wide">Pool ID:</span>{' '}
                      {shortenAddress(poolInfo.poolId, 6)}
                    </p>
                    <div className="grid gap-1 md:grid-cols-2">
                      <p>
                        <span className="font-semibold text-muted-foreground uppercase tracking-wide">Vault A:</span>{' '}
                        {shortenAddress(poolInfo.vaultA, 4)}
                      </p>
                      <p>
                        <span className="font-semibold text-muted-foreground uppercase tracking-wide">Vault B:</span>{' '}
                        {shortenAddress(poolInfo.vaultB, 4)}
                      </p>
                    </div>
                    <p>
                      <span className="font-semibold text-muted-foreground uppercase tracking-wide">LP Mint:</span>{' '}
                      {shortenAddress(poolInfo.lpMint, 6)}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3 hover:border-purple-500/30 transition-colors">
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Statistics</h3>
                  <dl className="grid grid-cols-2 gap-3 text-sm mt-2">
                    <div>
                      <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                        {tokenAMeta?.symbol ?? 'Token A'} Balance
                      </dt>
                      <dd className="font-semibold">{poolInfo.mintAmountA}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                        {tokenBMeta?.symbol ?? 'Token B'} Balance
                      </dt>
                      <dd className="font-semibold">{poolInfo.mintAmountB}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs uppercase tracking-wide">Preço (B/A)</dt>
                      <dd className="font-semibold">
                        {poolInfo.price.toLocaleString('en-US', { maximumFractionDigits: 6 })}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs uppercase tracking-wide">LP Supply</dt>
                      <dd className="font-semibold">{poolInfo.lpSupply}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Removed error message for better UX - pool is being prepared */}
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
                  <p className="text-sm font-semibold text-blue-400 mb-2">
                    🔄 Pool is being prepared
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    This pool is being set up. Please check back shortly or contact support if you have questions.
                  </p>
                  <p className="text-xs font-mono text-muted-foreground break-all">
                    Pool ID: {poolId}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeSection === 'ops' && (
        <Card className="border-purple-500/20 shadow-lg shadow-purple-500/5">
          <CardHeader>
            <CardTitle className="text-xl">Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!poolInfo ? (
              <p className="text-sm text-muted-foreground">
                Load pool information first to execute operations.
              </p>
            ) : (
              <Tabs defaultValue="add" className="w-full">
                <TabsList className="grid w-full grid-cols-2 text-xs">
                  <TabsTrigger value="add" className="py-2">
                    Invest
                  </TabsTrigger>
                  <TabsTrigger value="remove" className="py-2">
                    Withdraw
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="add" className="pt-4 space-y-3 min-h-[280px]">
                  <div className="space-y-2">
                    <Label>
                      Amount ({tokenAMeta?.symbol ?? 'Token A'})
                    </Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder={`0.0 ${tokenAMeta?.symbol ?? ''}`}
                      value={liquidityForm.amount}
                      onChange={(event) =>
                        setLiquidityForm((prev) => ({ ...prev, amount: event.target.value }))
                      }
                      className="border-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slippage (%)</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={liquidityForm.slippage}
                      onChange={(event) =>
                        setLiquidityForm((prev) => ({ ...prev, slippage: event.target.value }))
                      }
                      className="border-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                  <HeroButton
                    onClick={handleAddLiquidity}
                    disabled={txLoading || !poolInfo}
                    variant="brand"
                    className="w-full"
                    icon={txLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  >
                    {txLoading ? 'Processing...' : 'Invest'}
                  </HeroButton>
                </TabsContent>

                <TabsContent value="remove" className="pt-4 space-y-3 min-h-[280px]">
                  <div className="space-y-2">
                    <Label>LP Token Amount</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder="0.0 LP"
                      value={liquidityForm.amount}
                      onChange={(event) =>
                        setLiquidityForm((prev) => ({ ...prev, amount: event.target.value }))
                      }
                      className="border-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slippage (%)</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={liquidityForm.slippage}
                      onChange={(event) =>
                        setLiquidityForm((prev) => ({ ...prev, slippage: event.target.value }))
                      }
                      className="border-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                  <HeroButton
                    onClick={handleRemoveLiquidity}
                    disabled={txLoading || !poolInfo}
                    variant="outline"
                    className="w-full border-2 hover:border-red-500/50 hover:bg-red-500/10"
                    icon={txLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Minus className="h-4 w-4" />}
                  >
                    {txLoading ? 'Processing...' : 'Withdraw'}
                  </HeroButton>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      )}

      {activeSection === 'onchain' && (
        raydiumPool ? (
          <Card className="border-purple-500/20 shadow-lg shadow-purple-500/5">
            <CardHeader>
              <CardTitle className="text-xl">On-chain Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3 space-y-2.5 hover:border-purple-500/30 transition-colors">
                <p className="font-mono text-xs">
                  <span className="font-semibold text-muted-foreground uppercase tracking-wide">Pool Account:</span>{' '}
                  {shortenAddress(raydiumPool.publicKey.toBase58(), 6)}
                </p>
                <p className="font-mono text-xs">
                  <span className="font-semibold text-muted-foreground uppercase tracking-wide">Administrator:</span>{' '}
                  {shortenAddress(raydiumPool.admin.toBase58(), 6)}
                </p>
                <p className="font-mono text-xs">
                  <span className="font-semibold text-muted-foreground uppercase tracking-wide">SRWA Token:</span>{' '}
                  {tokenBMeta?.symbol ?? '—'} — {shortenAddress(raydiumPool.tokenMint.toBase58(), 6)}
                </p>
                <p className="font-mono text-xs">
                  <span className="font-semibold text-muted-foreground uppercase tracking-wide">Base Token:</span>{' '}
                  {tokenAMeta?.symbol ?? '—'} — {shortenAddress(raydiumPool.baseMint.toBase58(), 6)}
                </p>
                <p className="font-mono text-xs">
                  <span className="font-semibold text-muted-foreground uppercase tracking-wide">Active:</span>{' '}
                  <span className={raydiumPool.isActive ? 'text-green-400' : 'text-red-400'}>
                    {raydiumPool.isActive ? 'Yes' : 'No'}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-purple-500/20 shadow-lg shadow-purple-500/5">
            <CardHeader>
              <CardTitle className="text-xl">On-chain Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No on-chain record found for this pool.
              </p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
