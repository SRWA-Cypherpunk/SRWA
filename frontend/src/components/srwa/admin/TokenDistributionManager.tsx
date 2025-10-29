import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Send, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTokenDistribution } from '@/hooks/solana/useTokenDistribution';

/**
 * Token Distribution Manager
 *
 * Permite distribuição direta de Token-2022 RWA para investidores KYC'd
 *
 * IMPORTANTE:
 * - Este componente trabalha COM seu Transfer Hook de KYC
 * - A validação KYC acontece automaticamente na transferência
 * - Se o destinatário não tem KYC, o Transfer Hook bloqueará a transação
 *
 * FLUXO:
 * 1. Admin seleciona token RWA (Token-2022)
 * 2. Insere endereço do investidor
 * 3. Define quantidade
 * 4. Transfer Hook valida KYC automaticamente
 * 5. Se KYC OK: transferência é concluída
 * 6. Se KYC falha: Transfer Hook rejeita
 */
export function TokenDistributionManager() {
  const { publicKey, connected } = useWallet();
  const { distributeTokens } = useTokenDistribution();

  const [tokenMint, setTokenMint] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isDistributing, setIsDistributing] = useState(false);

  const handleDistribute = async () => {
    if (!connected || !publicKey) {
      toast.error('Conecte sua carteira primeiro');
      return;
    }

    if (!tokenMint || !recipientAddress || !amount) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      setIsDistributing(true);

      // Validar endereços
      const mintPubkey = new PublicKey(tokenMint);
      const recipientPubkey = new PublicKey(recipientAddress);
      const amountNum = parseFloat(amount);

      if (isNaN(amountNum) || amountNum <= 0) {
        toast.error('Quantidade inválida');
        return;
      }

      // Executar distribuição
      const result = await distributeTokens(mintPubkey, recipientPubkey, amountNum);

      if (result.success) {
        toast.success('✅ Distribuição concluída!', {
          description: `${amount} tokens enviados para ${recipientAddress.substring(0, 8)}...`,
          action: result.signature ? {
            label: 'Ver Transação',
            onClick: () => window.open(`https://explorer.solana.com/tx/${result.signature}?cluster=devnet`, '_blank')
          } : undefined,
        });

        // Limpar formulário
        setRecipientAddress('');
        setAmount('');
      } else {
        // Erro já tratado no hook
        toast.error('Erro na distribuição', {
          description: result.error,
          duration: 8000,
        });
      }

    } catch (error: any) {
      console.error('Distribution error:', error);
      toast.error('Erro na distribuição', {
        description: error.message,
      });
    } finally {
      setIsDistributing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-brand-50">Distribuição Direta de Tokens</h2>
        <p className="text-sm text-brand-300 mt-1">
          Distribua tokens RWA diretamente para investidores KYC'd
        </p>
      </div>

      <Separator />

      {/* Info Alert */}
      <Alert className="border-blue-500/50 bg-blue-500/10">
        <UserCheck className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-sm text-brand-100">
          <strong>Validação KYC Automática:</strong> Seu Transfer Hook valida automaticamente o KYC do destinatário.
          Se o investidor não tiver KYC válido, a transação será rejeitada on-chain.
        </AlertDescription>
      </Alert>

      {/* Distribution Form */}
      <Card className="bg-brand-800/50 border-brand-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-brand-50">
            <Send className="h-5 w-5" />
            Nova Distribuição
          </CardTitle>
          <CardDescription className="text-brand-300">
            Configure os detalhes da distribuição de tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Token Mint */}
          <div className="space-y-2">
            <Label htmlFor="tokenMint" className="text-brand-100">
              Token RWA (Mint Address)
              <Badge variant="outline" className="ml-2 text-xs">
                Token-2022
              </Badge>
            </Label>
            <Input
              id="tokenMint"
              placeholder="Ex: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
              value={tokenMint}
              onChange={(e) => setTokenMint(e.target.value)}
              className="bg-brand-900/50 border-brand-600 text-brand-50"
            />
            <p className="text-xs text-brand-400">
              Endereço do token RWA que será distribuído
            </p>
          </div>

          {/* Recipient */}
          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-brand-100">
              Endereço do Investidor
            </Label>
            <Input
              id="recipient"
              placeholder="Ex: 9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="bg-brand-900/50 border-brand-600 text-brand-50"
            />
            <p className="text-xs text-brand-400">
              Wallet do investidor que receberá os tokens
            </p>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-brand-100">
              Quantidade
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="Ex: 1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-brand-900/50 border-brand-600 text-brand-50"
            />
            <p className="text-xs text-brand-400">
              Quantidade de tokens a distribuir
            </p>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleDistribute}
            disabled={!connected || isDistributing || !tokenMint || !recipientAddress || !amount}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white"
          >
            {isDistributing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Distribuindo...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Distribuir Tokens
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="bg-brand-800/30 border-brand-700">
        <CardHeader>
          <CardTitle className="text-brand-50 text-lg">Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div>
              <p className="text-sm text-brand-100 font-medium">Distribuição Iniciada</p>
              <p className="text-xs text-brand-400">
                Admin inicia transferência para o investidor
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <div>
              <p className="text-sm text-brand-100 font-medium">Transfer Hook Ativado</p>
              <p className="text-xs text-brand-400">
                Seu programa de Transfer Hook é executado automaticamente
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-sm font-semibold">
              3
            </div>
            <div>
              <p className="text-sm text-brand-100 font-medium">Validação KYC</p>
              <p className="text-xs text-brand-400">
                Transfer Hook verifica se o destinatário possui KYC válido
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
              <CheckCircle2 className="h-3 w-3" />
            </div>
            <div>
              <p className="text-sm text-brand-100 font-medium">Transferência Concluída</p>
              <p className="text-xs text-brand-400">
                Se KYC OK: tokens são transferidos. Se KYC falha: transação é revertida
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card className="bg-gradient-to-br from-brand-800/30 to-brand-700/20 border-brand-600">
        <CardHeader>
          <CardTitle className="text-brand-50 text-lg">Vantagens desta Abordagem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
            <p className="text-sm text-brand-100">
              <strong>Compliance Garantido:</strong> KYC validado on-chain em toda transferência
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
            <p className="text-sm text-brand-100">
              <strong>Controle Total:</strong> Distribuição direta sem depender de DEXs
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
            <p className="text-sm text-brand-100">
              <strong>Flexibilidade:</strong> Migre para pools públicas quando protocolos suportarem Token-2022
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
            <p className="text-sm text-brand-100">
              <strong>Tokens como Garantia:</strong> Investidores podem usar tokens nos seus contratos SRWA
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Future Migration Note */}
      <Alert className="border-yellow-500/50 bg-yellow-500/10">
        <AlertCircle className="h-4 w-4 text-yellow-400" />
        <AlertDescription className="text-sm text-brand-100">
          <strong>Migração Futura:</strong> Quando MarginFi, Orca ou Raydium adicionarem suporte completo para Token-2022,
          você poderá facilmente migrar para pools públicas mantendo seu Transfer Hook de KYC.
        </AlertDescription>
      </Alert>
    </div>
  );
}
