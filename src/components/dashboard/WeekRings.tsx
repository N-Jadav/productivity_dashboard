import React from 'react';
import { useApp } from '../../context/AppContext';
import CircularProgress from '../ui/CircularProgress';
import { getDayCompletion } from '../../utils/statsUtils';
import { formatDate, shortDay, dayNumber } from '../../utils/dateUtils';

interface WeekRingsProps {
  days: Date[];
}

const WeekRings: React.FC<WeekRingsProps> = ({ days }) => {
  const { habits } = useApp();
  const today = formatDate(new Date());

  return (
    <div className="week-rings">
      {days.map(day => {
        const dateStr = formatDate(day);
        const { pct, completed, total } = getDayCompletion(habits, dateStr);
        const isToday = dateStr === today;
        const isFuture = dateStr > today;

        // Pick color based on completion %
        const ringColor = isFuture ? 'rgba(255,255,255,0.15)' :
          pct >= 80 ? '#10b981' :
          pct >= 50 ? '#f59e0b' :
          pct > 0 ? '#ef4444' : 'rgba(255,255,255,0.2)';

        return (
          <div key={dateStr} className={`day-ring-card ${isToday ? 'today' : ''} ${isFuture ? 'future' : ''}`}>
            <div className="day-ring-label">
              <span className="day-ring-dow">{shortDay(day)}</span>
              <span className="day-ring-date">{dayNumber(day)}</span>
            </div>
            <CircularProgress
              value={isFuture ? 0 : pct}
              size={80}
              strokeWidth={7}
              color={ringColor}
              label={isFuture ? '—' : `${pct}%`}
            />
            <div className="day-ring-stats">
              {isFuture ? (
                <span className="day-ring-future">Upcoming</span>
              ) : (
                <span className="day-ring-count">{completed}/{total}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeekRings;
