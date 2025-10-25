import React from "react";
import { OrbitingCircles, OrbitingCirclesContainer } from "@/components/ui/orbiting-circles";
import { File, Settings, Search, Shield, Globe, Zap } from "lucide-react";

const OrbitingCirclesTest = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">MagicUI Orbiting Circles</h1>
          <p className="text-lg text-muted-foreground">
            Exact implementation from MagicUI documentation
          </p>
        </div>

        {/* Basic Example from MagicUI Docs */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Basic Example (from MagicUI docs)</h2>
          <div className="relative overflow-hidden h-[500px] w-full border rounded-lg">
            <OrbitingCircles>
              <File />
              <Settings />
              <File />
            </OrbitingCircles>
            <OrbitingCircles radius={100} reverse>
              <File />
              <Settings />
              <File />
              <Search />
            </OrbitingCircles>
          </div>
        </div>

        {/* Custom Examples */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Custom Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">With Icons</h3>
              <div className="relative h-64 w-full border rounded-lg">
                <OrbitingCircles radius={80} duration={20} delay={0} iconSize={24}>
                  <Shield className="w-6 h-6 text-brand-500" />
                </OrbitingCircles>
                <OrbitingCircles radius={60} duration={15} delay={5} reverse iconSize={20}>
                  <Globe className="w-5 h-5 text-brand-400" />
                </OrbitingCircles>
                <OrbitingCircles radius={40} duration={25} delay={10} iconSize={16}>
                  <Zap className="w-4 h-4 text-brand-300" />
                </OrbitingCircles>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Different Speeds</h3>
              <div className="relative h-64 w-full border rounded-lg">
                <OrbitingCircles radius={70} duration={10} delay={0} speed={2} iconSize={20}>
                  <div className="w-5 h-5 rounded-full bg-brand-500" />
                </OrbitingCircles>
                <OrbitingCircles radius={50} duration={20} delay={5} speed={0.5} reverse iconSize={16}>
                  <div className="w-4 h-4 rounded-full bg-brand-400" />
                </OrbitingCircles>
                <OrbitingCircles radius={30} duration={30} delay={10} speed={1} iconSize={12}>
                  <div className="w-3 h-3 rounded-full bg-brand-300" />
                </OrbitingCircles>
              </div>
            </div>
          </div>
        </div>

        {/* Container Example */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Container Example</h2>
          <div className="flex justify-center">
            <OrbitingCirclesContainer>
              <div className="w-16 h-16 rounded-full bg-brand-500 flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </OrbitingCirclesContainer>
          </div>
        </div>

        {/* Props Documentation */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Available Props</h2>
          <div className="bg-muted p-6 rounded-lg">
            <pre className="text-sm">
{`interface OrbitingCirclesProps {
  className?: string;
  children?: React.ReactNode;
  reverse?: boolean;        // Default: false
  duration?: number;        // Default: 20
  delay?: number;          // Default: 10
  radius?: number;         // Default: 160
  path?: boolean;          // Default: true
  iconSize?: number;       // Default: 30
  speed?: number;          // Default: 1
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrbitingCirclesTest;
