import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/contexts/wallet/WalletContext';
import { RegistrationWizard } from '@/components/auth/RegistrationWizard';
import { useUserRegistry } from '@/hooks/solana';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wallet } from 'lucide-react';

export default function Register() {
  const { connected } = useWallet();
  const { userRegistry, isLoading } = useUserRegistry();
  const navigate = useNavigate();

  // Auto-redirect to dashboard if already registered
  useEffect(() => {
    if (userRegistry?.is_active) {
      console.log('[Register] User already registered, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [userRegistry, navigate]);

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

  // Show registration wizard for new users
  return <RegistrationWizard />;
}
