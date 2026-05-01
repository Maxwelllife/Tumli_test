import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Small helper for conditional Tailwind classes.
 *
 * clsx handles booleans/arrays/objects, tailwind-merge removes conflicting
 * utilities like "px-2 px-4" and keeps the last meaningful value.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
