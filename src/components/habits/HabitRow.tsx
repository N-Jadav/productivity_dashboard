import React from 'react';
import { Trash2, Check } from 'lucide-react';
import { Habit } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { useApp } from '../../context/AppContext';
import { isHabitCompletedForDay } from '../../utils/statsUtils';

interface HabitRowProps {
  habit: Habit;
  days: Date[];
  showDelete?: boolean;
}

const HabitRow: React.FC<HabitRowProps> = ({ habit, days, showDelete = true }) => {
  const { toggleHabitDay, updateHabitValue, deleteHabit } = useApp();
  const today = formatDate(new Date());

  return (
    <div className="habit-row">
      <div className="habit-row-info">
        <span className="habit-emoji" style={{ color: habit.color }}>{habit.emoji}</span>
        <div className="habit-name-col" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <span className="habit-name">{habit.name}</span>
          {habit.type === 'number' && (
            <span className="habit-target-label" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              Goal: {habit.targetValue} {habit.unit}
            </span>
          )}
        </div>
        {showDelete && (
          <button
            className="habit-delete-btn"
            onClick={() => deleteHabit(habit.id, formatDate(days[0]))}
            aria-label={`Delete ${habit.name}`}
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
      <div className="habit-days">
        {days.map(day => {
          const dateStr = formatDate(day);
          const completed = isHabitCompletedForDay(habit, dateStr);
          const isToday = dateStr === today;
          const isFuture = dateStr > today;

          return (
            <div key={dateStr} className="habit-check-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              {habit.type === 'number' ? (
                // Numeric habits: editable input for past + today, greyed placeholder for future
                isFuture ? (
                  <div
                    className="habit-numeric-display future"
                    style={{ opacity: 0.25 }}
                    title="Future date"
                  >
                    –
                  </div>
                ) : (
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className={`habit-numeric-input ${completed ? 'completed' : ''} ${isToday ? 'today' : ''}`}
                    style={completed ? { background: habit.color, borderColor: habit.color, color: '#fff' } : {}}
                    value={habit.completions[dateStr] !== undefined ? (habit.completions[dateStr] as number) : ''}
                    placeholder="0"
                    title={`${habit.name}: enter actual ${habit.unit || 'value'} (target: ${habit.targetValue} ${habit.unit || ''})`}
                    onChange={e => {
                      const v = e.target.value === '' ? 0 : Number(e.target.value);
                      updateHabitValue(habit.id, dateStr, v);
                    }}
                    aria-label={`${habit.name} on ${dateStr}`}
                  />
                )
              ) : (
                // Boolean habits: checkbox, only interactive for today
                <button
                  className={`habit-check ${completed ? 'completed' : ''} ${isToday ? 'today' : ''} ${!isToday ? 'future' : ''}`}
                  style={completed ? { background: habit.color, borderColor: habit.color } : {}}
                  onClick={() => toggleHabitDay(habit.id, dateStr)}
                  aria-label={`${habit.name} on ${dateStr}: ${completed ? 'done' : 'not done'}`}
                  disabled={!isToday}
                >
                  {completed && <Check size={11} strokeWidth={3} />}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HabitRow;
