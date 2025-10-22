import React, { useRef } from "react";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Coins, 
  Shield, 
  Users, 
  Database, 
  Network, 
  PieChart,
  Wallet,
  Activity,
  Globe,
  Banknote,
  TrendingUp
} from "lucide-react";

export const RWAEcosystem = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Left side - Assets and Banks
  const bankRef = useRef<HTMLDivElement>(null);
  const assetRef = useRef<HTMLDivElement>(null);
  
  // Center - Our Solution
  const solutionRef = useRef<HTMLDivElement>(null);
  
  // Right side - 3 Pools
  const pool1Ref = useRef<HTMLDivElement>(null); // Connects to B2B Investors
  const pool2Ref = useRef<HTMLDivElement>(null); // Connects to B2B Clients
  const pool3Ref = useRef<HTMLDivElement>(null); // Connects to B2B Clients
  
  // Final destinations
  const b2bInvestorsRef = useRef<HTMLDivElement>(null);
  const b2bClientsRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">RWA Lending Ecosystem</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A comprehensive platform connecting traditional assets with blockchain technology
          </p>
        </div>

        <div 
          ref={containerRef}
          className="relative w-full h-[600px] bg-gradient-to-br from-muted/30 to-background rounded-2xl border border-border/50 overflow-hidden"
        >
          {/* Center - Our Solution */}
          <div 
            ref={solutionRef}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <Card className="w-40 h-40 bg-gradient-to-br from-brand-500 to-brand-600 border-brand-400/50 shadow-lg shadow-brand-500/20">
              <div className="flex flex-col items-center justify-center h-full p-6">
                <Building2 className="w-12 h-12 text-white mb-3" />
                <span className="text-white text-lg font-bold text-center">RWA Platform</span>
                <span className="text-white/80 text-sm text-center">Our Solution</span>
              </div>
            </Card>
          </div>

          {/* Left Side - Assets and Banks */}
          <div className="absolute left-8 top-1/2 transform -translate-y-1/2 space-y-8">
            {/* Bank */}
            <div ref={bankRef} className="z-10">
              <Card className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400/50 shadow-lg">
                <div className="flex flex-col items-center justify-center h-full p-4">
                  <Banknote className="w-8 h-8 text-white mb-2" />
                  <span className="text-white text-sm font-semibold text-center">Banks</span>
                </div>
              </Card>
            </div>

            {/* Assets */}
            <div ref={assetRef} className="z-10">
              <Card className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-600 border-green-400/50 shadow-lg">
                <div className="flex flex-col items-center justify-center h-full p-4">
                  <Coins className="w-8 h-8 text-white mb-2" />
                  <span className="text-white text-sm font-semibold text-center">Assets</span>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Side - Pools and Destinations Horizontal */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 space-y-4">
            {/* Pool 1 + B2B Investors */}
            <div className="flex items-center space-x-3">
              <div ref={pool1Ref} className="z-10">
                <Card className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 border-purple-400/50 shadow-lg">
                  <div className="flex flex-col items-center justify-center h-full p-2">
                    <PieChart className="w-5 h-5 text-white mb-1" />
                    <span className="text-white text-xs font-semibold text-center">Pool 1</span>
                  </div>
                </Card>
              </div>
              <div ref={b2bInvestorsRef} className="z-10">
                <Card className="w-24 h-24 bg-gradient-to-br from-purple-700 to-purple-800 border-purple-500/50 shadow-lg">
                  <div className="flex flex-col items-center justify-center h-full p-2">
                    <TrendingUp className="w-5 h-5 text-white mb-1" />
                    <span className="text-white text-xs font-semibold text-center">B2B Investors</span>
                  </div>
                </Card>
              </div>
            </div>

            {/* Pool 2 + B2B Clients */}
            <div className="flex items-center space-x-3">
              <div ref={pool2Ref} className="z-10">
                <Card className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 border-orange-400/50 shadow-lg">
                  <div className="flex flex-col items-center justify-center h-full p-2">
                    <Database className="w-5 h-5 text-white mb-1" />
                    <span className="text-white text-xs font-semibold text-center">Pool 2</span>
                  </div>
                </Card>
              </div>
              <div ref={b2bClientsRef} className="z-10">
                <Card className="w-24 h-24 bg-gradient-to-br from-orange-700 to-orange-800 border-orange-500/50 shadow-lg">
                  <div className="flex flex-col items-center justify-center h-full p-2">
                    <Users className="w-5 h-5 text-white mb-1" />
                    <span className="text-white text-xs font-semibold text-center">B2B Clients</span>
                  </div>
                </Card>
              </div>
            </div>

            {/* Pool 3 + B2B Clients */}
            <div className="flex items-center space-x-3">
              <div ref={pool3Ref} className="z-10">
                <Card className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-cyan-600 border-cyan-400/50 shadow-lg">
                  <div className="flex flex-col items-center justify-center h-full p-2">
                    <Network className="w-5 h-5 text-white mb-1" />
                    <span className="text-white text-xs font-semibold text-center">Pool 3</span>
                  </div>
                </Card>
              </div>
              <div className="w-24 h-24 flex items-center justify-center z-10">
                <div className="w-4 h-4 bg-cyan-400 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Animated Beams - Left to Center */}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={bankRef}
            toRef={solutionRef}
            curvature={40}
            duration={3}
            delay={0}
            pathColor="rgb(59, 130, 246)"
            gradientStartColor="rgb(59, 130, 246)"
            gradientStopColor="rgb(147, 51, 234)"
            className="z-0"
          />

          <AnimatedBeam
            containerRef={containerRef}
            fromRef={assetRef}
            toRef={solutionRef}
            curvature={40}
            duration={3}
            delay={0.5}
            pathColor="rgb(34, 197, 94)"
            gradientStartColor="rgb(34, 197, 94)"
            gradientStopColor="rgb(147, 51, 234)"
            className="z-0"
          />

          {/* Animated Beams - Center to Pools */}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={solutionRef}
            toRef={pool1Ref}
            curvature={20}
            duration={2.5}
            delay={1}
            pathColor="rgb(147, 51, 234)"
            gradientStartColor="rgb(147, 51, 234)"
            gradientStopColor="rgb(168, 85, 247)"
            className="z-0"
          />

          <AnimatedBeam
            containerRef={containerRef}
            fromRef={solutionRef}
            toRef={pool2Ref}
            curvature={20}
            duration={2.5}
            delay={1.2}
            pathColor="rgb(147, 51, 234)"
            gradientStartColor="rgb(147, 51, 234)"
            gradientStopColor="rgb(249, 115, 22)"
            className="z-0"
          />

          <AnimatedBeam
            containerRef={containerRef}
            fromRef={solutionRef}
            toRef={pool3Ref}
            curvature={20}
            duration={2.5}
            delay={1.4}
            pathColor="rgb(147, 51, 234)"
            gradientStartColor="rgb(147, 51, 234)"
            gradientStopColor="rgb(6, 182, 212)"
            className="z-0"
          />

          {/* Animated Beams - Pool 1 to B2B Investors (direct horizontal) */}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={pool1Ref}
            toRef={b2bInvestorsRef}
            curvature={0}
            duration={1.5}
            delay={2}
            pathColor="rgb(168, 85, 247)"
            gradientStartColor="rgb(168, 85, 247)"
            gradientStopColor="rgb(147, 67, 234)"
            className="z-0"
          />

          {/* Animated Beams - Pool 2 to B2B Clients (direct horizontal) */}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={pool2Ref}
            toRef={b2bClientsRef}
            curvature={0}
            duration={1.5}
            delay={2.2}
            pathColor="rgb(249, 115, 22)"
            gradientStartColor="rgb(249, 115, 22)"
            gradientStopColor="rgb(234, 88, 12)"
            className="z-0"
          />

          {/* Animated Beams - Pool 3 to B2B Clients (through dot) */}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={pool3Ref}
            toRef={b2bClientsRef}
            curvature={20}
            duration={2}
            delay={2.4}
            pathColor="rgb(6, 182, 212)"
            gradientStartColor="rgb(6, 182, 212)"
            gradientStopColor="rgb(234, 88, 12)"
            className="z-0"
          />
        </div>
      </div>
    </section>
  );
};