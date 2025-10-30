import { FormEvent, useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useSolendPoolCreator } from '@/integrations/solend/useSolendPoolCreator';
import { TokenSelect } from './TokenSelect';
import {
  NULL_ORACLE,
  PYTH_DEVNET_PROGRAM_ID,
  PYTH_SOL_USD_DEVNET,
  SWITCHBOARD_DEVNET_PROGRAM_ID,
  SOLEND_DEVNET_PROGRAM_ID,
} from '@/integrations/solend/constants';
import { U64_MAX } from '@/integrations/solend/utils';
import type { CreateSolendPoolInput } from '@/integrations/solend/types';
import { toast } from 'sonner';
import { Loader2, ExternalLink } from 'lucide-react';

type RiskFormState = {
  optimalUtilizationRate: string;
  maxUtilizationRate: string;
  loanToValueRatio: string;
  liquidationThreshold: string;
  maxLiquidationThreshold: string;
  liquidationBonus: string;
  maxLiquidationBonus: string;
  minBorrowRate: string;
  optimalBorrowRate: string;
  maxBorrowRate: string;
  superMaxBorrowRate: string;
  protocolLiquidationFee: string;
  protocolTakeRate: string;
  addedBorrowWeightBps: string;
  scaledPriceOffsetBps: string;
  extraOracle: string;
  depositLimit: string;
  borrowLimit: string;
  attributedBorrowLimitOpen: string;
  attributedBorrowLimitClose: string;
};

type FormState = {
  market: {
    createNewMarket: boolean;
    quoteCurrency: string;
    oracleProgramId: string;
    switchboardProgramId: string;
    existingMarket: string;
  };
  reserve: {
    liquidityMint: string;
    initialLiquidity: string;
    pythPriceAccount: string;
    pythProductAccount: string;
    switchboardFeed: string;
    feeReceiver: string;
    useNullOracle: boolean;
    risk: RiskFormState;
  };
};

// HARDCODED: wSOL (Wrapped SOL) como token de teste na devnet
const WSOL_MINT_DEVNET = 'So11111111111111111111111111111111111111112';

const DEFAULT_FORM_STATE: FormState = {
  market: {
    createNewMarket: true,
    quoteCurrency: 'USD',
    oracleProgramId: PYTH_DEVNET_PROGRAM_ID.toBase58(),
    switchboardProgramId: SWITCHBOARD_DEVNET_PROGRAM_ID.toBase58(),
    existingMarket: '',
  },
  reserve: {
    liquidityMint: WSOL_MINT_DEVNET, // HARDCODED: wSOL
    initialLiquidity: '0.1', // HARDCODED: 0.1 SOL inicial (menor para teste)
    pythProductAccount: NULL_ORACLE.toBase58(), // NULL
    pythPriceAccount: NULL_ORACLE.toBase58(), // NULL
    switchboardFeed: '', // SERÁ PREENCHIDO: Você precisa criar um feed com o script
    feeReceiver: '',
    useNullOracle: false, // Usar Switchboard feed
    risk: {
      optimalUtilizationRate: '80',
      maxUtilizationRate: '95',
      loanToValueRatio: '70',
      liquidationThreshold: '85',
      maxLiquidationThreshold: '90',
      liquidationBonus: '8',
      maxLiquidationBonus: '10',
      minBorrowRate: '0',
      optimalBorrowRate: '6',
      maxBorrowRate: '45',
      superMaxBorrowRate: '60',
      protocolLiquidationFee: '0',
      protocolTakeRate: '0',
      addedBorrowWeightBps: '0',
      scaledPriceOffsetBps: '0',
      extraOracle: '',
      depositLimit: U64_MAX.toString(),
      borrowLimit: U64_MAX.toString(),
      attributedBorrowLimitOpen: '0',
      attributedBorrowLimitClose: '0',
    },
  },
};

function parsePercentage(label: string, value: string, options?: { min?: number; max?: number }) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`O campo ${label} precisa ser numérico`);
  }
  if (options?.min !== undefined && parsed < options.min) {
    throw new Error(`O campo ${label} deve ser >= ${options.min}`);
  }
  if (options?.max !== undefined && parsed > options.max) {
    throw new Error(`O campo ${label} deve ser <= ${options.max}`);
  }
  return parsed;
}

export function SolendPoolCreator() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM_STATE);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { createPool, loading, lastResult } = useSolendPoolCreator();

  const resetForm = () => {
    setForm(DEFAULT_FORM_STATE);
  };

  const updateMarket = (patch: Partial<FormState['market']>) => {
    setForm((prev) => ({ ...prev, market: { ...prev.market, ...patch } }));
  };

  const updateReserve = (patch: Partial<FormState['reserve']>) => {
    setForm((prev) => ({ ...prev, reserve: { ...prev.reserve, ...patch } }));
  };

  const updateRisk = (patch: Partial<RiskFormState>) => {
    setForm((prev) => ({
      ...prev,
      reserve: {
        ...prev.reserve,
        risk: { ...prev.reserve.risk, ...patch },
      },
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.reserve.liquidityMint.trim()) {
      toast.error('Enter the SPL mint of the SRWA token to be listed on Solend');
      return;
    }
    if (!form.reserve.initialLiquidity.trim() || Number(form.reserve.initialLiquidity) <= 0) {
      toast.error('Informe o montante inicial de liquidez a ser depositado');
      return;
    }

    // HARDCODED: Usar NULL_ORACLE (modo teste)
    toast.info('✅ Using NULL_ORACLE (test mode - pool without price validation)');

    if (!form.market.createNewMarket && !form.market.existingMarket.trim()) {
      toast.error('Enter the lending market address you want to reuse');
      return;
    }

    try {
      const risk = form.reserve.risk;

      const parsedRiskConfig = {
        optimalUtilizationRate: parsePercentage('Optimal Utilization', risk.optimalUtilizationRate, { min: 0, max: 100 }),
        maxUtilizationRate: parsePercentage('Max Utilization', risk.maxUtilizationRate, { min: 0, max: 100 }),
        loanToValueRatio: parsePercentage('Loan to Value', risk.loanToValueRatio, { min: 0, max: 99 }),
        liquidationThreshold: parsePercentage('Liquidation Threshold', risk.liquidationThreshold, { min: 1, max: 100 }),
        maxLiquidationThreshold: parsePercentage('Max Liquidation Threshold', risk.maxLiquidationThreshold, { min: 1, max: 100 }),
        liquidationBonus: parsePercentage('Liquidation Bonus', risk.liquidationBonus, { min: 0, max: 100 }),
        maxLiquidationBonus: parsePercentage('Max Liquidation Bonus', risk.maxLiquidationBonus, { min: 0, max: 100 }),
        minBorrowRate: parsePercentage('Min Borrow Rate', risk.minBorrowRate, { min: 0, max: 100 }),
        optimalBorrowRate: parsePercentage('Optimal Borrow Rate', risk.optimalBorrowRate, { min: 0, max: 150 }),
        maxBorrowRate: parsePercentage('Max Borrow Rate', risk.maxBorrowRate, { min: 0, max: 300 }),
        superMaxBorrowRate: parsePercentage('Super Max Borrow Rate', risk.superMaxBorrowRate, { min: 0 }),
        protocolLiquidationFee: parsePercentage('Protocol Liquidation Fee', risk.protocolLiquidationFee, { min: 0, max: 100 }),
        protocolTakeRate: parsePercentage('Protocol Take Rate', risk.protocolTakeRate, { min: 0, max: 100 }),
        addedBorrowWeightBps: risk.addedBorrowWeightBps.trim() || '0',
        scaledPriceOffsetBps: risk.scaledPriceOffsetBps.trim() || '0',
        extraOracle: risk.extraOracle.trim() || undefined,
        attributedBorrowLimitOpen: risk.attributedBorrowLimitOpen.trim() || '0',
        attributedBorrowLimitClose: risk.attributedBorrowLimitClose.trim() || '0',
        depositLimit: risk.depositLimit.trim() || U64_MAX.toString(),
        borrowLimit: risk.borrowLimit.trim() || U64_MAX.toString(),
      };

      if (parsedRiskConfig.liquidationThreshold < parsedRiskConfig.loanToValueRatio) {
        toast.error('A liquidation threshold deve ser maior ou igual ao Loan to Value (LTV).');
        return;
      }
      if (parsedRiskConfig.maxLiquidationThreshold < parsedRiskConfig.liquidationThreshold) {
        toast.error('A max liquidation threshold deve ser maior ou igual à liquidation threshold.');
        return;
      }

      const payload: CreateSolendPoolInput = {
        market: {
          createNewMarket: form.market.createNewMarket,
          quoteCurrency: form.market.quoteCurrency.trim() || 'USD',
          oracleProgramId: form.market.oracleProgramId.trim(),
          switchboardProgramId: form.market.switchboardProgramId.trim(),
          existingMarket: form.market.createNewMarket
            ? undefined
            : form.market.existingMarket.trim(),
        },
        reserve: {
          liquidityMint: form.reserve.liquidityMint.trim(),
          initialLiquidity: form.reserve.initialLiquidity.trim(),
          pythProductAccount: NULL_ORACLE.toBase58(), // HARDCODED: NULL_ORACLE
          pythPriceAccount: NULL_ORACLE.toBase58(), // HARDCODED: NULL_ORACLE
          switchboardFeed: NULL_ORACLE.toBase58(), // HARDCODED: NULL_ORACLE
          feeReceiver: form.reserve.feeReceiver?.trim() || undefined,
          riskConfig: parsedRiskConfig,
        },
      };

      const result = await createPool(payload);
      toast.success('Pool Solend criado com sucesso na devnet!');
      if (result) {
        updateReserve({ initialLiquidity: DEFAULT_FORM_STATE.reserve.initialLiquidity });
      }
    } catch (error: any) {
      if (error?.message) {
        toast.error(error.message);
      }
    }
  };

  const switchboardPlaceholder = useMemo(() => NULL_ORACLE.toBase58(), []);

  return (
    <Card className="card-institutional">
      <CardHeader>
        <CardTitle>Integração Solend (Devnet)</CardTitle>
        <CardDescription>
          Crie um lending market e reserve permissionado na Solend devnet para listar tokens SRWA.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-start justify-between rounded-lg border border-border/50 bg-muted/30 p-4">
                <div className="space-y-1">
                  <Label>Implantar novo lending market</Label>
                  <p className="text-xs text-muted-foreground">
                    Desative para reutilizar um market existente (isolated pool) que já controla.
                  </p>
                </div>
                <Switch
                  checked={form.market.createNewMarket}
                  onCheckedChange={(checked) => updateMarket({ createNewMarket: checked })}
                />
              </div>

              {form.market.createNewMarket ? (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Quote Currency</Label>
                    <Input
                      value={form.market.quoteCurrency}
                      maxLength={32}
                      onChange={(event) => updateMarket({ quoteCurrency: event.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Identificador de 32 bytes (ex: USD)</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Oracle Program (Pyth)</Label>
                    <Input
                      value={form.market.oracleProgramId}
                      onChange={(event) => updateMarket({ oracleProgramId: event.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Endereço do programa Pyth que será usado como oracle primário.
                    </p>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <Label>Switchboard Program</Label>
                    <Input
                      value={form.market.switchboardProgramId}
                      onChange={(event) =>
                        updateMarket({ switchboardProgramId: event.target.value })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Programa Switchboard opcional. Use o valor padrão ou ajuste conforme feed customizado.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Lending Market existente</Label>
                  <Input
                    placeholder="Market address (PublicKey)"
                    value={form.market.existingMarket}
                    onChange={(event) => updateMarket({ existingMarket: event.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Informe um market Solend já criado (devnet) no qual você possui permissão de owner.
                  </p>
                </div>
              )}
            </section>

            <Separator />

            <section className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Token SRWA</Label>
                <TokenSelect
                  value={form.reserve.liquidityMint}
                  onValueChange={(value) => updateReserve({ liquidityMint: value })}
                  placeholder="Selecione um token SRWA"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Selecione qual token RWA você quer listar no pool de lending
                </p>
              </div>
              <div className="space-y-2">
                <Label>Liquidez inicial (tokens)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={form.reserve.initialLiquidity}
                  onChange={(event) => updateReserve({ initialLiquidity: event.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Quantidade de tokens SRWA que será depositada na reserva ao criar o pool.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Pyth Price Account</Label>
                <Input
                  placeholder={form.reserve.useNullOracle ? NULL_ORACLE.toBase58() + " (NULL ORACLE)" : "Pyth price account"}
                  value={form.reserve.useNullOracle ? NULL_ORACLE.toBase58() : form.reserve.pythPriceAccount}
                  onChange={(event) => updateReserve({ pythPriceAccount: event.target.value })}
                  disabled={form.reserve.useNullOracle}
                />
              </div>
              <div className="space-y-2">
                <Label>Pyth Product Account</Label>
                <Input
                  placeholder={form.reserve.useNullOracle ? NULL_ORACLE.toBase58() + " (NULL ORACLE)" : "Conta de produto Pyth associada"}
                  value={form.reserve.useNullOracle ? NULL_ORACLE.toBase58() : form.reserve.pythProductAccount}
                  onChange={(event) => updateReserve({ pythProductAccount: event.target.value })}
                  disabled={form.reserve.useNullOracle}
                />
                <p className="text-xs text-muted-foreground">
                  {form.reserve.useNullOracle ? 'Oráculos desabilitados - usando NULL ORACLE para testes' : 'Contas de produto e preço estão documentadas no repositório da Pyth para devnet/mainnet.'}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Switchboard Feed (opcional)</Label>
                <Input
                  placeholder={form.reserve.useNullOracle ? NULL_ORACLE.toBase58() + " (NULL ORACLE)" : switchboardPlaceholder}
                  value={form.reserve.useNullOracle ? NULL_ORACLE.toBase58() : form.reserve.switchboardFeed}
                  onChange={(event) => updateReserve({ switchboardFeed: event.target.value })}
                  disabled={form.reserve.useNullOracle}
                />
                <p className="text-xs text-muted-foreground">
                  {form.reserve.useNullOracle ? 'Switchboard desabilitado - usando NULL ORACLE para testes' : `Caso não utilize Switchboard, deixe em branco (usaremos ${NULL_ORACLE.toBase58()}).`}
                </p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Conta SPL para receber fees (opcional)</Label>
                <Input
                  placeholder="Default: ATA da carteira administradora"
                  value={form.reserve.feeReceiver}
                  onChange={(event) => updateReserve({ feeReceiver: event.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Se vazio, usaremos a ATA do token SRWA da carteira atual para receber as taxas do pool.
                </p>
              </div>
            </section>

            <Separator />

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Parâmetros de Risco
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Configure limites de LTV, faixas de juros e bônus de liquidação.
                  </p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdvanced((prev) => !prev)}>
                  {showAdvanced ? 'Ocultar avançado' : 'Mostrar avançado'}
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <RiskInput
                  label="Optimal Utilization %"
                  value={form.reserve.risk.optimalUtilizationRate}
                  onChange={(value) => updateRisk({ optimalUtilizationRate: value })}
                />
                <RiskInput
                  label="Max Utilization %"
                  value={form.reserve.risk.maxUtilizationRate}
                  onChange={(value) => updateRisk({ maxUtilizationRate: value })}
                />
                <RiskInput
                  label="Loan to Value %"
                  value={form.reserve.risk.loanToValueRatio}
                  onChange={(value) => updateRisk({ loanToValueRatio: value })}
                />
                <RiskInput
                  label="Liquidation Threshold %"
                  value={form.reserve.risk.liquidationThreshold}
                  onChange={(value) => updateRisk({ liquidationThreshold: value })}
                />
                <RiskInput
                  label="Max Liquidation Threshold %"
                  value={form.reserve.risk.maxLiquidationThreshold}
                  onChange={(value) => updateRisk({ maxLiquidationThreshold: value })}
                />
                <RiskInput
                  label="Liquidation Bonus %"
                  value={form.reserve.risk.liquidationBonus}
                  onChange={(value) => updateRisk({ liquidationBonus: value })}
                />
                <RiskInput
                  label="Max Liquidation Bonus %"
                  value={form.reserve.risk.maxLiquidationBonus}
                  onChange={(value) => updateRisk({ maxLiquidationBonus: value })}
                />
                <RiskInput
                  label="Min Borrow APY %"
                  value={form.reserve.risk.minBorrowRate}
                  onChange={(value) => updateRisk({ minBorrowRate: value })}
                />
                <RiskInput
                  label="Optimal Borrow APY %"
                  value={form.reserve.risk.optimalBorrowRate}
                  onChange={(value) => updateRisk({ optimalBorrowRate: value })}
                />
                <RiskInput
                  label="Max Borrow APY %"
                  value={form.reserve.risk.maxBorrowRate}
                  onChange={(value) => updateRisk({ maxBorrowRate: value })}
                />
                <RiskInput
                  label="Super Max Borrow APY %"
                  value={form.reserve.risk.superMaxBorrowRate}
                  onChange={(value) => updateRisk({ superMaxBorrowRate: value })}
                />
                <RiskInput
                  label="Protocol Liquidation Fee %"
                  value={form.reserve.risk.protocolLiquidationFee}
                  onChange={(value) => updateRisk({ protocolLiquidationFee: value })}
                />
                <RiskInput
                  label="Protocol Take Rate %"
                  value={form.reserve.risk.protocolTakeRate}
                  onChange={(value) => updateRisk({ protocolTakeRate: value })}
                />
              </div>

              {showAdvanced && (
                <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                    Parâmetros Avançados
                  </h4>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <RiskInput
                      label="Deposit Limit (u64)"
                      value={form.reserve.risk.depositLimit}
                      onChange={(value) => updateRisk({ depositLimit: value })}
                    />
                    <RiskInput
                      label="Borrow Limit (u64)"
                      value={form.reserve.risk.borrowLimit}
                      onChange={(value) => updateRisk({ borrowLimit: value })}
                    />
                    <RiskInput
                      label="Added Borrow Weight BPS"
                      value={form.reserve.risk.addedBorrowWeightBps}
                      onChange={(value) => updateRisk({ addedBorrowWeightBps: value })}
                    />
                    <RiskInput
                      label="Scaled Price Offset BPS"
                      value={form.reserve.risk.scaledPriceOffsetBps}
                      onChange={(value) => updateRisk({ scaledPriceOffsetBps: value })}
                    />
                    <RiskInput
                      label="Extra Oracle (opcional)"
                      value={form.reserve.risk.extraOracle}
                      onChange={(value) => updateRisk({ extraOracle: value })}
                    />
                    <RiskInput
                      label="Attributed Borrow Limit Open"
                      value={form.reserve.risk.attributedBorrowLimitOpen}
                      onChange={(value) => updateRisk({ attributedBorrowLimitOpen: value })}
                    />
                    <RiskInput
                      label="Attributed Borrow Limit Close"
                      value={form.reserve.risk.attributedBorrowLimitClose}
                      onChange={(value) => updateRisk({ attributedBorrowLimitClose: value })}
                    />
                  </div>
                </div>
              )}
            </section>

            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                className="btn-primary w-full text-lg py-6"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Criando Pool na Solend Devnet...
                  </>
                ) : (
                  '🚀 Criar Pool Solend (wSOL - Modo Teste)'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>
                Limpar
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="gap-2 text-muted-foreground"
                onClick={() =>
                  window.open(
                    'https://github.com/solendprotocol/solana-program-library/tree/mainnet/token-lending',
                    '_blank'
                  )
                }
              >
                Documentação Solend
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {lastResult && (
            <div className="space-y-4 rounded-lg border border-border/40 bg-muted/10 p-4">
              <div>
                <h4 className="text-sm font-semibold uppercase text-muted-foreground">
                  Resultado da implantação
                </h4>
                <p className="text-xs text-muted-foreground">
                  Endereços úteis para interagir com o pool recém-criado.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <ResultField label="Lending Market" value={lastResult.marketPubkey.toBase58()} />
                <ResultField label="Market Authority PDA" value={lastResult.marketAuthority.toBase58()} />
                <ResultField label="Reserve" value={lastResult.reservePubkey.toBase58()} />
                <ResultField label="Collateral Mint" value={lastResult.reserveAccounts.collateralMint.toBase58()} />
                <ResultField label="Collateral Supply" value={lastResult.reserveAccounts.collateralSupply.toBase58()} />
                <ResultField label="Liquidity Supply" value={lastResult.reserveAccounts.liquiditySupply.toBase58()} />
                <ResultField label="Fee Receiver" value={lastResult.reserveAccounts.liquidityFeeReceiver.toBase58()} />
              </div>
              <div className="space-y-2">
                <Label>Transactions</Label>
                <ul className="list-disc space-y-1 pl-6 text-xs font-mono text-muted-foreground">
                  {lastResult.signatures.map((sig) => (
                    <li key={sig}>{sig}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface RiskInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function RiskInput({ label, value, onChange }: RiskInputProps) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

interface ResultFieldProps {
  label: string;
  value: string;
}

function ResultField({ label, value }: ResultFieldProps) {
  return (
    <div className="space-y-1 rounded-lg border border-border/40 bg-background/60 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="break-all font-mono text-xs text-foreground">{value}</p>
    </div>
  );
}
