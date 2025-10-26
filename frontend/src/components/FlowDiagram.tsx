import { motion, AnimatePresence } from "framer-motion";
import { Building2, Layers, TrendingUp, Check, ArrowRight, LucideIcon, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

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
  isMobile?: boolean;
}

// Desktop Flow Card (horizontal layout)
const FlowCard = ({ step, index, isActive, onClick, highlighted = false, isMobile = false }: FlowCardProps) => {
  const Icon = step.icon;

  return (
    <motion.div
      className={`relative p-6 sm:p-8 rounded-2xl border-2 ${step.borderColor} bg-gradient-to-br ${step.bgGradient} to-transparent backdrop-blur-sm cursor-pointer group ${highlighted ? 'ring-2 ring-purple-500/30' : ''}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportConfig}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      whileHover={{
        scale: 1.05,
        boxShadow: `0 0 30px ${step.glowColor}`
      }}
      onClick={onClick}
    >
      {/* Glow effect on hover */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 ${!isMobile && "transition-opacity duration-300"} rounded-2xl blur-xl`}
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

// Mobile Accordion Card
interface AccordionCardProps {
  step: FlowStep;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  highlighted?: boolean;
  isMobile?: boolean;
}

const AccordionCard = ({ step, index, isExpanded, onToggle, highlighted = false, isMobile = false }: AccordionCardProps) => {
  const Icon = step.icon;

  return (
    <motion.div
      className={`relative rounded-2xl border-2 ${step.borderColor} bg-gradient-to-br ${step.bgGradient} to-transparent backdrop-blur-sm overflow-hidden ${highlighted ? 'ring-2 ring-purple-500/30' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportConfig}
      transition={{ duration: 0.5, delay: index * 0.15 }}
    >
      {/* Glow effect */}
      <div
        className={`absolute inset-0 ${isExpanded ? 'opacity-100' : 'opacity-0'} ${!isMobile && "transition-opacity duration-300"} rounded-2xl blur-xl`}
        style={{ background: step.glowColor }}
      />

      {/* Header - Always visible */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-4 flex items-center justify-between relative z-10"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${highlighted ? 'bg-purple-500/20' : `bg-${step.color}-500/10`}`}
            style={{
              backgroundColor: highlighted ? 'rgba(153,69,255,0.2)' : undefined
            }}
          >
            <Icon
              className="w-5 h-5"
              style={{ color: step.accentColor }}
            />
          </div>
          <div className="text-left">
            <h3 className={`text-base font-bold ${highlighted ? 'text-purple-400' : 'text-white'}`}>
              {step.title}
            </h3>
            {highlighted && (
              <div className="text-xs text-purple-400/60">(Core Protocol)</div>
            )}
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown
            className="w-5 h-5"
            style={{ color: step.accentColor }}
          />
        </motion.div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2 relative z-10">
              {step.items.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="flex items-center justify-start gap-2 px-3 py-2 rounded-lg bg-black/20 border border-white/5"
                >
                  <Check
                    className="w-3.5 h-3.5 flex-shrink-0"
                    style={{ color: step.accentColor }}
                  />
                  <span className="text-xs text-fg-secondary text-left">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
          viewport={viewportConfig}
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
          viewport={viewportConfig}
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
          viewport={viewportConfig}
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

// Vertical Bidirectional Arrow for Mobile
interface VerticalBidirectionalArrowProps {
  fromColor: string;
  toColor: string;
  delay?: number;
  index?: number;
}

const VerticalBidirectionalArrow = ({ fromColor, toColor, delay = 0, index = 0 }: VerticalBidirectionalArrowProps) => {
  const uniqueId = `vertical-${index}-${fromColor.replace('#', '')}-${toColor.replace('#', '')}`;

  return (
    <div className="flex items-center justify-center relative py-2 lg:hidden">
      <svg
        className="w-12 h-12 relative z-10"
        viewBox="0 0 40 50"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Vertical bidirectional gradient (fromColor ↔ toColor) */}
          <linearGradient id={`bidir-v-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: fromColor, stopOpacity: 0.9 }} />
            <stop offset="50%" style={{ stopColor: toColor, stopOpacity: 0.9 }} />
            <stop offset="100%" style={{ stopColor: toColor, stopOpacity: 0.9 }} />
          </linearGradient>

          {/* Subtle glow filter */}
          <filter id={`tech-glow-v-${uniqueId}`}>
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Connection nodes */}
        <circle
          cx="20"
          cy="5"
          r="3"
          fill={fromColor}
          opacity="0.7"
        />
        <circle
          cx="20"
          cy="45"
          r="3"
          fill={toColor}
          opacity="0.7"
        />

        {/* Main bidirectional line - THICK */}
        <motion.path
          d="M 20 5 L 20 45"
          stroke={`url(#bidir-v-${uniqueId})`}
          strokeWidth="3"
          fill="none"
          filter={`url(#tech-glow-v-${uniqueId})`}
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={viewportConfig}
          transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
        />

        {/* Top arrow head (pointing up) */}
        <motion.path
          d="M 20 5 L 20 0 L 17 2 L 20 5 L 23 2 L 20 0 Z"
          fill={fromColor}
          stroke={fromColor}
          strokeWidth="0.5"
          filter={`url(#tech-glow-v-${uniqueId})`}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 0.9, scale: 1 }}
          viewport={viewportConfig}
          transition={{ duration: 0.3, delay: delay + 1, ease: "backOut" }}
        />

        {/* Bottom arrow head (pointing down) */}
        <motion.path
          d="M 20 45 L 20 50 L 17 48 L 20 45 L 23 48 L 20 50 Z"
          fill={toColor}
          stroke={toColor}
          strokeWidth="0.5"
          filter={`url(#tech-glow-v-${uniqueId})`}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 0.9, scale: 1 }}
          viewport={viewportConfig}
          transition={{ duration: 0.3, delay: delay + 1, ease: "backOut" }}
        />

        {/* Hexagonal data packet traveling down (fromColor → toColor) */}
        <motion.path
          d="M 20 0 L 23 2 L 23 4 L 20 6 L 17 4 L 17 2 Z"
          fill={toColor}
          opacity="0.8"
          filter={`url(#tech-glow-v-${uniqueId})`}
          animate={{
            y: [0, 45],
            opacity: [0, 0.8, 0.8, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: delay + 1.5,
            ease: "easeInOut"
          }}
        />

        {/* Hexagonal data packet traveling up (toColor → fromColor) */}
        <motion.path
          d="M 20 50 L 23 48 L 23 46 L 20 44 L 17 46 L 17 48 Z"
          fill={fromColor}
          opacity="0.8"
          filter={`url(#tech-glow-v-${uniqueId})`}
          animate={{
            y: [0, -45],
            opacity: [0, 0.8, 0.8, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: delay + 2.2,
            ease: "easeInOut"
          }}
        />

        {/* Subtle energy pulse */}
        <motion.path
          d="M 20 5 L 20 45"
          stroke={toColor}
          strokeWidth="3"
          fill="none"
          opacity="0"
          animate={{
            opacity: [0, 0.2, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: delay + 2.5,
            ease: "easeInOut"
          }}
        />
      </svg>
    </div>
  );
};

export const FlowDiagram = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [expandedStep, setExpandedStep] = useState<number>(1); // Default: expand SRWA (middle card)

  // Detect mobile to disable animations
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAccordionToggle = (index: number) => {
    setExpandedStep(expandedStep === index ? -1 : index);
  };

  // Viewport config for animations (disabled on mobile to prevent flashing)
  const viewportConfig = isMobile ? false : { once: true };

  return (
    <div className="relative">
      {/* Desktop Layout - Horizontal with Arrows */}
      <div className="hidden lg:grid lg:grid-cols-[1fr,auto,1fr,auto,1fr] lg:gap-0 items-stretch">
        {/* Card 1: ISSUERS */}
        <FlowCard
          step={steps[0]}
          index={0}
          isActive={activeStep === 0}
          onClick={() => setActiveStep(activeStep === 0 ? null : 0)}
          isMobile={isMobile}
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
          isMobile={isMobile}
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
          isMobile={isMobile}
        />
      </div>

      {/* Mobile Layout - Accordion with Vertical Arrows */}
      <div className="lg:hidden flex flex-col">
        {/* Card 1: ISSUERS */}
        <AccordionCard
          step={steps[0]}
          index={0}
          isExpanded={expandedStep === 0}
          onToggle={() => handleAccordionToggle(0)}
          highlighted={false}
          isMobile={isMobile}
        />

        {/* Vertical Arrow 1↕2 */}
        <VerticalBidirectionalArrow
          fromColor={steps[0].accentColor}
          toColor={steps[1].accentColor}
          delay={0.3}
          index={0}
        />

        {/* Card 2: SRWA (Core Protocol - highlighted) */}
        <AccordionCard
          step={steps[1]}
          index={1}
          isExpanded={expandedStep === 1}
          onToggle={() => handleAccordionToggle(1)}
          highlighted={true}
          isMobile={isMobile}
        />

        {/* Vertical Arrow 2↕3 */}
        <VerticalBidirectionalArrow
          fromColor={steps[1].accentColor}
          toColor={steps[2].accentColor}
          delay={0.6}
          index={1}
        />

        {/* Card 3: MARKET */}
        <AccordionCard
          step={steps[2]}
          index={2}
          isExpanded={expandedStep === 2}
          onToggle={() => handleAccordionToggle(2)}
          highlighted={false}
          isMobile={isMobile}
        />
      </div>

      {/* Info Text */}
      <motion.div
        className="mt-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportConfig}
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
