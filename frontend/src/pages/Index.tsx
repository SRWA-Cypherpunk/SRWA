import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { KPICard } from "@/components/ui/kpi-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { MarketChart } from "@/components/ui/market-chart";
import { HeroButton } from "@/components/ui/hero-button";
import { Globe as GlobeComponent } from "@/components/ui/globe";
import { useBlendPools } from "@/hooks/markets/useBlendPools";
import { useEnhancedPoolData } from "@/hooks/markets/useDefIndexData";
import { useWallet } from "@/components/wallet/WalletProvider";
import { mockMarketStats, mockMarkets, mockMarketCharts } from "@/lib/mock-data";
import { ROUTES, COLORS, PARTNERS } from "@/lib/constants";
import Logo from "@/assets/logo.png";
import SRWALetters from "@/assets/srwa_letters.png";

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
    <div className="min-h-screen bg-background">
      <Header />

      {/* Enhanced Hero Section with Dynamic Gradients */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#0A0A0A] via-[#1a0f1f] to-[#0A0A0A]">
        {/* Background Globe */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="blur-[2px] opacity-30">
            <GlobeComponent size={1000} className="max-w-none" />
          </div>
        </div>

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-[#0A0A0A]/60 via-[#0A0A0A]/40 to-[#0A0A0A]/80 pointer-events-none" />

        {/* Animated mesh gradient backgrounds */}
        <div className="absolute inset-0 z-0">
          {/* Purple gradient orb */}
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(153,69,255,0.4) 0%, transparent 70%)' }}
            animate={{
              x: ['-10%', '10%', '-10%'],
              y: ['20%', '30%', '20%'],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Orange gradient orb */}
          <motion.div
            className="absolute right-0 w-[500px] h-[500px] rounded-full blur-[100px] opacity-25"
            style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.5) 0%, transparent 70%)' }}
            animate={{
              x: ['10%', '-5%', '10%'],
              y: ['10%', '25%', '10%'],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Secondary purple accent */}
          <motion.div
            className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full blur-[90px] opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(153,69,255,0.3) 0%, transparent 70%)' }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Animated grid pattern */}
        <div className="absolute inset-0 z-30 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,107,53,0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(153,69,255,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full z-30"
            style={{
              background: i % 2 === 0 ? 'rgba(153,69,255,0.6)' : 'rgba(255,107,53,0.6)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

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

      {/* Enhanced Stats Section */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20 -mt-8 sm:-mt-16 relative z-20">
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
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <KPICard
              title="Total Value Locked"
              value={isLoading ? "Loading..." : marketStats.totalValueLocked}
              icon={DollarSign}
              trend="up"
              trendValue="Live"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <KPICard
              title="Tokenized Assets"
              value={isLoading ? "-" : marketStats.tokenizedAssets.toString()}
              icon={Coins}
              subtitle="RWA Markets"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <KPICard
              title="Total Yield Distributed"
              value={isLoading ? "-" : marketStats.totalYieldDistributed}
              icon={PiggyBank}
              trend="up"
              trendValue="Active"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Enhanced Features Section */}
      <section ref={featuresRef} className="container mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <motion.div 
          className="text-center space-y-4 mb-16"
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
            Institutional-Grade Infrastructure
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
              color: "text-blue-400"
            },
            {
              icon: Zap,
              title: "Efficient Capital",
              description: "Optimized lending protocols with isolated risk pools for maximum capital efficiency.",
              color: "text-yellow-400"
            },
            {
              icon: BarChart3,
              title: "Risk Premiums", 
              description: "Granular risk modeling with base rates plus asset-specific premiums.",
              color: "text-purple-400"
            },
            {
              icon: Zap,
              title: "Lightning Fast",
              description: "Built on Solana for sub-second finality and ultra-low transaction costs.",
              color: "text-solana-500"
            },
            {
              icon: Users,
              title: "Institutional UX",
              description: "Professional dashboards, reporting, and treasury-grade position management.",
              color: "text-pink-400"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={isFeatureInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.03 }}
              className="group"
            >
              <Card className="card-institutional hover-lift h-full relative overflow-hidden border-brand-500/20">
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <div className="space-y-6 relative z-10">
                  <motion.div 
                    className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-500/10 group-hover:bg-brand-500/20 transition-colors"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    <feature.icon className={`h-7 w-7 text-brand-400 group-hover:${feature.color} transition-colors`} />
                  </motion.div>
                  <div className="space-y-3">
                    <h3 className="text-h3 font-semibold text-fg-primary group-hover:text-brand-300 transition-colors">
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
      </section>

      {/* Enhanced Markets Preview */}
      <section ref={marketsRef} className="container mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20 bg-gradient-to-b from-transparent via-bg-elev-1/30 to-transparent">
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
            Active Markets
            <motion.span 
              className="inline-block ml-2"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Star className="h-5 w-5 sm:h-6 sm:w-6 text-brand-400 inline" />
            </motion.span>
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
                  {/* Animated background gradient */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-brand-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    initial={false}
                    whileHover={{
                      background: [
                        "linear-gradient(135deg, rgba(77,178,255,0.1) 0%, transparent 50%, rgba(77,178,255,0.05) 100%)",
                        "linear-gradient(225deg, rgba(77,178,255,0.1) 0%, transparent 50%, rgba(77,178,255,0.05) 100%)",
                        "linear-gradient(315deg, rgba(77,178,255,0.1) 0%, transparent 50%, rgba(77,178,255,0.05) 100%)",
                        "linear-gradient(135deg, rgba(77,178,255,0.1) 0%, transparent 50%, rgba(77,178,255,0.05) 100%)"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  
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
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-400 opacity-0 group-hover:opacity-100 transition-opacity"
                whileHover={{
                  background: [
                    "linear-gradient(45deg, #3A9FEA, #4DB2FF)",
                    "linear-gradient(135deg, #4DB2FF, #66BEFF)",
                    "linear-gradient(225deg, #66BEFF, #3A9FEA)",
                    "linear-gradient(315deg, #3A9FEA, #4DB2FF)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </Button>
          </motion.div>
        </motion.div>
      </section>


      {/* Social Proof Section */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
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
            Trusted by Leading Institutions
          </motion.h2>
          <motion.p 
            className="text-sm sm:text-body-1 text-fg-secondary max-w-2xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Join institutional investors who trust our platform for their RWA lending needs.
          </motion.p>
        </motion.div>

        {/* Partner Logos */}
        <motion.div 
          className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 opacity-60 px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 0.6, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {PARTNERS.map((partner, index) => (
            <motion.div
              key={partner}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-card/50 rounded-lg border border-stroke-line/50"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, opacity: 0.8 }}
            >
              <span className="text-xs sm:text-body-2 font-medium text-fg-muted">{partner}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, staggerChildren: 0.2 }}
          viewport={{ once: true }}
        >
          {[
            {
              quote: "The institutional-grade compliance and transparency gives us confidence to deploy significant capital.",
              author: "Sarah Chen",
              role: "CTO, Meridian Capital",
              avatar: "SC",
              rating: 5
            },
            {
              quote: "Seamless Solana integration and professional UX makes treasury management effortless.",
              author: "Marcus Rodriguez",
              role: "Treasury Director, Block Ventures",
              avatar: "MR",
              rating: 5
            },
            {
              quote: "Superior yields with institutional-grade risk management. Exactly what we needed.",
              author: "Dr. Emily Watson",
              role: "Head of Investments, RWA Fund",
              avatar: "EW",
              rating: 5
            }
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Card className="card-institutional h-full border-brand-500/20 bg-gradient-to-br from-card to-bg-elev-1">
                <div className="space-y-6">
                  {/* Star Rating */}
                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.2 + i * 0.1 }}
                      >
                        <Star className="h-4 w-4 text-brand-400 fill-current" />
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <blockquote className="text-body-2 text-fg-secondary italic leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  {/* Author */}
                  <div className="flex items-center space-x-3 pt-4 border-t border-stroke-line/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 font-semibold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="text-body-2 font-semibold text-fg-primary">{testimonial.author}</p>
                      <p className="text-micro text-fg-muted">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Enhanced Trust Indicators */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Card className="card-institutional bg-gradient-to-br from-bg-elev-1 via-bg-elev-2 to-bg-elev-1 border-brand-500/30 relative overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-brand-400 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
            
            <div className="text-center space-y-12 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-xl sm:text-2xl lg:text-h2 font-semibold text-fg-primary mb-4 px-4">
                  Enterprise-Ready Platform
                </h2>
                <p className="text-sm sm:text-body-1 text-fg-secondary max-w-2xl mx-auto px-4">
                  Built with institutional standards from day one
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                {[
                  {
                    icon: CheckCircle,
                    title: "Regulatory Compliant",
                    description: "Full KYC/KYB with jurisdiction controls and real-time monitoring",
                    highlight: "SOC 2 Type II"
                  },
                  {
                    icon: Shield,
                    title: "Audited & Secure",
                    description: "Smart contracts audited by leading security firms with bug bounties",
                    highlight: "$2M+ Bounty Pool"
                  },
                  {
                    icon: BarChart3,
                    title: "Real-Time Reporting",
                    description: "Institutional-grade analytics with custom reporting and API access",
                    highlight: "99.9% Uptime"
                  }
                ].map((item, index) => (
                  <motion.div 
                    key={index} 
                    className="flex flex-col items-center space-y-4 group"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    whileHover={{ y: -5 }}
                  >
                    <motion.div 
                      className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 group-hover:bg-brand-500/20 transition-all duration-300 border border-brand-500/20"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <item.icon className="h-8 w-8 text-brand-400" />
                    </motion.div>
                    <div className="space-y-2 text-center">
                      <Badge variant="outline" className="text-micro text-brand-400 border-brand-500/30 mb-2">
                        {item.highlight}
                      </Badge>
                      <h3 className="text-h3 font-semibold text-fg-primary group-hover:text-brand-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-body-2 text-fg-secondary text-center leading-relaxed max-w-xs">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Modern Crypto-Style Footer */}
      <footer className="relative border-t border-stroke-line bg-gradient-to-b from-background via-bg-elev-1 to-background overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(153,69,255,0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(153,69,255,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -bottom-48 -left-48 w-96 h-96 rounded-full blur-3xl opacity-10"
            style={{ background: 'radial-gradient(circle, rgba(153,69,255,0.8) 0%, transparent 70%)' }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-48 -right-48 w-96 h-96 rounded-full blur-3xl opacity-10"
            style={{ background: 'radial-gradient(circle, rgba(77,178,255,0.8) 0%, transparent 70%)' }}
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.15, 0.1, 0.15],
            }}
            transition={{ duration: 8, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20 relative z-10">
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

          {/* Bottom Bar */}
          <motion.div
            className="pt-8 border-t border-stroke-line/50"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-xs text-fg-muted">
                © 2025 SRWA Platform. All rights reserved.
              </p>
              <p className="text-xs text-fg-muted/80">
                Built with ❤️ on{' '}
                <motion.a
                  href="https://solana.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-400 font-semibold hover:text-brand-300 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  Solana
                </motion.a>
                {' • '}
                <motion.a
                  href="https://github.com/SRWA-Cypherpunk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fg-secondary hover:text-brand-400 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  Open Source
                </motion.a>
              </p>
            </div>
          </motion.div>
        </div>
      </footer>
      
    </div>
  );
};

export default Index;