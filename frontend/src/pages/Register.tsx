import { useEffect, useMemo } from 'react';
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

  const roleRoute = useMemo(() => {
    if (!userRegistry) return null;

    if (userRegistry.role === UserRole.Issuer) return '/srwa-issuance';
    if (userRegistry.role === UserRole.Investor) return '/investor';
    if (userRegistry.role === UserRole.Admin) return '/admin';
    return '/dashboard';
  }, [userRegistry]);

  // Log state for debugging
  useEffect(() => {
    console.log('[Register] State:', { connected, isLoading, userRegistry });
  }, [connected, isLoading, userRegistry]);

  // Redirect registered users automatically to their dashboard
  useEffect(() => {
    if (roleRoute) {
      navigate(roleRoute, { replace: true });
    }
  }, [roleRoute, navigate]);

  // Show loading while loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Verifying registration...</p>
        </div>
      </div>
    );
  }

  // If not connected, show message to connect
  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full backdrop-blur-md bg-white/[0.03] border-white/10 animate-fade-in">
          <CardHeader>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(var(--brand-500))] to-[hsl(var(--brand-600))] flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(153,69,255,0.3)]">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-center text-2xl">
              Connect Your Wallet
            </CardTitle>
            <CardDescription className="text-center text-base">
              To register on SRWA Protocol, you need to connect your Solana wallet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Click the "Connect Wallet" button in the top right corner to get started
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is already registered, show message
  if (roleRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full backdrop-blur-md bg-white/[0.03] border-white/10 animate-fade-in">
          <CardHeader>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(var(--accent-green-500))] to-[hsl(var(--accent-green-400))] flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(20,241,149,0.3)]">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-center text-2xl">
              You are already registered!
            </CardTitle>
            <CardDescription className="text-center text-base">
              Your account type: <strong>{userRegistry?.role}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Registered on: {userRegistry ? new Date(userRegistry.registered_at * 1000).toLocaleDateString('en-US') : '—'}
            </p>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link to={roleRoute}>Go to my page</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show registration wizard
  return <RegistrationWizard />;
}
