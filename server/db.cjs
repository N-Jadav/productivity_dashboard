const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'focusflow.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL DEFAULT '⭐',
    color TEXT NOT NULL DEFAULT '#10b981',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS habit_completions (
    habit_id TEXT NOT NULL,
    date TEXT NOT NULL,
    PRIMARY KEY (habit_id, date),
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS weekly_habits (
    habit_id TEXT NOT NULL,
    week_start TEXT NOT NULL,
    PRIMARY KEY (habit_id, week_start),
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    target REAL NOT NULL DEFAULT 10,
    current REAL NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'units',
    deadline TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#10b981',
    emoji TEXT NOT NULL DEFAULT '🎯',
    created_at TEXT NOT NULL
  );
`);

// Run database schema migrations
try {
  db.exec("ALTER TABLE habits ADD COLUMN type TEXT NOT NULL DEFAULT 'boolean'");
} catch (e) {
  // Column already exists
}
try {
  db.exec("ALTER TABLE habits ADD COLUMN target_value REAL DEFAULT 0");
} catch (e) {
  // Column already exists
}
try {
  db.exec("ALTER TABLE habits ADD COLUMN unit TEXT DEFAULT ''");
} catch (e) {
  // Column already exists
}
try {
  db.exec("ALTER TABLE habit_completions ADD COLUMN value REAL NOT NULL DEFAULT 1");
} catch (e) {
  // Column already exists
}

function getWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

// Seed default data if empty
const habitCount = db.prepare('SELECT COUNT(*) as n FROM habits').get();
if (habitCount.n === 0) {
  const now = new Date().toISOString();
  const insertHabit = db.prepare(
    'INSERT INTO habits (id, name, emoji, color, created_at) VALUES (?, ?, ?, ?, ?)'
  );
  insertHabit.run('seed-1', 'Morning Workout', '🏋️', '#10b981', now);
  insertHabit.run('seed-2', 'Read 30 mins', '📚', '#6366f1', now);
  insertHabit.run('seed-3', 'Meditate', '🧘', '#f59e0b', now);
  insertHabit.run('seed-4', 'Drink Water (2L)', '💧', '#06b6d4', now);
  insertHabit.run('seed-5', 'No Social Media', '🚫', '#ec4899', now);

  const insertWeeklyHabit = db.prepare(
    'INSERT INTO weekly_habits (habit_id, week_start) VALUES (?, ?)'
  );
  const currentWeek = getWeekStart();
  ['seed-1', 'seed-2', 'seed-3', 'seed-4', 'seed-5'].forEach(id => {
    insertWeeklyHabit.run(id, currentWeek);
  });

  const endOfMonth = new Date();
  endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);
  const dl = endOfMonth.toISOString();

  const insertGoal = db.prepare(
    'INSERT INTO goals (id, title, description, target, current, unit, deadline, color, emoji, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  insertGoal.run('gseeed-1', 'Run 50km', 'Monthly running target', 50, 18, 'km', dl, '#10b981', '🏃', now);
  insertGoal.run('gseed-2', 'Read 4 Books', 'Reading goal for this month', 4, 1, 'books', dl, '#6366f1', '📖', now);
}

// Backfill existing habits to current week if they aren't in weekly_habits
const currentWeekStr = getWeekStart();
db.exec(`
  INSERT OR IGNORE INTO weekly_habits (habit_id, week_start)
  SELECT id, '${currentWeekStr}' FROM habits;
`);

module.exports = db;
