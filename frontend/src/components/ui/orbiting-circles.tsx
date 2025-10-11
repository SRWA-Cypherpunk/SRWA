import React from "react";
import { cn } from "@/lib/utils";
import { 
  Coins, 
  Building2, 
  Database, 
  Network, 
  Wallet, 
  Banknote, 
  PieChart, 
  Activity,
  Shield,
  Globe
} from "lucide-react";

interface OrbitingCirclesProps {
  className?: string;
  children?: React.ReactNode;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
  iconSize?: number;
  speed?: number;
}

export const OrbitingCircles = ({
  className,
  children,
  reverse = false,
  duration = 20,
  delay = 10,
  radius = 160,
  path = true,
  iconSize = 30,
  speed = 1,
}: OrbitingCirclesProps) => {
  return (
    <>
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <circle
            className="stroke-black/10 stroke-1 dark:stroke-white/10"
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            strokeDasharray={"4 4"}
          />
        </svg>
      )}

      <div
        style={
          {
            "--duration": duration,
            "--radius": radius,
            "--delay": -delay,
            "--speed": speed,
          } as React.CSSProperties
        }
        className={cn(
          "absolute flex h-full w-full transform-gpu animate-orbit items-center justify-center rounded-full border bg-black/10 dark:bg-white/10 [animation-delay:calc(var(--delay)*1000ms)] [animation-duration:calc(var(--duration)*1s/var(--speed))]",
          { "[animation-direction:reverse]": reverse },
          className,
        )}
      >
        <div
          style={{
            width: `${iconSize}px`,
            height: `${iconSize}px`,
          }}
          className="flex items-center justify-center"
        >
          {children}
        </div>
      </div>
    </>
  );
};

interface OrbitingCirclesContainerProps {
  className?: string;
  children?: React.ReactNode;
}

export const OrbitingCirclesContainer = ({
  className,
  children,
}: OrbitingCirclesContainerProps) => {
  return (
    <div
      className={cn(
        "relative flex h-96 w-96 items-center justify-center",
        className
      )}
    >
      {children}
    </div>
  );
};

// Hero-specific orbiting circles with project-related icons
export const HeroOrbitingCircles = ({ className }: { className?: string }) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Stellar/Blockchain related icons */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80">
        <OrbitingCircles radius={120} duration={30} delay={0} iconSize={24}>
          <div className="w-6 h-6 rounded-full bg-brand-500/20 border-2 border-brand-500 flex items-center justify-center">
            <Globe className="w-4 h-4 text-brand-500" />
          </div>
        </OrbitingCircles>
      </div>
      
      <div className="absolute top-1/3 right-1/4 w-60 h-60">
        <OrbitingCircles radius={80} duration={25} delay={5} reverse iconSize={20}>
          <div className="w-5 h-5 rounded-full bg-brand-400/20 border-2 border-brand-400 flex items-center justify-center">
            <Network className="w-3 h-3 text-brand-400" />
          </div>
        </OrbitingCircles>
      </div>

      <div className="absolute top-1/2 left-1/6 w-48 h-48">
        <OrbitingCircles radius={60} duration={20} delay={10} iconSize={18}>
          <div className="w-4 h-4 rounded-full bg-brand-300/20 border-2 border-brand-300 flex items-center justify-center">
            <Coins className="w-3 h-3 text-brand-300" />
          </div>
        </OrbitingCircles>
      </div>

      <div className="absolute bottom-1/3 right-1/6 w-64 h-64">
        <OrbitingCircles radius={100} duration={35} delay={15} reverse iconSize={22}>
          <div className="w-5 h-5 rounded-full bg-brand-500/20 border-2 border-brand-500 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-brand-500" />
          </div>
        </OrbitingCircles>
      </div>

      <div className="absolute top-2/3 left-1/3 w-40 h-40">
        <OrbitingCircles radius={50} duration={15} delay={20} iconSize={16}>
          <div className="w-4 h-4 rounded-full bg-brand-400/20 border-2 border-brand-400 flex items-center justify-center">
            <PieChart className="w-3 h-3 text-brand-400" />
          </div>
        </OrbitingCircles>
      </div>

      <div className="absolute bottom-1/4 left-2/3 w-32 h-32">
        <OrbitingCircles radius={40} duration={18} delay={25} reverse iconSize={14}>
          <div className="w-3 h-3 rounded-full bg-brand-300/20 border-2 border-brand-300 flex items-center justify-center">
            <Shield className="w-2 h-2 text-brand-300" />
          </div>
        </OrbitingCircles>
      </div>

      {/* Additional smaller orbits with more icons */}
      <div className="absolute top-1/5 right-1/5 w-24 h-24">
        <OrbitingCircles radius={30} duration={12} delay={8} iconSize={12}>
          <div className="w-3 h-3 rounded-full bg-brand-200/20 border border-brand-200 flex items-center justify-center">
            <Wallet className="w-2 h-2 text-brand-200" />
          </div>
        </OrbitingCircles>
      </div>

      <div className="absolute bottom-1/5 right-1/3 w-20 h-20">
        <OrbitingCircles radius={25} duration={16} delay={12} reverse iconSize={10}>
          <div className="w-2 h-2 rounded-full bg-brand-400/20 border border-brand-400 flex items-center justify-center">
            <Database className="w-1.5 h-1.5 text-brand-400" />
          </div>
        </OrbitingCircles>
      </div>

      <div className="absolute top-3/4 right-1/5 w-28 h-28">
        <OrbitingCircles radius={35} duration={14} delay={6} iconSize={11}>
          <div className="w-2.5 h-2.5 rounded-full bg-brand-300/20 border border-brand-300 flex items-center justify-center">
            <Activity className="w-1.5 h-1.5 text-brand-300" />
          </div>
        </OrbitingCircles>
      </div>
    </div>
  );
};
