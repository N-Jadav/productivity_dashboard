import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { useApp } from '../../context/AppContext';
import { Habit } from '../../types';

interface CopyHabitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetWeekStart: string;
  lastWeekHabits: Habit[];
}

const CopyHabitsModal: React.FC<CopyHabitsModalProps> = ({ isOpen, onClose, targetWeekStart, lastWeekHabits }) => {
  const { copyWeekHabits } = useApp();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set());
    }
  }, [isOpen, lastWeekHabits]);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.size === 0) return;
    setIsSubmitting(true);
    await copyWeekHabits(Array.from(selectedIds), targetWeekStart);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Habits to Copy">
      <form onSubmit={handleSubmit} className="form">
        <p style={{ marginBottom: 16, fontSize: '0.9rem', color: '#a1a1aa' }}>
          Select the habits from last week you'd like to continue tracking this week.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {lastWeekHabits.length === 0 && (
            <p style={{ fontStyle: 'italic', color: '#52525b' }}>No habits found from last week.</p>
          )}
          {lastWeekHabits.map(habit => (
            <label key={habit.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedIds.has(habit.id)}
                onChange={() => toggleSelection(habit.id)}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <span style={{ fontSize: '1.2rem' }}>{habit.emoji}</span>
              <span style={{ flex: 1 }}>{habit.name}</span>
            </label>
          ))}
        </div>

        <div className="form-row">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={selectedIds.size === 0 || isSubmitting}
          >
            {isSubmitting ? 'Copying...' : `Copy ${selectedIds.size} Habits`}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CopyHabitsModal;
