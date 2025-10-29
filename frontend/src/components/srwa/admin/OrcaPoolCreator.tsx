import { FormEvent, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TokenSelect } from './TokenSelect';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRaydiumPools } from '@/hooks/solana/useRaydiumPools';
import { useOrcaWhirlpools } from '@/hooks/orca/useOrcaWhirlpools';
import { PublicKey } from '@solana/web3.js';
import { toast } from 'sonner';
import {
  Loader2,
  ExternalLink,
  Info,
  Copy,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Droplet,
  Waves
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type FormState = {
  tokenMint: string;
  baseMint: string;
  initialPrice: string;
  tokenAmount: string;
  solAmount: string;
  feeTier: 'stable' | 'standard' | 'volatile';
};

const DEFAULT_FORM_STATE: FormState = {
  tokenMint: '',
  baseMint: 'So11111111111111111111111111111111111111112', // wSOL
  initialPrice: '0.001',
  tokenAmount: '1000',
  solAmount: '1',
  feeTier: 'standard',
};

const FEE_TIERS = {
  stable: { label: '0.01%', value: 'stable', description: 'Para pares estáveis (stablecoins)' },
  standard: { label: '0.3%', value: 'standard', description: 'Para a maioria dos pares' },
  volatile: { label: '1%', value: 'volatile', description: 'Para pares muito voláteis' },
};

export function OrcaPoolCreator() {
  const { publicKey } = useWallet();
  const { registerPool } = useRaydiumPools();
  const { createWhirlpool } = useOrcaWhirlpools();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [poolAddress, setPoolAddress] = useState('');
  const [transactionSignature, setTransactionSignature] = useState('');
  const [step, setStep] = useState<'form' | 'created' | 'register'>('form');
  const [registered, setRegistered] = useState(false);

  const updateForm = (updates: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const handleCreatePool = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.tokenMint.trim()) {
      toast.error('Selecione um token SRWA');
      return;
    }

    if (!publicKey) {
      toast.error('Conecte sua wallet');
      return;
    }

    const price = parseFloat(form.initialPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Preço inicial inválido');
      return;
    }

    setLoading(true);
    try {
      const tokenMintPubkey = new PublicKey(form.tokenMint);
      const baseMintPubkey = new PublicKey(form.baseMint);

      toast.info('Criando pool no Orca Whirlpools...', {
        description: 'Aguarde a confirmação na sua wallet',
      });

      // Criar a pool usando o SDK
      const result = await createWhirlpool(
        tokenMintPubkey,
        baseMintPubkey,
        price,
        form.feeTier
      );

      setPoolAddress(result.poolAddress);
      setTransactionSignature(result.txId);
      setStep('created');

      toast.success('Pool criada com sucesso!', {
        description: `Pool ID: ${result.poolAddress.slice(0, 8)}...`,
      });
    } catch (error: any) {
      console.error('[OrcaPoolCreator] Failed to create pool:', error);
      toast.error('Erro ao criar pool', {
        description: error.message || 'Erro desconhecido',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!poolAddress.trim()) {
      toast.error('Informe o Pool Address');
      return;
    }

    if (!publicKey) {
      toast.error('Conecte sua wallet');
      return;
    }

    setLoading(true);
    try {
      const poolIdPubkey = new PublicKey(poolAddress.trim());
      const tokenMintPubkey = new PublicKey(form.tokenMint);
      const baseMintPubkey = new PublicKey(form.baseMint);

      await registerPool(poolIdPubkey, tokenMintPubkey, baseMintPubkey);

      toast.success('Pool registrada com sucesso!', {
        description: 'A pool agora aparecerá no dashboard de mercados.',
      });

      setRegistered(true);
    } catch (error: any) {
      console.error('[OrcaPoolCreator] Failed to register pool:', error);
      toast.error('Erro ao registrar pool: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(DEFAULT_FORM_STATE);
    setPoolAddress('');
    setStep('form');
    setRegistered(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  if (step === 'register') {
    return (
      <Card className="card-institutional">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Droplet className="h-5 w-5 text-brand-400" />
                Registrar Pool Orca
              </CardTitle>
              <CardDescription>
                Registre uma pool criada manualmente no Orca.so
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Voltar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-blue-500/10 border-blue-500/30">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-sm">
              Após criar sua pool no Orca.so, copie o endereço da pool e cole abaixo para registrá-la no sistema.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="poolAddress">Pool Address</Label>
              <Input
                id="poolAddress"
                placeholder="Endereço da pool criada no Orca"
                value={poolAddress}
                onChange={(e) => setPoolAddress(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Cole o endereço da pool que você criou no Orca.so
              </p>
            </div>

            <div className="space-y-2">
              <Label>Token SRWA (Token A)</Label>
              <TokenSelect
                value={form.tokenMint}
                onValueChange={(value) => updateForm({ tokenMint: value })}
                placeholder="Selecione o token SRWA usado"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseMint">Token Base (Token B)</Label>
              <Input
                id="baseMint"
                placeholder="Endereço do token base"
                value={form.baseMint}
                onChange={(e) => updateForm({ baseMint: e.target.value })}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.open('https://www.orca.so/pools?network=devnet', '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Ir para Orca.so
            </Button>
            <Button
              onClick={handleRegister}
              disabled={loading || !poolAddress.trim() || !form.tokenMint}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Registrar Pool
                </>
              )}
            </Button>
          </div>

          {registered && (
            <Alert className="bg-green-500/10 border-green-500/30">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-sm text-green-200">
                ✅ Pool registrada com sucesso! Agora ela aparecerá no dashboard de mercados.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  if (step === 'created') {
    return (
      <Card className="card-institutional">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                Pool Criada com Sucesso!
              </CardTitle>
              <CardDescription>
                Sua pool Orca está ativa na blockchain
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Criar Outra
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-green-500/10 border-green-500/30">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-sm">
              ✅ Pool criada e registrada na blockchain Solana (Devnet)
            </AlertDescription>
          </Alert>

          {/* Pool Info */}
          <Card className="border-2 border-brand-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informações da Pool</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Pool Address</Label>
                  <p className="font-mono text-sm mt-1 break-all">{poolAddress}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(poolAddress, 'Pool Address')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {transactionSignature && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Transaction</Label>
                    <p className="font-mono text-xs mt-1 break-all">{transactionSignature}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted rounded-lg">
                  <Label className="text-xs text-muted-foreground">Preço Inicial</Label>
                  <p className="text-sm mt-1">{form.initialPrice} SOL</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <Label className="text-xs text-muted-foreground">Fee Tier</Label>
                  <p className="text-sm mt-1">{FEE_TIERS[form.feeTier].label}</p>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => window.open(`https://www.orca.so/pools?address=${poolAddress}`, '_blank')}
              >
                Ver Pool no Orca.so
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Registrar no Sistema */}
          <Card className="border-2 border-brand-500/30 bg-brand-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Registrar Pool no Sistema</CardTitle>
              <CardDescription className="text-xs">
                Registre a pool para que apareça no dashboard de mercados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {registered ? (
                <Alert className="bg-green-500/10 border-green-500/30">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-sm text-green-200">
                    ✅ Pool registrada com sucesso! Agora ela aparecerá no dashboard de mercados.
                  </AlertDescription>
                </Alert>
              ) : (
                <Button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Registrar Pool no Sistema
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-institutional">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplet className="h-5 w-5 text-brand-400" />
          Criar Pool Orca Whirlpools (Token-2022)
        </CardTitle>
        <CardDescription>
          Crie uma pool de liquidez concentrada programaticamente via Orca SDK
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreatePool} className="space-y-6">
          <Alert className="bg-blue-500/10 border-blue-500/30">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-sm">
              <strong>Criação Manual:</strong> Devido a limitações do SDK, a criação de pools é feita
              manualmente no site do Orca. Orca Whirlpools tem suporte COMPLETO para Token-2022!
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Token SRWA (Token A)</Label>
              <TokenSelect
                value={form.tokenMint}
                onValueChange={(value) => updateForm({ tokenMint: value })}
                placeholder="Selecione um token SRWA"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Selecione qual token RWA você quer adicionar na pool
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseMint">Token Base (Token B)</Label>
              <Input
                id="baseMint"
                placeholder="Endereço do token base"
                value={form.baseMint}
                onChange={(e) => updateForm({ baseMint: e.target.value })}
                disabled={loading}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Token de par (padrão: wSOL)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feeTier">Fee Tier</Label>
              <Select
                value={form.feeTier}
                onValueChange={(value: any) => updateForm({ feeTier: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FEE_TIERS).map(([key, tier]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {tier.label}
                        </Badge>
                        <span className="text-sm">{tier.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Taxa de swap que será cobrada nas transações
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="initialPrice">Preço Inicial (SOL por token)</Label>
                <Input
                  id="initialPrice"
                  type="number"
                  step="any"
                  placeholder="0.001"
                  value={form.initialPrice}
                  onChange={(e) => updateForm({ initialPrice: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tokenAmount">Quantidade Token (sugestão)</Label>
                <Input
                  id="tokenAmount"
                  type="number"
                  step="any"
                  placeholder="1000"
                  value={form.tokenAmount}
                  onChange={(e) => updateForm({ tokenAmount: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <Alert className="bg-amber-500/10 border-amber-500/30">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <AlertDescription className="text-xs">
              <strong>Como funciona:</strong>
              <ol className="list-decimal ml-4 mt-2 space-y-1">
                <li>Clique em "Ir para Orca.so" abaixo</li>
                <li>Conecte sua wallet e crie a pool com seus tokens</li>
                <li>Copie o endereço da pool criada</li>
                <li>Volte aqui e clique em "Registrar Pool"</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="default"
              className="flex-1"
              onClick={() => window.open(`https://www.orca.so/pools?network=devnet`, '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Ir para Orca.so
            </Button>
            <Button
              type="submit"
              variant="outline"
              className="flex-1"
              disabled={!publicKey}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Registrar Pool
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
