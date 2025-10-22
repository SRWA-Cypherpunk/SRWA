import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWallet } from '@/contexts/wallet/WalletContext';
import { RegistrationWizard } from '@/components/auth/RegistrationWizard';
import { useUserRegistry } from '@/hooks/solana';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet, CheckCircle } from 'lucide-react';
import { UserRole } from '@/types/srwa-contracts';

export default function Register() {
  const { connected } = useWallet();
  const { userRegistry, isLoading } = useUserRegistry();
  const navigate = useNavigate();

  // Log state for debugging
  useEffect(() => {
    console.log('[Register] State:', { connected, isLoading, userRegistry });
  }, [connected, isLoading, userRegistry]);

  // Mostrar loading enquanto carrega
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Verificando registro...</p>
        </div>
      </div>
    );
  }

  // Se não estiver conectado, mostrar mensagem para conectar
  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-center text-2xl">
              Conecte sua Wallet
            </CardTitle>
            <CardDescription className="text-center text-base">
              Para se registrar no SRWA Protocol, você precisa conectar sua carteira Solana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Clique no botão "Connect Wallet" no canto superior direito para começar
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se o usuário já estiver registrado, mostrar mensagem
  if (userRegistry) {
    const getRolePage = () => {
      if (userRegistry.role === UserRole.Issuer) return '/srwa-issuance';
      if (userRegistry.role === UserRole.Investor) return '/investor';
      if (userRegistry.role === UserRole.Admin) return '/admin';
      return '/dashboard';
    };

    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle className="text-center text-2xl">
              Você já está registrado!
            </CardTitle>
            <CardDescription className="text-center text-base">
              Seu tipo de conta: <strong>{userRegistry.role}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Registrado em: {new Date(userRegistry.registered_at * 1000).toLocaleDateString('pt-BR')}
            </p>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link to={getRolePage()}>Ir para minha página</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link to="/dashboard">Ver Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar o wizard de registro
  return <RegistrationWizard />;
}
