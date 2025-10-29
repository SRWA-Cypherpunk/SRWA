import { FormEvent, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TokenSelect } from './TokenSelect';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Keypair } from '@solana/web3.js';
import { toast } from 'sonner';
import { Loader2, ExternalLink, Info, Copy, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import { MarginfiClient, getConfig } from '@mrgnlabs/marginfi-client-v2';
import type { BankConfigOpt, RiskTier, OperationalState, OracleSetup } from '@mrgnlabs/marginfi-client-v2';
import BigNumber from 'bignumber.js';

type FormState = {
  // Token
  mint: string;

  // Group
  createNewGroup: boolean;
  existingGroup: string;

  // Oracle
  oracleSetup: 'None' | 'PythPushOracle' | 'SwitchboardV2';
  oraclePriceKey: string;
  oracleMaxAge: string;
  oracleMaxConfidence: string;

  // Risk Parameters
  riskTier: 'Collateral' | 'Isolated';
  operationalState: 'Operational' | 'Paused' | 'ReduceOnly';
  assetWeightInit: string;
  assetWeightMaint: string;
  liabilityWeightInit: string;
  liabilityWeightMaint: string;
  depositLimit: string;
  borrowLimit: string;

  // Interest Rate Config
  optimalUtilizationRate: string;
  plateauInterestRate: string;
  maxInterestRate: string;
  insuranceFeeFixedApr: string;
  insuranceIrFee: string;
  protocolFixedFeeApr: string;
  protocolIrFee: string;
  protocolOriginationFee: string;
};

// MarginFi Main Group na Devnet (oficial do SDK)
const MARGINFI_DEVNET_GROUP = '52NC7T3NTPFFwoxJDFk9mbKcA7675DJ39H1iPNz5RjSV';

const DEFAULT_FORM_STATE: FormState = {
  // Token
  mint: '',

  // Group
  createNewGroup: false, // Usar grupo existente por padrão
  existingGroup: MARGINFI_DEVNET_GROUP,

  // Oracle (Pyth SOL/USD devnet para teste - requerido!)
  oracleSetup: 'PythPushOracle',
  oraclePriceKey: 'J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix', // SOL/USD Pyth Devnet
  oracleMaxAge: '300', // 5 minutos
  oracleMaxConfidence: '5', // 5%

  // Risk Parameters (Isolated para Token-2022 RWA)
  riskTier: 'Isolated',
  operationalState: 'Operational',
  assetWeightInit: '0.75', // 75% LTV inicial
  assetWeightMaint: '0.80', // 80% LTV manutenção
  liabilityWeightInit: '1.25', // 125% liability weight
  liabilityWeightMaint: '1.20', // 120% liability weight
  depositLimit: '1000000', // 1M tokens
  borrowLimit: '500000', // 500K tokens

  // Interest Rate (Conservative rates para RWA)
  optimalUtilizationRate: '0.80', // 80%
  plateauInterestRate: '0.08', // 8% APR
  maxInterestRate: '0.30', // 30% APR máximo
  insuranceFeeFixedApr: '0',
  insuranceIrFee: '0',
  protocolFixedFeeApr: '0.01', // 1%
  protocolIrFee: '0.05', // 5%
  protocolOriginationFee: '0.001', // 0.1%
};

export function MarginFiBankCreator() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<{
    bankAddress: string;
    groupAddress: string;
    signature: string;
  } | null>(null);

  const updateForm = (updates: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!wallet.publicKey || !wallet.signTransaction) {
      toast.error('Conecte sua wallet primeiro');
      return;
    }

    if (!form.mint.trim()) {
      toast.error('Selecione um token SRWA');
      return;
    }

    if (!form.createNewGroup && !form.existingGroup.trim()) {
      toast.error('Informe o endereço do grupo existente');
      return;
    }

    setLoading(true);

    try {
      const mintPubkey = new PublicKey(form.mint.trim());

      toast.info('Inicializando MarginFi client...');

      // Initialize MarginFi Client
      const config = getConfig('dev'); // Devnet
      const marginfiClient = await MarginfiClient.fetch(config, wallet as any, connection);

      console.log('[MarginFiBankCreator] MarginFi client initialized');

      // Step 1: Use existing group (creating new groups requires special permissions)
      if (!form.existingGroup.trim()) {
        throw new Error('Informe o endereço do grupo MarginFi');
      }

      const groupAddress = new PublicKey(form.existingGroup.trim());
      console.log('[MarginFiBankCreator] Using group:', groupAddress.toBase58());

      toast.info('Usando grupo MarginFi devnet...');

      // Step 2: Get mint decimals
      toast.info('Verificando token mint...');

      const { getMint, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } = await import('@solana/spl-token');

      // Detect token program
      const mintAccountInfo = await connection.getAccountInfo(mintPubkey);
      if (!mintAccountInfo) {
        throw new Error('Token mint não encontrado');
      }

      const tokenProgram = mintAccountInfo.owner;
      console.log('[MarginFiBankCreator] Token program:', tokenProgram.toBase58());

      // Check if Token-2022
      if (tokenProgram.equals(TOKEN_2022_PROGRAM_ID)) {
        toast.error('❌ Token-2022 detectado!', {
          description: 'MarginFi ainda não suporta Token-2022 completamente. Use Orca ou Raydium.',
          duration: 15000,
        });
        throw new Error('MarginFi não suporta Token-2022 (SPL Token Extensions) no momento. Use Orca Whirlpools ou Raydium CLMM para criar pools com Token-2022.');
      }

      const mintInfo = await getMint(connection, mintPubkey, 'confirmed', tokenProgram);
      const decimals = mintInfo.decimals;

      console.log('[MarginFiBankCreator] Token decimals:', decimals);

      // Step 3: Build bank config
      toast.info('Configurando parâmetros do bank...');

      const bankConfig: BankConfigOpt = {
        // Risk weights
        assetWeightInit: new BigNumber(form.assetWeightInit),
        assetWeightMaint: new BigNumber(form.assetWeightMaint),
        liabilityWeightInit: new BigNumber(form.liabilityWeightInit),
        liabilityWeightMaint: new BigNumber(form.liabilityWeightMaint),

        // Limits (use actual decimals)
        depositLimit: new BigNumber(form.depositLimit).multipliedBy(new BigNumber(10).pow(decimals)),
        borrowLimit: new BigNumber(form.borrowLimit).multipliedBy(new BigNumber(10).pow(decimals)),
        totalAssetValueInitLimit: new BigNumber(0),

        // Risk tier
        riskTier: form.riskTier as RiskTier,

        // Oracle
        oracleMaxAge: parseInt(form.oracleMaxAge),
        oracleMaxConfidence: parseFloat(form.oracleMaxConfidence),

        // Interest rate config
        interestRateConfig: {
          optimalUtilizationRate: new BigNumber(form.optimalUtilizationRate),
          plateauInterestRate: new BigNumber(form.plateauInterestRate),
          maxInterestRate: new BigNumber(form.maxInterestRate),
          insuranceFeeFixedApr: new BigNumber(form.insuranceFeeFixedApr),
          insuranceIrFee: new BigNumber(form.insuranceIrFee),
          protocolFixedFeeApr: new BigNumber(form.protocolFixedFeeApr),
          protocolIrFee: new BigNumber(form.protocolIrFee),
          protocolOriginationFee: new BigNumber(form.protocolOriginationFee),
        },

        // State
        operationalState: form.operationalState as OperationalState,

        // Misc
        assetTag: null,
        permissionlessBadDebtSettlement: null,
      };

      console.log('[MarginFiBankCreator] Bank config:', bankConfig);

      // Step 4: Create bank usando createLendingPool (mais simples)
      toast.info('Criando lending pool no MarginFi...');

      console.log('[MarginFiBankCreator] Creating bank with params:', {
        mint: mintPubkey.toBase58(),
        group: groupAddress.toBase58(),
        admin: wallet.publicKey.toBase58(),
        tokenProgram: tokenProgram.toBase58(),
      });

      // Reload client to ensure we're using the correct group
      await marginfiClient.reload();

      const result = await marginfiClient.createLendingPool(
        mintPubkey,
        bankConfig
      );

      const signature = result.signature;
      const createdBankAddress = result.bankAddress.toBase58();

      toast.success('Bank MarginFi criado!');
      console.log('[MarginFiBankCreator] Bank created!', {
        signature,
        bankAddress: createdBankAddress,
      });

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      setResult({
        bankAddress: createdBankAddress,
        groupAddress: groupAddress.toBase58(),
        signature,
      });

      toast.success('🎉 Bank criado com sucesso!', {
        description: 'Configure o oracle manualmente se necessário',
        duration: 10000,
      });

    } catch (error: any) {
      console.error('[MarginFiBankCreator] Error:', error);

      let errorMsg = 'Erro ao criar bank';
      if (error.message?.includes('User rejected')) {
        errorMsg = 'Transação cancelada';
      } else if (error.message) {
        errorMsg = error.message;
      }

      toast.error(errorMsg, {
        duration: 10000,
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  return (
    <Card className="card-institutional">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-brand-400" />
          Criar Bank MarginFi (Devnet)
        </CardTitle>
        <CardDescription>
          Crie um isolated lending bank permissionless no MarginFi para seu token Token-2022
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Success Result */}
          {result && (
            <Alert className="bg-green-500/10 border-green-500/30">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription>
                <div className="space-y-3">
                  <p className="font-semibold text-green-200">✅ Bank criado com sucesso!</p>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 bg-background/50 rounded">
                      <div className="flex-1">
                        <span className="text-muted-foreground">Bank Address:</span>
                        <p className="font-mono mt-1 break-all">{result.bankAddress}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(result.bankAddress, 'Bank Address')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-background/50 rounded">
                      <div className="flex-1">
                        <span className="text-muted-foreground">Group Address:</span>
                        <p className="font-mono mt-1 break-all">{result.groupAddress}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(result.groupAddress, 'Group Address')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-background/50 rounded">
                      <div className="flex-1">
                        <span className="text-muted-foreground">Transaction:</span>
                        <a
                          href={`https://explorer.solana.com/tx/${result.signature}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-400 hover:underline font-mono block mt-1 break-all"
                        >
                          {result.signature.slice(0, 16)}...
                        </a>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://explorer.solana.com/tx/${result.signature}?cluster=devnet`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open('https://app.marginfi.com/?cluster=devnet', '_blank')}
                  >
                    Ver no MarginFi App
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Info Alerts */}
          <Alert className="bg-blue-500/10 border-blue-500/30 mb-4">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-sm">
              <strong>MarginFi Arena:</strong> Permite criar banks isolados (isolated groups) para qualquer token.
              Cada bank é independente e não afeta a main liquidity pool do MarginFi.
            </AlertDescription>
          </Alert>

          <Alert className="bg-amber-500/10 border-amber-500/30">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <AlertDescription className="text-xs">
              <strong>Oracle Obrigatório:</strong> MarginFi requer um oracle válido (Pyth ou Switchboard).
              Por padrão, usamos o Pyth SOL/USD devnet. Para seu token RWA, você precisará criar um feed customizado
              ou ajustar o oracle após a criação do bank.
            </AlertDescription>
          </Alert>

          {/* Token-2022 Warning */}
          <Alert className="bg-red-500/10 border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-xs">
              <strong>⚠️ Token-2022 Limitado:</strong> MarginFi ainda não tem suporte completo para Token-2022 (SPL Token Extensions).
              O processo pode falhar com erro "Reached maximum depth for account resolution".
              <br/><br/>
              <strong>Alternativas:</strong>
              <ul className="list-disc ml-4 mt-2">
                <li>Use Orca Whirlpools (suporte completo Token-2022)</li>
                <li>Use Raydium CLMM (suporte Token-2022)</li>
                <li>Aguarde suporte oficial do MarginFi</li>
              </ul>
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Token Selection */}
            <section className="space-y-4">
              <div className="space-y-2">
                <Label>Token SRWA (Token-2022)</Label>
                <TokenSelect
                  value={form.mint}
                  onValueChange={(value) => updateForm({ mint: value })}
                  placeholder="Selecione um token SRWA"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Token que será listado no lending bank do MarginFi
                </p>
              </div>
            </section>

            <Separator />

            {/* Group Configuration */}
            <section className="space-y-4">
              <Alert className="bg-blue-500/10 border-blue-500/30">
                <Info className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-xs">
                  <strong>Grupo MarginFi:</strong> Por padrão, usamos o grupo principal do MarginFi na devnet.
                  Criar novos grupos requer permissões especiais de admin. Se você tem seu próprio grupo,
                  pode alterar o endereço abaixo.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="existingGroup">MarginFi Group Address</Label>
                <Input
                  id="existingGroup"
                  placeholder="Endereço do MarginFi group (PublicKey)"
                  value={form.existingGroup}
                  onChange={(e) => updateForm({ existingGroup: e.target.value })}
                  disabled={loading}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Padrão: Grupo principal MarginFi devnet ({MARGINFI_DEVNET_GROUP.slice(0, 8)}...)
                </p>
              </div>
            </section>

            <Separator />

            {/* Oracle Configuration */}
            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Configuração de Oracle
                </h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="oracleSetup">Oracle Setup</Label>
                  <Select
                    value={form.oracleSetup}
                    onValueChange={(value: any) => updateForm({ oracleSetup: value })}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PythPushOracle">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-500/20">Recomendado</Badge>
                          <span>Pyth Push Oracle</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="SwitchboardV2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Alt</Badge>
                          <span>Switchboard V2</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Pyth Push Oracle é recomendado para devnet
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="oraclePriceKey">Oracle Price Account</Label>
                  <Input
                    id="oraclePriceKey"
                    placeholder="PublicKey do price feed"
                    value={form.oraclePriceKey}
                    onChange={(e) => updateForm({ oraclePriceKey: e.target.value })}
                    disabled={loading}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Padrão: SOL/USD Pyth Devnet (J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix)
                  </p>
                </div>
              </div>

              <Alert className="bg-amber-500/10 border-amber-500/30">
                <AlertCircle className="h-4 w-4 text-amber-400" />
                <AlertDescription className="text-xs">
                  <strong>Atenção:</strong> Para tokens RWA customizados, você pode usar o oracle SOL/USD como placeholder.
                  O preço será usado apenas para cálculos de collateral. Atualize o oracle para um feed customizado
                  após criar o bank, se necessário.
                </AlertDescription>
              </Alert>
            </section>

            <Separator />

            {/* Risk Configuration */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Parâmetros de Risco
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Configure LTV, limits e interest rates
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? 'Ocultar avançado' : 'Mostrar avançado'}
                </Button>
              </div>

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="limits">Limites</TabsTrigger>
                  <TabsTrigger value="interest">Juros</TabsTrigger>
                </TabsList>

                {/* Basic Tab */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="riskTier">Risk Tier</Label>
                      <Select
                        value={form.riskTier}
                        onValueChange={(value: any) => updateForm({ riskTier: value })}
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Isolated">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-amber-500/20">Safer</Badge>
                              <span>Isolated</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Collateral">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-blue-500/20">Standard</Badge>
                              <span>Collateral</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        "Isolated" = banco independente (recomendado para RWA)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="operationalState">Estado Operacional</Label>
                      <Select
                        value={form.operationalState}
                        onValueChange={(value: any) => updateForm({ operationalState: value })}
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Operational">Operational (Ativo)</SelectItem>
                          <SelectItem value="ReduceOnly">ReduceOnly (Apenas repagamentos)</SelectItem>
                          <SelectItem value="Paused">Paused (Pausado)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assetWeightInit">Asset Weight Init (LTV Inicial)</Label>
                      <Input
                        id="assetWeightInit"
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        placeholder="0.75"
                        value={form.assetWeightInit}
                        onChange={(e) => updateForm({ assetWeightInit: e.target.value })}
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">
                        75% = pode emprestar até 75% do valor do collateral
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assetWeightMaint">Asset Weight Maint (LTV Manutenção)</Label>
                      <Input
                        id="assetWeightMaint"
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        placeholder="0.80"
                        value={form.assetWeightMaint}
                        onChange={(e) => updateForm({ assetWeightMaint: e.target.value })}
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Threshold para liquidação (deve ser maior que Init)
                      </p>
                    </div>
                  </div>
                </TabsContent>

                {/* Limits Tab */}
                <TabsContent value="limits" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="depositLimit">Deposit Limit (tokens)</Label>
                      <Input
                        id="depositLimit"
                        type="number"
                        step="any"
                        placeholder="1000000"
                        value={form.depositLimit}
                        onChange={(e) => updateForm({ depositLimit: e.target.value })}
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Quantidade máxima de tokens que pode ser depositada
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="borrowLimit">Borrow Limit (tokens)</Label>
                      <Input
                        id="borrowLimit"
                        type="number"
                        step="any"
                        placeholder="500000"
                        value={form.borrowLimit}
                        onChange={(e) => updateForm({ borrowLimit: e.target.value })}
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Quantidade máxima que pode ser emprestada
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="liabilityWeightInit">Liability Weight Init</Label>
                      <Input
                        id="liabilityWeightInit"
                        type="number"
                        step="0.01"
                        min="1"
                        placeholder="1.25"
                        value={form.liabilityWeightInit}
                        onChange={(e) => updateForm({ liabilityWeightInit: e.target.value })}
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Peso do empréstimo (1.25 = 125% do valor emprestado)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="liabilityWeightMaint">Liability Weight Maint</Label>
                      <Input
                        id="liabilityWeightMaint"
                        type="number"
                        step="0.01"
                        min="1"
                        placeholder="1.20"
                        value={form.liabilityWeightMaint}
                        onChange={(e) => updateForm({ liabilityWeightMaint: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Interest Tab */}
                <TabsContent value="interest" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="optimalUtilizationRate">Optimal Utilization (0-1)</Label>
                      <Input
                        id="optimalUtilizationRate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        placeholder="0.80"
                        value={form.optimalUtilizationRate}
                        onChange={(e) => updateForm({ optimalUtilizationRate: e.target.value })}
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">
                        80% = ponto ótimo de utilização do pool
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="plateauInterestRate">Plateau Interest Rate (APR)</Label>
                      <Input
                        id="plateauInterestRate"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.08"
                        value={form.plateauInterestRate}
                        onChange={(e) => updateForm({ plateauInterestRate: e.target.value })}
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">
                        8% = taxa no ponto ótimo (0.08 = 8% APR)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxInterestRate">Max Interest Rate (APR)</Label>
                      <Input
                        id="maxInterestRate"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.30"
                        value={form.maxInterestRate}
                        onChange={(e) => updateForm({ maxInterestRate: e.target.value })}
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">
                        30% = taxa máxima quando pool está sobreutilizado
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="protocolFixedFeeApr">Protocol Fixed Fee (APR)</Label>
                      <Input
                        id="protocolFixedFeeApr"
                        type="number"
                        step="0.001"
                        min="0"
                        placeholder="0.01"
                        value={form.protocolFixedFeeApr}
                        onChange={(e) => updateForm({ protocolFixedFeeApr: e.target.value })}
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">
                        1% = fee fixo do protocolo
                      </p>
                    </div>
                  </div>

                  {showAdvanced && (
                    <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">
                        Fees Avançados
                      </h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="protocolIrFee">Protocol IR Fee</Label>
                          <Input
                            id="protocolIrFee"
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.protocolIrFee}
                            onChange={(e) => updateForm({ protocolIrFee: e.target.value })}
                            disabled={loading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="protocolOriginationFee">Origination Fee</Label>
                          <Input
                            id="protocolOriginationFee"
                            type="number"
                            step="0.001"
                            min="0"
                            value={form.protocolOriginationFee}
                            onChange={(e) => updateForm({ protocolOriginationFee: e.target.value })}
                            disabled={loading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="insuranceFeeFixedApr">Insurance Fixed Fee</Label>
                          <Input
                            id="insuranceFeeFixedApr"
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.insuranceFeeFixedApr}
                            onChange={(e) => updateForm({ insuranceFeeFixedApr: e.target.value })}
                            disabled={loading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="insuranceIrFee">Insurance IR Fee</Label>
                          <Input
                            id="insuranceIrFee"
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.insuranceIrFee}
                            onChange={(e) => updateForm({ insuranceIrFee: e.target.value })}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </section>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading || !wallet.connected || !form.mint}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando Bank...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Criar Bank MarginFi
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => window.open('https://docs.marginfi.com/the-arena', '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Docs
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
