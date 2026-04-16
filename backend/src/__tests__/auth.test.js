const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ---- Mock setup ----

// Mock pool: collects calls for assertions
const mockQuery = jest.fn();
jest.mock('../config/db', () => ({ query: mockQuery }));

// Mock groq (not used in auth, but proposals route requires it at module level)
jest.mock('../services/groq', () => ({
  generateProposal: jest.fn(),
  generateFollowUp: jest.fn(),
}));

// ---- App bootstrap ----
process.env.JWT_SECRET = 'test-secret-key-for-jwt';

const authRoutes = require('../routes/auth');
const errorHandler = require('../middleware/errorHandler');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use(errorHandler);
  return app;
}

// ---- Tests ----

describe('POST /api/auth/register', () => {
  let app;

  beforeEach(() => {
    app = buildApp();
    mockQuery.mockReset();
  });

  it('returns 201 with token and user on success', async () => {
    // First query: check existing user — none found
    mockQuery.mockResolvedValueOnce({ rows: [] });
    // Second query: INSERT user
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'uuid-1', email: 'test@example.com', created_at: new Date().toISOString() }],
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toEqual({ id: 'uuid-1', email: 'test@example.com' });

    // Verify the token is valid
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded.id).toBe('uuid-1');
    expect(decoded.email).toBe('test@example.com');
  });

  it('returns 409 when email already registered', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'existing-id' }] });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'existing@example.com', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already registered/i);
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it('returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it('returns 400 when password is too short', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/at least 6/i);
  });

  it('hashes the password with bcrypt before storing', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'uuid-2', email: 'hash@example.com', created_at: new Date().toISOString() }],
    });

    await request(app)
      .post('/api/auth/register')
      .send({ email: 'hash@example.com', password: 'mypassword' });

    // The second query is the INSERT — second arg is [email, passwordHash]
    const insertCall = mockQuery.mock.calls[1];
    const storedHash = insertCall[1][1]; // second param = password_hash
    const isValid = await bcrypt.compare('mypassword', storedHash);
    expect(isValid).toBe(true);
  });
});

describe('POST /api/auth/login', () => {
  let app;

  beforeEach(() => {
    app = buildApp();
    mockQuery.mockReset();
  });

  it('returns 200 with token and user on valid credentials', async () => {
    const hash = await bcrypt.hash('correctpassword', 12);
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'uuid-login', email: 'user@example.com', password_hash: hash }],
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'correctpassword' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toEqual({ id: 'uuid-login', email: 'user@example.com' });
  });

  it('returns 401 for wrong password', async () => {
    const hash = await bcrypt.hash('correctpassword', 12);
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'uuid-login', email: 'user@example.com', password_hash: hash }],
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid credentials/i);
  });

  it('returns 401 for non-existent email', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'anything' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid credentials/i);
  });

  it('returns 400 when email and password are missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });
});

describe('Protected route without token', () => {
  it('returns 401 when no Authorization header is sent', async () => {
    const app = express();
    app.use(express.json());

    const authMiddleware = require('../middleware/auth');
    app.get('/api/protected', authMiddleware, (req, res) => {
      res.json({ message: 'ok' });
    });
    app.use(errorHandler);

    const res = await request(app).get('/api/protected');

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/authentication required/i);
  });

  it('returns 401 when token is invalid', async () => {
    const app = express();
    app.use(express.json());

    const authMiddleware = require('../middleware/auth');
    app.get('/api/protected', authMiddleware, (req, res) => {
      res.json({ message: 'ok' });
    });
    app.use(errorHandler);

    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer invalid-token-here');

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid or expired/i);
  });

  it('passes when a valid token is provided', async () => {
    const app = express();
    app.use(express.json());

    const authMiddleware = require('../middleware/auth');
    app.get('/api/protected', authMiddleware, (req, res) => {
      res.json({ user: req.user });
    });
    app.use(errorHandler);

    const token = jwt.sign({ id: 'uid-1', email: 'a@b.com' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: 'uid-1', email: 'a@b.com' });
  });
});
