const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// ---- Mock setup ----
const mockQuery = jest.fn();
jest.mock('../config/db', () => ({ query: mockQuery }));

jest.mock('../services/groq', () => ({
  generateProposal: jest.fn(),
  generateFollowUp: jest.fn(),
}));

jest.mock('../services/followUp', () => ({
  runFollowUpRoutine: jest.fn(),
}));

process.env.JWT_SECRET = 'test-secret-key-for-jwt';

const routineRoutes = require('../routes/routines');
const errorHandler = require('../middleware/errorHandler');

// ---- Helpers ----

function buildApp() {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use('/api/routines', routineRoutes);
  app.use(errorHandler);
  return app;
}

function makeToken(userId = 'user-1') {
  return jwt.sign({ id: userId, email: 'test@example.com' }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

const token = makeToken();

const sampleLogs = [
  {
    id: 'log-1',
    routine_name: 'follow-up-routine',
    triggered_by: 'cron',
    status: 'completed',
    proposals_affected: 3,
    details: { follow_ups: [] },
    started_at: '2026-04-15T12:00:00.000Z',
    finished_at: '2026-04-15T12:01:00.000Z',
  },
  {
    id: 'log-2',
    routine_name: 'follow-up-routine',
    triggered_by: 'manual',
    status: 'failed',
    proposals_affected: 0,
    details: { error: 'Groq timeout' },
    started_at: '2026-04-14T09:00:00.000Z',
    finished_at: '2026-04-14T09:00:05.000Z',
  },
];

// ---- Tests ----

describe('GET /api/routines/logs', () => {
  let app;

  beforeEach(() => {
    app = buildApp();
    mockQuery.mockReset();
  });

  it('returns routine logs ordered by started_at DESC', async () => {
    mockQuery.mockResolvedValueOnce({ rows: sampleLogs });

    const res = await request(app)
      .get('/api/routines/logs')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.logs).toHaveLength(2);
    expect(res.body.logs[0].routine_name).toBe('follow-up-routine');
    expect(res.body.logs[0].triggered_by).toBe('cron');
    expect(res.body.logs[1].status).toBe('failed');
  });

  it('returns empty array when no logs exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/api/routines/logs')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.logs).toEqual([]);
  });

  it('returns 401 without authentication', async () => {
    const res = await request(app).get('/api/routines/logs');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/routines/follow-up/trigger', () => {
  let app;

  beforeEach(() => {
    app = buildApp();
    mockQuery.mockReset();
  });

  it('returns 202 with log_id (fire-and-forget)', async () => {
    // INSERT log query
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'log-new' }] });
    // The background queries (stale proposals, updates) — mock them to avoid unhandled rejections
    mockQuery.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .post('/api/routines/follow-up/trigger')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(202);
    expect(res.body.message).toMatch(/triggered/i);
    expect(res.body.log_id).toBe('log-new');
  });

  it('returns 401 without authentication', async () => {
    const res = await request(app).post('/api/routines/follow-up/trigger');
    expect(res.status).toBe(401);
  });

  it('creates a log entry with status running and triggered_by manual', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'log-check' }] });
    mockQuery.mockResolvedValue({ rows: [] });

    await request(app)
      .post('/api/routines/follow-up/trigger')
      .set('Cookie', `token=${token}`);

    // First call should be the INSERT into routine_logs
    const firstCall = mockQuery.mock.calls[0];
    expect(firstCall[0]).toMatch(/INSERT INTO routine_logs/i);
    expect(firstCall[1]).toContain('follow-up-routine');
    expect(firstCall[1]).toContain('manual');
    expect(firstCall[1]).toContain('running');
  });
});
