import { useState, useEffect, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Plus, Shield, Building2 } from "lucide-react";
import { SolanaWalletButton } from "@/components/wallet/SolanaWalletButton";
import { ROUTES, ISSUER_ROUTES, ADMIN_ROUTES } from "@/lib/constants/routes";
import { FEATURES } from "@/lib/constants/features";
import Logo from "@/assets/logo.png";
import SRWALetters from "@/assets/srwa_letters.png";
import { AnimatePresence, motion } from "framer-motion";
import { useUserRegistry } from "@/hooks/solana";
import { UserRole } from "@/types/srwa-contracts";

interface HeaderProps {
  disableDashboardLink?: boolean;
  onDashboardLinkClick?: () => void;
}

export function Header({ disableDashboardLink = false, onDashboardLinkClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { userRegistry } = useUserRegistry();

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
          <Link to={ROUTES.HOME} className="flex items-center gap-2 sm:gap-3 group">
            <img src={Logo} alt="SRWA Logo" className="h-auto w-4 sm:w-6 md:w-8 transition-transform group-hover:scale-105" />
            <img src={SRWALetters} alt="SRWA" className="h-auto w-16 sm:w-20 md:w-24 transition-transform group-hover:scale-105" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-none items-center justify-center px-4">
          <nav className="flex items-center space-x-4 lg:space-x-6">
            <Link to={ROUTES.HOME} className="text-sm lg:text-body-2 text-fg-secondary hover:text-brand-400 transition-colors relative group">
              Home
              <span className="absolute bottom-0 left-0 w-0 h-px bg-brand-400 group-hover:w-full transition-all duration-300" />
            </Link>
            {FEATURES.DASHBOARD && (
              <Link
                to={disableDashboardLink ? "#" : ROUTES.DASHBOARD}
                onClick={handleDashboardLink}
                className="text-sm lg:text-body-2 text-fg-secondary hover:text-brand-400 transition-colors relative group font-medium"
              >
                Dashboard
                <span className="absolute bottom-0 left-0 w-0 h-px bg-brand-400 group-hover:w-full transition-all duration-300" />
              </Link>
            )}

            {/* Issuer: Create SRWA */}
            {userRegistry?.role === UserRole.Issuer && (
              <Link
                to={ISSUER_ROUTES.CREATE_SRWA}
                className="text-sm lg:text-body-2 text-blue-400 hover:text-blue-300 transition-colors relative group font-semibold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Create SRWA
                <span className="absolute bottom-0 left-0 w-0 h-px bg-blue-400 group-hover:w-full transition-all duration-300" />
              </Link>
            )}

            {/* Issuer: My Tokens */}
            {userRegistry?.role === UserRole.Issuer && (
              <Link
                to={ISSUER_ROUTES.MY_TOKENS}
                className="text-sm lg:text-body-2 text-fg-secondary hover:text-brand-400 transition-colors relative group flex items-center gap-1"
              >
                <Building2 className="w-3 h-3" />
                My Tokens
                <span className="absolute bottom-0 left-0 w-0 h-px bg-brand-400 group-hover:w-full transition-all duration-300" />
              </Link>
            )}

            {/* Admin: Admin Panel */}
            {userRegistry?.role === UserRole.Admin && (
              <Link
                to={ADMIN_ROUTES.DASHBOARD}
                className="text-sm lg:text-body-2 text-purple-400 hover:text-purple-300 transition-colors relative group font-semibold flex items-center gap-1"
              >
                <Shield className="w-3 h-3" />
                Admin Panel
                <span className="absolute bottom-0 left-0 w-0 h-px bg-purple-400 group-hover:w-full transition-all duration-300" />
              </Link>
            )}

            <a href={ROUTES.DOCS} target="_blank" rel="noopener noreferrer" className="text-sm lg:text-body-2 text-fg-secondary hover:text-brand-400 transition-colors relative group">
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
                <Link
                  to={ROUTES.HOME}
                  className="block py-2 text-sm sm:text-body-2 text-fg-secondary hover:text-brand-400 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                {FEATURES.DASHBOARD && (
                  <Link
                    to={disableDashboardLink ? "#" : ROUTES.DASHBOARD}
                    onClick={(e) => {
                      handleDashboardLink(e);
                      setMobileMenuOpen(false);
                    }}
                    className="block py-2 text-sm sm:text-body-2 text-fg-secondary hover:text-brand-400 transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
                )}

                {/* Issuer Menu Items */}
                {userRegistry?.role === UserRole.Issuer && (
                  <>
                    <Link
                      to={ISSUER_ROUTES.CREATE_SRWA}
                      className="block py-2 text-sm sm:text-body-2 text-blue-400 hover:text-blue-300 transition-colors font-semibold flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Plus className="w-4 h-4" />
                      Create SRWA
                    </Link>
                    <Link
                      to={ISSUER_ROUTES.MY_TOKENS}
                      className="block py-2 text-sm sm:text-body-2 text-fg-secondary hover:text-brand-400 transition-colors flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Building2 className="w-4 h-4" />
                      My Tokens
                    </Link>
                  </>
                )}

                {/* Admin Menu Items */}
                {userRegistry?.role === UserRole.Admin && (
                  <Link
                    to={ADMIN_ROUTES.DASHBOARD}
                    className="block py-2 text-sm sm:text-body-2 text-purple-400 hover:text-purple-300 transition-colors font-semibold flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}

                <a
                  href={ROUTES.DOCS}
                  target="_blank"
                  rel="noopener noreferrer"
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
