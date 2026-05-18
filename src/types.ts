export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: string; // ISO date string
  activeWeeks: string[]; // Week start dates
  completions: Record<string, boolean | number>; // key = "YYYY-MM-DD"
  type: 'boolean' | 'number';
  targetValue?: number;
  unit?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: string; // ISO date string
  color: string;
  emoji: string;
  createdAt: string;
}

export type TabId = 'dashboard' | 'weekly' | 'monthly' | 'goals' | 'reports';

export interface AppState {
  habits: Habit[];
  goals: Goal[];
}
