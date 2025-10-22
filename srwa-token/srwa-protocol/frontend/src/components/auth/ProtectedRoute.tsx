import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '@/contexts/wallet/WalletContext';
import { useUserRegistry } from '@/hooks/solana';
import { UserRole } from '@/types/srwa-contracts';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requireRegistration?: boolean;
}

export function ProtectedRoute({
  children,
  allowedRoles = [],
  requireRegistration = true,
}: ProtectedRouteProps) {
  const { connected } = useWallet();
  const { userRegistry, isLoading } = useUserRegistry();

  // Debug logs
  useEffect(() => {
    console.log('[ProtectedRoute] State:', {
      connected,
      isLoading,
      userRegistry,
      requireRegistration,
      allowedRoles,
    });
  }, [connected, isLoading, userRegistry, requireRegistration, allowedRoles]);

  // Mostrar loading enquanto carrega o registro do usuário
  if (connected && isLoading) {
    console.log('[ProtectedRoute] Loading user registry...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver conectado, redirecionar para home
  if (!connected) {
    console.log('[ProtectedRoute] Not connected, redirecting to /');
    return <Navigate to="/" replace />;
  }

  // Se requer registro e o usuário não está registrado, redirecionar para /register
  if (requireRegistration && !userRegistry) {
    console.log('[ProtectedRoute] User not registered, redirecting to /register');
    return <Navigate to="/register" replace />;
  }

  // Se tem allowedRoles especificados, verificar se o usuário tem um dos roles permitidos
  if (allowedRoles.length > 0 && userRegistry) {
    if (!allowedRoles.includes(userRegistry.role)) {
      console.log('[ProtectedRoute] User role not allowed, redirecting to appropriate page');
      // Redirecionar para a página apropriada baseado no role do usuário
      if (userRegistry.role === UserRole.Issuer) {
        return <Navigate to="/srwa-issuance" replace />;
      } else if (userRegistry.role === UserRole.Investor) {
        return <Navigate to="/investor" replace />;
      } else if (userRegistry.role === UserRole.Admin) {
        return <Navigate to="/admin" replace />;
      }
    }
  }

  // Se passou por todas as verificações, renderizar o conteúdo
  console.log('[ProtectedRoute] Access granted');
  return <>{children}</>;
}
