import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/contexts/wallet/WalletContext';
import { useIssuanceRequests } from '@/hooks/solana/useIssuanceRequests';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, Plus, ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ISSUER_ROUTES } from '@/lib/constants/routes';

export default function MyTokens() {
  const { publicKey } = useWallet();
  const navigate = useNavigate();
  const { data: requests, isLoading } = useIssuanceRequests();

  // Filter requests created by current user
  const myRequests = requests?.filter(
    (req) => req.issuer.toBase58() === publicKey?.toBase58()
  ) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'deployed':
        return (
          <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Implantado
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeitado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Carregando seus tokens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Meus Tokens</h1>
          <p className="text-muted-foreground">
            Gerencie os tokens SRWA que você criou
          </p>
        </div>
        <Button onClick={() => navigate(ISSUER_ROUTES.CREATE_SRWA)} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Criar Novo Token
        </Button>
      </div>

      {myRequests.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl mb-2">Nenhum token criado ainda</CardTitle>
            <CardDescription className="text-center max-w-md mb-6">
              Comece criando seu primeiro token SRWA para tokenizar seus ativos do mundo real
            </CardDescription>
            <Button onClick={() => navigate(ISSUER_ROUTES.CREATE_SRWA)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Meu Primeiro Token
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myRequests.map((request, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  {getStatusBadge(request.status)}
                </div>
                <CardTitle className="text-xl">{request.tokenConfig.name}</CardTitle>
                <CardDescription>
                  Símbolo: <span className="font-mono font-semibold">{request.tokenConfig.symbol}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tipo de Ativo</p>
                    <p className="text-sm font-medium capitalize">{request.tokenConfig.assetType}</p>
                  </div>

                  {request.tokenConfig.cnpj && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">CNPJ</p>
                      <p className="text-sm font-mono">{request.tokenConfig.cnpj}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Meta de Arrecadação</p>
                    <p className="text-sm font-semibold">
                      {request.offeringConfig?.targetAmount?.toLocaleString('pt-BR')} SOL
                    </p>
                  </div>

                  {request.yieldConfig?.targetApy && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">APY Alvo</p>
                      <p className="text-sm font-semibold text-green-600">
                        {request.yieldConfig.targetApy}%
                      </p>
                    </div>
                  )}

                  {request.status === 'deployed' && request.deployedTokenMint && (
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => window.open(
                        `https://explorer.solana.com/address/${request.deployedTokenMint.toBase58()}?cluster=devnet`,
                        '_blank'
                      )}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver no Explorer
                    </Button>
                  )}

                  {request.status === 'rejected' && request.rejectionReason && (
                    <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-xs font-semibold text-red-500 mb-1">Motivo da Rejeição:</p>
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {request.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
