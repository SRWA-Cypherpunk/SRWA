import { motion } from "framer-motion";
import { Building2, Layers, TrendingUp, Check, ArrowRight, LucideIcon } from "lucide-react";
import { useState } from "react";

interface FlowStep {
  id: string;
  title: string;
  icon: LucideIcon;
  items: string[];
  color: 'green' | 'purple' | 'orange';
  accentColor: string;
  borderColor: string;
  bgGradient: string;
  glowColor: string;
}

const steps: FlowStep[] = [
  {
    id: 'issuers',
    title: 'ISSUERS',
    icon: Building2,
    items: [
      'RWA (Real-World Assets)',
      'Compliance & Regulatory Rules',
      'Returns Before Credit Distribution',
      'Asset Origination & Custody'
    ],
    color: 'orange',
    accentColor: '#FF6B35',
    borderColor: 'border-orange-500/20',
    bgGradient: 'from-orange-950/20',
    glowColor: 'rgba(255,107,53,0.3)'
  },
  {
    id: 'tokenization',
    title: 'SRWA',
    icon: Layers,
    items: [
      'Token Modules & Reserve',
      'Hybrid Oracles (NAV + Pyth)',
      'Smart Contract Infrastructure',
      'Compliance Layer'
    ],
    color: 'purple',
    accentColor: '#9945FF',
    borderColor: 'border-purple-500/30',
    bgGradient: 'from-purple-950/30',
    glowColor: 'rgba(153,69,255,0.4)'
  },
  {
    id: 'market',
    title: 'MARKET',
    icon: TrendingUp,
    items: [
      'Pool Lending (60% LTV)',
      'Yield Farm Junior (45-50% APY)',
      'Borrow Against Assets',
      'Yield Farm Senior (8-15% APY)'
    ],
    color: 'orange',
    accentColor: '#FF6B35',
    borderColor: 'border-orange-500/20',
    bgGradient: 'from-orange-950/20',
    glowColor: 'rgba(255,107,53,0.3)'
  }
];

interface FlowCardProps {
  step: FlowStep;
  index: number;
  isActive: boolean;
  onClick: () => void;
  highlighted?: boolean;
}

const FlowCard = ({ step, index, isActive, onClick, highlighted = false }: FlowCardProps) => {
  const Icon = step.icon;

  return (
    <motion.div
      className={`relative p-6 sm:p-8 rounded-2xl border-2 ${step.borderColor} bg-gradient-to-br ${step.bgGradient} to-transparent backdrop-blur-sm cursor-pointer group ${highlighted ? 'ring-2 ring-purple-500/30' : ''}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      whileHover={{
        scale: 1.05,
        boxShadow: `0 0 30px ${step.glowColor}`
      }}
      onClick={onClick}
    >
      {/* Glow effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"
        style={{ background: step.glowColor }}
      />

      {/* Content - CENTRALIZED */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Icon - Centered */}
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mb-4 ${highlighted ? 'bg-purple-500/20' : `bg-${step.color}-500/10`}`}
          style={{
            backgroundColor: highlighted ? 'rgba(153,69,255,0.2)' : undefined
          }}
        >
          <Icon
            className="w-7 h-7 sm:w-8 sm:h-8"
            style={{ color: step.accentColor }}
          />
        </div>

        {/* Title - Centered */}
        <h3 className={`text-lg sm:text-xl font-bold mb-4 ${highlighted ? 'text-purple-400' : 'text-white'}`}>
          {step.title}
          {highlighted && (
            <div className="text-xs font-normal text-purple-400/60 mt-1">(Core Protocol)</div>
          )}
        </h3>

        {/* Items - Left aligned */}
        <div className="flex flex-col gap-2 w-full">
          {step.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-start gap-2 px-3 py-2 rounded-lg bg-black/20 border border-white/5"
            >
              <Check
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                style={{ color: step.accentColor }}
              />
              <span className="text-xs sm:text-sm text-fg-secondary text-left">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active indicator */}
      {isActive && (
        <motion.div
          className="absolute -top-2 -right-2 w-4 h-4 rounded-full"
          style={{ backgroundColor: step.accentColor }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};

interface BidirectionalArrowProps {
  fromColor: string;
  toColor: string;
  delay?: number;
}

const BidirectionalArrow = ({ fromColor, toColor, delay = 0 }: BidirectionalArrowProps) => {
  return (
    <div className="hidden lg:flex items-center justify-center relative px-4">
      <svg
        className="w-24 h-12 relative z-10"
        viewBox="0 0 100 40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Bidirectional gradient (fromColor ↔ toColor) */}
          <linearGradient id={`bidir-${fromColor}-${toColor}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: fromColor, stopOpacity: 0.9 }} />
            <stop offset="50%" style={{ stopColor: toColor, stopOpacity: 0.9 }} />
            <stop offset="100%" style={{ stopColor: toColor, stopOpacity: 0.9 }} />
          </linearGradient>

          {/* Subtle glow filter */}
          <filter id={`tech-glow-${fromColor}-${toColor}`}>
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Connection nodes */}
        <circle
          cx="10"
          cy="20"
          r="3"
          fill={fromColor}
          opacity="0.7"
        />
        <circle
          cx="90"
          cy="20"
          r="3"
          fill={toColor}
          opacity="0.7"
        />

        {/* Main bidirectional line - THICK */}
        <motion.path
          d="M 10 20 L 90 20"
          stroke={`url(#bidir-${fromColor}-${toColor})`}
          strokeWidth="4"
          fill="none"
          filter={`url(#tech-glow-${fromColor}-${toColor})`}
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: delay + 0.3, ease: "easeOut" }}
        />

        {/* Left hexagonal arrow head (pointing left) */}
        <motion.path
          d="M 10 20 L 5 20 L 7 17 L 10 20 L 7 23 L 5 20 Z"
          fill={fromColor}
          stroke={fromColor}
          strokeWidth="0.5"
          filter={`url(#tech-glow-${fromColor}-${toColor})`}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 0.9, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: delay + 1.3, ease: "backOut" }}
        />

        {/* Right hexagonal arrow head (pointing right) */}
        <motion.path
          d="M 90 20 L 95 20 L 93 17 L 90 20 L 93 23 L 95 20 Z"
          fill={toColor}
          stroke={toColor}
          strokeWidth="0.5"
          filter={`url(#tech-glow-${fromColor}-${toColor})`}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 0.9, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: delay + 1.3, ease: "backOut" }}
        />

        {/* Hexagonal data packet traveling right (fromColor → toColor) */}
        <motion.path
          d="M -5 20 L -3 17 L -1 17 L 1 20 L -1 23 L -3 23 Z"
          fill={toColor}
          opacity="0.8"
          filter={`url(#tech-glow-${fromColor}-${toColor})`}
          animate={{
            x: [0, 95],
            opacity: [0, 0.8, 0.8, 0]
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            delay: delay + 2,
            ease: "easeInOut"
          }}
        />

        {/* Hexagonal data packet traveling left (toColor → fromColor) */}
        <motion.path
          d="M 95 20 L 97 17 L 99 17 L 101 20 L 99 23 L 97 23 Z"
          fill={fromColor}
          opacity="0.8"
          filter={`url(#tech-glow-${fromColor}-${toColor})`}
          animate={{
            x: [0, -95],
            opacity: [0, 0.8, 0.8, 0]
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            delay: delay + 2.8,
            ease: "easeInOut"
          }}
        />

        {/* Subtle energy pulse */}
        <motion.path
          d="M 10 20 L 90 20"
          stroke={toColor}
          strokeWidth="4"
          fill="none"
          opacity="0"
          animate={{
            opacity: [0, 0.2, 0]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: delay + 3,
            ease: "easeInOut"
          }}
        />
      </svg>
    </div>
  );
};

export const FlowDiagram = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <div className="relative">
      {/* Flow Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr,auto,1fr] gap-6 lg:gap-0 items-stretch">
        {/* Card 1: ISSUERS */}
        <FlowCard
          step={steps[0]}
          index={0}
          isActive={activeStep === 0}
          onClick={() => setActiveStep(activeStep === 0 ? null : 0)}
        />

        {/* Bidirectional Arrow 1↔2 */}
        <BidirectionalArrow
          fromColor={steps[0].accentColor}
          toColor={steps[1].accentColor}
          delay={0.4}
        />

        {/* Card 2: TOKENIZATION (highlighted) */}
        <FlowCard
          step={steps[1]}
          index={1}
          isActive={activeStep === 1}
          onClick={() => setActiveStep(activeStep === 1 ? null : 1)}
          highlighted={true}
        />

        {/* Bidirectional Arrow 2↔3 */}
        <BidirectionalArrow
          fromColor={steps[1].accentColor}
          toColor={steps[2].accentColor}
          delay={0.8}
        />

        {/* Card 3: MARKET */}
        <FlowCard
          step={steps[2]}
          index={2}
          isActive={activeStep === 2}
          onClick={() => setActiveStep(activeStep === 2 ? null : 2)}
        />
      </div>

      {/* Mobile Arrows (vertical) */}
      <div className="lg:hidden flex flex-col items-center gap-6 my-6">
        {[0, 1].map((idx) => (
          <motion.div
            key={idx}
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.6 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.3 }}
          >
            <ArrowRight
              className="w-6 h-6 rotate-90"
              style={{ color: steps[idx + 1].accentColor }}
            />
          </motion.div>
        ))}
      </div>

      {/* Info Text */}
      <motion.div
        className="mt-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <p className="text-sm text-fg-secondary max-w-3xl mx-auto">
          <span className="text-purple-400 font-semibold">SRWA Protocol</span> connects real-world asset issuers with DeFi lending markets through a
          compliant tokenization layer, enabling institutional investors to earn yield backed by tangible assets.
        </p>
      </motion.div>
    </div>
  );
};
