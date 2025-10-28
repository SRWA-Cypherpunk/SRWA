import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet } from '@/contexts/wallet/WalletContext';
import { useRaydiumCpmm, type RaydiumPoolDisplay, type SwapDirection } from '@/hooks/raydium/useRaydiumCpmm';
import { useRaydiumPools } from '@/hooks/solana';
import { useDeployedTokens } from '@/hooks/solana/useDeployedTokens';
import { ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface SwapFormState {
  direction: SwapDirection;
  amount: string;
  slippage: string;
}

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
  const { pools } = useRaydiumPools();
  const { tokens: deployedTokens } = useDeployedTokens();
  const { loadPoolInfo, swap, addLiquidity, removeLiquidity } = useRaydiumCpmm();

  const [poolInfo, setPoolInfo] = useState<RaydiumPoolDisplay | null>(null);
  const [loading, setLoading] = useState(false);
  const [txLoading, setTxLoading] = useState(false);
  const [swapForm, setSwapForm] = useState<SwapFormState>({
    direction: 'AtoB',
    amount: '',
    slippage: '1',
  });
  const [liquidityForm, setLiquidityForm] = useState<LiquidityFormState>({
    amount: '',
    slippage: '1',
  });

  const sections: { id: SectionId; label: string }[] = useMemo(
    () => [
      { id: 'info', label: 'Informações do Pool' },
      { id: 'ops', label: 'Operações' },
      { id: 'onchain', label: 'Registro On-chain' },
    ],
    []
  );
  const [activeSection, setActiveSection] = useState<SectionId>('info');

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

  const activeInputMeta = useMemo(() => {
    if (!poolInfo) return null;
    return swapForm.direction === 'AtoB' ? tokenAMeta : tokenBMeta;
  }, [poolInfo, swapForm.direction, tokenAMeta, tokenBMeta]);

  const activeOutputMeta = useMemo(() => {
    if (!poolInfo) return null;
    return swapForm.direction === 'AtoB' ? tokenBMeta : tokenAMeta;
  }, [poolInfo, swapForm.direction, tokenAMeta, tokenBMeta]);

  const swapLabelForward = useMemo(() => {
    return `${tokenAMeta?.symbol ?? 'Token A'} → ${tokenBMeta?.symbol ?? 'Token B'}`;
  }, [tokenAMeta?.symbol, tokenBMeta?.symbol]);

  const swapLabelReverse = useMemo(() => {
    return `${tokenBMeta?.symbol ?? 'Token B'} → ${tokenAMeta?.symbol ?? 'Token A'}`;
  }, [tokenAMeta?.symbol, tokenBMeta?.symbol]);

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
      const info = await loadPoolInfo(poolId);
      setPoolInfo(info);
    } catch (error: any) {
      if (error?.message?.includes('Wallet não conectada')) {
        setPoolInfo(null);
        return;
      }
      console.error('[RaydiumPoolOperations] Failed to load pool:', error);
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

  const handleSwap = async () => {
    if (!poolId || !swapForm.amount) {
      toast.error('Informe uma quantidade para swap');
      return;
    }
    if (!ensureWallet()) return;

    setTxLoading(true);
    try {
      const txId = await swap(poolId, swapForm.direction, swapForm.amount, swapForm.slippage);
      toast.success('Swap realizado!', {
        action: {
          label: 'Explorer',
          onClick: () => window.open(`https://explorer.solana.com/tx/${txId}?cluster=devnet`, '_blank'),
        },
      });
      setSwapForm((prev) => ({ ...prev, amount: '' }));
      await refreshPoolInfo();
    } catch (error: any) {
      console.error('[RaydiumPoolOperations] Swap error:', error);
      toast.error(error?.message ?? 'Erro ao realizar swap');
    } finally {
      setTxLoading(false);
    }
  };

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
  const activeIndex = sections.findIndex((section) => section.id === activeSection);
  const goToPrev = () => {
    if (activeIndex > 0) {
      setActiveSection(sections[activeIndex - 1].id);
    }
  };
  const goToNext = () => {
    if (activeIndex < sections.length - 1) {
      setActiveSection(sections[activeIndex + 1].id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 text-[11px] font-medium">
        {sections.map((section, index) => {
          const isActive = section.id === activeSection;
          return (
            <div key={section.id} className="flex items-center gap-2">
              <Button
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                className="h-8 whitespace-nowrap"
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
              </Button>
              {index < sections.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
            </div>
          );
        })}
      </div>

      {activeSection === 'info' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Informações do Pool</CardTitle>
            <Button variant="outline" size="icon" onClick={refreshPoolInfo} disabled={isBusy}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {!wallet.publicKey ? (
              <p className="text-sm text-muted-foreground">
                Conecte sua wallet para carregar os dados do pool e executar operações.
              </p>
            ) : loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando dados do pool...
              </div>
            ) : poolInfo ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-border/40 bg-muted/5 p-3 space-y-2">
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
                <div className="rounded-lg border border-border/40 bg-muted/5 p-3 space-y-2">
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Identificadores</h3>
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
                <div className="rounded-lg border border-border/40 bg-muted/5 p-3">
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Estatísticas</h3>
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
              <p className="text-sm text-muted-foreground">
                Não foi possível carregar os dados do pool. Verifique o ID e tente novamente.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {activeSection === 'ops' && (
        <Card>
          <CardHeader>
            <CardTitle>Operações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!poolInfo ? (
              <p className="text-sm text-muted-foreground">
                Carregue as informações do pool primeiro para executar operações.
              </p>
            ) : (
              <Tabs defaultValue="swap" className="w-full">
                <TabsList className="grid w-full grid-cols-3 text-xs">
                  <TabsTrigger value="swap" className="py-2">
                    Swap
                  </TabsTrigger>
                  <TabsTrigger value="add" className="py-2">
                    Adicionar Liquidez
                  </TabsTrigger>
                  <TabsTrigger value="remove" className="py-2">
                    Remover Liquidez
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="swap" className="pt-4 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={swapForm.direction === 'AtoB' ? 'default' : 'outline'}
                      onClick={() => setSwapForm((prev) => ({ ...prev, direction: 'AtoB' }))}
                    >
                      {swapLabelForward}
                    </Button>
                    <Button
                      type="button"
                      variant={swapForm.direction === 'BtoA' ? 'default' : 'outline'}
                      onClick={() => setSwapForm((prev) => ({ ...prev, direction: 'BtoA' }))}
                    >
                      {swapLabelReverse}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Quantidade ({activeInputMeta?.symbol ?? 'Token'})
                    </Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder={`0.0 ${activeInputMeta?.symbol ?? ''}`}
                      value={swapForm.amount}
                      onChange={(event) => setSwapForm((prev) => ({ ...prev, amount: event.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Slippage (%)</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={swapForm.slippage}
                      onChange={(event) => setSwapForm((prev) => ({ ...prev, slippage: event.target.value }))}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Recebe aproximadamente {activeOutputMeta?.symbol ?? 'token'} considerando slippage.
                    </p>
                  </div>

                  <Button
                    onClick={handleSwap}
                    disabled={txLoading || !poolInfo}
                    className="w-full"
                  >
                    {txLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Executar Swap'}
                  </Button>
                </TabsContent>

                <TabsContent value="add" className="pt-4 space-y-3">
                  <div className="space-y-2">
                    <Label>
                      Quantidade ({tokenAMeta?.symbol ?? 'Token A'})
                    </Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder={`0.0 ${tokenAMeta?.symbol ?? ''}`}
                      value={liquidityForm.amount}
                      onChange={(event) =>
                        setLiquidityForm((prev) => ({ ...prev, amount: event.target.value }))
                      }
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
                    />
                  </div>
                  <Button
                    onClick={handleAddLiquidity}
                    disabled={txLoading || !poolInfo}
                    className="w-full"
                  >
                    {txLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Adicionar Liquidez'}
                  </Button>
                </TabsContent>

                <TabsContent value="remove" className="pt-4 space-y-3">
                  <div className="space-y-2">
                    <Label>Quantidade de LP tokens</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder="0.0 LP"
                      value={liquidityForm.amount}
                      onChange={(event) =>
                        setLiquidityForm((prev) => ({ ...prev, amount: event.target.value }))
                      }
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
                    />
                  </div>
                  <Button
                    onClick={handleRemoveLiquidity}
                    disabled={txLoading || !poolInfo}
                    className="w-full"
                  >
                    {txLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Remover Liquidez'}
                  </Button>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      )}

      {activeSection === 'onchain' && (
        raydiumPool ? (
          <Card>
            <CardHeader>
              <CardTitle>Registro On-chain</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <p className="font-mono">
                <span className="font-semibold text-muted-foreground uppercase tracking-wide">Conta do Pool:</span>{' '}
                {shortenAddress(raydiumPool.publicKey.toBase58(), 6)}
              </p>
              <p className="font-mono">
                <span className="font-semibold text-muted-foreground uppercase tracking-wide">Administrador:</span>{' '}
                {shortenAddress(raydiumPool.admin.toBase58(), 6)}
              </p>
              <p className="font-mono">
                <span className="font-semibold text-muted-foreground uppercase tracking-wide">Token SRWA:</span>{' '}
                {tokenBMeta?.symbol ?? '—'} — {shortenAddress(raydiumPool.tokenMint.toBase58(), 6)}
              </p>
              <p className="font-mono">
                <span className="font-semibold text-muted-foreground uppercase tracking-wide">Token Base:</span>{' '}
                {tokenAMeta?.symbol ?? '—'} — {shortenAddress(raydiumPool.baseMint.toBase58(), 6)}
              </p>
              <p className="font-mono">
                <span className="font-semibold text-muted-foreground uppercase tracking-wide">Ativa:</span>{' '}
                {raydiumPool.isActive ? 'Sim' : 'Não'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Registro On-chain</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Nenhum registro on-chain encontrado para este pool.
              </p>
            </CardContent>
          </Card>
        )
      )}

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" size="sm" onClick={goToPrev} disabled={activeIndex === 0}>
          Anterior
        </Button>
        <Button variant="ghost" size="sm" onClick={goToNext} disabled={activeIndex === sections.length - 1}>
          Próximo
        </Button>
      </div>
    </div>
  );
}
