import { useWallet } from '@solana/wallet-adapter-react';
import { cn } from '@/lib/utils';
import { Wallet, ChevronDown, Loader2, Check } from 'lucide-react';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WalletModal } from './WalletModal';
import { HeroButton } from '@/components/ui/hero-button';

interface SolanaWalletButtonProps {
  className?: string;
}

/**
 * SolanaWalletButton - Modern, elegant wallet connection button
 *
 * UX/UI Best Practices:
 * - Clear visual hierarchy
 * - Subtle animations and micro-interactions
 * - Accessible with proper focus states
 * - Responsive for mobile/desktop
 */
export function SolanaWalletButton({ className }: SolanaWalletButtonProps) {
  const { publicKey, wallet, disconnect, connecting } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const handleConnect = () => {
    setModalOpen(true);
  };

  const handleDisconnect = () => {
    disconnect();
    setShowDropdown(false);
  };

  // Connecting state
  if (connecting) {
    return (
      <motion.button
        disabled
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'relative inline-flex items-center justify-center gap-2.5',
          'px-4 py-2.5 rounded-xl',
          'bg-gradient-to-r from-purple-500/10 to-blue-500/10',
          'border border-purple-500/20',
          'text-sm font-semibold text-gray-300',
          'cursor-not-allowed',
          'transition-all duration-200',
          className
        )}
      >
        <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
        <span>Connecting...</span>
      </motion.button>
    );
  }

  // Connected state
  if (base58) {
    return (
      <div className="relative">
        <motion.button
          onClick={() => setShowDropdown(!showDropdown)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'relative inline-flex items-center justify-center gap-2',
            'px-4 py-2.5 rounded-xl',
            'bg-gradient-to-r from-purple-500/10 to-blue-500/10',
            'border border-purple-500/30',
            'text-sm font-semibold text-white',
            'hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20',
            'transition-all duration-200',
            'backdrop-blur-sm',
            className
          )}
        >
          {wallet?.adapter.icon && (
            <motion.img
              src={wallet.adapter.icon}
              alt={wallet.adapter.name}
              className="h-5 w-5 rounded-full"
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            />
          )}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="hidden sm:inline">{formatAddress(base58)}</span>
            <span className="sm:hidden">{base58.slice(0, 6)}</span>
          </div>
          <ChevronDown className={cn(
            'h-4 w-4 text-gray-400 transition-transform duration-200',
            showDropdown && 'rotate-180'
          )} />
        </motion.button>

        {/* Dropdown menu */}
        <AnimatePresence>
          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={cn(
                  'absolute right-0 top-full mt-2 z-50',
                  'w-64 rounded-xl',
                  'bg-gray-900/95 backdrop-blur-xl',
                  'border border-gray-800',
                  'shadow-2xl shadow-black/50',
                  'overflow-hidden'
                )}
              >
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-800/50">
                  <div className="flex items-center gap-3">
                    {wallet?.adapter.icon && (
                      <img
                        src={wallet.adapter.icon}
                        alt={wallet.adapter.name}
                        className="h-8 w-8 rounded-full"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {wallet?.adapter.name}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">
                        {formatAddress(base58)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                      <Check className="h-3 w-3 text-green-400" />
                      <span className="text-xs text-green-400 font-medium">Active</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-2">
                  <button
                    onClick={handleDisconnect}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
                      'text-sm font-medium text-red-400',
                      'hover:bg-red-500/10 hover:text-red-300',
                      'transition-all duration-150'
                    )}
                  >
                    <Wallet className="h-4 w-4" />
                    <span>Disconnect Wallet</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Disconnected state - primary CTA
  return (
    <>
      <HeroButton
        onClick={handleConnect}
        variant="brand"
        className={cn(
          'w-full sm:w-auto',
          '!px-4 !py-2 sm:!px-5 sm:!py-2.5', // Manter tamanho original menor
          '!text-xs sm:!text-sm', // Manter font size original
          className
        )}
        icon={<Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
      >
        <span className="hidden sm:inline">Connect Wallet</span>
        <span className="sm:hidden">Connect</span>
      </HeroButton>

      {/* Custom Modal */}
      <WalletModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

/**
 * WalletInfo - Componente que mostra informações da carteira conectada
 */
export function WalletInfo({ className }: { className?: string }) {
  const { connected, address } = useWallet();

  if (!connected || !address) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-elev-1 border border-brand-500/30",
        className
      )}
    >
      <div className="w-2 h-2 rounded-full bg-solana-500 animate-pulse" />
      <span className="text-sm text-fg-secondary font-mono">
        {address.slice(0, 4)}...{address.slice(-4)}
      </span>
    </div>
  );
}
