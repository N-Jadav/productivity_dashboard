import React, { useState } from 'react';
import { Goal } from '../../types';
import { useApp } from '../../context/AppContext';
import ProgressBar from '../ui/ProgressBar';
import { getGoalProgress, getDaysLeft } from '../../utils/statsUtils';
import { Trash2, Edit3, Check, X } from 'lucide-react';
import { format } from 'date-fns';

interface GoalCardProps {
  goal: Goal;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal }) => {
  const { updateGoalProgress, deleteGoal } = useApp();
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(String(goal.current));

  const pct = getGoalProgress(goal);
  const daysLeft = getDaysLeft(goal.deadline);

  const handleSave = () => {
    const val = parseFloat(inputVal);
    if (!isNaN(val) && val >= 0) {
      updateGoalProgress(goal.id, Math.min(val, goal.target));
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') { setInputVal(String(goal.current)); setEditing(false); }
  };

  return (
    <div className="goal-card" style={{ '--goal-color': goal.color } as React.CSSProperties}>
      <div className="goal-card-header">
        <div className="goal-card-title-row">
          <span className="goal-emoji">{goal.emoji}</span>
          <div className="goal-card-titles">
            <h3 className="goal-title">{goal.title}</h3>
            {goal.description && <p className="goal-desc">{goal.description}</p>}
          </div>
        </div>
        <div className="goal-card-actions">
          <button className="icon-btn" onClick={() => { setEditing(true); setInputVal(String(goal.current)); }} title="Edit progress">
            <Edit3 size={14} />
          </button>
          <button className="icon-btn danger" onClick={() => deleteGoal(goal.id)} title="Delete goal">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="goal-progress-row">
        {editing ? (
          <div className="goal-edit-row">
            <input
              className="form-input goal-edit-input"
              type="number"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <button className="icon-btn success" onClick={handleSave}><Check size={14} /></button>
            <button className="icon-btn" onClick={() => { setInputVal(String(goal.current)); setEditing(false); }}><X size={14} /></button>
          </div>
        ) : (
          <div className="goal-numbers">
            <span className="goal-current" style={{ color: goal.color }}>{goal.current}</span>
            <span className="goal-separator"> / </span>
            <span className="goal-target">{goal.target} {goal.unit}</span>
          </div>
        )}
        <span className="goal-pct" style={{ color: goal.color }}>{pct}%</span>
      </div>

      <ProgressBar value={pct} color={goal.color} height={6} />

      <div className="goal-footer">
        <span className="goal-deadline">📅 Due {format(new Date(goal.deadline), 'MMM d, yyyy')}</span>
        <span className={`goal-days-left ${daysLeft <= 7 ? 'urgent' : ''}`}>
          {daysLeft === 0 ? '⏰ Due today!' : `${daysLeft}d left`}
        </span>
      </div>
    </div>
  );
};

export default GoalCard;
