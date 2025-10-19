import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { KPICard } from "@/components/ui/kpi-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { MarketChart } from "@/components/ui/market-chart";
import { HeroButton } from "@/components/ui/hero-button";
import { Globe as GlobeComponent } from "@/components/ui/globe";
import { RoadmapSection } from "@/components/sections/RoadmapSection";
import { useBlendPools } from "@/hooks/markets/useBlendPools";
import { useEnhancedPoolData } from "@/hooks/markets/useDefIndexData";
import { useWallet } from "@/contexts/wallet/WalletContext";
import { mockMarketStats, mockMarkets, mockMarketCharts } from "@/lib/mock-data";
import { ROUTES, COLORS, PARTNERS } from "@/lib/constants";
import Logo from "@/assets/logo.png";
import SRWALetters from "@/assets/srwa_letters.png";

// Simplified backgrounds - just colors
import { COLORS as BG_COLORS } from "@/lib/constants/backgrounds";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
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
  MessageCircle
} from "lucide-react";

const Index = () => {
  // Fetch real pool data
  const { pools: blendPools, loading: poolsLoading } = useBlendPools();
  const { enhancedPools, loading: analyticsLoading } = useEnhancedPoolData(blendPools);
  
  // Wallet connection
  const { isConnected, isConnecting, connect } = useWallet();
  
  const topMarkets = enhancedPools.slice(0, 3);
  const isLoading = poolsLoading || analyticsLoading;
  
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
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
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
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Animated Hero Heading */}
            <div className="space-y-6 sm:space-y-8">
              <motion.div
                className="space-y-3 sm:space-y-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-fg-primary leading-tight px-4">
                  Real World Assets
                  <br />
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentPhraseIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                      }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
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
              <HeroButton
                onClick={() => window.location.href = ROUTES.DASHBOARD}
                variant="brand"
                className="w-full sm:w-auto"
                icon={<ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />}
              >
                Launch App
              </HeroButton>
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
              animate={{
                opacity: [0.8, 1, 0.8],
                scale: [1, 1.02, 1],
              }}
              transition={{
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
              className="absolute w-2 h-2 rounded-full bg-purple-500/10 animate-pulse"
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
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-2xl sm:text-3xl lg:text-h1 font-semibold text-fg-primary px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Powered by Industry Leaders
          </motion.h2>
          <motion.p
            className="text-sm sm:text-body-1 text-fg-secondary max-w-2xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Built in collaboration with leading blockchain protocols and institutions.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-12 mb-12 sm:mb-16 px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {PARTNERS.map((partner, index) => (
            <motion.a
              key={partner.name}
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 0.7, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{
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
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-h1 font-bold bg-gradient-to-r from-brand-400 via-brand-300 to-green-400 bg-clip-text text-transparent">
            Our Numbers
          </h2>
          <p className="text-sm sm:text-body-1 text-fg-secondary max-w-xl mx-auto">
            Real-time metrics powered by on-chain data
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, staggerChildren: 0.1 }}
          viewport={{ once: true }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
            whileHover={{ y: -6 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-brand-500 rounded-xl blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
            <KPICard
              title="Total Value Locked"
              value={isLoading ? "Loading..." : marketStats.totalValueLocked}
              icon={DollarSign}
              trend="up"
              trendValue="Live"
              className="relative border-brand-500/20 hover:border-brand-400/40 transition-colors"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ y: -6 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-green-500 rounded-xl blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
            <KPICard
              title="Tokenized Assets"
              value={isLoading ? "-" : marketStats.tokenizedAssets.toString()}
              icon={Coins}
              subtitle="RWA Markets"
              className="relative border-green-500/20 hover:border-green-400/40 transition-colors"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -6 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-orange-500 rounded-xl blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
            <KPICard
              title="Total Yield Distributed"
              value={isLoading ? "-" : marketStats.totalYieldDistributed}
              icon={PiggyBank}
              trend="up"
              trendValue="Active"
              className="relative border-orange-500/20 hover:border-orange-400/40 transition-colors"
            />
          </motion.div>
        </motion.div>
        </div>
      </section>

      {/* Features Section */}
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
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">

        <motion.div
          className="text-center space-y-4 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-2xl sm:text-3xl lg:text-h1 font-bold px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-brand-400 to-green-400 bg-clip-text text-transparent">
              Institutional-Grade
            </span>
            <span className="text-fg-primary ml-3">Infrastructure</span>
          </motion.h2>
          <motion.p
            className="text-sm sm:text-body-1 text-fg-secondary max-w-2xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Purpose-built for professional asset managers, treasuries, and institutional investors.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          initial={{ opacity: 0 }}
          animate={isFeatureInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, staggerChildren: 0.1 }}
        >
          {[
            {
              icon: Shield,
              title: "Permissioned Markets",
              description: "KYC/KYB compliance with role-based access controls and regulatory transparency.",
              color: "text-green-400"
            },
            {
              icon: Globe,
              title: "Hybrid Oracles",
              description: "Pyth Network price feeds combined with NAV attestations from custodians.",
              color: "text-brand-400"
            },
            {
              icon: Zap,
              title: "Efficient Capital",
              description: "Optimized lending protocols with isolated risk pools for maximum capital efficiency.",
              color: "text-orange-400"
            },
            {
              icon: BarChart3,
              title: "Risk Premiums",
              description: "Granular risk modeling with base rates plus asset-specific premiums.",
              color: "text-brand-400"
            },
            {
              icon: Zap,
              title: "Lightning Fast",
              description: "Built on Solana for sub-second finality and ultra-low transaction costs.",
              color: "text-green-400"
            },
            {
              icon: Users,
              title: "Institutional UX",
              description: "Professional dashboards, reporting, and treasury-grade position management.",
              color: "text-orange-400"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={isFeatureInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className="group relative"
            >
              <Card className="card-institutional h-full relative border-stroke-line hover:border-brand-500/30 transition-all duration-300">
                {/* Subtle hover glow */}
                <div className="absolute inset-0 bg-brand-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="space-y-6 relative z-10">
                  <motion.div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 border border-brand-500/20 group-hover:border-brand-500/40 transition-all"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </motion.div>
                  <div className="space-y-3">
                    <h3 className="text-h3 font-bold text-fg-primary group-hover:text-brand-300 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-body-2 text-fg-secondary leading-relaxed group-hover:text-fg-primary/90 transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
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
            animate={{
              y: [0, 20, 0],
              opacity: [0.05, 0.08, 0.05],
            }}
            transition={{
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
            animate={{
              x: [0, 15, 0],
              opacity: [0.04, 0.06, 0.04],
            }}
            transition={{
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
            animate={{
              y: [0, -15, 0],
              opacity: [0.03, 0.05, 0.03],
            }}
            transition={{
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
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-2xl sm:text-3xl lg:text-h1 font-bold px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-green-400 to-brand-400 bg-clip-text text-transparent">
              Active Markets
            </span>
          </motion.h2>
          <motion.p
            className="text-sm sm:text-body-1 text-fg-secondary max-w-2xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Institutional-grade Real-World Asset markets with regulated access and competitive yields.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12"
          initial={{ opacity: 0 }}
          animate={isMarketsInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, staggerChildren: 0.15 }}
        >
{isLoading ? (
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
          ) : topMarkets.length > 0 ? (
            topMarkets.map((market, index) => (
              <motion.div
                key={market.address}
                initial={{ opacity: 0, y: 60, rotateX: 45 }}
                animate={isMarketsInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 60, rotateX: 45 }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                whileHover={{ y: -12, scale: 1.03 }}
                className="group perspective-1000"
              >
                <Card className="card-institutional hover-lift h-full relative overflow-hidden border-brand-500/30 group-hover:border-brand-400/50 transition-all duration-300">
                  {/* Subtle brand gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <motion.div whileHover={{ scale: 1.1 }}>
                        <Badge variant="outline" className="text-micro border-brand-500/40 text-brand-300">
                          {market.name.slice(0, 4).toUpperCase()}
                        </Badge>
                      </motion.div>
                      <Badge variant="secondary" className="text-micro bg-green-500/10 text-green-400 border-green-500/20">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse" />
                        {market.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-h3 font-semibold text-fg-primary group-hover:text-brand-300 transition-colors">
                        {market.name}
                      </h3>
                      <p className="text-body-2 text-fg-muted group-hover:text-fg-secondary transition-colors">
                        Class: <span className="text-brand-400 font-medium">{market.class}</span>
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <motion.div 
                        className="text-center p-3 rounded-lg bg-brand-500/5 group-hover:bg-brand-500/10 transition-colors"
                        whileHover={{ scale: 1.05 }}
                      >
                        <p className="text-micro text-fg-muted uppercase tracking-wide mb-1">Supply APY</p>
                        <AnimatedCounter 
                          value={`${(market.supplyAPY * 100).toFixed(2)}%`} 
                          className="text-h3 font-semibold text-brand-400 tabular-nums"
                        />
                      </motion.div>
                      <motion.div 
                        className="text-center p-3 rounded-lg bg-brand-500/5 group-hover:bg-brand-500/10 transition-colors"
                        whileHover={{ scale: 1.05 }}
                      >
                        <p className="text-micro text-fg-muted uppercase tracking-wide mb-1">TVL</p>
                        <div className="text-h3 font-semibold text-fg-primary tabular-nums group-hover:text-brand-300 transition-colors">
                          <span>$</span>
                          <AnimatedCounter 
                            value={market.tvl > 0 ? `${(market.tvl / 1e6).toFixed(1)}M` : '0.0M'} 
                            className=""
                          />
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
                              : 'bg-gradient-to-r from-brand-600 to-brand-400'
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
                        variant="outline"
                        className="w-full group-hover:bg-brand-500/10 group-hover:border-brand-400/50 group-hover:text-brand-300 transition-all"
                        onClick={() => window.location.href = ROUTES.DASHBOARD}
                      >
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            // No markets state
            <div className="col-span-3 text-center py-12">
              <p className="text-body-1 text-fg-muted">No markets available</p>
            </div>
          )}
        </motion.div>

        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="btn-primary px-8 py-4 text-body-1 relative overflow-hidden group"
              onClick={() => window.location.href = ROUTES.DASHBOARD}
            >
              <span className="relative z-10">Explore All Markets</span>
              <ArrowRight className="ml-2 h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-green-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </Button>
          </motion.div>
        </motion.div>
        </div>
      </section>


      {/* Roadmap Section */}
      <RoadmapSection />

      {/* Professional Footer - Clean Black */}
      <footer className="relative py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          {/* Footer Container - Clean */}
          <div className="relative rounded-2xl border border-stroke-line overflow-hidden">

            <div className="relative z-10 px-6 sm:px-12 py-12 sm:py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Brand Column */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <a href={ROUTES.HOME} className="flex items-center gap-2 group">
                <img src={Logo} alt="SRWA Logo" className="h-auto w-8 transition-transform group-hover:scale-105" />
                <img src={SRWALetters} alt="SRWA" className="h-auto w-20 transition-transform group-hover:scale-105" />
              </a>
              <p className="text-sm text-fg-secondary leading-relaxed">
                Institutional-grade Real-World Asset lending on Solana with full compliance and transparency.
              </p>
            </motion.div>

            {/* Product Column */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-sm font-semibold text-fg-primary uppercase tracking-wider">Product</h4>
              <ul className="space-y-3">
                {[
                  { href: ROUTES.DASHBOARD, label: "Dashboard" },
                  { href: ROUTES.MARKETS, label: "Markets" },
                  { href: ROUTES.PORTFOLIO, label: "Portfolio" },
                  { href: ROUTES.KYC, label: "KYC Portal" }
                ].map((link, index) => (
                  <li key={link.href}>
                    <motion.a
                      href={link.href}
                      className="text-sm text-fg-secondary hover:text-brand-400 transition-colors inline-flex items-center gap-2 group"
                      whileHover={{ x: 4 }}
                    >
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
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
              viewport={{ once: true }}
            >
              <h4 className="text-sm font-semibold text-fg-primary uppercase tracking-wider">Resources</h4>
              <ul className="space-y-3">
                {[
                  { href: ROUTES.DOCS, label: "Documentation", icon: BookOpen },
                  { href: "https://github.com/SRWA-Cypherpunk", label: "GitHub", icon: Github },
                  { href: ROUTES.ADMIN, label: "Admin", icon: Shield }
                ].map((link, index) => (
                  <li key={link.href}>
                    <motion.a
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-sm text-fg-secondary hover:text-brand-400 transition-colors inline-flex items-center gap-2 group"
                      whileHover={{ x: 4 }}
                    >
                      <link.icon className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
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
              viewport={{ once: true }}
            >
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-fg-primary uppercase tracking-wider">
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
                  <div className="relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-stroke-line bg-bg-elev-2 group-hover:border-brand-500/50 transition-all">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                      initial={{ x: '-200%' }}
                      whileHover={{ x: '200%' }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="relative flex items-center gap-2.5 flex-1">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 group-hover:bg-brand-500/20 transition-colors">
                        <Github className="h-4 w-4 text-fg-secondary group-hover:text-brand-400 transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-fg-primary group-hover:text-brand-300 transition-colors flex-1">
                        GitHub
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-fg-muted group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
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
                  <div className="relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-stroke-line bg-bg-elev-2 group-hover:border-blue-500/50 transition-all">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-brand-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                      initial={{ x: '-200%' }}
                      whileHover={{ x: '200%' }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="relative flex items-center gap-2.5 flex-1">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                        <Twitter className="h-4 w-4 text-fg-secondary group-hover:text-blue-400 transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-fg-primary group-hover:text-blue-300 transition-colors flex-1">
                        Twitter / X
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-fg-muted group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
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
                  <div className="relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-stroke-line bg-bg-elev-2 group-hover:border-[#5865F2]/50 transition-all">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-[#5865F2]/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                      initial={{ x: '-200%' }}
                      whileHover={{ x: '200%' }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="relative flex items-center gap-2.5 flex-1">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5865F2]/10 group-hover:bg-[#5865F2]/20 transition-colors">
                        {/* Discord Logo SVG */}
                        <svg className="h-4 w-4 text-fg-secondary group-hover:text-[#5865F2] transition-colors" viewBox="0 0 71 55" fill="none">
                          <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-fg-primary group-hover:text-[#5865F2] transition-colors flex-1">
                        Discord
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-fg-muted group-hover:text-[#5865F2] group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* Powered By Section */}
          <motion.div
            className="pt-12 pb-8 border-t border-stroke-line/50"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-8">
              <h4 className="text-xs font-semibold text-fg-muted uppercase tracking-widest mb-6">
                Powered by
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-8 items-center justify-items-center">
                {PARTNERS.map((partner) => (
                  <motion.a
                    key={partner.name}
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-50 hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ scale: 1.1 }}
                  >
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="h-8 w-auto object-contain grayscale hover:grayscale-0 transition-all"
                    />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Bottom Bar */}
          <motion.div
            className="pt-8 border-t border-stroke-line/50"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
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
                Built on{' '}
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
      
    </div>
  );
};

export default Index;