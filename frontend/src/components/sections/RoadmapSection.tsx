import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  Building2,
  Trophy,
  Globe2
} from "lucide-react";
import "@/styles/features/roadmap.css";

interface RoadmapPhase {
  phase: string;
  title: string;
  period: string;
  status: "completed" | "in-progress" | "upcoming" | "planned";
  icon: typeof Rocket;
  milestones: string[];
  progress?: number;
}

const roadmapData: RoadmapPhase[] = [
  {
    phase: "Phase 1",
    title: "Foundation & Mainnet Launch",
    period: "Q4 2024",
    status: "in-progress",
    icon: Rocket,
    progress: 50,
    milestones: [
      "Audited smart contracts deployed on Solana Mainnet",
      "Fully functional RWA tokenization platform",
      "Secondary marketplace for RWA token trading",
      "First active liquidity pools",
      "Institutional interface for token creation and management",
      "Integrated oracle system (Pyth Network)"
    ]
  },
  {
    phase: "Phase 2",
    title: "Governance & Global Compliance",
    period: "Q1-Q2 2025",
    status: "upcoming",
    icon: Building2,
    milestones: [
      "DAO structuring and launch (decentralized governance model)",
      "Complete tokenomics development and incentive model",
      "Strategic partnerships with global KYC/KYB providers",
      "Regulatory certifications across multiple jurisdictions",
      "Modular and adaptable compliance framework"
    ]
  },
  {
    phase: "Phase 3",
    title: "Token Launch & Institutional Adoption",
    period: "Q3-Q4 2025",
    status: "upcoming",
    icon: Trophy,
    milestones: [
      "Fully operational DAO with decentralized treasury",
      "Token Generation Event (TGE) and governance distribution",
      "Partnerships with banks, asset managers, and family offices",
      "Integration with legacy systems (TradFi)",
      "Incentive program for institutional early adopters"
    ]
  },
  {
    phase: "Phase 4",
    title: "Global Expansion & Advanced Products",
    period: "2026+",
    status: "planned",
    icon: Globe2,
    milestones: [
      "Cross-chain expansion (Ethereum, Base, Arbitrum)",
      "Advanced DeFi products (derivatives, yield strategies, structured products)",
      "Integration with institutional custodians (Fireblocks, Copper)",
      "Geographic expansion: Latin America, Europe, Asia-Pacific",
      "Institutional API for white-label integration",
      "Grant and acceleration program for RWA projects"
    ]
  }
];

const statusConfig = {
  completed: {
    label: "Completed",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/40"
  },
  "in-progress": {
    label: "In Progress",
    color: "text-brand-400",
    bgColor: "bg-brand-500/10",
    borderColor: "border-brand-500/40"
  },
  upcoming: {
    label: "Upcoming",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/40"
  },
  planned: {
    label: "Planned",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/40"
  }
};

export const RoadmapSection = () => {
  const sectionRef = useRef(null);
  const isSectionInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Detect mobile to disable heavy animations
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Viewport config for animations (disabled on mobile to prevent flashing)
  const viewportConfig = isMobile ? false : { once: true };

  return (
    <section
      ref={sectionRef}
      className="relative py-16 sm:py-20 overflow-hidden"
    >
      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(153,69,255,0.6) 1.5px, transparent 1.5px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 30% 20%, rgba(255,107,53,0.05), transparent 40%), radial-gradient(circle at 60% 50%, rgba(153,69,255,0.05), transparent 60%)'
        }}
      />

      {/* Subtle animated orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Purple orb - left */}
        <motion.div
          className="absolute top-1/4 -left-20 w-96 h-96 rounded-full opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, rgba(153,69,255,0.4), transparent 70%)',
            filter: 'blur(80px)'
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            opacity: [0.04, 0.06, 0.04],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        {/* Orange orb - right */}
        <motion.div
          className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full opacity-[0.05]"
          style={{
            background: 'radial-gradient(circle, rgba(255,107,53,0.4), transparent 70%)',
            filter: 'blur(70px)'
          }}
          animate={{
            x: [0, -20, 0],
            y: [0, 25, 0],
            opacity: [0.05, 0.07, 0.05],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">

      {/* Header */}
      <motion.div
        className="text-center space-y-4 mb-16 sm:mb-20 relative z-10"
        initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 30 }}
        whileInView={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={viewportConfig}
      >
        <motion.h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white px-4"
          initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Roadmap to the Future
        </motion.h2>
        <motion.p
          className="text-sm sm:text-lg text-fg-muted max-w-2xl mx-auto px-4"
          initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Our journey to transform the Real-World Assets market on blockchain
        </motion.p>
      </motion.div>

      {/* Roadmap Timeline */}
      <div className="relative max-w-5xl mx-auto">
        <div className="roadmap-timeline">
          {roadmapData.map((phase, index) => {
            const PhaseIcon = phase.icon;

            return (
              <motion.div
                key={index}
                className={`roadmap-item ${phase.status}`}
                initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 50 }}
                animate={isSectionInView ? { opacity: 1, y: 0 } : (isMobile ? { opacity: 1 } : { opacity: 0, y: 50 })}
                transition={{ duration: 0.6, delay: isMobile ? 0 : index * 0.2 }}
              >
                {/* Timeline Node (Icon) */}
                <div className="roadmap-node">
                  <motion.div
                    className={`node-circle ${statusConfig[phase.status].bgColor} border-4 ${statusConfig[phase.status].borderColor} backdrop-blur-md`}
                    initial={isMobile ? { scale: 1 } : { scale: 0, rotate: -180 }}
                    animate={isSectionInView ? { scale: 1, rotate: 0 } : (isMobile ? { scale: 1 } : { scale: 0, rotate: -180 })}
                    transition={{
                      duration: 0.8,
                      delay: isMobile ? 0 : index * 0.2 + 0.3,
                      type: "spring",
                      stiffness: 150,
                      damping: 12
                    }}
                    whileHover={isMobile ? {} : { scale: 1.1, rotate: 10 }}
                  >
                    {/* Pulsing ring for in-progress */}
                    {phase.status === "in-progress" && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-brand-400"
                        animate={{
                          scale: [1, 1.4, 1],
                          opacity: [0.8, 0, 0.8]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                    <PhaseIcon className={`h-10 w-10 lg:h-12 lg:w-12 ${statusConfig[phase.status].color}`} />
                  </motion.div>
                </div>

                {/* Card Content */}
                <div className="roadmap-content">
                  <motion.div
                    whileHover={isMobile ? {} : { y: -8, scale: 1.01 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      className={`relative overflow-hidden bg-gradient-to-br from-[#0D0D0D] via-[#121212] to-bg-black border-[3px] ${!isMobile && "transition-all duration-500"} group`}
                      style={{
                        borderRadius: "20px",
                        borderColor: phase.status === "completed"
                          ? "rgba(34, 197, 94, 0.6)"
                          : phase.status === "in-progress"
                          ? "rgba(153, 69, 255, 0.6)"
                          : phase.status === "upcoming"
                          ? "rgba(255, 107, 53, 0.6)"
                          : "rgba(168, 85, 247, 0.6)",
                        boxShadow: `
                          0 0 60px ${
                            phase.status === "completed"
                              ? "rgba(34, 197, 94, 0.4)"
                              : phase.status === "in-progress"
                              ? "rgba(153, 69, 255, 0.4)"
                              : phase.status === "upcoming"
                              ? "rgba(255, 107, 53, 0.4)"
                              : "rgba(168, 85, 247, 0.4)"
                          }
                        `
                      }}
                    >
                      {/* Glow effect on hover */}
                      <motion.div
                        className={`absolute inset-0 opacity-0 group-hover:opacity-100 ${!isMobile && "transition-opacity duration-500"}`}
                        style={{
                          background: phase.status === "completed"
                            ? "linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, transparent 60%)"
                            : phase.status === "in-progress"
                            ? "linear-gradient(135deg, rgba(153, 69, 255, 0.15) 0%, rgba(255, 107, 53, 0.15) 100%)"
                            : phase.status === "upcoming"
                            ? "linear-gradient(135deg, rgba(255, 107, 53, 0.15) 0%, transparent 60%)"
                            : "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, transparent 60%)"
                        }}
                      />

                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${
                            phase.status === "completed"
                              ? "rgba(34, 197, 94, 0.1)"
                              : phase.status === "in-progress"
                              ? "rgba(153, 69, 255, 0.1)"
                              : phase.status === "upcoming"
                              ? "rgba(255, 107, 53, 0.1)"
                              : "rgba(168, 85, 247, 0.1)"
                          }, transparent)`
                        }}
                        animate={{
                          x: ["-100%", "200%"]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />

                      <div className="relative z-10 p-6 sm:p-8 space-y-5">
                        {/* Phase Header */}
                        <div className="roadmap-header flex flex-col gap-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <motion.div whileHover={{ scale: 1.05 }}>
                              <Badge className="relative text-xs sm:text-sm font-extrabold px-5 py-2 bg-gradient-to-r from-orange-500 via-orange-600 to-purple-600 text-white border-0 shadow-lg overflow-hidden">
                                {/* Shimmer effect on badge */}
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                  animate={{
                                    x: ["-100%", "200%"]
                                  }}
                                  transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "linear",
                                    repeatDelay: 1
                                  }}
                                />
                                <span className="relative z-10">{phase.phase.toUpperCase()}</span>
                              </Badge>
                            </motion.div>
                            <span className="text-sm sm:text-base text-fg-muted font-semibold">{phase.period}</span>
                          </div>

                          {/* Title */}
                          <h3 className={`text-xl sm:text-2xl font-extrabold text-fg-primary leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-fg-primary group-hover:to-brand-300 ${!isMobile && "transition-all duration-300"}`}>
                            {phase.title}
                          </h3>
                        </div>

                        {/* Key Features */}
                        <div className="pt-4 border-t border-stroke-line/40">
                          <p className="text-orange-400 font-bold text-sm sm:text-base mb-4 tracking-wide" style={{
                            textShadow: "0 0 20px rgba(255, 107, 53, 0.3)"
                          }}>
                            Key Features:
                          </p>

                          {/* Milestones */}
                          <div className="roadmap-milestones flex flex-col gap-3">
                            {phase.milestones.map((milestone, mIndex) => (
                              <motion.div
                                key={mIndex}
                                initial={{ opacity: 0, x: -20 }}
                                animate={isSectionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                transition={{ duration: 0.4, delay: index * 0.2 + mIndex * 0.08 }}
                                className="milestone-item flex items-start gap-3 group/milestone"
                              >
                                {/* Circle with check inside */}
                                <motion.div
                                  className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    phase.status === "completed"
                                      ? "border-green-400 text-green-400"
                                      : phase.status === "in-progress"
                                      ? "border-brand-400 text-brand-400"
                                      : phase.status === "upcoming"
                                      ? "border-orange-400 text-orange-400"
                                      : "border-purple-400 text-purple-400"
                                  } group-hover/milestone:scale-125 ${!isMobile && "transition-transform duration-300"}`}
                                  whileHover={{
                                    boxShadow: `0 0 15px ${
                                      phase.status === "completed"
                                        ? "rgba(34, 197, 94, 0.6)"
                                        : phase.status === "in-progress"
                                        ? "rgba(153, 69, 255, 0.6)"
                                        : phase.status === "upcoming"
                                        ? "rgba(255, 107, 53, 0.6)"
                                        : "rgba(168, 85, 247, 0.6)"
                                    }`
                                  }}
                                >
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    strokeWidth="3"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </motion.div>
                                <p className={`text-sm sm:text-base text-fg-secondary group-hover/milestone:text-fg-primary ${!isMobile && "transition-colors"} leading-relaxed flex-1`}>
                                  {milestone}
                                </p>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Progress indicator for in-progress phase */}
                        {phase.status === "in-progress" && phase.progress !== undefined && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                            className="pt-5 border-t border-stroke-line/40"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs sm:text-sm text-fg-muted font-semibold">Overall Progress</span>
                              <motion.span
                                className="text-xs sm:text-sm font-extrabold text-brand-400"
                                animate={{
                                  textShadow: [
                                    "0 0 10px rgba(153, 69, 255, 0.3)",
                                    "0 0 20px rgba(153, 69, 255, 0.5)",
                                    "0 0 10px rgba(153, 69, 255, 0.3)"
                                  ]
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              >
                                {phase.progress}%
                              </motion.span>
                            </div>
                            <div className="w-full bg-bg-elev-2 rounded-full h-2.5 overflow-hidden border-2 border-brand-500/30 relative">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 relative overflow-hidden"
                                initial={{ width: 0 }}
                                whileInView={{ width: `${phase.progress}%` }}
                                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                              >
                                {/* Animated shimmer on progress bar */}
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                  animate={{
                                    x: ["-100%", "200%"]
                                  }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "linear",
                                    repeatDelay: 0.5
                                  }}
                                />
                              </motion.div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      </div>
    </section>
  );
};
