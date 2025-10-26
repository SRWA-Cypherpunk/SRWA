import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, AlertCircle, Check } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName } from '@solana/wallet-adapter-base';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * WalletModal - Beautiful, modern wallet selection modal
 *
 * UX/UI Features:
 * - Glassmorphism design
 * - Stagger animations for wallet list
 * - Detects installed wallets
 * - Loading and error states
 * - Popular wallet badges
 * - Smooth transitions
 */
export function WalletModal({ open, onClose }: WalletModalProps) {
  const { wallets, select, connecting } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<WalletName | null>(null);

  // Reset selected wallet when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedWallet(null);
    }
  }, [open]);

  const handleWalletClick = async (walletName: WalletName, e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();

    try {
      setSelectedWallet(walletName);
      select(walletName);
    } catch (error) {
      console.error('[WalletModal] Error selecting wallet:', error);
      setSelectedWallet(null);
    }
  };

  const popularWallets = ['Phantom', 'Solflare', 'Backpack'];

  // Deduplicate wallets by name (removes duplicate entries)
  const uniqueWallets = wallets.reduce((acc, wallet) => {
    const walletName = wallet.adapter.name;

    // Skip if we already have this wallet (deduplication)
    if (acc.find(w => w.adapter.name === walletName)) {
      return acc;
    }

    return [...acc, wallet];
  }, [] as typeof wallets);

  const getWalletUrl = (walletName: string) => {
    const urls: Record<string, string> = {
      Phantom: 'https://phantom.app',
      Solflare: 'https://solflare.com',
      Backpack: 'https://backpack.app',
      Ledger: 'https://www.ledger.com',
      Torus: 'https://tor.us',
    };
    return urls[walletName] || '#';
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={cn(
                'relative w-full',
                'bg-gradient-to-b from-gray-900 to-gray-950',
                'rounded-2xl shadow-2xl',
                'border border-gray-800/50'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with glassmorphism */}
              <div className="relative px-6 py-5 border-b border-gray-800/50 bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Choose your preferred wallet
                    </p>
                  </div>
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      'p-2 rounded-lg',
                      'bg-gray-800/50 hover:bg-gray-700/50',
                      'text-gray-400 hover:text-white',
                      'transition-colors duration-150'
                    )}
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>

              {/* Wallet List */}
              <div className="p-4 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent">
                <div className="space-y-2">
                  {uniqueWallets.map((wallet, index) => {
                    const isInstalled = wallet.readyState === 'Installed';
                    const isPopular = popularWallets.includes(wallet.adapter.name);
                    const isConnecting =
                      connecting && selectedWallet === wallet.adapter.name;

                    return (
                      <motion.button
                        key={wallet.adapter.name}
                        onClick={(e) => handleWalletClick(wallet.adapter.name, e)}
                        disabled={isConnecting}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: index * 0.05,
                          type: 'spring',
                          stiffness: 300,
                          damping: 25,
                        }}
                        whileHover={!isConnecting ? { scale: 1.02, x: 4 } : {}}
                        whileTap={!isConnecting ? { scale: 0.98 } : {}}
                        className={cn(
                          'w-full flex items-center gap-4 p-4 rounded-xl',
                          'bg-gray-800/30 hover:bg-gray-800/50',
                          'border border-gray-700/50 hover:border-purple-500/50',
                          'transition-all duration-200',
                          'group relative overflow-hidden',
                          isConnecting && 'cursor-wait opacity-60'
                        )}
                      >
                        {/* Hover glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Wallet icon */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={wallet.adapter.icon}
                            alt={wallet.adapter.name}
                            className="h-10 w-10 rounded-full"
                          />
                          {isInstalled && (
                            <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-green-500 border-2 border-gray-900">
                              <Check className="h-2.5 w-2.5 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Wallet info */}
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-base font-semibold text-white truncate">
                              {wallet.adapter.name}
                            </p>
                            {isPopular && (
                              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs font-medium text-purple-300">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mt-0.5">
                            {isInstalled ? (
                              <span className="text-green-400 font-medium">
                                Detected
                              </span>
                            ) : (
                              'Not installed'
                            )}
                          </p>
                        </div>

                        {/* Status indicator */}
                        <div className="flex-shrink-0">
                          {isConnecting ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: 'linear',
                              }}
                              className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full"
                            />
                          ) : !isInstalled ? (
                            <a
                              href={getWalletUrl(wallet.adapter.name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4 text-gray-400" />
                            </a>
                          ) : null}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Help text */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: uniqueWallets.length * 0.05 + 0.2 }}
                  className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
                >
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-300">
                        New to Solana wallets?
                      </p>
                      <p className="text-xs text-blue-200/80 mt-1">
                        We recommend Phantom for beginners. It's easy to use and
                        widely supported.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-800/50 bg-gray-900/50">
                <p className="text-xs text-center text-gray-500">
                  By connecting, you agree to our Terms of Service
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
