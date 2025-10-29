import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMobileDetection } from '@/hooks/ui/useMobileDetection';
import { motion, AnimatePresence } from 'framer-motion';

const DISMISS_KEY = 'srwa-install-prompt-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export function InstallPrompt() {
  const { isMobile, canInstall, isIOS, isStandalone, promptInstall } = useMobileDetection();
  const [isVisible, setIsVisible] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (isStandalone) {
      setIsVisible(false);
      return;
    }

    // Check if user dismissed recently
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const timeSinceDismiss = Date.now() - parseInt(dismissedAt, 10);
      if (timeSinceDismiss < DISMISS_DURATION) {
        setIsVisible(false);
        return;
      }
    }

    // Show prompt if on mobile and can install (or iOS)
    if (isMobile && (canInstall || isIOS)) {
      // Delay showing to avoid overwhelming user immediately
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isMobile, canInstall, isIOS, isStandalone]);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setIsVisible(false);
  };

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else if (canInstall) {
      await promptInstall();
      handleDismiss();
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md"
      >
        <Card className="bg-gradient-to-br from-purple-900/95 to-purple-950/95 border-purple-500/30 backdrop-blur-xl shadow-2xl">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-purple-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Install SRWA App</h3>
                  <p className="text-xs text-purple-200/70">
                    Get quick access to your portfolio
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 w-8 p-0 text-purple-200/50 hover:text-purple-200 hover:bg-purple-500/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {!showIOSInstructions ? (
              <div className="space-y-2">
                <ul className="text-xs text-purple-200/80 space-y-1 mb-3">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-purple-400" />
                    Offline access to your portfolio
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-purple-400" />
                    Faster loading & better performance
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-purple-400" />
                    Native app experience
                  </li>
                </ul>
                <Button
                  onClick={handleInstall}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isIOS ? 'Install Instructions' : 'Install App'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-purple-200/80 font-medium">
                  To install SRWA on iOS:
                </p>
                <ol className="text-xs text-purple-200/70 space-y-2">
                  <li className="flex gap-2">
                    <span className="font-semibold text-purple-300">1.</span>
                    <span>Tap the Share button at the bottom of Safari</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-purple-300">2.</span>
                    <span>Scroll down and tap "Add to Home Screen"</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-purple-300">3.</span>
                    <span>Tap "Add" in the top right corner</span>
                  </li>
                </ol>
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  className="w-full border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
                  size="sm"
                >
                  Got it
                </Button>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
