require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const cron = require('node-cron');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const proposalRoutes = require('./routes/proposals');
const routineRoutes = require('./routes/routines');
const runMigrations = require('./db/migrate');
const { runFollowUpRoutine } = require('./services/followUp');

// Validate required env vars
const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET', 'GROQ_API_KEY'];
REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    process.stderr.write(`Missing required env var: ${key}\n`);
    process.exit(1);
  }
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/routines', routineRoutes);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
async function start() {
  // Run migrations on startup
  await runMigrations();

  // Schedule follow-up routine: daily at 09:00 America/Sao_Paulo
  cron.schedule('0 9 * * *', async () => {
    try {
      const result = await runFollowUpRoutine('cron');
      process.stdout.write(`[cron] Follow-up routine completed: ${result.proposals_affected} proposals affected\n`);
    } catch (err) {
      process.stderr.write(`[cron] Follow-up routine failed: ${err.message}\n`);
    }
  }, {
    timezone: 'America/Sao_Paulo',
  });

  app.listen(PORT, () => {
    process.stdout.write(`Backend running on http://localhost:${PORT}\n`);
  });
}

start().catch((err) => {
  process.stderr.write(`Failed to start server: ${err.message}\n`);
  process.exit(1);
});
