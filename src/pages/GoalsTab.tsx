import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import GoalCard from '../components/goals/GoalCard';
import AddGoalModal from '../components/goals/AddGoalModal';
import { Plus, Target } from 'lucide-react';

const GoalsTab: React.FC = () => {
  const { goals } = useApp();
  const [modal, setModal] = useState(false);

  const active = goals.filter(g => {
    const dl = new Date(g.deadline);
    return dl >= new Date() || g.current < g.target;
  });
  const completed = goals.filter(g => g.current >= g.target);

  return (
    <div className="tab-content">
      <div className="section-header" style={{ marginBottom: 24 }}>
        <h2 className="section-title" style={{ fontSize: 20 }}>My Goals</h2>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <Plus size={16} /> New Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🎯</span>
          <p>No goals yet. Set your first goal and start tracking progress!</p>
          <button className="btn btn-primary" onClick={() => setModal(true)}>
            <Plus size={16} /> Add Your First Goal
          </button>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="section">
              <h3 className="subsection-title">
                <Target size={16} /> In Progress ({active.length})
              </h3>
              <div className="goals-grid">
                {active.map(g => <GoalCard key={g.id} goal={g} />)}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div className="section">
              <h3 className="subsection-title">✅ Completed ({completed.length})</h3>
              <div className="goals-grid">
                {completed.map(g => <GoalCard key={g.id} goal={g} />)}
              </div>
            </div>
          )}
        </>
      )}

      <AddGoalModal isOpen={modal} onClose={() => setModal(false)} />
    </div>
  );
};

export default GoalsTab;
