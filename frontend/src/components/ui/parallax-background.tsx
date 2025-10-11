import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxBackgroundProps {
  imageUrl?: string;
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

export function ParallaxBackground({ 
  imageUrl, 
  children, 
  className = "",
  speed = 0.5 
}: ParallaxBackgroundProps) {
  const { scrollY } = useScroll();
  const [windowHeight, setWindowHeight] = useState(0);
  
  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const y = useTransform(scrollY, [0, windowHeight], [0, windowHeight * speed]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {imageUrl && (
        <motion.div
          style={{ y }}
          className="absolute inset-0 -z-10"
        >
          <div 
            className="absolute inset-0 scale-110 bg-cover bg-center bg-no-repeat opacity-10"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg-black/80 via-bg-black/90 to-bg-black" />
        </motion.div>
      )}
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden -z-5">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-brand-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      
      {children}
    </div>
  );
}