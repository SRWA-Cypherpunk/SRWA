import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@/contexts/wallet/WalletContext';
import { RegistrationWizard } from '@/components/auth/RegistrationWizard';
import { useUserRegistry } from '@/hooks/solana';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet, CheckCircle, ArrowRight, LayoutDashboard } from 'lucide-react';
import { UserRole } from '@/types/srwa-contracts';

export default function Register() {
  const { connected } = useWallet();
  const { userRegistry, isLoading } = useUserRegistry();

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
      <div className="relative min-h-screen overflow-hidden">
        {/* Glassdoor Background */}
        <div className="fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/40 rounded-full blur-3xl animate-pulse" />
              <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>
          </div>
          <div className="absolute inset-0 backdrop-blur-2xl bg-bg-primary/60" />
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-400" />
            <p className="text-lg text-fg-secondary">Checking registration...</p>
          </div>
        </div>
      </div>
    );
  }

  // Se não estiver conectado, mostrar mensagem para conectar
  if (!connected) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        {/* Glassdoor Background */}
        <div className="fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/40 rounded-full blur-3xl animate-pulse" />
              <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>
          </div>
          <div className="absolute inset-0 backdrop-blur-2xl bg-bg-primary/60" />
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full">
            {/* Glass Card */}
            <div className="relative rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-8 animate-fade-in">
              {/* Gradient Overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-orange-500/10" />

              <div className="relative space-y-6">
                {/* Icon */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-orange-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center mx-auto">
                  <Wallet className="w-10 h-10 text-purple-400" />
                </div>

                {/* Title */}
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-fg-primary">
                    Connect Your Wallet
                  </h2>
                  <p className="text-fg-secondary">
                    To register on SRWA Protocol, you need to connect your Solana wallet
                  </p>
                </div>

                {/* Info */}
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <p className="text-sm text-fg-secondary text-center">
                    Click the "Connect Wallet" button in the top right corner to get started
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
      <div className="relative min-h-screen overflow-hidden">
        {/* Glassdoor Background */}
        <div className="fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary">
            {/* Simulated dashboard content */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-20 left-10 right-10 grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-white/5 rounded-lg" />
                ))}
              </div>
              <div className="absolute top-60 left-10 right-10 grid grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-64 bg-white/5 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Animated Gradient Mesh */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/40 rounded-full blur-3xl animate-pulse" />
              <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
              <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-2000" />
            </div>
          </div>
          <div className="absolute inset-0 backdrop-blur-2xl bg-bg-primary/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="max-w-lg w-full">
            {/* Glass Card */}
            <div className="relative rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-8 animate-fade-in">
              {/* Gradient Overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-orange-500/10" />

              <div className="relative space-y-6">
                {/* Success Icon */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-400/20 backdrop-blur-sm border border-green-500/20 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>

                {/* Title & Description */}
                <div className="text-center space-y-3">
                  <h2 className="text-3xl font-bold text-fg-primary">
                    You're Already Registered!
                  </h2>
                  <p className="text-fg-secondary">
                    Your account type: <span className="font-semibold text-purple-400">{userRegistry.role}</span>
                  </p>
                </div>

                {/* Registration Date */}
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm text-fg-secondary text-center">
                    Registered on: {new Date(userRegistry.registered_at * 1000).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    asChild
                    className="flex-1 bg-gradient-to-r from-purple-600 via-purple-500 to-orange-500 hover:from-purple-500 hover:via-orange-500 hover:to-orange-400 transition-all duration-300"
                  >
                    <Link to={getRolePage()} className="flex items-center justify-center gap-2">
                      Go to My Page
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 border-white/20 hover:bg-white/5"
                  >
                    <Link to="/dashboard" className="flex items-center justify-center gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      View Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar o wizard de registro
  return <RegistrationWizard />;
}
