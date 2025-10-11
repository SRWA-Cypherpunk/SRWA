import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SpringConfig {
  damping: number;
  stiffness: number;
  mass: number;
  restDelta: number;
}

interface SmoothCursorProps {
  cursor?: React.ReactNode;
  springConfig?: SpringConfig;
}

const defaultSpringConfig: SpringConfig = {
  damping: 45,
  stiffness: 400,
  mass: 1,
  restDelta: 0.001,
};

const DefaultCursorSVG = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-brand-500"
  >
    <path
      d="M2 2L17 17L12.5 12.5L8 17L2 2Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const SmoothCursor: React.FC<SmoothCursorProps> = ({
  cursor = <DefaultCursorSVG />,
  springConfig = defaultSpringConfig,
}) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isText, setIsText] = useState(false);

  const targetPosition = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animationFrame = useRef<number>();

  const updatePosition = () => {
    if (!cursorRef.current) return;

    const dx = targetPosition.current.x - position.x;
    const dy = targetPosition.current.y - position.y;

    const springForce = springConfig.stiffness * dx;
    const dampingForce = springConfig.damping * velocity.current.x;
    const accelerationX = (springForce - dampingForce) / springConfig.mass;

    const springForceY = springConfig.stiffness * dy;
    const dampingForceY = springConfig.damping * velocity.current.y;
    const accelerationY = (springForceY - dampingForceY) / springConfig.mass;

    velocity.current.x += accelerationX;
    velocity.current.y += accelerationY;

    const newX = position.x + velocity.current.x;
    const newY = position.y + velocity.current.y;

    setPosition({ x: newX, y: newY });

    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > springConfig.restDelta) {
      animationFrame.current = requestAnimationFrame(updatePosition);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetPosition.current = { x: e.clientX, y: e.clientY };
      setIsVisible(true);
      
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      animationFrame.current = requestAnimationFrame(updatePosition);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = target.closest('button, a, [role="button"], input, textarea, select');
      const isTextElement = target.closest('input, textarea, [contenteditable]');
      
      setIsPointer(!!isClickable);
      setIsText(!!isTextElement);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleMouseOver);
      
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [position, springConfig]);

  return (
    <div
      ref={cursorRef}
      className={cn(
        "fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-200",
        {
          "opacity-0": !isVisible,
          "opacity-100": isVisible,
        }
      )}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
    >
      <div
        className={cn(
          "transition-all duration-200 ease-out",
          {
            "scale-150": isPointer,
            "scale-75": isText,
            "scale-100": !isPointer && !isText,
          }
        )}
      >
        {cursor}
      </div>
    </div>
  );
};
