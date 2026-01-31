require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const excuseRoutes = require('./routes/excuseRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/excuses', excuseRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api', (req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  await connectDB();
  app.listen(PORT, HOST, () => console.log(`Server running on http://${HOST}:${PORT}`));
}

start().catch((err) => {
  console.error('Startup failed:', err.message);
  process.exit(1);
});
