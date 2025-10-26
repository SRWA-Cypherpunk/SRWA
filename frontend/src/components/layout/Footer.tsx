import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { SolanaWalletButton } from "@/components/wallet/SolanaWalletButton";
import { HeroButton } from "@/components/ui/hero-button";
import { LaunchCountdownButton } from "@/components/ui/launch-countdown-button";
import { ROUTES } from "@/lib/constants";
import { FEATURES } from "@/lib/constants/features";
import Logo from "@/assets/logo.png";
import SRWALetters from "@/assets/srwa_letters.png";
import {
  ArrowRight,
  BookOpen,
  Github,
  Twitter,
  Shield,
} from "lucide-react";

export interface FooterProps {
  showCTA?: boolean;
  ctaTitle?: string;
  ctaDescription?: string;
  ctaAction?: "dashboard" | "top" | "custom";
  onCtaCustomAction?: () => void;
}

/**
 * Footer Component - Reusable footer for all pages
 *
 * Features:
 * - Optional CTA section with wallet integration
 * - Navigation links (Product, Resources, Community)
 * - Social media buttons
 * - Responsive design
 * - Consistent styling across all pages
 *
 * Usage:
 * <Footer showCTA />  // Show with CTA
 * <Footer />  // Minimal footer without CTA
 */
export function Footer({
  showCTA = false,
  ctaTitle = "Ready to Get Started?",
  ctaDescription = "Connect your wallet and start exploring institutional-grade RWA markets",
  ctaAction = "dashboard",
  onCtaCustomAction,
}: FooterProps) {
  const navigate = useNavigate();
  const { connected } = useWallet();

  // Detect mobile to disable heavy animations
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Viewport config for animations (disabled on mobile)
  const viewportConfig = isMobile ? false : { once: true };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCtaAction = () => {
    if (ctaAction === "top") {
      scrollToTop();
    } else if (ctaAction === "dashboard") {
      navigate(ROUTES.DASHBOARD);
    } else if (ctaAction === "custom" && onCtaCustomAction) {
      onCtaCustomAction();
    }
  };

  return (
    <footer className="relative py-16 sm:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Footer Container with Gradient */}
        <div
          className="relative rounded-2xl border-2 border-purple-500/10 overflow-hidden"
          style={{
            background:
              "linear-gradient(to bottom, #0d0b0e 0%, #110d14 50%, #0A0A0A 100%)",
            borderImageSource:
              "linear-gradient(to right, rgba(153,69,255,0.3), rgba(255,107,53,0.2))",
            borderImageSlice: 1,
          }}
        >
          {/* Dot pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(153,69,255,0.6) 1.5px, transparent 1.5px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* CTA Section - Highlighted Box (Optional) */}
          {showCTA && (
            <div className="relative z-10 mx-6 sm:mx-12 mt-8 sm:mt-12 mb-12 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/30 via-purple-900/20 to-orange-950/30 p-6 sm:p-8 backdrop-blur-sm overflow-hidden">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-orange-500/5 pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-orange-400 bg-clip-text text-transparent mb-2">
                    {ctaTitle}
                  </h3>
                  <p className="text-sm text-fg-secondary">{ctaDescription}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 sm:items-center md:items-end">
                  {connected ? (
                    <LaunchCountdownButton
                      className="w-full sm:w-auto items-center md:items-end text-center md:text-right"
                      buttonClassName="!px-6 !py-3 !text-sm"
                      icon={<ArrowRight className="h-4 w-4" />}
                      onLaunch={handleCtaAction}
                    />
                  ) : (
                    <SolanaWalletButton className="w-full sm:w-auto !px-6 !py-3 !text-sm" />
                  )}
                  {FEATURES.DASHBOARD && (
                    <HeroButton
                      onClick={() => navigate(ROUTES.DASHBOARD)}
                      variant="solana"
                      className="!px-6 !py-3 !text-sm"
                      icon={<ArrowRight className="h-4 w-4" />}
                    >
                      View Dashboard
                    </HeroButton>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="relative z-10 px-6 sm:px-12 pb-12 sm:pb-16">
            {/* Main Footer Content */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 ${showCTA ? 'mb-12' : 'mt-8 sm:mt-12 mb-12'}`}>
              {/* Brand Column */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={viewportConfig}
              >
                <a href={ROUTES.HOME} className="flex items-center gap-2 group">
                  <img
                    src={Logo}
                    alt="SRWA Logo"
                    className={`h-auto w-8 ${
                      !isMobile && "transition-transform"
                    } group-hover:scale-105`}
                  />
                  <img
                    src={SRWALetters}
                    alt="SRWA"
                    className={`h-auto w-20 ${
                      !isMobile && "transition-transform"
                    } group-hover:scale-105`}
                  />
                </a>
                <p className="text-sm text-fg-secondary leading-relaxed">
                  Institutional-grade Real-World Asset lending on Solana with
                  full compliance and transparency.
                </p>
              </motion.div>

              {/* Product Column */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={viewportConfig}
              >
                <h4 className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent uppercase tracking-wider">
                  Product
                </h4>
                <ul className="space-y-3">
                  {[
                    FEATURES.DASHBOARD && {
                      href: ROUTES.DASHBOARD,
                      label: "Dashboard",
                    },
                    { href: ROUTES.MARKETS, label: "Markets" },
                    { href: ROUTES.PORTFOLIO, label: "Portfolio" },
                    { href: ROUTES.KYC, label: "KYC Portal" },
                  ]
                    .filter(Boolean)
                    .map((link: any) => (
                      <li key={link.href}>
                        <motion.a
                          href={link.href}
                          className={`text-sm text-fg-secondary hover:text-purple-400 inline-flex items-center gap-2 group ${
                            !isMobile && "transition-all"
                          }`}
                          whileHover={{ x: 4 }}
                        >
                          <ArrowRight
                            className={`h-3 w-3 text-purple-500/60 opacity-0 group-hover:opacity-100 ${
                              !isMobile && "transition-opacity"
                            }`}
                          />
                          <span>{link.label}</span>
                        </motion.a>
                      </li>
                    ))}
                </ul>
              </motion.div>

              {/* Resources Column */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={viewportConfig}
              >
                <h4 className="text-sm font-semibold bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent uppercase tracking-wider">
                  Resources
                </h4>
                <ul className="space-y-3">
                  {[
                    { href: ROUTES.DOCS, label: "Documentation", icon: BookOpen },
                    {
                      href: "https://github.com/SRWA-Cypherpunk",
                      label: "GitHub",
                      icon: Github,
                    },
                    { href: ROUTES.ADMIN, label: "Admin", icon: Shield },
                  ].map((link) => (
                    <li key={link.href}>
                      <motion.a
                        href={link.href}
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel={
                          link.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className={`text-sm text-fg-secondary hover:text-orange-400 inline-flex items-center gap-2 group ${
                          !isMobile && "transition-all"
                        }`}
                        whileHover={{ x: 4 }}
                      >
                        <link.icon
                          className={`h-4 w-4 text-orange-500/60 group-hover:text-orange-400 opacity-60 group-hover:opacity-100 ${
                            !isMobile && "transition-all"
                          }`}
                        />
                        <span>{link.label}</span>
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Community Column */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={viewportConfig}
              >
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent uppercase tracking-wider">
                    Join Our Community
                  </h4>
                  <p className="text-xs text-fg-secondary">
                    Stay updated with the latest from SRWA
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  {/* GitHub Button */}
                  <motion.a
                    href="https://github.com/SRWA-Cypherpunk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative group overflow-hidden"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-stroke-line bg-bg-elev-2 group-hover:border-purple-500/50 group-hover:shadow-[0_0_20px_rgba(153,69,255,0.3)] ${
                        !isMobile && "transition-all"
                      }`}
                    >
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-r from-purple-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 ${
                          !isMobile && "transition-opacity"
                        }`}
                      />
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                        initial={{ x: "-200%" }}
                        whileHover={{ x: "200%" }}
                        transition={{ duration: 0.6 }}
                      />
                      <div className="relative flex items-center gap-2.5 flex-1">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 ${
                            !isMobile && "transition-colors"
                          }`}
                        >
                          <Github
                            className={`h-4 w-4 text-fg-secondary group-hover:text-purple-400 ${
                              !isMobile && "transition-colors"
                            }`}
                          />
                        </div>
                        <span
                          className={`text-sm font-medium text-fg-primary group-hover:text-purple-300 ${
                            !isMobile && "transition-colors"
                          } flex-1`}
                        >
                          GitHub
                        </span>
                        <ArrowRight
                          className={`h-3.5 w-3.5 text-fg-muted group-hover:text-purple-400 group-hover:translate-x-1 ${
                            !isMobile && "transition-all"
                          }`}
                        />
                      </div>
                    </div>
                  </motion.a>

                  {/* Twitter/X Button */}
                  <motion.a
                    href="https://x.com/SRWAdotsol"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative group overflow-hidden"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-stroke-line bg-bg-elev-2 group-hover:border-blue-500/50 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] ${
                        !isMobile && "transition-all"
                      }`}
                    >
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-r from-blue-500/10 to-brand-500/10 opacity-0 group-hover:opacity-100 ${
                          !isMobile && "transition-opacity"
                        }`}
                      />
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                        initial={{ x: "-200%" }}
                        whileHover={{ x: "200%" }}
                        transition={{ duration: 0.6 }}
                      />
                      <div className="relative flex items-center gap-2.5 flex-1">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 ${
                            !isMobile && "transition-colors"
                          }`}
                        >
                          <Twitter
                            className={`h-4 w-4 text-fg-secondary group-hover:text-blue-400 ${
                              !isMobile && "transition-colors"
                            }`}
                          />
                        </div>
                        <span
                          className={`text-sm font-medium text-fg-primary group-hover:text-blue-300 ${
                            !isMobile && "transition-colors"
                          } flex-1`}
                        >
                          Twitter / X
                        </span>
                        <ArrowRight
                          className={`h-3.5 w-3.5 text-fg-muted group-hover:text-blue-400 group-hover:translate-x-1 ${
                            !isMobile && "transition-all"
                          }`}
                        />
                      </div>
                    </div>
                  </motion.a>

                  {/* Discord Button */}
                  <motion.a
                    href="https://discord.gg/your-discord-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative group overflow-hidden"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-stroke-line bg-bg-elev-2 group-hover:border-[#5865F2]/50 group-hover:shadow-[0_0_20px_rgba(88,101,242,0.3)] ${
                        !isMobile && "transition-all"
                      }`}
                    >
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-r from-[#5865F2]/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 ${
                          !isMobile && "transition-opacity"
                        }`}
                      />
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                        initial={{ x: "-200%" }}
                        whileHover={{ x: "200%" }}
                        transition={{ duration: 0.6 }}
                      />
                      <div className="relative flex items-center gap-2.5 flex-1">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg bg-[#5865F2]/10 group-hover:bg-[#5865F2]/20 ${
                            !isMobile && "transition-colors"
                          }`}
                        >
                          {/* Discord Logo SVG */}
                          <svg
                            className={`h-4 w-4 text-fg-secondary group-hover:text-[#5865F2] ${
                              !isMobile && "transition-colors"
                            }`}
                            viewBox="0 0 71 55"
                            fill="none"
                          >
                            <path
                              d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"
                              fill="currentColor"
                            />
                          </svg>
                        </div>
                        <span
                          className={`text-sm font-medium text-fg-primary group-hover:text-[#5865F2] ${
                            !isMobile && "transition-colors"
                          } flex-1`}
                        >
                          Discord
                        </span>
                        <ArrowRight
                          className={`h-3.5 w-3.5 text-fg-muted group-hover:text-[#5865F2] group-hover:translate-x-1 ${
                            !isMobile && "transition-all"
                          }`}
                        />
                      </div>
                    </div>
                  </motion.a>
                </div>
              </motion.div>
            </div>

            {/* Bottom Bar */}
            <motion.div
              className="pt-8 border-t border-stroke-line/50"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={viewportConfig}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs text-fg-muted">
                  <p>© 2025 SRWA Platform. All rights reserved.</p>
                  <div className="flex items-center gap-3">
                    <a
                      href="/privacy"
                      className="hover:text-brand-400 transition-colors"
                    >
                      Privacy Policy
                    </a>
                    <span>•</span>
                    <a
                      href="/terms"
                      className="hover:text-brand-400 transition-colors"
                    >
                      Terms of Service
                    </a>
                  </div>
                </div>
                <p className="text-xs text-fg-muted/80">
                  Built on{" "}
                  <motion.a
                    href="https://solana.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 font-semibold hover:text-brand-300 transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    Solana
                  </motion.a>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
}
