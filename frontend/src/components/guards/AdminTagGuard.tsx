import { ReactNode } from 'react';
import { useIsAuthorizedAdmin } from '@/hooks/useIsAuthorizedAdmin';

interface AdminTagGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Guard component that only renders children if the connected wallet
 * has an authorized admin tag on-chain
 */
export const AdminTagGuard = ({ children, fallback = null }: AdminTagGuardProps) => {
  const isAuthorizedAdmin = useIsAuthorizedAdmin();

  if (!isAuthorizedAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
