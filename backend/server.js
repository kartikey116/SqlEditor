require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// ── Middleware ──────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

// ── DB ──────────────────────────────────────────────────────────
connectDB();

// ── Routes ──────────────────────────────────────────────────────
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/execute', require('./routes/execute'));
app.use('/api/hint', require('./routes/hint'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/progress', require('./routes/progress'));

// ── Health ──────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── 404 ─────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀  Backend running on http://localhost:${PORT}`)
);
