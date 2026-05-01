export type PendingTimeDisplayMode = "hoursMinutes" | "totalMinutes";

const STORAGE_KEY = "task-calendar:pending-time-display";
const DEFAULT_MODE: PendingTimeDisplayMode = "hoursMinutes";

export function getPendingTimeDisplayMode(): PendingTimeDisplayMode {
  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  return storedValue === "totalMinutes" || storedValue === "hoursMinutes"
    ? storedValue
    : DEFAULT_MODE;
}

export function savePendingTimeDisplayMode(mode: PendingTimeDisplayMode) {
  window.localStorage.setItem(STORAGE_KEY, mode);
}

export function getNextPendingTimeDisplayMode(
  mode: PendingTimeDisplayMode,
): PendingTimeDisplayMode {
  return mode === "hoursMinutes" ? "totalMinutes" : "hoursMinutes";
}
