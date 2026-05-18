import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getWeekDays, formatDate } from '../utils/dateUtils';
import { getWeeklyCompletion } from '../utils/statsUtils';
import WeekRings from '../components/dashboard/WeekRings';
import HabitGrid from '../components/habits/HabitGrid';
import AddHabitModal from '../components/habits/AddHabitModal';
import CopyHabitsModal from '../components/habits/CopyHabitsModal';
import { ChevronLeft, ChevronRight, Plus, Copy } from 'lucide-react';
import { format, addWeeks, subWeeks, isSameWeek } from 'date-fns';

const WeeklyTab: React.FC = () => {
  const { habits } = useApp();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [habitModal, setHabitModal] = useState(false);
  const [copyModal, setCopyModal] = useState(false);

  const weekDays = getWeekDays(currentWeek);
  const currentWeekStart = formatDate(weekDays[0]);
  const weeklyHabits = habits.filter(h => h.activeWeeks?.includes(currentWeekStart));
  const { pct, completed, total } = getWeeklyCompletion(weeklyHabits, currentWeek);
  const isCurrentWeek = isSameWeek(currentWeek, new Date(), { weekStartsOn: 1 });

  const prevWeek = () => setCurrentWeek(w => subWeeks(w, 1));
  const nextWeek = () => setCurrentWeek(w => addWeeks(w, 1));
  const goToday = () => setCurrentWeek(new Date());

  const weekLabel = isCurrentWeek
    ? 'This Week'
    : `${format(weekDays[0], 'MMM d')} – ${format(weekDays[6], 'MMM d, yyyy')}`;

  const lastWeekStart = formatDate(getWeekDays(subWeeks(currentWeek, 1))[0]);
  const lastWeekHabits = habits.filter(h => h.activeWeeks?.includes(lastWeekStart));

  return (
    <div className="tab-content">
      {/* Toast removed since we use Modal now */}

      {/* Week Navigator */}
      <div className="week-nav">
        <button className="nav-arrow" onClick={prevWeek}><ChevronLeft size={20} /></button>
        <div className="week-nav-center">
          <span className="week-nav-label">{weekLabel}</span>
          {!isCurrentWeek && (
            <button className="btn-link" onClick={goToday}>↩ This Week</button>
          )}
        </div>
        <button className="nav-arrow" onClick={nextWeek} disabled={isCurrentWeek}><ChevronRight size={20} /></button>
      </div>

      {/* Week Summary Banner */}
      <div className="week-summary-card">
        <div className="week-summary-left">
          <span className="week-summary-pct" style={{ color: pct >= 80 ? '#10b981' : pct >= 50 ? '#0bbbf5ff' : '#447aefff' }}>
            {pct}%
          </span>
          <div className="week-summary-text">
            <span className="week-summary-label">Weekly Completion</span>
            <span className="week-summary-count">{completed} of {total} habits done</span>
          </div>
        </div>
        <div className="week-summary-bar-outer">
          <div className="week-summary-bar-inner" style={{
            width: `${pct}%`,
            background: pct >= 80 ? '#10b981' : pct >= 50 ? '#0bbbf5ff' : '#447aefff'
          }} />
        </div>
      </div>

      {/* Day Rings */}
      <div className="section">
        <h2 className="section-title">Daily Progress</h2>
        <WeekRings days={weekDays} />
      </div>

      {/* Habit Grid with Copy + Add buttons */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Habit Tracker</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {lastWeekHabits.length > 0 && (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setCopyModal(true)}
                title="Select habits from last week to continue this week"
              >
                <Copy size={14} />
                Copy Last Week
              </button>
            )}
            <button className="btn btn-primary btn-sm" onClick={() => setHabitModal(true)}>
              <Plus size={15} /> Add Habit
            </button>
          </div>
        </div>
        <HabitGrid habits={weeklyHabits} days={weekDays} />
      </div>

      <AddHabitModal isOpen={habitModal} onClose={() => setHabitModal(false)} weekStart={currentWeekStart} />
      <CopyHabitsModal
        isOpen={copyModal}
        onClose={() => setCopyModal(false)}
        targetWeekStart={currentWeekStart}
        lastWeekHabits={lastWeekHabits}
      />
    </div>
  );
};

export default WeeklyTab;
