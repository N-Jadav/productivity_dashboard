import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useApp } from '../../context/AppContext';

const EMOJI_OPTIONS = ['🏃', '📖', '💰', '🎯', '✈️', '🏠', '💻', '🎨', '🏆', '🌟', '💪', '🧪'];
const COLOR_OPTIONS = ['#10b981', '#6366f1', '#f59e0b', '#06b6d4', '#ec4899', '#ef4444', '#8b5cf6', '#f97316'];

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose }) => {
  const { addGoal } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('10');
  const [current, setCurrent] = useState('0');
  const [unit, setUnit] = useState('');
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [emoji, setEmoji] = useState('🎯');
  const [color, setColor] = useState('#10b981');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addGoal({
      title: title.trim(),
      description: description.trim(),
      target: parseFloat(target) || 10,
      current: parseFloat(current) || 0,
      unit: unit.trim() || 'units',
      deadline: new Date(deadline).toISOString(),
      color,
      emoji,
    });
    onClose();
    setTitle(''); setDescription(''); setTarget('10'); setCurrent('0'); setUnit(''); setEmoji('🎯'); setColor('#10b981');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Goal">
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="form-label">Goal Title</label>
          <input className="form-input" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Run 50km" autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Description (optional)</label>
          <input className="form-input" type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Target</label>
            <input className="form-input" type="number" min="1" value={target} onChange={e => setTarget(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Current</label>
            <input className="form-input" type="number" min="0" value={current} onChange={e => setCurrent(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Unit</label>
            <input className="form-input" type="text" value={unit} onChange={e => setUnit(e.target.value)} placeholder="km, books..." />
          </div>
        </div>
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="form-label" style={{ margin: 0 }}>Deadline</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                className="btn-link" 
                style={{ fontSize: '0.8rem', padding: 0 }}
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 7);
                  setDeadline(d.toISOString().split('T')[0]);
                }}
              >
                +1 Week
              </button>
              <button 
                type="button" 
                className="btn-link" 
                style={{ fontSize: '0.8rem', padding: 0 }}
                onClick={() => {
                  const d = new Date();
                  d.setMonth(d.getMonth() + 1);
                  setDeadline(d.toISOString().split('T')[0]);
                }}
              >
                +1 Month
              </button>
            </div>
          </div>
          <input className="form-input" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Emoji</label>
          <div className="emoji-grid">
            {EMOJI_OPTIONS.map(e => (
              <button key={e} type="button" className={`emoji-btn ${emoji === e ? 'active' : ''}`} onClick={() => setEmoji(e)}>{e}</button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Color</label>
          <div className="color-grid">
            {COLOR_OPTIONS.map(c => (
              <button key={c} type="button" className={`color-swatch ${color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => setColor(c)} />
            ))}
          </div>
        </div>
        <div className="form-row">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={!title.trim()}>Add Goal</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddGoalModal;
