import { useEffect, useRef, useState } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

interface AnimatedCounterProps {
  value: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({ value, duration = 2000, className }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
      animateCounter();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView, controls]);

  const animateCounter = () => {
    // Extract numeric part from value (e.g., "$1.24B" -> "1.24")
    const numericMatch = value.match(/[\d,.]+/);
    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }

    const numericPart = numericMatch[0].replace(/,/g, "");
    const targetNumber = parseFloat(numericPart);
    const suffix = value.replace(numericMatch[0], "").replace(/[\d,.]/g, "");
    const prefix = value.substring(0, value.indexOf(numericMatch[0]));
    
    if (isNaN(targetNumber)) {
      setDisplayValue(value);
      return;
    }

    let startNumber = 0;
    const increment = targetNumber / (duration / 16); // 60fps
    
    const timer = setInterval(() => {
      startNumber += increment;
      if (startNumber >= targetNumber) {
        startNumber = targetNumber;
        clearInterval(timer);
      }
      
      let formattedNumber;
      if (targetNumber >= 1000000000) {
        formattedNumber = (startNumber / 1000000000).toFixed(2);
      } else if (targetNumber >= 1000000) {
        formattedNumber = (startNumber / 1000000).toFixed(1);
      } else if (targetNumber >= 1000) {
        formattedNumber = (startNumber / 1000).toFixed(1);
      } else {
        formattedNumber = startNumber.toFixed(0);
      }
      
      setDisplayValue(`${prefix}${formattedNumber}${suffix}`);
    }, 16);
  };

  return (
    <motion.span
      ref={ref}
      className={className}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
      }}
    >
      {displayValue}
    </motion.span>
  );
}