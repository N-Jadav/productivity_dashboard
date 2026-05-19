import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Habit, Goal } from "../types";
import { v4 as uuidv4 } from "../utils/uuid";

const API = "/api";

interface AppContextValue {
  habits: Habit[];
  goals: Goal[];
  loading: boolean;
  error: string | null;
  addHabit: (
    habit: Omit<Habit, "id" | "createdAt" | "completions" | "activeWeeks">,
    weekStart: string,
  ) => Promise<void>;
  deleteHabit: (id: string, weekStart?: string) => Promise<void>;
  toggleHabitDay: (habitId: string, dateStr: string) => Promise<void>;
  updateHabitValue: (
    habitId: string,
    dateStr: string,
    value: number,
  ) => Promise<void>;
  copyWeekHabits: (habitIds: string[], weekStart: string) => Promise<number>;
  addGoal: (goal: Omit<Goal, "id" | "createdAt">) => Promise<void>;
  updateGoalProgress: (goalId: string, current: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial data load
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [habitsRes, goalsRes] = await Promise.all([
          fetch(`${API}/habits`),
          fetch(`${API}/goals`),
        ]);
        if (!habitsRes.ok || !goalsRes.ok)
          throw new Error("Server error loading data");
        const [habitsData, goalsData] = await Promise.all([
          habitsRes.json(),
          goalsRes.json(),
        ]);
        setHabits(habitsData);
        setGoals(goalsData);
        setError(null);
      } catch (e: any) {
        setError(e.message || "Could not connect to server. Is it running?");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const addHabit = useCallback(
    async (
      habitData: Omit<
        Habit,
        "id" | "createdAt" | "completions" | "activeWeeks"
      >,
      weekStart: string,
    ) => {
      const newHabit = {
        ...habitData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        weekStart,
      };
      const res = await fetch(`${API}/habits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHabit),
      });
      const created: Habit = await res.json();
      setHabits((prev) => [...prev, created]);
    },
    [],
  );

  const deleteHabit = useCallback(async (id: string, weekStart?: string) => {
    try {
      const url = weekStart
        ? `${API}/habits/${id}?weekStart=${weekStart}`
        : `${API}/habits/${id}`;
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete habit");

      setHabits((prev) => {
        if (weekStart) {
          // Scoped deletion: remove the week from activeWeeks and clear completions for that week
          return prev.map((h) => {
            if (h.id !== id) return h;

            // Generate the 7 days of the week to remove from h.completions
            const parts = weekStart.split("-");
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            const datesToRemove = new Set<string>();
            for (let i = 0; i < 7; i++) {
              const d = new Date(year, month, day + i);
              const y = d.getFullYear();
              const m = String(d.getMonth() + 1).padStart(2, "0");
              const dateNum = String(d.getDate()).padStart(2, "0");
              datesToRemove.add(`${y}-${m}-${dateNum}`);
            }

            const cleanCompletions = { ...h.completions };
            for (const dStr of datesToRemove) {
              delete cleanCompletions[dStr];
            }

            return {
              ...h,
              activeWeeks: h.activeWeeks.filter((ws) => ws !== weekStart),
              completions: cleanCompletions,
            };
          });
        }
        // Global deletion
        return prev.filter((h) => h.id !== id);
      });
    } catch (err) {
      console.error(err);
      // Basic error handling
    }
  }, []);

  const toggleHabitDay = useCallback(
    async (habitId: string, dateStr: string) => {
      // Optimistic update
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId
            ? {
                ...h,
                completions: {
                  ...h.completions,
                  [dateStr]: !h.completions[dateStr],
                },
              }
            : h,
        ),
      );
      try {
        await fetch(`${API}/habits/${habitId}/toggle/${dateStr}`, {
          method: "PUT",
        });
      } catch {
        // Revert on failure
        setHabits((prev) =>
          prev.map((h) =>
            h.id === habitId
              ? {
                  ...h,
                  completions: {
                    ...h.completions,
                    [dateStr]: !h.completions[dateStr],
                  },
                }
              : h,
          ),
        );
      }
    },
    [],
  );

  const updateHabitValue = useCallback(
    async (habitId: string, dateStr: string, value: number) => {
      // Optimistic update
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId
            ? { ...h, completions: { ...h.completions, [dateStr]: value } }
            : h,
        ),
      );
      try {
        const res = await fetch(`${API}/habits/${habitId}/value/${dateStr}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value }),
        });
        if (!res.ok) throw new Error();
      } catch {
        // Revert: on failure fetch all habits to ensure absolute sync
        const habitsRes = await fetch(`${API}/habits`);
        const habitsData = await habitsRes.json();
        setHabits(habitsData);
      }
    },
    [],
  );

  const copyWeekHabits = useCallback(
    async (habitIds: string[], weekStart: string): Promise<number> => {
      const res = await fetch(`${API}/habits/copy-week`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitIds, weekStart }),
      });
      const data = await res.json();
      // Reload habits to reflect new assignments
      const habitsRes = await fetch(`${API}/habits`);
      const habitsData = await habitsRes.json();
      setHabits(habitsData);
      return data.copied ?? 0;
    },
    [],
  );

  const addGoal = useCallback(
    async (goalData: Omit<Goal, "id" | "createdAt">) => {
      const newGoal = {
        ...goalData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      const res = await fetch(`${API}/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGoal),
      });
      const created: Goal = await res.json();
      setGoals((prev) => [...prev, created]);
    },
    [],
  );

  const updateGoalProgress = useCallback(
    async (goalId: string, current: number) => {
      // Optimistic update
      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, current } : g)),
      );
      await fetch(`${API}/goals/${goalId}/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current }),
      });
    },
    [],
  );

  const deleteGoal = useCallback(async (id: string) => {
    await fetch(`${API}/goals/${id}`, { method: "DELETE" });
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        habits,
        goals,
        loading,
        error,
        addHabit,
        deleteHabit,
        toggleHabitDay,
        updateHabitValue,
        copyWeekHabits,
        addGoal,
        updateGoalProgress,
        deleteGoal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
