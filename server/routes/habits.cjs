const express = require('express');
const router = express.Router();
const db = require('../db.cjs');

function buildHabit(row) {
  const completionRows = db
    .prepare('SELECT date, value FROM habit_completions WHERE habit_id = ?')
    .all(row.id);
  const completions = {};
  completionRows.forEach(c => {
    completions[c.date] = row.type === 'number' ? c.value : c.value === 1;
  });
  
  const weekRows = db
    .prepare('SELECT week_start FROM weekly_habits WHERE habit_id = ?')
    .all(row.id);
  const activeWeeks = weekRows.map(w => w.week_start);

  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    color: row.color,
    createdAt: row.created_at,
    type: row.type || 'boolean',
    targetValue: row.target_value || 0,
    unit: row.unit || '',
    completions,
    activeWeeks,
  };
}

// GET /api/habits — list all with completions
router.get('/', (req, res) => {
  const { weekStart } = req.query;
  let rows;
  if (weekStart) {
    rows = db.prepare(`
      SELECT h.* 
      FROM habits h
      JOIN weekly_habits wh ON h.id = wh.habit_id
      WHERE wh.week_start = ?
      ORDER BY h.created_at ASC
    `).all(weekStart);
  } else {
    rows = db.prepare('SELECT * FROM habits ORDER BY created_at ASC').all();
  }
  res.json(rows.map(buildHabit));
});

// POST /api/habits — create
router.post('/', (req, res) => {
  const { id, name, emoji, color, createdAt, weekStart, type, targetValue, unit } = req.body;
  if (!id || !name) return res.status(400).json({ error: 'id and name required' });
  db.prepare('INSERT INTO habits (id, name, emoji, color, created_at, type, target_value, unit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(
      id,
      name,
      emoji || '⭐',
      color || '#10b981',
      createdAt || new Date().toISOString(),
      type || 'boolean',
      targetValue || 0,
      unit || ''
    );
  
  if (weekStart) {
    db.prepare('INSERT INTO weekly_habits (habit_id, week_start) VALUES (?, ?)').run(id, weekStart);
  }

  const row = db.prepare('SELECT * FROM habits WHERE id = ?').get(id);
  res.status(201).json(buildHabit(row));
});

// DELETE /api/habits/:id
router.delete('/:id', (req, res) => {
  const { weekStart } = req.query;
  const habitId = req.params.id;

  if (weekStart) {
    // Scoped deletion: remove from this specific week
    db.prepare('DELETE FROM weekly_habits WHERE habit_id = ? AND week_start = ?').run(habitId, weekStart);

    // Generate the 7 dates for this week start to delete completions as well
    const parts = weekStart.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(year, month, day + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dateNum = String(d.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${dateNum}`);
    }

    db.prepare(`
      DELETE FROM habit_completions
      WHERE habit_id = ? AND date IN (?, ?, ?, ?, ?, ?, ?)
    `).run(habitId, ...dates);
  } else {
    // Global deletion
    db.prepare('DELETE FROM habits WHERE id = ?').run(habitId);
  }
  
  res.json({ ok: true });
});

// PUT /api/habits/:id/toggle/:date — toggle a day completion
router.put('/:id/toggle/:date', (req, res) => {
  const { id, date } = req.params;
  const existing = db
    .prepare('SELECT 1 FROM habit_completions WHERE habit_id = ? AND date = ?')
    .get(id, date);
  if (existing) {
    db.prepare('DELETE FROM habit_completions WHERE habit_id = ? AND date = ?').run(id, date);
    res.json({ completed: false });
  } else {
    db.prepare('INSERT INTO habit_completions (habit_id, date, value) VALUES (?, ?, 1)').run(id, date);
    res.json({ completed: true });
  }
});

// PUT /api/habits/:id/value/:date — set/update a completion value
router.put('/:id/value/:date', (req, res) => {
  const { id, date } = req.params;
  const { value } = req.body;
  
  if (value === undefined || value === null || isNaN(value)) {
    return res.status(400).json({ error: 'Valid value required' });
  }

  if (value <= 0) {
    db.prepare('DELETE FROM habit_completions WHERE habit_id = ? AND date = ?').run(id, date);
    return res.json({ completed: false, value: 0 });
  }

  const existing = db
    .prepare('SELECT 1 FROM habit_completions WHERE habit_id = ? AND date = ?')
    .get(id, date);

  if (existing) {
    db.prepare('UPDATE habit_completions SET value = ? WHERE habit_id = ? AND date = ?').run(value, id, date);
  } else {
    db.prepare('INSERT INTO habit_completions (habit_id, date, value) VALUES (?, ?, ?)').run(id, date, value);
  }

  res.json({ completed: true, value });
});

// POST /api/habits/copy-week — assign habits to a new week
// Body: { habitIds: ["id1", ...], weekStart: "YYYY-MM-DD" }
router.post('/copy-week', (req, res) => {
  const { habitIds, weekStart } = req.body;
  if (!Array.isArray(habitIds) || !weekStart) {
    return res.status(400).json({ error: 'habitIds array and weekStart required' });
  }

  const insertOrIgnore = db.prepare(
    'INSERT OR IGNORE INTO weekly_habits (habit_id, week_start) VALUES (?, ?)'
  );

  let copied = 0;
  const copyAll = db.transaction(() => {
    habitIds.forEach(id => {
      const result = insertOrIgnore.run(id, weekStart);
      if (result.changes > 0) copied++;
    });
  });

  copyAll();
  res.json({ ok: true, copied });
});

module.exports = router;
