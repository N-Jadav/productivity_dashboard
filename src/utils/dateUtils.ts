import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, getDaysInMonth } from 'date-fns';

export const formatDate = (date: Date): string => format(date, 'yyyy-MM-dd');

export const getWeekDays = (date: Date): Date[] => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

export const getMonthDays = (date: Date): Date[] => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
};

export const getDaysInMonthCount = (date: Date): number => getDaysInMonth(date);

export const today = (): Date => new Date();

export const todayStr = (): string => formatDate(new Date());

export const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const monthName = (date: Date): string => format(date, 'MMMM yyyy');

export const shortDay = (date: Date): string => format(date, 'EEE');
export const dayNumber = (date: Date): string => format(date, 'd');
export const fullDate = (date: Date): string => format(date, 'MMMM d, yyyy');
