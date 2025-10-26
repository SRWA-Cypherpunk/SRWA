import { useState, useEffect } from 'react';

/**
 * Hook to provide consistent motion configuration across the app
 * Automatically detects mobile devices and disables animations to prevent flashing
 */
export function useMotionConfig() {
  // Initialize with actual window size to prevent flash
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check immediately in case SSR gave wrong value
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Viewport configurations
  const viewportConfig = isMobile ? false : { once: true };
  const viewportConfigWithMargin = isMobile ? false : { once: true, margin: "-100px" };

  // Animation configurations
  const getInitialAnimation = (desktopConfig: any) => {
    return isMobile ? { opacity: 1 } : desktopConfig;
  };

  const getWhileInViewAnimation = (desktopConfig: any) => {
    return isMobile ? { opacity: 1 } : desktopConfig;
  };

  const getAnimateAnimation = (desktopConfig: any) => {
    return isMobile ? {} : desktopConfig;
  };

  const getTransition = (desktopConfig: any) => {
    return isMobile ? {} : desktopConfig;
  };

  // CSS class helpers
  const getTransitionClass = (transitionClass: string) => {
    return isMobile ? '' : transitionClass;
  };

  return {
    isMobile,
    viewportConfig,
    viewportConfigWithMargin,
    getInitialAnimation,
    getWhileInViewAnimation,
    getAnimateAnimation,
    getTransition,
    getTransitionClass,
  };
}