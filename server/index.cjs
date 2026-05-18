const express = require('express');
const cors = require('cors');
const habitsRouter = require('./routes/habits.cjs');
const goalsRouter = require('./routes/goals.cjs');

// Initialize DB (side effect: creates tables + seeds data)
require('./db.cjs');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use('/api/habits', habitsRouter);
app.use('/api/goals', goalsRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 FocusFlow API running at http://localhost:${PORT}`);
});
