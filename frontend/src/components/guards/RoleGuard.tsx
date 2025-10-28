import { ReactNode } from 'react';
import { useUserRegistry } from '@/hooks/solana/useUserRegistry';
import { UserRole } from '@/types/srwa-contracts';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
  requireActive?: boolean;
}

/**
 * Guard component that only renders children if the user has one of the allowed roles
 */
export const RoleGuard = ({
  allowedRoles,
  children,
  fallback = null,
  requireActive = true,
}: RoleGuardProps) => {
  const { userRegistry } = useUserRegistry();

  // Check if user is registered and has an allowed role
  const isAllowed =
    userRegistry &&
    allowedRoles.includes(userRegistry.role) &&
    (!requireActive || userRegistry.is_active);

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
