import { createContext, useContext } from "react";

export const CurrentTimeContext = createContext<Date | null>(null);

export function useCurrentTime() {
  const currentTime = useContext(CurrentTimeContext);

  if (!currentTime) {
    throw new Error("useCurrentTime must be used inside CurrentTimeProvider");
  }

  return currentTime;
}
