import { Button } from "@/components/ui/button";
import { Header, Footer } from "@/components/layout";
import { KPICard } from "@/components/ui/kpi-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { MarketChart } from "@/components/ui/market-chart";
import { HeroButton } from "@/components/ui/hero-button";
import { LaunchCountdownButton } from "@/components/ui/launch-countdown-button";
import { Globe as GlobeComponent } from "@/components/ui/globe";
import { RoadmapSection } from "@/components/sections/RoadmapSection";
import { FlowDiagram } from "@/components/FlowDiagram";
import { SolanaWalletButton } from "@/components/wallet/SolanaWalletButton";
import { useBlendPools } from "@/hooks/markets/useBlendPools";
import { useEnhancedPoolData } from "@/hooks/markets/useDefIndexData";
import { useDeployedTokens } from "@/hooks/solana/useDeployedTokens";
import { useWallet } from '@solana/wallet-adapter-react';
import { mockMarketStats, mockMarkets, mockMarketCharts } from "@/lib/mock-data";
import { PARTNERS } from "@/lib/constants";
import { FEATURES } from "@/lib/constants/features";
import Logo from "@/assets/logo.png";
import SRWALetters from "@/assets/srwa_letters.png";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  BarChart3,
  Users,
  TrendingUp,
  Lock,
  Globe,
  Zap,
  DollarSign,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Star,
  Coins,
  PiggyBank,
  Github,
  Twitter,
  FileText,
  BookOpen,
  Mail,
  MessageCircle,
  Wallet,
  ExternalLink
} from "lucide-react";

const shortenAddress = (address: string, chars = 4) => {
  if (!address) return "";
  return address.length <= chars * 2 ? address : `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

const formatCompactCurrency = (value: number) => {
  if (!value) {
    return "$0";
  }
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toLocaleString()}`;
};

const Index = () => {
  const navigate = useNavigate();

  // Fetch real pool data
  const { pools: blendPools, loading: poolsLoading } = useBlendPools();
  const { enhancedPools, loading: analyticsLoading } = useEnhancedPoolData(blendPools);

  // Wallet connection - using official Solana wallet adapter hook
  const { connected, connecting } = useWallet();

  const topMarkets = enhancedPools.slice(0, 3);
  const isLoading = poolsLoading || analyticsLoading;
  const { tokens: srwaTokens, loading: srwaTokensLoading } = useDeployedTokens();
  const displayedTokens = srwaTokens.slice(0, 3);
  const isMarketsLoading = srwaTokensLoading || (displayedTokens.length === 0 && isLoading);

  // Detect mobile to disable heavy animations
  // Initialize with actual window size to prevent flash
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    // Check immediately in case SSR gave wrong value
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Viewport config for animations (disabled on mobile to prevent flashing)
  const viewportConfig = isMobile ? false : { once: true };
  const viewportConfigWithMargin = isMobile ? false : { once: true, margin: "-100px" };
  
  // Calculate real market stats from enhanced pools
  const marketStats = enhancedPools.length > 0 ? {
    totalValueLocked: `$${(enhancedPools.reduce((sum, pool) => sum + pool.tvl, 0) / 1e6).toFixed(1)}M`,
    tokenizedAssets: enhancedPools.length,
    totalYieldDistributed: `$${(enhancedPools.reduce((sum, pool) => {
      // Calculate estimated yield: TVL * APY * estimated time period (e.g., 3 months = 0.25 year)
      const estimatedYield = pool.tvl * pool.supplyAPY * 0.25;
      return sum + estimatedYield;
    }, 0) / 1e6).toFixed(2)}M`
  } : {
    totalValueLocked: "$0.0M",
    tokenizedAssets: 0,
    totalYieldDistributed: "$0.00M"
  };
  
  const featuresRef = useRef(null);
  const marketsRef = useRef(null);
  const isFeatureInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const isMarketsInView = useInView(marketsRef, { once: true, margin: "-100px" });

  // Rotating text for hero section
  const rotatingPhrases = ["into DeFi", "through Compliance", "with On-Chain Trust"];
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % rotatingPhrases.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [rotatingPhrases.length]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* MASTER BACKGROUND - Ultra-smooth gradient with anti-banding */}
      <div className="absolute top-0 left-0 right-0 z-0 pointer-events-none" style={{ height: '600vh' }}>
        {/* SVG Noise Overlay for dithering (anti-banding) */}
        <svg className="absolute inset-0 opacity-[0.015] pointer-events-none w-full h-full">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>

        {/* Ultra-detailed gradient with 110+ stops - NO GREEN */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(
                to bottom,
                #0A0A0A 0%,
                #0A0A0A 8vh,
                #0b0a0c 12vh,
                #0c0b0d 16vh,
                #0d0b0e 20vh,
                #0e0c0f 24vh,
                #100d12 28vh,
                #110d14 32vh,
                #130e16 36vh,
                #140f18 40vh,
                #16101a 44vh,
                #17101b 48vh,
                #19111d 52vh,
                #1a0f1f 56vh,
                #1b1020 60vh,
                #1c1021 64vh,
                #1d1122 68vh,
                #1e1223 72vh,
                #1f1224 76vh,
                #201324 80vh,
                #221426 84vh,
                rgba(40,18,45,0.98) 87vh,
                rgba(48,22,55,0.96) 89vh,
                rgba(55,24,65,0.94) 91vh,
                rgba(62,25,75,0.92) 93vh,
                rgba(68,26,85,0.90) 95vh,
                rgba(75,27,100,0.88) 97vh,
                rgba(80,27,112,0.86) 99vh,
                rgba(84,28,125,0.82) 101vh,
                rgba(87,28,132,0.78) 103vh,
                rgba(88,28,135,0.75) 105vh,
                rgba(88,28,135,0.72) 108vh,
                rgba(88,28,135,0.68) 112vh,
                rgba(88,28,135,0.65) 116vh,
                rgba(88,28,135,0.62) 121vh,
                rgba(88,28,135,0.60) 126vh,
                rgba(88,28,135,0.60) 132vh,
                rgba(87,28,133,0.59) 136vh,
                rgba(85,28,130,0.58) 140vh,
                rgba(82,27,125,0.56) 144vh,
                rgba(79,26,120,0.54) 148vh,
                rgba(75,25,114,0.52) 152vh,
                rgba(70,24,105,0.48) 156vh,
                rgba(65,23,98,0.44) 160vh,
                rgba(58,21,88,0.40) 164vh,
                rgba(50,19,75,0.35) 168vh,
                rgba(42,17,62,0.30) 172vh,
                rgba(34,15,50,0.24) 176vh,
                rgba(26,12,38,0.18) 180vh,
                rgba(20,10,28,0.13) 184vh,
                rgba(15,8,20,0.08) 188vh,
                #0A0A0A 192vh,
                #0A0A0A 196vh,
                #0A0A0A 200vh,
                rgba(11,10,13,0.04) 203vh,
                rgba(14,11,16,0.08) 206vh,
                rgba(18,12,20,0.12) 209vh,
                rgba(22,13,24,0.16) 212vh,
                rgba(28,15,30,0.20) 215vh,
                rgba(35,18,38,0.25) 218vh,
                rgba(42,20,46,0.30) 221vh,
                rgba(50,22,56,0.36) 224vh,
                rgba(58,24,66,0.42) 227vh,
                rgba(66,25,78,0.48) 230vh,
                rgba(72,27,90,0.54) 233vh,
                rgba(78,28,104,0.58) 236vh,
                rgba(83,28,118,0.62) 239vh,
                rgba(86,28,128,0.64) 242vh,
                rgba(88,28,135,0.65) 245vh,
                rgba(88,28,135,0.65) 252vh,
                rgba(90,29,133,0.66) 257vh,
                rgba(94,31,130,0.68) 262vh,
                rgba(100,33,126,0.70) 267vh,
                rgba(106,35,121,0.72) 272vh,
                rgba(113,37,114,0.74) 277vh,
                rgba(120,40,105,0.76) 282vh,
                rgba(117,39,95,0.74) 287vh,
                rgba(112,37,84,0.72) 292vh,
                rgba(105,34,72,0.69) 297vh,
                rgba(96,31,60,0.66) 302vh,
                rgba(86,27,48,0.63) 307vh,
                rgba(77,24,38,0.60) 312vh,
                rgba(70,21,30,0.57) 317vh,
                rgba(67,20,7,0.55) 322vh,
                rgba(67,20,7,0.55) 342vh,
                rgba(67,20,7,0.55) 362vh,
                rgba(69,21,12,0.57) 366vh,
                rgba(72,23,20,0.59) 370vh,
                rgba(77,26,32,0.62) 374vh,
                rgba(82,29,48,0.64) 378vh,
                rgba(85,31,65,0.67) 382vh,
                rgba(87,33,82,0.69) 386vh,
                rgba(88,34,98,0.71) 390vh,
                rgba(88,35,115,0.73) 394vh,
                rgba(88,35,128,0.74) 398vh,
                rgba(88,28,135,0.75) 402vh,
                rgba(88,28,135,0.75) 422vh,
                rgba(88,28,135,0.75) 442vh,
                rgba(86,30,132,0.73) 446vh,
                rgba(83,32,128,0.71) 450vh,
                rgba(78,35,122,0.68) 454vh,
                rgba(72,38,115,0.65) 458vh,
                rgba(64,42,105,0.61) 462vh,
                rgba(55,45,92,0.56) 466vh,
                rgba(45,48,78,0.50) 470vh,
                rgba(35,50,62,0.44) 474vh,
                rgba(26,48,48,0.37) 478vh,
                rgba(18,42,35,0.30) 482vh,
                rgba(12,32,24,0.22) 486vh,
                rgba(10,22,16,0.15) 490vh,
                rgba(10,14,12,0.08) 494vh,
                rgba(10,10,10,0.03) 498vh,
                #0A0A0A 502vh,
                #0A0A0A 100%
              ),
              radial-gradient(
                ellipse 100% 30% at 50% 110vh,
                rgba(153,69,255,0.18),
                transparent 60%
              )
            `,
          }}
        />
      </div>

      <div className="relative z-10">
        <Header />
      </div>

      {/* Enhanced Hero Section with Dynamic Gradients */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Globe */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="blur-[2px] opacity-30">
            <GlobeComponent size={1000} className="max-w-none" />
          </div>
        </div>

        {/* Dark overlay for readability - muito reduzido */}
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-[#0A0A0A]/20 via-transparent to-transparent pointer-events-none" />

        {/* Mesh gradient - CSS puro */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: 'radial-gradient(circle at 20% 30%, rgba(153,69,255,0.15), transparent 40%), radial-gradient(circle at 80% 50%, rgba(255,107,53,0.12), transparent 40%)'
            }}
          />
        </div>

        {/* Grid pattern sutil */}
        <div
          className="absolute inset-0 z-5 opacity-[0.01]"
          style={{
            backgroundImage: 'linear-gradient(rgba(153,69,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,53,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 z-30 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 rounded-full ${i % 2 === 0 ? 'bg-purple-500/20' : 'bg-orange-500/20'}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={isMobile ? {} : {
                y: [0, -30, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={isMobile ? {} : {
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 relative z-40">
          <motion.div
            className="text-center space-y-8"
            initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Animated Hero Heading */}
            <div className="space-y-6 sm:space-y-8">
              <motion.div
                className="space-y-3 sm:space-y-4"
                initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: isMobile ? 0 : 0.2 }}
              >
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-fg-primary leading-tight px-4">
                  Real World Assets
                  <br />
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentPhraseIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isMobile ? {
                        opacity: 1,
                        y: 0
                      } : {
                        opacity: 1,
                        y: 0,
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                      }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={isMobile ? {
                        opacity: { duration: 0.5 },
                        y: { duration: 0.5 }
                      } : {
                        opacity: { duration: 0.5 },
                        y: { duration: 0.5 },
                        backgroundPosition: { duration: 5, repeat: Infinity, ease: 'easeInOut' }
                      }}
                      className="inline-block bg-gradient-to-r from-purple-500 via-purple-400 to-orange-500 bg-clip-text text-transparent leading-relaxed pb-2"
                      style={{ backgroundSize: '200% 200%' }}
                    >
                      {rotatingPhrases[currentPhraseIndex]}
                    </motion.span>
                  </AnimatePresence>
                </h1>

                <motion.p
                  className="text-base sm:text-lg md:text-xl lg:text-2xl text-fg-secondary max-w-4xl mx-auto leading-relaxed px-4"
                  initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: isMobile ? 0 : 0.6 }}
                >
                  Bringing institutional-grade assets and compliance to decentralized finance, enabling real yield backed by tangible value.
                </motion.p>
              </motion.div>
            </div>

            <motion.div
              className="flex justify-center px-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <LaunchCountdownButton
                className="w-full sm:w-auto"
                buttonClassName="w-full sm:w-auto"
                icon={<ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />}
                onLaunch={scrollToTop}
              />
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* Powered by Section */}
      <section className="relative py-16 sm:py-20">
        {/* Gradiente radial de fundo */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(153,69,255,0.08), transparent 60%)'
          }}
        />

        {/* Círculos concêntricos animados */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute border-2 rounded-full ${i % 2 === 0 ? 'border-purple-500' : 'border-orange-500'}`}
              style={{
                width: `${200 + i * 120}px`,
                height: `${200 + i * 120}px`,
              }}
              animate={isMobile ? {} : {
                opacity: [0.8, 1, 0.8],
                scale: [1, 1.02, 1],
              }}
              transition={isMobile ? {} : {
                duration: 4 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2
              }}
            />
          ))}
        </div>

        {/* Partículas flutuantes sutis */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 rounded-full bg-purple-500/10 ${!isMobile && "animate-pulse"}`}
              style={{
                left: `${15 + Math.random() * 70}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        <motion.div
          className="text-center space-y-6 mb-16"
          initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 30 }}
          whileInView={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={viewportConfig}
        >
          <motion.h2
            className="text-2xl sm:text-3xl lg:text-h1 font-semibold text-fg-primary px-4"
            initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Powered by Industry Leaders
          </motion.h2>
          <motion.p
            className="text-sm sm:text-body-1 text-fg-secondary max-w-2xl mx-auto px-4"
            initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Built in collaboration with leading blockchain protocols and institutions.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-12 mb-12 sm:mb-16 px-4"
          initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={viewportConfig}
        >
          {PARTNERS.map((partner, index) => (
            <motion.a
              key={partner.name}
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center opacity-70 hover:opacity-100 ${!isMobile && "transition-opacity duration-300"}`}
              initial={isMobile ? { opacity: 0.7 } : { opacity: 0, y: 20 }}
              whileInView={isMobile ? { opacity: 0.7 } : { opacity: 0.7, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={isMobile ? {} : {
                scale: 1.1,
                opacity: 1,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="w-full h-auto max-h-12 object-contain"
              />
            </motion.a>
          ))}
        </motion.div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="relative py-16 sm:py-20 -mt-8 sm:-mt-16">
        {/* Diagonal gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(153,69,255,0.05) 0%, transparent 50%, rgba(153,69,255,0.02) 100%)'
          }}
        />

        {/* Diagonal grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(45deg, rgba(153,69,255,0.3) 1px, transparent 1px), linear-gradient(-45deg, rgba(153,69,255,0.3) 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }}
        />

        {/* Decorative orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Purple orb - top left */}
          <div
            className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-[0.04]"
            style={{
              background: 'radial-gradient(circle, rgba(153,69,255,0.3), transparent 70%)',
              filter: 'blur(60px)'
            }}
          />
          {/* Purple orb - bottom right (suave) */}
          <div
            className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full opacity-[0.02]"
            style={{
              background: 'radial-gradient(circle, rgba(153,69,255,0.2), transparent 70%)',
              filter: 'blur(60px)'
            }}
          />
        </div>

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">

        <motion.div
          className="text-center space-y-4 mb-12"
          initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 30 }}
          whileInView={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={viewportConfigWithMargin}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-h1 font-bold text-white">
            Our Numbers
          </h2>
          <p className="text-sm sm:text-body-1 text-fg-secondary max-w-xl mx-auto">
            Real-time metrics powered by on-chain data
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch max-w-full sm:max-w-5xl mx-auto"
          initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 50 }}
          whileInView={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, staggerChildren: isMobile ? 0 : 0.1 }}
          viewport={viewportConfigWithMargin}
        >
          <motion.div
            initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 30 }}
            whileInView={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
            whileHover={isMobile ? {} : { y: -6 }}
            className="group w-full"
          >
            <KPICard
              title="Total Value Locked"
              value={isLoading ? "Loading..." : marketStats.totalValueLocked}
              icon={DollarSign}
              trend="up"
              trendValue="Live"
              variant="gradient"
            />
          </motion.div>
          <motion.div
            initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 30 }}
            whileInView={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={isMobile ? {} : { y: -6 }}
            className="group w-full"
          >
            <KPICard
              title="Tokenized Assets"
              value={isLoading ? "-" : marketStats.tokenizedAssets.toString()}
              icon={Coins}
              trend="neutral"
              trendValue="Markets"
              variant="gradient"
            />
          </motion.div>
          <motion.div
            initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 30 }}
            whileInView={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={isMobile ? {} : { y: -6 }}
            className="group w-full"
          >
            <KPICard
              title="Total Yield Distributed"
              value={isLoading ? "-" : marketStats.totalYieldDistributed}
              icon={PiggyBank}
              trend="up"
              trendValue="Active"
              variant="gradient"
            />
          </motion.div>
        </motion.div>
        </div>
      </section>

      {/* Protocol Flow Section - How SRWA Works */}
      <section ref={featuresRef} className="relative py-16 sm:py-20 overflow-visible">
        {/* Horizontal lines pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(153,69,255,0.5) 1px, transparent 1px)',
            backgroundSize: '100% 100px'
          }}
        />

        {/* Radial gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 30% 50%, rgba(153,69,255,0.06), transparent 50%)'
          }}
        />

        {/* Green accent particles (subtle) */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-green-500/15"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              animate={isMobile ? {} : {
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.5, 1],
              }}
              transition={isMobile ? {} : {
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">

        {/* Header */}
        <motion.div
          className="text-center space-y-4 mb-16"
          initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 30 }}
          whileInView={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={viewportConfigWithMargin}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-h1 font-bold text-white">
            How SRWA Protocol Works
          </h2>
          <p className="text-sm sm:text-body-1 text-fg-secondary max-w-2xl mx-auto">
            End-to-end real-world asset tokenization and lending flow
          </p>
        </motion.div>

        {/* Flow Diagram */}
        <FlowDiagram />

        </div>
      </section>

      {/* Markets Preview */}
      <section ref={marketsRef} className="relative py-16 sm:py-20 overflow-visible">
        {/* Radial mesh gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 20% 20%, rgba(153,69,255,0.06), transparent 40%), radial-gradient(circle at 50% 50%, rgba(255,107,53,0.08), transparent 50%)'
          }}
        />

        {/* Multiple floating orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Orange orb - top center */}
          <motion.div
            className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full opacity-[0.05]"
            style={{
              background: 'radial-gradient(circle, rgba(255,107,53,0.4), transparent 70%)',
              filter: 'blur(80px)'
            }}
            animate={isMobile ? {} : {
              y: [0, 20, 0],
              opacity: [0.05, 0.08, 0.05],
            }}
            transition={isMobile ? {} : {
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Purple orb - bottom left */}
          <motion.div
            className="absolute bottom-20 left-20 w-72 h-72 rounded-full opacity-[0.04]"
            style={{
              background: 'radial-gradient(circle, rgba(153,69,255,0.4), transparent 70%)',
              filter: 'blur(70px)'
            }}
            animate={isMobile ? {} : {
              x: [0, 15, 0],
              opacity: [0.04, 0.06, 0.04],
            }}
            transition={isMobile ? {} : {
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Green orb - right */}
          <motion.div
            className="absolute top-1/2 right-10 w-60 h-60 rounded-full opacity-[0.03]"
            style={{
              background: 'radial-gradient(circle, rgba(20,241,149,0.3), transparent 70%)',
              filter: 'blur(60px)'
            }}
            animate={isMobile ? {} : {
              y: [0, -15, 0],
              opacity: [0.03, 0.05, 0.03],
            }}
            transition={isMobile ? {} : {
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,107,53,0.5) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">

        <motion.div
          className="text-center space-y-6 mb-16"
          initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 30 }}
          whileInView={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={viewportConfigWithMargin}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-h1 font-bold text-white px-4">
            Active Markets
          </h2>
          <p className="text-sm sm:text-body-1 text-fg-secondary max-w-2xl mx-auto px-4">
            Institutional-grade Real-World Asset markets with regulated access and competitive yields.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12"
          initial={{ opacity: 0 }}
          animate={isMarketsInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, staggerChildren: 0.15 }}
        >
{isMarketsLoading ? (
            // Loading state
            [...Array(3)].map((_, index) => (
              <motion.div
                key={`loading-${index}`}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Card className="card-institutional h-full border-brand-500/30">
                  <div className="space-y-6 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="h-6 w-16 bg-brand-500/20 rounded"></div>
                      <div className="h-6 w-12 bg-green-500/20 rounded"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-8 w-3/4 bg-brand-500/20 rounded"></div>
                      <div className="h-4 w-1/2 bg-brand-500/10 rounded"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center p-3 rounded-lg bg-brand-500/5">
                        <div className="h-4 w-16 bg-brand-500/20 rounded mb-2 mx-auto"></div>
                        <div className="h-6 w-12 bg-brand-500/20 rounded mx-auto"></div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-brand-500/5">
                        <div className="h-4 w-8 bg-brand-500/20 rounded mb-2 mx-auto"></div>
                        <div className="h-6 w-16 bg-brand-500/20 rounded mx-auto"></div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : displayedTokens.length > 0 ? (
            displayedTokens.map((token, index) => {
              const mintAddress = token.mint.toBase58();
              const protocolLabel = token.yieldConfig?.protocol
                ? token.yieldConfig.protocol.charAt(0).toUpperCase() + token.yieldConfig.protocol.slice(1)
                : "Custom";
              const apyDisplay = `${(token.supplyAPY ?? 0).toFixed(2)}%`;
              const tvlDisplay = formatCompactCurrency(token.tvl ?? 0);
              return (
                <motion.div
                  key={mintAddress}
                  initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 30 }}
                  whileInView={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={viewportConfigWithMargin}
                  whileHover={isMobile ? {} : { y: -8, scale: 1.02 }}
                  className="group"
                >
                  <Card className={`card-institutional hover-lift h-full relative overflow-hidden border-brand-500/30 group-hover:border-brand-400/50 ${!isMobile && "transition-all duration-300"}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 ${!isMobile && "transition-opacity duration-500"}`} />

                    <div className="space-y-6 relative z-10">
                      <div className="flex items-center justify-between">
                        <motion.div whileHover={{ scale: 1.05 }}>
                          <Badge
                            variant="gradient"
                            className="text-micro px-3 py-1 shadow-[0_12px_32px_rgba(153,69,255,0.25)]"
                          >
                            {token.symbol?.slice(0, 6) ?? "SRWA"}
                          </Badge>
                        </motion.div>
                        <Badge variant="secondary" className="text-micro bg-green-500/10 text-green-400 border-green-500/20">
                          <motion.div
                            className="w-2 h-2 bg-green-400 rounded-full mr-1"
                            animate={isMobile ? {} : { opacity: [0.6, 1, 0.6] }}
                            transition={isMobile ? {} : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          />
                          Disponível
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <h3 className={`text-h3 font-semibold text-fg-primary group-hover:text-brand-300 ${!isMobile && "transition-colors"}`}>
                          {token.name}
                        </h3>
                        <p className={`text-body-2 text-fg-muted group-hover:text-fg-secondary ${!isMobile && "transition-colors"}`}>
                          Estratégia de yield:{" "}
                          <span className="bg-gradient-to-r from-brand-500 via-brand-400 to-orange-400 bg-clip-text text-transparent font-medium">
                            {protocolLabel}
                          </span>
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <motion.div
                          className="relative overflow-hidden rounded-xl p-[1px] shadow-[0_18px_45px_rgba(153,69,255,0.25)]"
                          whileHover={{ scale: 1.02 }}
                          animate={isMobile ? {} : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                          transition={isMobile ? {} : { duration: 5, repeat: Infinity, ease: "easeInOut" }}
                          style={{
                            backgroundSize: "200% 200%",
                            backgroundImage: "linear-gradient(135deg, #6D28D9 0%, #8B5CF6 50%, #FF6B35 100%)",
                          }}
                        >
                          <div
                            className={`flex flex-col items-center gap-1 bg-bg-elev-2/95 px-4 py-3 text-center ${!isMobile && "transition-colors duration-300"} group-hover:bg-bg-elev-2/80`}
                            style={{ borderRadius: "calc(0.75rem - 2px)" }}
                          >
                            <p className="text-micro text-fg-muted uppercase tracking-wide">Target APY</p>
                            <AnimatedCounter
                              value={apyDisplay}
                              className="text-h3 font-semibold text-fg-primary tabular-nums"
                            />
                          </div>
                        </motion.div>
                        <motion.div
                          className="relative overflow-hidden rounded-xl p-[1px] shadow-[0_18px_45px_rgba(153,69,255,0.25)]"
                          whileHover={{ scale: 1.02 }}
                          animate={isMobile ? {} : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                          transition={isMobile ? {} : { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                          style={{
                            backgroundSize: "200% 200%",
                            backgroundImage: "linear-gradient(135deg, #6D28D9 0%, #8B5CF6 50%, #FF6B35 100%)",
                          }}
                        >
                          <div
                            className={`flex flex-col items-center gap-1 bg-bg-elev-2/95 px-4 py-3 text-center ${!isMobile && "transition-colors duration-300"} group-hover:bg-bg-elev-2/80`}
                            style={{ borderRadius: "calc(0.75rem - 2px)" }}
                          >
                            <p className="text-micro text-fg-muted uppercase tracking-wide">Target TVL</p>
                            <div className="text-h3 font-semibold text-fg-primary tabular-nums">
                              {tvlDisplay}
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      <div className="rounded-xl border border-border/60 bg-bg-elev-2/70 px-4 py-3 space-y-3">
                        <div className="flex items-center justify-between text-micro text-fg-muted uppercase tracking-wide">
                          <span>Mint address</span>
                          <span className="font-mono text-fg-secondary">{shortenAddress(mintAddress)}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="w-full justify-center gap-2"
                        >
                          <a
                            href={`https://explorer.solana.com/address/${mintAddress}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Ver no explorer
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="gradient"
                          className={`group w-full shadow-[0_18px_45px_rgba(153,69,255,0.25)] ${!isMobile && "transition-all duration-500"} hover:shadow-[0_28px_60px_rgba(255,107,53,0.35)]`}
                          onClick={() => navigate('/investor')}
                        >
                          Investir agora
                          <ArrowRight className={`ml-2 h-4 w-4 group-hover:translate-x-1 ${!isMobile && "transition-transform"}`} />
                        </Button>
                      </motion.div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          ) : topMarkets.length > 0 ? (
            topMarkets.map((market, index) => (
              <motion.div
                key={market.address}
                initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 30 }}
                whileInView={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={viewportConfigWithMargin}
                whileHover={isMobile ? {} : { y: -8, scale: 1.02 }}
                className="group"
              >
                <Card className={`card-institutional hover-lift h-full relative overflow-hidden border-brand-500/30 group-hover:border-brand-400/50 ${!isMobile && "transition-all duration-300"}`}>
                  {/* Subtle brand gradient on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 ${!isMobile && "transition-opacity duration-500"}`} />
                  
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <motion.div whileHover={{ scale: 1.1 }}>
                        <Badge
                          variant="gradient"
                          className="text-micro px-3 py-1 shadow-[0_12px_32px_rgba(153,69,255,0.25)]"
                        >
                          {market.name.replace(/\s+/g, '').slice(0, 4).toUpperCase()}
                        </Badge>
                      </motion.div>
                      <Badge variant="secondary" className="text-micro bg-green-500/10 text-green-400 border-green-500/20">
                        <motion.div
                          className="w-2 h-2 bg-green-400 rounded-full mr-1"
                          animate={isMobile ? {} : { opacity: [0.6, 1, 0.6] }}
                          transition={isMobile ? {} : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />
                        {market.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className={`text-h3 font-semibold text-fg-primary group-hover:text-brand-300 ${!isMobile && "transition-colors"}`}>
                        {market.name}
                      </h3>
                      <p className={`text-body-2 text-fg-muted group-hover:text-fg-secondary ${!isMobile && "transition-colors"}`}>
                        Class:{" "}
                        <span className="bg-gradient-to-r from-brand-500 via-brand-400 to-orange-400 bg-clip-text text-transparent font-medium">
                          {market.class}
                        </span>
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <motion.div
                        className="relative overflow-hidden rounded-xl p-[1px] shadow-[0_18px_45px_rgba(153,69,255,0.25)]"
                        whileHover={{ scale: 1.02 }}
                        animate={isMobile ? {} : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                        transition={isMobile ? {} : { duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        style={{
                          backgroundSize: "200% 200%",
                          backgroundImage: "linear-gradient(135deg, #6D28D9 0%, #8B5CF6 50%, #FF6B35 100%)",
                        }}
                      >
                        <div
                          className={`flex flex-col items-center gap-1 bg-bg-elev-2/95 px-4 py-3 text-center ${!isMobile && "transition-colors duration-300"} group-hover:bg-bg-elev-2/80`}
                          style={{ borderRadius: "calc(0.75rem - 2px)" }}
                        >
                          <p className="text-micro text-fg-muted uppercase tracking-wide">Supply APY</p>
                          <AnimatedCounter 
                            value={`${(market.supplyAPY * 100).toFixed(2)}%`} 
                            className="text-h3 font-semibold text-fg-primary tabular-nums"
                          />
                        </div>
                      </motion.div>
                      <motion.div
                        className="relative overflow-hidden rounded-xl p-[1px] shadow-[0_18px_45px_rgba(153,69,255,0.25)]"
                        whileHover={{ scale: 1.02 }}
                        animate={isMobile ? {} : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                        transition={isMobile ? {} : { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                        style={{
                          backgroundSize: "200% 200%",
                          backgroundImage: "linear-gradient(135deg, #6D28D9 0%, #8B5CF6 50%, #FF6B35 100%)",
                        }}
                      >
                        <div
                          className={`flex flex-col items-center gap-1 bg-bg-elev-2/95 px-4 py-3 text-center ${!isMobile && "transition-colors duration-300"} group-hover:bg-bg-elev-2/80`}
                          style={{ borderRadius: "calc(0.75rem - 2px)" }}
                        >
                          <p className="text-micro text-fg-muted uppercase tracking-wide">TVL</p>
                          <div className="text-h3 font-semibold text-fg-primary tabular-nums">
                            <span className="mr-1 text-fg-muted">$</span>
                            <AnimatedCounter 
                              value={market.tvl > 0 ? `${(market.tvl / 1e6).toFixed(1)}M` : '0.0M'} 
                              className=""
                            />
                          </div>
                        </div>
                      </motion.div>
                    </div>
                    
                    {/* Utilization Bar - Fixed for >100% values */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-micro text-fg-muted">Utilization</span>
                        <span className={`text-micro font-medium ${
                          market.utilizationRate > 1 ? 'text-amber-400' : 'text-brand-400'
                        }`}>
                          {(market.utilizationRate * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-bg-elev-2 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className={`h-2 rounded-full ${
                            market.utilizationRate > 1
                              ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                              : 'bg-gradient-to-r from-brand-600 via-brand-500 to-orange-500'
                          }`}
                          initial={{ width: 0 }}
                          whileInView={{
                            width: `${Math.min(market.utilizationRate * 100, 100)}%`
                          }}
                          transition={{ duration: 1.5, delay: index * 0.2 }}
                        />
                      </div>
                      {market.utilizationRate > 1 && (
                        <div className="text-center">
                          <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full border border-amber-400/20">
                            High Utilization
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="gradient"
                        className={`group w-full shadow-[0_18px_45px_rgba(153,69,255,0.25)] ${!isMobile && "transition-all duration-500"} hover:shadow-[0_28px_60px_rgba(255,107,53,0.35)]`}
                        onClick={scrollToTop}
                      >
                        View Details
                        <ArrowRight className={`ml-2 h-4 w-4 group-hover:translate-x-1 ${!isMobile && "transition-transform"}`} />
                      </Button>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            // No SRWA tokens state
            <div className="col-span-3 text-center py-12">
              <p className="text-body-1 text-fg-muted">Nenhum token SRWA disponível no momento.</p>
            </div>
          )}

        </motion.div>

        <motion.div
          className="text-center"
          initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={viewportConfig}
        >
          <LaunchCountdownButton
            icon={<ArrowRight className="h-5 w-5" />}
            onLaunch={scrollToTop}
            className="w-full sm:w-auto mx-auto"
          />
        </motion.div>
        </div>
      </section>


      {/* Roadmap Section */}
      <RoadmapSection />

      {/* Footer */}
      <Footer
        showCTA
        ctaAction="dashboard"
        ctaTitle="Ready to Get Started?"
        ctaDescription="Connect your wallet and start exploring institutional-grade RWA markets"
      />

    </div>
  );
};

export default Index;
