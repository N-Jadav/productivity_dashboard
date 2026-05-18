import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getMonthlyCompletion, getMonthlyChartData } from '../utils/statsUtils';
import ProgressChart from '../components/reports/ProgressChart';
import ProgressBar from '../components/ui/ProgressBar';
import { subMonths, format, differenceInMonths, startOfMonth } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MonthReport {
  date: Date;
  label: string;
}

const ReportsTab: React.FC = () => {
  const { habits } = useApp();
  
  // Only include habits that have activeWeeks
  const activeHabits = habits.filter(h => h.activeWeeks && h.activeWeeks.length > 0);
  const [expanded, setExpanded] = useState<string | null>(null);

  const earliestDate = habits.length > 0 
    ? new Date(Math.min(...habits.map(h => new Date(h.createdAt).getTime())))
    : new Date();
    
  const pastMonthsCount = differenceInMonths(
    startOfMonth(new Date()),
    startOfMonth(earliestDate)
  );

  const safeCount = Math.max(0, pastMonthsCount);

  // Build list of past months (excluding current) down to the earliest date
  const months: MonthReport[] = Array.from({ length: safeCount }, (_, i) => {
    const d = subMonths(new Date(), i + 1);
    return { date: d, label: format(d, 'MMMM yyyy') };
  });

  return (
    <div className="tab-content">
      <div style={{ marginBottom: 24 }}>
        <h2 className="section-title" style={{ fontSize: 20 }}>Past Reports</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 4 }}>
          Review your habit completion history month by month.
        </p>
      </div>

      {activeHabits.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <p>Add habits on the Dashboard to start tracking history.</p>
        </div>
      ) : months.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">⏳</span>
          <p>Check back next month! Your past reports will appear here once you've used the app for more than a month.</p>
        </div>
      ) : (
        <div className="reports-list">
          {months.map(({ date, label }) => {
            // Or maybe just pass all active habits and let completions decide. Let's use activeHabits
            const { pct, completed, total } = getMonthlyCompletion(activeHabits, date);
            const chartData = getMonthlyChartData(activeHabits, date);
            const key = label;
            const isOpen = expanded === key;

            return (
              <div key={key} className={`report-card ${isOpen ? 'open' : ''}`}>
                <button
                  className="report-card-header"
                  onClick={() => setExpanded(isOpen ? null : key)}
                >
                  <div className="report-card-left">
                    <span className="report-month-label">{label}</span>
                    <div className="report-bar-wrap">
                      <ProgressBar value={pct} color={pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444'} height={5} />
                    </div>
                  </div>
                  <div className="report-card-right">
                    <span className="report-pct" style={{ color: pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444' }}>
                      {pct}%
                    </span>
                    <span className="report-count">{completed}/{total}</span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="report-card-body">
                    {total === 0 ? (
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '12px 0' }}>
                        No habits were active or tracked during this month.
                      </p>
                    ) : (
                      <>
                        <div className="report-habit-list">
                          {activeHabits.map(habit => {
                            const { pct: hPct, total: hTotal } = getMonthlyCompletion([habit], date);
                            if (hTotal === 0) return null;
                            return (
                              <div key={habit.id} className="report-habit-row">
                                <span>{habit.emoji} {habit.name}</span>
                                <div style={{ flex: 1, margin: '0 12px' }}>
                                  <ProgressBar value={hPct} color={habit.color} height={5} />
                                </div>
                                <span style={{ fontSize: 13, color: habit.color, minWidth: 36, textAlign: 'right' }}>{hPct}%</span>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ marginTop: 16 }}>
                          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Daily Trend</p>
                          <ProgressChart data={chartData} color="#10b981" />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReportsTab;
