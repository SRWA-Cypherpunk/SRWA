import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { SolanaWalletButton } from "@/components/wallet/SolanaWalletButton";
import { ROUTES } from "@/lib/constants";
import Logo from "@/assets/logo.png";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stroke-line bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <a href={ROUTES.HOME} className="flex items-center space-x-2 sm:space-x-3 group">
          <img src={Logo} alt="SRWA Logo" className="h-auto w-12 sm:w-16 md:w-20 transition-transform group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-brand-400 via-accent-orange-500 to-brand-500 bg-clip-text text-transparent">
              SRWA
            </span>
            <span className="text-[8px] sm:text-[10px] text-fg-muted uppercase tracking-wider hidden sm:block">
              Solana RWA
            </span>
          </div>
        </a>

        {/* Spacer for centering */}
        <div className="flex-1"></div>

        {/* Desktop Navigation + Wallet Connection */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
          {/* Navigation Links */}
          <nav className="flex items-center space-x-4 lg:space-x-6">
            <a href={ROUTES.HOME} className="text-sm lg:text-body-2 text-fg-secondary hover:text-brand-400 transition-colors relative group">
              Home
              <span className="absolute bottom-0 left-0 w-0 h-px bg-brand-400 group-hover:w-full transition-all duration-300" />
            </a>
            <a href={ROUTES.DASHBOARD} className="text-sm lg:text-body-2 text-fg-secondary hover:text-brand-400 transition-colors relative group font-medium">
              Dashboard
              <span className="absolute bottom-0 left-0 w-0 h-px bg-brand-400 group-hover:w-full transition-all duration-300" />
            </a>
            <a href={ROUTES.DOCS} className="text-sm lg:text-body-2 text-fg-secondary hover:text-brand-400 transition-colors relative group">
              Documentation
              <span className="absolute bottom-0 left-0 w-0 h-px bg-brand-400 group-hover:w-full transition-all duration-300" />
            </a>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center ml-4 lg:ml-6">
            <SolanaWalletButton />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden p-2 ml-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stroke-line bg-card animate-slide-up">
          <nav className="container mx-auto px-4 sm:px-6 py-4 space-y-3">
            <a href={ROUTES.HOME} className="block py-2 text-sm sm:text-body-2 text-fg-secondary hover:text-brand-400 transition-colors">
              Home
            </a>
            <a href={ROUTES.DASHBOARD} className="block py-2 text-sm sm:text-body-2 text-fg-secondary hover:text-brand-400 transition-colors font-medium">
              Dashboard
            </a>
            <a href={ROUTES.DOCS} className="block py-2 text-sm sm:text-body-2 text-fg-secondary hover:text-brand-400 transition-colors">
              Documentation
            </a>
            {/* Mobile Wallet Button */}
            <div className="pt-2 border-t border-stroke-line">
              <SolanaWalletButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
