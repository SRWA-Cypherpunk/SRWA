import { useState, useEffect, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { SolanaWalletButton } from "@/components/wallet/SolanaWalletButton";
import { ROUTES } from "@/lib/constants";
import { FEATURES } from "@/lib/constants/features";
import Logo from "@/assets/logo.png";
import SRWALetters from "@/assets/srwa_letters.png";
import { AnimatePresence, motion } from "framer-motion";

interface HeaderProps {
  disableDashboardLink?: boolean;
  onDashboardLinkClick?: () => void;
}

export function Header({ disableDashboardLink = false, onDashboardLinkClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        // Always show at top
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  // Block body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleDashboardLink = (event: MouseEvent<HTMLAnchorElement>) => {
    if (disableDashboardLink) {
      event.preventDefault();
      onDashboardLinkClick?.();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className={`sticky top-0 z-50 w-full border-b border-stroke-line bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="container mx-auto flex h-14 sm:h-16 max-w-7xl items-center px-4 sm:px-6">

        {/* Logo */}
        <div className="flex flex-1 items-center">
          <a href={ROUTES.HOME} className="flex items-center gap-2 sm:gap-3 group">
            <img src={Logo} alt="SRWA Logo" className="h-auto w-4 sm:w-6 md:w-8 transition-transform group-hover:scale-105" />
            <img src={SRWALetters} alt="SRWA" className="h-auto w-16 sm:w-20 md:w-24 transition-transform group-hover:scale-105" />
          </a>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-none items-center justify-center px-4">
          <nav className="flex items-center space-x-4 lg:space-x-6">
            <a href={ROUTES.HOME} className="text-sm lg:text-body-2 text-fg-secondary hover:text-brand-400 transition-colors relative group">
              Home
              <span className="absolute bottom-0 left-0 w-0 h-px bg-brand-400 group-hover:w-full transition-all duration-300" />
            </a>
            {FEATURES.DASHBOARD && (
              <a
                href={disableDashboardLink ? "#" : ROUTES.DASHBOARD}
                onClick={handleDashboardLink}
                className="text-sm lg:text-body-2 text-fg-secondary hover:text-brand-400 transition-colors relative group font-medium"
              >
                Dashboard
                <span className="absolute bottom-0 left-0 w-0 h-px bg-brand-400 group-hover:w-full transition-all duration-300" />
              </a>
            )}
            <a href={ROUTES.DOCS} className="text-sm lg:text-body-2 text-fg-secondary hover:text-brand-400 transition-colors relative group">
              Documentation
              <span className="absolute bottom-0 left-0 w-0 h-px bg-brand-400 group-hover:w-full transition-all duration-300" />
            </a>
          </nav>
        </div>

        {/* Wallet Connection */}
        <div className="hidden md:flex flex-1 items-center justify-end ml-4 lg:ml-6">
          <SolanaWalletButton />
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden p-2 ml-auto"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 top-14 md:hidden z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Menu Panel */}
            <motion.div
              className="absolute top-0 left-0 right-0 border-t border-stroke-line bg-card shadow-2xl"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <nav className="container mx-auto px-4 sm:px-6 py-4 space-y-3">
                <a
                  href={ROUTES.HOME}
                  className="block py-2 text-sm sm:text-body-2 text-fg-secondary hover:text-brand-400 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </a>
                {FEATURES.DASHBOARD && (
                  <a
                    href={disableDashboardLink ? "#" : ROUTES.DASHBOARD}
                    onClick={(e) => {
                      handleDashboardLink(e);
                      setMobileMenuOpen(false);
                    }}
                    className="block py-2 text-sm sm:text-body-2 text-fg-secondary hover:text-brand-400 transition-colors font-medium"
                  >
                    Dashboard
                  </a>
                )}
                <a
                  href={ROUTES.DOCS}
                  className="block py-2 text-sm sm:text-body-2 text-fg-secondary hover:text-brand-400 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Documentation
                </a>
                {/* Mobile Wallet Button */}
                <div className="pt-2 border-t border-stroke-line">
                  <SolanaWalletButton />
                </div>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
