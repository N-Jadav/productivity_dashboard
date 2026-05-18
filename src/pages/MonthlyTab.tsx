import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getMonthDays, monthName, formatDate } from '../utils/dateUtils';
import { getMonthlyCompletion, getDayCompletion, getMonthlyChartData, isHabitCompletedForDay, isHabitActiveOnDay } from '../utils/statsUtils';
import ProgressChart from '../components/reports/ProgressChart';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { addMonths, subMonths, isSameMonth, startOfWeek, startOfMonth } from 'date-fns';

const MonthlyTab: React.FC = () => {
  const { habits } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const days = getMonthDays(currentMonth);
  
  // A month spans multiple weeks. Find all week starts that cover this month.
  const monthWeeks = new Set(days.map(d => {
    return formatDate(startOfWeek(d, { weekStartsOn: 1 }));
  }));
  const monthHabits = habits.filter(h => h.activeWeeks?.some(ws => monthWeeks.has(ws)));

  const { pct, completed, total } = getMonthlyCompletion(monthHabits, currentMonth);
  const chartData = getMonthlyChartData(monthHabits, currentMonth);
  const isCurrentMonth = isSameMonth(currentMonth, new Date());
  const today = formatDate(new Date());
  
  const earliestDate = habits.length > 0 
    ? new Date(Math.min(...habits.map(h => new Date(h.createdAt).getTime())))
    : new Date();
  const isEarliestMonth = startOfMonth(currentMonth) <= startOfMonth(earliestDate);

  const prevMonth = () => setCurrentMonth(m => subMonths(m, 1));
  const nextMonth = () => setCurrentMonth(m => addMonths(m, 1));

  return (
    <div className="tab-content">
      {/* Month Navigator */}
      <div className="week-nav">
        <button className="nav-arrow" onClick={prevMonth} disabled={isEarliestMonth}><ChevronLeft size={20} /></button>
        <div className="week-nav-center">
          <span className="week-nav-label">{monthName(currentMonth)}</span>
          {!isCurrentMonth && (
            <button className="btn-link" onClick={() => setCurrentMonth(new Date())}>↩ This Month</button>
          )}
        </div>
        <button className="nav-arrow" onClick={nextMonth} disabled={isCurrentMonth}><ChevronRight size={20} /></button>
      </div>

      {/* Summary row */}
      <div className="monthly-summary-row">
        <div className="monthly-stat-chip">
          <span className="chip-label">Total Habits</span>
          <span className="chip-value">{monthHabits.length}</span>
        </div>
        <div className="monthly-stat-chip">
          <span className="chip-label">Completed</span>
          <span className="chip-value" style={{ color: '#10b981' }}>{completed}</span>
        </div>
        <div className="monthly-stat-chip">
          <span className="chip-label">Total Possible</span>
          <span className="chip-value">{total}</span>
        </div>
        <div className="monthly-stat-chip">
          <span className="chip-label">Progress</span>
          <span className="chip-value" style={{ color: pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444' }}>
            {pct}%
          </span>
        </div>
      </div>

      {/* Monthly Habit Grid */}
      {monthHabits.length > 0 ? (
        <div className="section">
          <h2 className="section-title">Monthly Habit Grid</h2>
          <div className="monthly-grid-wrapper">
            <div className="monthly-grid-scroll">
              {/* Header: day numbers */}
              <div className="monthly-grid">
                <div className="monthly-habit-col-header">My Habits</div>
                <div className="monthly-days-header">
                  {days.map(d => {
                    const ds = formatDate(d);
                    const isT = ds === today;
                    return (
                      <div key={ds} className={`monthly-day-header ${isT ? 'today' : ''}`}>
                        {d.getDate()}
                      </div>
                    );
                  })}
                  <div className="monthly-day-header pct-col">%</div>
                </div>
              </div>

              {/* Habit rows */}
              {monthHabits.map(habit => {
                const { pct: hPct } = getMonthlyCompletion([habit], currentMonth);
                return (
                  <div key={habit.id} className="monthly-grid">
                    <div className="monthly-habit-name">
                      <span>{habit.emoji}</span>
                      <span className="monthly-habit-label">{habit.name}</span>
                    </div>
                    <div className="monthly-days-row">
                      {days.map(d => {
                        const ds = formatDate(d);
                        const active = isHabitActiveOnDay(habit, d);
                        const done = active && isHabitCompletedForDay(habit, ds);
                        const isT = ds === today;
                        const isFuture = ds > today;
                        const val = habit.completions[ds];
                        const tooltip = !active
                          ? 'Not active this week'
                          : habit.type === 'number'
                            ? `${val !== undefined ? val : 0} / ${habit.targetValue} ${habit.unit}`
                            : done ? 'Completed' : 'Not completed';

                        return (
                          <div
                            key={ds}
                            className={`monthly-cell ${done ? 'done' : ''} ${isT ? 'today' : ''} ${isFuture || !active ? 'future' : ''}`}
                            style={done ? { background: habit.color + '33', borderColor: habit.color } : !active ? { opacity: 0.15, cursor: 'not-allowed', background: 'rgba(255,255,255,0.02)' } : {}}
                            title={tooltip}
                          >
                            {done && <Check size={10} strokeWidth={3} style={{ color: habit.color }} />}
                            {!active && <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>-</span>}
                          </div>
                        );
                      })}
                      <div className="monthly-cell pct-cell" style={{ color: habit.color }}>
                        {hPct}%
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Daily % row */}
              <div className="monthly-grid">
                <div className="monthly-habit-name" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Daily %</div>
                <div className="monthly-days-row">
                  {days.map(d => {
                    const ds = formatDate(d);
                    const { pct: dp } = getDayCompletion(monthHabits, ds);
                    const isFuture = ds > today;
                    return (
                      <div key={ds} className="monthly-cell pct-row-cell">
                        {!isFuture && dp > 0 ? `${dp}%` : ''}
                      </div>
                    );
                  })}
                  <div className="monthly-cell pct-cell">{pct}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">📊</span>
          <p>Add habits to see your monthly grid</p>
        </div>
      )}

      {/* Area Chart */}
      {monthHabits.length > 0 && (
        <div className="section">
          <h2 className="section-title">Daily Completion Trend</h2>
          <div className="card">
            <ProgressChart data={chartData} color="#10b981" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyTab;
