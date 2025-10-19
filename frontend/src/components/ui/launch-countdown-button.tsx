import { useEffect, useState, type ReactNode } from "react";
import { HeroButton } from "@/components/ui/hero-button";

const resolveLaunchTimestamp = () => {
  const now = new Date();
  const target = new Date(now.getFullYear(), 9, 30, 4, 0, 0, 0); // 30 Oct, 04:00 local time

  if (target.getTime() <= now.getTime()) {
    target.setFullYear(target.getFullYear() + 1);
  }

  return target.getTime();
};

const LAUNCH_TARGET_TIMESTAMP = resolveLaunchTimestamp();

const pad = (value: number) => value.toString().padStart(2, "0");

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isElapsed: boolean;
}

const calculateCountdown = (now: number): CountdownState => {
  const diff = Math.max(LAUNCH_TARGET_TIMESTAMP - now, 0);
  const totalSeconds = Math.floor(diff / 1000);

  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    isElapsed: diff === 0,
  };
};

export function useLaunchCountdown() {
  const [state, setState] = useState<CountdownState>(() => calculateCountdown(Date.now()));

  useEffect(() => {
    const interval = window.setInterval(() => {
      setState(calculateCountdown(Date.now()));
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  return state;
}

interface LaunchCountdownButtonProps {
  className?: string;
  buttonClassName?: string;
  icon?: ReactNode;
  onLaunch?: () => void;
}

export function LaunchCountdownButton({
  className = "",
  buttonClassName = "",
  icon,
  onLaunch,
}: LaunchCountdownButtonProps) {
  const { days, hours, minutes, seconds, isElapsed } = useLaunchCountdown();
  const formattedCountdown = `${pad(days)}d:${pad(hours)}h:${pad(minutes)}m:${pad(seconds)}s`;

  const containerClasses = ["flex flex-col items-center", className]
    .filter(Boolean)
    .join(" ");

  const handleLaunch = () => {
    if (isElapsed && onLaunch) {
      onLaunch();
    }
  };

  const label = isElapsed ? "Launch App" : `Launch App • ${formattedCountdown}`;

  return (
    <div className={containerClasses}>
      <HeroButton
        onClick={handleLaunch}
        variant="brand"
        className={buttonClassName || "w-full sm:w-auto"}
        disabled={!isElapsed}
        icon={icon}
      >
        {label}
      </HeroButton>
    </div>
  );
}
