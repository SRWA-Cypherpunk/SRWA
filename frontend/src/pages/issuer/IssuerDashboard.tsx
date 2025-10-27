import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/contexts/wallet/WalletContext';
import { useIssuanceRequests } from '@/hooks/solana/useIssuanceRequests';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, Plus, TrendingUp, Clock, CheckCircle, Coins } from 'lucide-react';
import { ISSUER_ROUTES } from '@/lib/constants/routes';

export default function IssuerDashboard() {
  const { publicKey } = useWallet();
  const navigate = useNavigate();
  const { data: requests, isLoading } = useIssuanceRequests();

  // Filter requests created by current user
  const myRequests = requests?.filter(
    (req) => req.issuer.toBase58() === publicKey?.toBase58()
  ) || [];

  const stats = {
    total: myRequests.length,
    pending: myRequests.filter((r) => r.status === 'pending').length,
    deployed: myRequests.filter((r) => r.status === 'deployed').length,
    rejected: myRequests.filter((r) => r.status === 'rejected').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Issuer Dashboard</h1>
        <p className="text-muted-foreground">
          Gerencie seus tokens e acompanhe o status das suas emissões
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tokens</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Tokens criados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Implantados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.deployed}</div>
            <p className="text-xs text-muted-foreground">Ativos na blockchain</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0
                ? `${Math.round((stats.deployed / stats.total) * 100)}%`
                : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">Tokens aprovados</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(ISSUER_ROUTES.CREATE_SRWA)}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Criar Novo Token</CardTitle>
                <CardDescription>
                  Tokenize um novo ativo do mundo real
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Inicie o processo de criação de um token SRWA em 5 etapas simples
            </p>
            <Button className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Começar Criação
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(ISSUER_ROUTES.MY_TOKENS)}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Meus Tokens</CardTitle>
                <CardDescription>
                  Veja todos os seus tokens criados
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Gerencie e acompanhe o status de todos os seus tokens SRWA
            </p>
            <Button variant="outline" className="w-full">
              <Building2 className="w-4 h-4 mr-2" />
              Ver Meus Tokens
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitações Recentes</CardTitle>
          <CardDescription>
            Acompanhe o status das suas últimas criações de tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myRequests.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Você ainda não criou nenhum token
              </p>
              <Button onClick={() => navigate(ISSUER_ROUTES.CREATE_SRWA)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Token
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.slice(0, 5).map((request, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">{request.tokenConfig.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.tokenConfig.symbol} • {request.tokenConfig.assetType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {request.status === 'pending' && (
                      <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                        <Clock className="w-3 h-3 mr-1" />
                        Pendente
                      </Badge>
                    )}
                    {request.status === 'deployed' && (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Implantado
                      </Badge>
                    )}
                    {request.status === 'rejected' && (
                      <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20">
                        Rejeitado
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {myRequests.length > 5 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(ISSUER_ROUTES.MY_TOKENS)}
                >
                  Ver Todos os Tokens
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
