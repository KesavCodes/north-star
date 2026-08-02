import { format, subDays, parseISO } from "date-fns";
import { Task, TaskLog } from "../types";

/**
 * Calculates the current streak count for a given task.
 * Respects task.daysOfWeek routine schedule: non-scheduled off days are ignored
 * and do not break the streak.
 */
export function calculateTaskStreak(
  task: Task,
  logs: Record<string, TaskLog>,
  fromDate: Date = new Date(),
): number {
  let streak = 0;
  let currentDate = fromDate;
  const todayStr = format(fromDate, "yyyy-MM-dd");

  // Check up to 365 days back
  for (let i = 0; i < 365; i++) {
    const dateStr = format(currentDate, "yyyy-MM-dd");
    const dayOfWeek = currentDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

    // Check if task was active on this day of the week
    const isScheduledDay =
      !task.isRoutine ||
      !task.daysOfWeek ||
      task.daysOfWeek.length === 0 ||
      task.daysOfWeek.includes(dayOfWeek);

    if (isScheduledDay) {
      const logId = `${task.id}-${dateStr}`;
      const log = logs[logId];

      if (log?.completed) {
        streak++;
      } else {
        // If today is not completed yet, don't break streak for past days
        if (dateStr !== todayStr) {
          break;
        }
      }
    }
    // If not a scheduled day, skip without breaking the streak loop!

    currentDate = subDays(currentDate, 1);
  }

  return streak;
}
