import { Habit, Goal } from "../types";
import { formatDate, getWeekDays, getMonthDays } from "./dateUtils";
import { startOfWeek } from "date-fns";

const getWeekStartForDate = (d: Date | string): string => {
  // Use date-fns startOfWeek (Monday=1) to match how activeWeeks entries are stored
  const date = typeof d === "string" ? new Date(`${d}T00:00:00`) : d;
  return formatDate(startOfWeek(date, { weekStartsOn: 1 }));
};

export const isHabitActiveOnDay = (habit: Habit, d: Date | string): boolean => {
  if (!habit.activeWeeks) return true;
  return habit.activeWeeks.includes(getWeekStartForDate(d));
};

export const isHabitCompletedForDay = (
  habit: Habit,
  dateStr: string,
): boolean => {
  const value = habit.completions[dateStr];
  if (value === undefined || value === null) return false;
  if (habit.type === "number") {
    const target = habit.targetValue || 0;
    const comparison = habit.comparison || "lte";
    const numValue = value as number;

    if (comparison === "lte") {
      return numValue <= target;
    } else if (comparison === "gte") {
      return numValue >= target;
    } else if (comparison === "eq") {
      return numValue === target;
    }
    return false;
  }
  return value === true;
};

export const getHabitCompletionForDay = (
  habit: Habit,
  dateStr: string,
): boolean => {
  return isHabitCompletedForDay(habit, dateStr);
};

export const getHabitPartialScore = (habit: Habit, dateStr: string): number => {
  const value = habit.completions[dateStr];
  if (value === undefined || value === null) return 0;
  if (habit.type === "number") {
    const target = habit.targetValue || 1;
    const comparison = habit.comparison || "lte";
    const numValue = value as number;

    if (comparison === "lte") {
      // For limit: score is inversely proportional to how much over the limit
      // If value <= target, score = 1. Otherwise score decreases.
      return numValue <= target
        ? 1
        : Math.max(0, 1 - (numValue - target) / target);
    } else if (comparison === "gte") {
      // For goal: score is proportional to progress
      return Math.min(1, numValue / target);
    } else if (comparison === "eq") {
      // For exact: score is 1 if exact, 0 otherwise
      return numValue === target ? 1 : 0;
    }
    return 0;
  }
  return value === true ? 1 : 0;
};

export const getWeeklyCompletion = (
  habits: Habit[],
  date: Date,
): { completed: number; total: number; pct: number } => {
  const days = getWeekDays(date);
  // habits passed here are already filtered by the caller for this week, but let's be safe
  let total = 0;
  let completed = 0;
  let partialScore = 0;
  for (const day of days) {
    const ds = formatDate(day);
    for (const habit of habits) {
      if (isHabitActiveOnDay(habit, day)) {
        total++;
        if (isHabitCompletedForDay(habit, ds)) completed++;
        partialScore += getHabitPartialScore(habit, ds);
      }
    }
  }
  const pct = total === 0 ? 0 : Math.round((partialScore / total) * 100);
  return { completed, total, pct };
};

export const getDayCompletion = (
  habits: Habit[],
  dateStr: string,
): { completed: number; total: number; pct: number } => {
  let total = 0;
  let completed = 0;
  let partialScore = 0;
  for (const habit of habits) {
    if (isHabitActiveOnDay(habit, dateStr)) {
      total++;
      if (isHabitCompletedForDay(habit, dateStr)) completed++;
      partialScore += getHabitPartialScore(habit, dateStr);
    }
  }
  const pct = total === 0 ? 0 : Math.round((partialScore / total) * 100);
  return { completed, total, pct };
};

export const getMonthlyCompletion = (
  habits: Habit[],
  date: Date,
): { completed: number; total: number; pct: number } => {
  const days = getMonthDays(date);
  let total = 0;
  let completed = 0;
  let partialScore = 0;
  for (const day of days) {
    const ds = formatDate(day);
    for (const habit of habits) {
      if (isHabitActiveOnDay(habit, day)) {
        total++;
        if (isHabitCompletedForDay(habit, ds)) completed++;
        partialScore += getHabitPartialScore(habit, ds);
      }
    }
  }
  const pct = total === 0 ? 0 : Math.round((partialScore / total) * 100);
  return { completed, total, pct };
};

export const getMonthlyChartData = (habits: Habit[], date: Date) => {
  const days = getMonthDays(date);
  return days.map((day) => {
    const dateStr = formatDate(day);
    const { pct } = getDayCompletion(habits, dateStr);
    return { date: day.getDate(), pct };
  });
};

export const getHabitStreak = (habit: Habit): number => {
  let streak = 0;
  const today = new Date();
  let current = new Date(today);
  while (true) {
    const dateStr = formatDate(current);
    if (isHabitCompletedForDay(habit, dateStr)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

export const getGoalProgress = (goal: Goal): number => {
  return goal.target === 0
    ? 0
    : Math.min(100, Math.round((goal.current / goal.target) * 100));
};

export const getDaysLeft = (deadline: string): number => {
  const today = new Date();
  const dl = new Date(deadline);
  const diff = dl.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};
