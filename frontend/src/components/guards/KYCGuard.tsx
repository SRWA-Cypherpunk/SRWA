import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRegistry } from '@/hooks/solana/useUserRegistry';

interface KYCGuardProps {
  children: ReactNode;
  requireKYC?: boolean;
  returnUrl?: string;
  onKYCRequired?: () => void;
}

/**
 * Guard component that checks if KYC is required and completed
 * If KYC is required but not completed, redirects to KYC page
 */
export const KYCGuard = ({
  children,
  requireKYC = true,
  returnUrl,
  onKYCRequired,
}: KYCGuardProps) => {
  const { userRegistry } = useUserRegistry();
  const navigate = useNavigate();

  // If KYC is not required, render children
  if (!requireKYC) {
    return <>{children}</>;
  }

  // If KYC is completed, render children
  if (userRegistry?.kyc_completed) {
    return <>{children}</>;
  }

  // KYC required but not completed
  const handleKYCRedirect = () => {
    if (onKYCRequired) {
      onKYCRequired();
    } else {
      const kycUrl = returnUrl
        ? `/investor/kyc?returnTo=${encodeURIComponent(returnUrl)}`
        : '/investor/kyc';
      navigate(kycUrl);
    }
  };

  // Trigger redirect immediately
  handleKYCRedirect();

  return null;
};
