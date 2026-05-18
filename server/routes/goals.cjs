const express = require('express');
const router = express.Router();
const db = require('../db.cjs');

function buildGoal(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    target: row.target,
    current: row.current,
    unit: row.unit,
    deadline: row.deadline,
    color: row.color,
    emoji: row.emoji,
    createdAt: row.created_at,
  };
}

// GET /api/goals
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM goals ORDER BY created_at ASC').all();
  res.json(rows.map(buildGoal));
});

// POST /api/goals
router.post('/', (req, res) => {
  const { id, title, description, target, current, unit, deadline, color, emoji, createdAt } = req.body;
  if (!id || !title) return res.status(400).json({ error: 'id and title required' });
  db.prepare(
    'INSERT INTO goals (id, title, description, target, current, unit, deadline, color, emoji, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(id, title, description || '', target || 10, current || 0, unit || 'units', deadline, color || '#10b981', emoji || '🎯', createdAt || new Date().toISOString());
  const row = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
  res.status(201).json(buildGoal(row));
});

// PUT /api/goals/:id/progress
router.put('/:id/progress', (req, res) => {
  const { current } = req.body;
  if (current === undefined) return res.status(400).json({ error: 'current required' });
  db.prepare('UPDATE goals SET current = ? WHERE id = ?').run(current, req.params.id);
  const row = db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(buildGoal(row));
});

// DELETE /api/goals/:id
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM goals WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
