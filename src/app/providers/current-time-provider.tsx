import {
  type PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from "react";

import { CurrentTimeContext } from "./current-time-context";

function getMsUntilNextMinute(now: Date) {
  return 60_000 - now.getSeconds() * 1_000 - now.getMilliseconds();
}

export function CurrentTimeProvider({ children }: PropsWithChildren) {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    let intervalId: number | undefined;

    /**
     * Align updates to the real clock minute boundary.
     *
     * If the app opens at 10:04:37, a plain 60s interval would tick at 10:05:37.
     * For labels like "in 12 min", it is cleaner to tick at 10:05:00.
     */
    const timeoutId = window.setTimeout(() => {
      setCurrentTime(new Date());
      intervalId = window.setInterval(() => {
        setCurrentTime(new Date());
      }, 60_000);
    }, getMsUntilNextMinute(new Date()));

    return () => {
      window.clearTimeout(timeoutId);

      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  const value = useMemo(() => currentTime, [currentTime]);

  return (
    <CurrentTimeContext.Provider value={value}>
      {children}
    </CurrentTimeContext.Provider>
  );
}
