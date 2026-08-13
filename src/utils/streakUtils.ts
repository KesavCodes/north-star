import { format, subDays, differenceInDays } from "date-fns";
import { Task, TaskLog } from "../types";

/**
 * Calculates search depth bound in O(1) time directly from the number of days since firstUsedAt.
 */
function getSearchDaysBound(
  firstUsedAt?: number,
  fromDate: Date = new Date(),
): number {
  if (!firstUsedAt) return 365;
  const daysDiff = differenceInDays(fromDate, new Date(firstUsedAt)) + 7;
  return Math.max(daysDiff, 365);
}

/**
 * Calculates the current streak count for a single task in O(K) time
 * where K is the active streak length. Breaks immediately on broken streak.
 */
export function calculateTaskStreak(
  task: Task,
  logs: Record<string, TaskLog>,
  fromDate: Date = new Date(),
  firstUsedAt?: number,
): number {
  let streak = 0;
  let currentDate = fromDate;
  const todayStr = format(fromDate, "yyyy-MM-dd");
  const maxDays = getSearchDaysBound(firstUsedAt, fromDate);

  for (let i = 0; i < maxDays; i++) {
    const dateStr = format(currentDate, "yyyy-MM-dd");
    const dayOfWeek = currentDate.getDay();

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
        if (dateStr !== todayStr) {
          break;
        }
      }
    }

    currentDate = subDays(currentDate, 1);
  }

  return streak;
}

/**
 * Calculates the all-time best streak count for a single task.
 */
export function calculateTaskBestStreak(
  task: Task,
  logs: Record<string, TaskLog>,
  fromDate: Date = new Date(),
  firstUsedAt?: number,
): number {
  let maxStreak = 0;
  let tempStreak = 0;
  let currentDate = fromDate;
  const maxDays = getSearchDaysBound(firstUsedAt, fromDate);

  for (let i = 0; i < maxDays; i++) {
    const dateStr = format(currentDate, "yyyy-MM-dd");
    const dayOfWeek = currentDate.getDay();

    const isScheduledDay =
      !task.isRoutine ||
      !task.daysOfWeek ||
      task.daysOfWeek.length === 0 ||
      task.daysOfWeek.includes(dayOfWeek);

    if (isScheduledDay) {
      const logId = `${task.id}-${dateStr}`;
      const log = logs[logId];

      if (log?.completed) {
        tempStreak++;
        if (tempStreak > maxStreak) {
          maxStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }

    currentDate = subDays(currentDate, 1);
  }

  return maxStreak;
}

/**
 * Calculates streak across a set of tasks (e.g. all tasks, or tasks within a category).
 */
export function calculateGroupStreak(
  taskList: Task[],
  logs: Record<string, TaskLog>,
  fromDate: Date = new Date(),
  firstUsedAt?: number,
): { currentStreak: number; bestStreak: number } {
  if (!taskList || taskList.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  let isCurrentStreakActive = true;
  const todayStr = format(fromDate, "yyyy-MM-dd");
  const maxDays = getSearchDaysBound(firstUsedAt, fromDate);

  for (let i = 0; i < maxDays; i++) {
    const currentDate = subDays(fromDate, i);
    const dateStr = format(currentDate, "yyyy-MM-dd");
    const dayOfWeek = currentDate.getDay();

    const scheduledTasks = taskList.filter((task) => {
      if (!task.isRoutine) return true;
      if (!task.daysOfWeek || task.daysOfWeek.length === 0) return true;
      return task.daysOfWeek.includes(dayOfWeek);
    });

    if (scheduledTasks.length === 0) {
      continue;
    }

    const completedTasksCount = scheduledTasks.filter((task) => {
      const logId = `${task.id}-${dateStr}`;
      return logs[logId]?.completed;
    }).length;

    const isFullyCompleted = completedTasksCount === scheduledTasks.length;

    if (isFullyCompleted) {
      tempStreak++;
      if (isCurrentStreakActive) {
        currentStreak++;
      }
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    } else {
      if (dateStr === todayStr) {
        // Today in progress
      } else {
        isCurrentStreakActive = false;
        tempStreak = 0;
      }
    }
  }

  return { currentStreak, bestStreak: Math.max(bestStreak, currentStreak) };
}

/**
 * Calculates streak for a specific category ID or category name.
 * If categoryKey is 'all' or empty, calculates overall streak.
 */
export function calculateCategoryStreak(
  categoryKey: string,
  allTasks: Task[],
  logs: Record<string, TaskLog>,
  fromDate: Date = new Date(),
  firstUsedAt?: number,
): { currentStreak: number; bestStreak: number } {
  if (!categoryKey || categoryKey === "all") {
    return calculateGroupStreak(allTasks, logs, fromDate, firstUsedAt);
  }

  const categoryTasks = allTasks.filter(
    (t) =>
      t.category === categoryKey ||
      t.category?.toLowerCase() === categoryKey.toLowerCase(),
  );

  return calculateGroupStreak(categoryTasks, logs, fromDate, firstUsedAt);
}
