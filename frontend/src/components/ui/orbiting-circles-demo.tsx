import React from "react";
import { OrbitingCircles, OrbitingCirclesContainer } from "./orbiting-circles";
import { Shield, Globe, Zap, BarChart3, Lock, Users } from "lucide-react";

// Demo component showing different orbiting circles configurations
export const OrbitingCirclesDemo = () => {
  return (
    <div className="space-y-16 p-8">
      {/* Basic orbiting circles */}
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-4">Basic Orbiting Circles</h3>
        <OrbitingCirclesContainer className="mx-auto">
          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
        </OrbitingCirclesContainer>
      </div>

      {/* Multiple orbiting circles */}
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-4">Multiple Orbiting Circles</h3>
        <div className="relative w-96 h-96 mx-auto">
          <OrbitingCircles radius={80} duration={20} delay={0}>
            <div className="w-4 h-4 rounded-full bg-brand-400 flex items-center justify-center">
              <Globe className="w-2 h-2 text-white" />
            </div>
          </OrbitingCircles>
          <OrbitingCircles radius={60} duration={15} delay={5} reverse>
            <div className="w-3 h-3 rounded-full bg-brand-300 flex items-center justify-center">
              <Zap className="w-1.5 h-1.5 text-white" />
            </div>
          </OrbitingCircles>
          <OrbitingCircles radius={40} duration={25} delay={10}>
            <div className="w-2 h-2 rounded-full bg-brand-500 flex items-center justify-center">
              <BarChart3 className="w-1 h-1 text-white" />
            </div>
          </OrbitingCircles>
        </div>
      </div>

      {/* Different sizes and speeds */}
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-4">Different Configurations</h3>
        <div className="flex justify-center space-x-8">
          <div className="relative w-24 h-24">
            <OrbitingCircles radius={30} duration={10} delay={0}>
              <div className="w-2 h-2 rounded-full bg-brand-400" />
            </OrbitingCircles>
          </div>
          <div className="relative w-32 h-32">
            <OrbitingCircles radius={40} duration={20} delay={5} reverse>
              <div className="w-3 h-3 rounded-full bg-brand-300" />
            </OrbitingCircles>
          </div>
          <div className="relative w-40 h-40">
            <OrbitingCircles radius={50} duration={30} delay={10}>
              <div className="w-4 h-4 rounded-full bg-brand-500" />
            </OrbitingCircles>
          </div>
        </div>
      </div>
    </div>
  );
};
