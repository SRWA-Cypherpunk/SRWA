import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  CheckCircle,
  Rocket,
  Shield,
  Users,
  TrendingUp,
  ArrowRightLeft,
  DollarSign,
  Globe,
  FileText,
  ExternalLink,
  Code,
  Sparkles,
  Star,
  ArrowRight,
  Lock,
  BarChart3,
  Zap
} from 'lucide-react';

import TokenWizard from '@/components/srwa/TokenWizard';
import { RWA_TEMPLATES } from '@/types/templates';
import { TokenTemplate } from '@/types/srwa-contracts';

export default function SRWADemo() {
  const [activeDemo, setActiveDemo] = useState<'overview' | 'wizard' | 'management'>('overview');
  
  // Animation refs
  const featuresRef = useRef(null);
  const templatesRef = useRef(null);
  const architectureRef = useRef(null);
  const isFeatureInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const isTemplatesInView = useInView(templatesRef, { once: true, margin: "-100px" });
  const isArchitectureInView = useInView(architectureRef, { once: true, margin: "-100px" });

  const systemFeatures = [
    {
      icon: Rocket,
      title: 'Token Factory',
      description: 'Deploy complete SRWA token ecosystems with 8 interconnected smart contracts',
      contracts: ['Token Factory', 'SRWA Token', 'Compliance Core', 'Identity Registry'],
      color: 'text-blue-400',
    },
    {
      icon: Shield,
      title: 'Advanced Compliance',
      description: 'Enterprise-grade compliance with modular architecture and real-time checks',
      contracts: ['Compliance Modules', 'Jurisdiction Control', 'Sanctions Screening', 'Pause/Freeze'],
      color: 'text-green-400',
    },
    {
      icon: Users,
      title: 'Identity Management',
      description: 'Complete KYC/AML system with trusted issuers and verifiable claims',
      contracts: ['Claim Topics Registry', 'Trusted Issuers Registry', 'Identity Storage'],
      color: 'text-purple-400',
    },
    {
      icon: TrendingUp,
      title: 'DeFi Integration',
      description: 'Native integration with Blend Protocol and SoroSwap for lending and trading',
      contracts: ['Blend Adapter', 'SoroSwap Adapter', 'Oracle Integration'],
      color: 'text-amber-400',
    },
  ];

  const templates = Object.values(RWA_TEMPLATES);

  const contractAddresses = {
    'Token Factory': 'CAHRDR3I4NT5TVHEOS22UMS7SSHCU3CDTMXGBW4R7FNDEHCO5AZLOCOA', // ✅ CLI Working
    'Compliance Core': 'CDMM3DRN7IRDTBQUHCS5CARLFBLECC4XPPYOTMHERHCVJBSHTTUO75FA', // ✅ CLI Working
    'Identity Registry': 'CBJSAOFZWWDNWJI5QEFBHYLEIBHXOHN4B5DDI6DJBSYRQ6ROU3YXJ36E', // ✅ CLI Working
    'Claim Topics Registry': 'CADQZX6IIPAVVOJ6SVZFGXK374UE5KXDFKBB6VRVVCSFPS2OLTRHS3NT',
    'Trusted Issuers Registry': 'CDTBD2II6JGXHPDGMFWAQE2SRYXOCENGIE2Z5WHWNM6UG34BX5SQTDRN',
    'Compliance Modules': 'CC3PYCRZ5ULYSFYI4L5FFZQL2K6VKVUDKUYXWZEPNFLEWGQ35UDN6QY3',
    'Integrations': 'CADJTJWRKMPCLLD2LVDWWNKFSFD77UTALKRUB6YGSLUTW36JQHUNYXXH',
    'Blend Adapter': 'CCT2DRUBLZV3I3H3JFEW64E4NMOSBCWMJCARM7SNC3WOBCNDWZ6FRQ7L',
  };

  if (activeDemo === 'wizard') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <motion.div 
          className="mb-6 px-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              onClick={() => setActiveDemo('overview')}
              className="mb-4 border-brand-500/30 hover:bg-brand-500/10 hover:border-brand-400/50"
            >
              <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
              Back to Overview
            </Button>
          </motion.div>
        </motion.div>
        <TokenWizard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Enhanced Hero Section with Dynamic Gradients */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-gradient-to-br from-[#0A0A0A] via-[#1a0f1f] to-[#0A0A0A]">
        {/* Animated mesh gradient backgrounds */}
        <div className="absolute inset-0">
          {/* Purple gradient orb */}
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-25"
            style={{ background: 'radial-gradient(circle, rgba(153,69,255,0.4) 0%, transparent 70%)' }}
            animate={{
              x: ['-10%', '10%', '-10%'],
              y: ['10%', '20%', '10%'],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Orange gradient orb */}
          <motion.div
            className="absolute right-0 w-[400px] h-[400px] rounded-full blur-[90px] opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.5) 0%, transparent 70%)' }}
            animate={{
              x: ['5%', '-10%', '5%'],
              y: ['15%', '25%', '15%'],
            }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="container mx-auto max-w-7xl px-6 py-24 relative z-10">
          <motion.div
            className="text-center space-y-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Badge variant="secondary" className="bg-brand-500/20 text-brand-300 border-brand-500/30 backdrop-blur-sm px-4 py-2 mb-6">
                  <Sparkles className="w-3 h-3 mr-2" />
                  Solana Blockchain • High Performance
                </Badge>
              </motion.div>

              <motion.h1
                className="text-display-1 font-semibold text-fg-primary max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Real World Asset
                <motion.span
                  className="block mt-2 bg-gradient-to-r from-brand-400 via-[#FF6B35] to-brand-500 bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  Tokenization Platform
                </motion.span>
              </motion.h1>

              <motion.p
                className="text-body-1 text-fg-secondary max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Complete institutional-grade RWA tokenization system with enterprise compliance,
                identity management, and native DeFi integration on Solana's high-performance blockchain.
              </motion.p>
            </div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setActiveDemo('wizard')}
                  className="btn-primary px-8 py-4 text-body-1 relative overflow-hidden group"
                >
                  <span className="relative z-10">Create RWA Token</span>
                  <Rocket className="ml-2 h-5 w-5 relative z-10 group-hover:rotate-12 transition-transform" />
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
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  className="px-8 py-4 text-body-1 backdrop-blur-sm border-brand-500/30 hover:bg-brand-500/10"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  View Documentation
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Live Stats Preview */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <div className="text-center space-y-2 bg-card/10 backdrop-blur-sm rounded-xl p-4 border border-brand-500/20">
                <AnimatedCounter value="8" className="text-h1 font-bold text-brand-400 tabular-nums" />
                <p className="text-micro text-fg-muted uppercase tracking-wide">Smart Contracts</p>
              </div>
              <div className="text-center space-y-2 bg-card/10 backdrop-blur-sm rounded-xl p-4 border border-brand-500/20">
                <AnimatedCounter value="4" className="text-h1 font-bold text-brand-400 tabular-nums" />
                <p className="text-micro text-fg-muted uppercase tracking-wide">Token Templates</p>
              </div>
              <div className="text-center space-y-2 bg-card/10 backdrop-blur-sm rounded-xl p-4 border border-brand-500/20">
                <AnimatedCounter value="2" className="text-h1 font-bold text-brand-400 tabular-nums" />
                <p className="text-micro text-fg-muted uppercase tracking-wide">DeFi Integrations</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/20 to-[#0A0A0A] pointer-events-none" />
      </section>

      <div className="container mx-auto max-w-7xl p-6 space-y-20 relative -mt-16 z-20">

        {/* Enhanced System Overview */}
        <section ref={featuresRef} className="space-y-8">
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={isFeatureInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-h1 font-semibold text-fg-primary"
              initial={{ opacity: 0, y: 20 }}
              animate={isFeatureInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Institutional-Grade Infrastructure
              <motion.span 
                className="inline-block ml-2"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Star className="h-6 w-6 text-brand-400 inline" />
              </motion.span>
            </motion.h2>
            <motion.p 
              className="text-body-1 text-fg-secondary max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={isFeatureInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Complete RWA tokenization ecosystem built with enterprise standards and regulatory compliance.
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            initial={{ opacity: 0 }}
            animate={isFeatureInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, staggerChildren: 0.1 }}
          >
            {systemFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={isFeatureInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <Card className="card-institutional hover-lift h-full relative overflow-hidden border-brand-500/20">
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <CardHeader className="relative z-10">
                    <div className="flex items-center space-x-4">
                      <motion.div 
                        className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-500/10 group-hover:bg-brand-500/20 transition-colors"
                        whileHover={{ rotate: 10, scale: 1.1 }}
                      >
                        <feature.icon className={`h-7 w-7 text-brand-400 group-hover:${feature.color} transition-colors`} />
                      </motion.div>
                      <div>
                        <CardTitle className="text-h3 font-semibold text-fg-primary group-hover:text-brand-300 transition-colors">
                          {feature.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 relative z-10">
                    <p className="text-body-2 text-fg-secondary leading-relaxed group-hover:text-fg-primary/90 transition-colors">
                      {feature.description}
                    </p>
                    <div className="space-y-3">
                      <h4 className="text-body-2 font-semibold text-fg-primary flex items-center">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                          className="w-2 h-2 bg-brand-400 rounded-full mr-3"
                        />
                        Smart Contracts
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {feature.contracts.map((contract, contractIndex) => (
                          <motion.div
                            key={contract}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={isFeatureInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.4, delay: index * 0.1 + contractIndex * 0.05 }}
                          >
                            <Badge 
                              variant="outline" 
                              className="text-xs text-brand-300 border-brand-500/30 bg-brand-500/5 hover:bg-brand-500/10 transition-colors"
                            >
                              {contract}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Enhanced Token Templates */}
        <section ref={templatesRef} className="space-y-8">
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={isTemplatesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-h1 font-semibold text-fg-primary"
              initial={{ opacity: 0, y: 20 }}
              animate={isTemplatesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              RWA Token Templates
              <motion.span 
                className="inline-block ml-2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Zap className="h-6 w-6 text-brand-400 inline" />
              </motion.span>
            </motion.h2>
            <motion.p 
              className="text-body-1 text-fg-secondary max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={isTemplatesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Pre-configured templates for different types of real-world assets with compliance settings.
            </motion.p>
          </motion.div>

          <Card className="card-institutional bg-gradient-to-br from-card to-bg-elev-1 border-brand-500/20">
            <CardHeader>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isTemplatesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="space-y-4"
              >
                <CardTitle className="text-h2 text-fg-primary flex items-center">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="opacity-20 mr-4"
                  >
                    <Sparkles className="h-6 w-6 text-brand-400" />
                  </motion.div>
                  Ready-to-Deploy Templates
                </CardTitle>
                <p className="text-body-1 text-fg-secondary">
                  Each template includes specialized compliance modules and DeFi integration settings.
                </p>
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                initial={{ opacity: 0 }}
                animate={isTemplatesInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.8, staggerChildren: 0.1 }}
              >
                {templates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={isTemplatesInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.03 }}
                    className="group"
                  >
                    <Card className="card-institutional hover-lift h-full relative overflow-hidden border-brand-500/30 group-hover:border-brand-400/50 transition-all duration-300">
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-brand-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      />
                      <CardHeader className="pb-4 relative z-10">
                        <div className="flex items-center space-x-3">
                          <motion.span 
                            className="text-3xl"
                            whileHover={{ scale: 1.2, rotate: 10 }}
                            transition={{ duration: 0.3 }}
                          >
                            {template.icon}
                          </motion.span>
                          <CardTitle className="text-h3 font-semibold text-fg-primary group-hover:text-brand-300 transition-colors">
                            {template.name}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-4 relative z-10">
                        <p className="text-body-2 text-fg-secondary leading-relaxed group-hover:text-fg-primary/90 transition-colors">
                          {template.description}
                        </p>
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-micro font-semibold text-fg-primary uppercase tracking-wide mb-2 flex items-center">
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                                className="w-1.5 h-1.5 bg-brand-400 rounded-full mr-2"
                              />
                              Use Cases
                            </h4>
                            <ul className="space-y-1">
                              {template.use_cases.slice(0, 2).map((useCase, i) => (
                                <motion.li 
                                  key={i} 
                                  className="text-micro text-fg-secondary flex items-start"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={isTemplatesInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                                  transition={{ duration: 0.4, delay: index * 0.1 + i * 0.1 }}
                                >
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                                    className="w-1 h-1 bg-brand-400 rounded-full mt-1.5 mr-2 flex-shrink-0"
                                  />
                                  {useCase}
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-micro font-semibold text-fg-primary uppercase tracking-wide">Integrations</h4>
                            <div className="flex flex-wrap gap-1">
                              {template.supported_integrations
                                .filter(i => i.supported)
                                .map((integration, integrationIndex) => (
                                  <motion.div
                                    key={integration.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={isTemplatesInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 + integrationIndex * 0.05 }}
                                  >
                                    <Badge 
                                      variant="outline" 
                                      className="text-xs text-brand-300 border-brand-500/30 bg-brand-500/5 hover:bg-brand-500/10 transition-colors"
                                    >
                                      {integration.name}
                                    </Badge>
                                  </motion.div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </section>

        {/* Smart Contract Architecture */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Smart Contract Architecture</CardTitle>
            <p className="text-muted-foreground">
              8 interconnected smart contracts deployed on Stellar Testnet
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="contracts" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="contracts">Deployed Contracts</TabsTrigger>
                <TabsTrigger value="flow">Integration Flow</TabsTrigger>
                <TabsTrigger value="features">Key Features</TabsTrigger>
              </TabsList>
              
              <TabsContent value="contracts" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(contractAddresses).map(([name, address]) => (
                    <div key={name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{name}</div>
                        <div className="text-xs text-muted-foreground">
                          Deployed & Operational
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {address.slice(0, 8)}...{address.slice(-4)}
                        </code>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="flow" className="space-y-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="text-center">
                      <CardContent className="pt-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-xl font-bold text-blue-600">1</span>
                        </div>
                        <h3 className="font-medium">Deploy Ecosystem</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          Token Factory deploys all 8 contracts and wires them together
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="text-center">
                      <CardContent className="pt-6">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-xl font-bold text-green-600">2</span>
                        </div>
                        <h3 className="font-medium">Configure Compliance</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          Set up identity verification, compliance modules, and trusted issuers
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="text-center">
                      <CardContent className="pt-6">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-xl font-bold text-purple-600">3</span>
                        </div>
                        <h3 className="font-medium">Enable DeFi</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          Integrate with Blend and SoroSwap for lending and trading
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="features" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3 flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-green-500" />
                      Compliance Features
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                        KYC/AML verification with verifiable claims
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                        Jurisdiction controls (allow/deny lists)
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                        Sanctions screening and blacklisting
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                        Maximum holder limits for regulatory compliance
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                        Emergency pause and freeze capabilities
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                      DeFi Features
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2 text-blue-500" />
                        Blend Protocol lending integration
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2 text-blue-500" />
                        SoroSwap DEX integration for trading
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2 text-blue-500" />
                        Price oracle integration (DIA/Reflector)
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2 text-blue-500" />
                        Automated compliance checks on transfers
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2 text-blue-500" />
                        Cross-protocol interoperability
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Live Demo */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-800">Ready to Experience RWA Tokenization?</CardTitle>
            <p className="text-blue-700">
              Try our complete RWA token creation wizard with real smart contracts on Stellar Testnet
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">8</div>
                <div className="text-sm text-muted-foreground">Smart Contracts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">4</div>
                <div className="text-sm text-muted-foreground">Token Templates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">2</div>
                <div className="text-sm text-muted-foreground">DeFi Integrations</div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => setActiveDemo('wizard')}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Rocket className="mr-2 h-5 w-5" />
                Launch Token Wizard
              </Button>
              <Button variant="outline" size="lg">
                <Code className="mr-2 h-5 w-5" />
                View Source Code
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <Alert>
          <Globe className="h-4 w-4" />
          <AlertDescription>
            <strong>Stellar Testnet Deployment:</strong> All contracts are deployed and operational on Stellar Testnet. 
            This is a complete, functional RWA tokenization platform ready for real-world use cases.
            <div className="mt-2 flex space-x-4">
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-3 w-3 mr-1" />
                Stellar Expert
              </Button>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-3 w-3 mr-1" />
                GitHub Repository
              </Button>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-3 w-3 mr-1" />
                Documentation
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}