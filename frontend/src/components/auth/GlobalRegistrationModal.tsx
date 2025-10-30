import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useWallet } from '@/contexts/wallet/WalletContext';
import { useUserRegistry } from '@/hooks/solana';
import { RegistrationWizard } from './RegistrationWizard';

/**
 * Global registration modal that appears over any page when user is connected but not registered.
 * This ensures users cannot navigate the app until they complete registration.
 * Does not appear on the home page (/).
 */
export function GlobalRegistrationModal() {
  const { connected } = useWallet();
  const { userRegistry, isLoading } = useUserRegistry();
  const location = useLocation();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const isHomePage = location.pathname === '/';

    console.log('[GlobalRegistrationModal] State:', {
      connected,
      isLoading,
      userRegistry,
      isHomePage,
      pathname: location.pathname,
      shouldShow: connected && !isLoading && !userRegistry && !isHomePage
    });

    // Show modal if user is connected but has no registry entry, and not on home page
    if (connected && !isLoading && !userRegistry && !isHomePage) {
      setShouldShow(true);
    } else {
      setShouldShow(false);
    }
  }, [connected, isLoading, userRegistry, location.pathname]);

  console.log('[GlobalRegistrationModal] Render - shouldShow:', shouldShow);

  if (!shouldShow) {
    console.log('[GlobalRegistrationModal] Not showing modal');
    return null;
  }

  console.log('[GlobalRegistrationModal] SHOWING MODAL NOW!');

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => e.stopPropagation()} // Prevent click through
    >
      <div className="w-full h-full overflow-y-auto">
        <RegistrationWizard />
      </div>
    </div>
  );
}
