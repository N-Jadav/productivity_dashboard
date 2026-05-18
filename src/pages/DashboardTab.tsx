import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getDayCompletion, getWeeklyCompletion, getHabitStreak } from '../utils/statsUtils';
import { formatDate, getWeekDays, todayStr } from '../utils/dateUtils';
import CircularProgress from '../components/ui/CircularProgress';
import HabitGrid from '../components/habits/HabitGrid';
import GoalCard from '../components/goals/GoalCard';
import AddGoalModal from '../components/goals/AddGoalModal';
import { Plus, Flame, CheckCircle2, TrendingUp } from 'lucide-react';

const DashboardTab: React.FC = () => {
  const { habits, goals } = useApp();
  const [goalModal, setGoalModal] = useState(false);

  const today = new Date();
  const weekDays = getWeekDays(today);
  const currentWeekStart = formatDate(weekDays[0]);
  const weeklyHabits = habits.filter(h => h.activeWeeks?.includes(currentWeekStart));

  const todayCompletion = getDayCompletion(weeklyHabits, todayStr());
  const weekCompletion = getWeeklyCompletion(weeklyHabits, today);

  // Longest streak across all habits
  const maxStreak = weeklyHabits.reduce((max, h) => {
    return Math.max(max, getHabitStreak(h));
  }, 0);

  return (
    <div className="tab-content">
      {/* Stat cards */}
      <div className="stats-row">
        <div className="stat-card primary">
          <div className="stat-card-inner">
            <div className="stat-icon-wrap" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <CheckCircle2 size={22} color="#10b981" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{todayCompletion.completed}<span className="stat-total">/{todayCompletion.total}</span></span>
              <span className="stat-label">Today's Habits</span>
            </div>
          </div>
          <CircularProgress value={todayCompletion.pct} size={60} strokeWidth={6} color="#10b981" label={`${todayCompletion.pct}%`} />
        </div>

        <div className="stat-card">
          <div className="stat-card-inner">
            <div className="stat-icon-wrap" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <TrendingUp size={22} color="#6366f1" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{weekCompletion.pct}<span className="stat-unit">%</span></span>
              <span className="stat-label">This Week</span>
            </div>
          </div>
          <CircularProgress value={weekCompletion.pct} size={60} strokeWidth={6} color="#6366f1" label={`${weekCompletion.pct}%`} />
        </div>

        <div className="stat-card">
          <div className="stat-card-inner">
            <div className="stat-icon-wrap" style={{ background: 'rgba(245,158,11,0.15)' }}>
              <Flame size={22} color="#f59e0b" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{maxStreak}<span className="stat-unit"> days</span></span>
              <span className="stat-label">Best Streak 🔥</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-inner">
            <div className="stat-icon-wrap" style={{ background: 'rgba(6,182,212,0.15)' }}>
              <span style={{ fontSize: 22 }}>🎯</span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{goals.length}</span>
              <span className="stat-label">Active Goals</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Habit Grid */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">This Week's Habits</h2>
        </div>
        <HabitGrid habits={weeklyHabits} days={weekDays} />
      </div>

      {/* Goals */}
      {goals.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Active Goals</h2>
          </div>
          <div className="goals-grid">
            {goals.map(g => <GoalCard key={g.id} goal={g} />)}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Goals</h2>
          </div>
          <div className="empty-state">
            <span className="empty-icon">🎯</span>
            <p>No goals yet. Add your first goal!</p>
            <button className="btn btn-primary" onClick={() => setGoalModal(true)}>
              <Plus size={15} /> Add Goal
            </button>
          </div>
        </div>
      )}

      <AddGoalModal isOpen={goalModal} onClose={() => setGoalModal(false)} />
    </div>
  );
};

export default DashboardTab;
