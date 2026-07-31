/**
 * Standard duration formatting utilities for North Star app.
 */

/**
 * Formats a duration in seconds into a human-readable string.
 * Example:
 * - 0 -> "0m"
 * - 2700 (45 mins) -> "45m"
 * - 3600 (1 hour) -> "1h"
 * - 5400 (1h 30m) -> "1h 30m"
 * - 9000 (2h 30m) -> "2h 30m"
 */
export function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return "0m";

  const totalMinutes = Math.floor(totalSeconds / 60);
  return formatMinutes(totalMinutes);
}

/**
 * Formats a duration in minutes into a human-readable string.
 * Example:
 * - 45 -> "45m"
 * - 60 -> "1h"
 * - 90 -> "1h 30m"
 * - 120 -> "2h"
 */
export function formatMinutes(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return "0m";

  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

/**
 * Formats seconds into digital timer display format (e.g., "01:30" or "01:15:30").
 */
export function formatDigitalTime(totalSeconds: number, autoHideHours = true): string {
  if (!totalSeconds || totalSeconds <= 0) {
    return "00:00";
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0 || !autoHideHours) {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}
