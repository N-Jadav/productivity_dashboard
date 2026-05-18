import React from 'react';
import { Habit } from '../../types';
import HabitRow from './HabitRow';
import { shortDay, dayNumber, formatDate } from '../../utils/dateUtils';

interface HabitGridProps {
  habits: Habit[];
  days: Date[];
  title?: string;
}

const HabitGrid: React.FC<HabitGridProps> = ({ habits, days, title }) => {
  const today = formatDate(new Date());

  return (
    <div className="habit-grid">
      {/* Header row */}
      <div className="habit-grid-header">
        <div className="habit-grid-header-label">{title || 'Habits'}</div>
        <div className="habit-days-header">
          {days.map(day => {
            const dateStr = formatDate(day);
            const isToday = dateStr === today;
            return (
              <div key={dateStr} className={`day-header-cell ${isToday ? 'today' : ''}`}>
                <span className="day-header-label">{shortDay(day)}</span>
                <span className="day-header-num">{dayNumber(day)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Habit rows */}
      {habits.length === 0 ? (
        <div className="habit-grid-empty">
          <p>No habits yet. Add your first habit! 🌱</p>
        </div>
      ) : (
        habits.map(habit => (
          <HabitRow key={habit.id} habit={habit} days={days} />
        ))
      )}
    </div>
  );
};

export default HabitGrid;
