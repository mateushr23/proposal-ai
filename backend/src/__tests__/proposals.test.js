const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// ---- Mock setup ----
const mockQuery = jest.fn();
jest.mock('../config/db', () => ({ query: mockQuery }));

const mockGenerateProposal = jest.fn();
const mockGenerateFollowUp = jest.fn();
jest.mock('../services/groq', () => ({
  generateProposal: mockGenerateProposal,
  generateFollowUp: mockGenerateFollowUp,
}));

process.env.JWT_SECRET = 'test-secret-key-for-jwt';

const proposalRoutes = require('../routes/proposals');
const errorHandler = require('../middleware/errorHandler');

// ---- Helpers ----

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/proposals', proposalRoutes);
  app.use(errorHandler);
  return app;
}

function makeToken(userId = 'user-1', email = 'test@example.com') {
  return jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

const USER_ID = 'user-1';
const OTHER_USER_ID = 'user-other';
const PROPOSAL_ID = 'proposal-1';
const token = makeToken(USER_ID);

const sampleProposal = {
  id: PROPOSAL_ID,
  user_id: USER_ID,
  client_name: 'Acme Corp',
  segment: 'Tecnologia',
  service: 'Website redesign',
  estimated_value: 5000,
  deadline: '2026-06-01',
  content: null,
  status: 'draft',
  created_at: '2026-04-01T00:00:00.000Z',
  updated_at: '2026-04-01T00:00:00.000Z',
};

// ---- Tests ----

describe('GET /api/proposals', () => {
  let app;

  beforeEach(() => {
    app = buildApp();
    mockQuery.mockReset();
  });

  it('returns list of proposals for authenticated user', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [sampleProposal] });

    const res = await request(app)
      .get('/api/proposals')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.proposals).toHaveLength(1);
    expect(res.body.proposals[0].client_name).toBe('Acme Corp');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/proposals');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/proposals/:id', () => {
  let app;

  beforeEach(() => {
    app = buildApp();
    mockQuery.mockReset();
  });

  it('returns single proposal owned by user', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [sampleProposal] });

    const res = await request(app)
      .get(`/api/proposals/${PROPOSAL_ID}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.client_name).toBe('Acme Corp');
    // user_id should be stripped from response
    expect(res.body.user_id).toBeUndefined();
  });

  it('returns 404 when proposal does not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/api/proposals/nonexistent')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('returns 403 when accessing another user proposal', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ ...sampleProposal, user_id: OTHER_USER_ID }],
    });

    const res = await request(app)
      .get(`/api/proposals/${PROPOSAL_ID}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/forbidden/i);
  });
});

describe('POST /api/proposals', () => {
  let app;

  beforeEach(() => {
    app = buildApp();
    mockQuery.mockReset();
  });

  it('creates a draft proposal and returns 201', async () => {
    const created = { ...sampleProposal };
    delete created.user_id;
    mockQuery.mockResolvedValueOnce({ rows: [created] });

    const res = await request(app)
      .post('/api/proposals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        client_name: 'Acme Corp',
        segment: 'Tecnologia',
        service: 'Website redesign',
        estimated_value: 5000,
        deadline: '2026-06-01',
      });

    expect(res.status).toBe(201);
    expect(res.body.client_name).toBe('Acme Corp');
    expect(res.body.status).toBe('draft');
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/proposals')
      .set('Authorization', `Bearer ${token}`)
      .send({ client_name: 'Only Name' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });
});

describe('PUT /api/proposals/:id', () => {
  let app;

  beforeEach(() => {
    app = buildApp();
    mockQuery.mockReset();
  });

  it('updates proposal fields', async () => {
    // Ownership check
    mockQuery.mockResolvedValueOnce({ rows: [{ id: PROPOSAL_ID, user_id: USER_ID }] });
    // Update query
    const updated = { ...sampleProposal, client_name: 'Updated Corp' };
    delete updated.user_id;
    mockQuery.mockResolvedValueOnce({ rows: [updated] });

    const res = await request(app)
      .put(`/api/proposals/${PROPOSAL_ID}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ client_name: 'Updated Corp' });

    expect(res.status).toBe(200);
    expect(res.body.client_name).toBe('Updated Corp');
  });

  it('returns 403 when updating another user proposal', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: PROPOSAL_ID, user_id: OTHER_USER_ID }] });

    const res = await request(app)
      .put(`/api/proposals/${PROPOSAL_ID}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ client_name: 'Hacked' });

    expect(res.status).toBe(403);
  });

  it('returns 404 when proposal does not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .put('/api/proposals/nonexistent')
      .set('Authorization', `Bearer ${token}`)
      .send({ client_name: 'X' });

    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/proposals/:id/status', () => {
  let app;

  beforeEach(() => {
    app = buildApp();
    mockQuery.mockReset();
  });

  it('updates proposal status', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: PROPOSAL_ID, user_id: USER_ID }] });
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: PROPOSAL_ID, status: 'sent', updated_at: '2026-04-02T00:00:00.000Z' }],
    });

    const res = await request(app)
      .patch(`/api/proposals/${PROPOSAL_ID}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'sent' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('sent');
  });

  it('returns 400 for invalid status value', async () => {
    const res = await request(app)
      .patch(`/api/proposals/${PROPOSAL_ID}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'invalid_status' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/must be one of/i);
  });

  it('returns 403 for non-owner', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: PROPOSAL_ID, user_id: OTHER_USER_ID }] });

    const res = await request(app)
      .patch(`/api/proposals/${PROPOSAL_ID}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'sent' });

    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/proposals/:id', () => {
  let app;

  beforeEach(() => {
    app = buildApp();
    mockQuery.mockReset();
  });

  it('deletes proposal owned by user', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: PROPOSAL_ID, user_id: USER_ID }] });
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });

    const res = await request(app)
      .delete(`/api/proposals/${PROPOSAL_ID}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it('returns 404 for non-existent proposal', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .delete('/api/proposals/nonexistent')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('returns 403 for non-owner', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: PROPOSAL_ID, user_id: OTHER_USER_ID }] });

    const res = await request(app)
      .delete(`/api/proposals/${PROPOSAL_ID}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

describe('POST /api/proposals/:id/generate', () => {
  let app;

  beforeEach(() => {
    app = buildApp();
    mockQuery.mockReset();
    mockGenerateProposal.mockReset();
  });

  it('generates proposal content via Groq and saves it', async () => {
    const proposalData = {
      id: PROPOSAL_ID,
      user_id: USER_ID,
      client_name: 'Acme Corp',
      segment: 'Tecnologia',
      service: 'Website redesign',
      estimated_value: 5000,
      deadline: '2026-06-01',
    };

    // SELECT query to fetch proposal
    mockQuery.mockResolvedValueOnce({ rows: [proposalData] });
    // UPDATE query to save content
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });

    const generatedContent = {
      introduction: 'Prezado Acme Corp...',
      scope: 'O escopo do projeto inclui...',
      investment: 'O investimento total sera de R$ 5.000,00...',
      next_steps: 'Os proximos passos sao...',
    };
    mockGenerateProposal.mockResolvedValueOnce(generatedContent);

    const res = await request(app)
      .post(`/api/proposals/${PROPOSAL_ID}/generate`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.content).toEqual(generatedContent);
    expect(mockGenerateProposal).toHaveBeenCalledWith({
      client_name: 'Acme Corp',
      segment: 'Tecnologia',
      service: 'Website redesign',
      estimated_value: 5000,
      deadline: '2026-06-01',
    });
  });

  it('returns 502 when Groq API fails', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: PROPOSAL_ID,
        user_id: USER_ID,
        client_name: 'Acme',
        segment: 'Tech',
        service: 'Dev',
        estimated_value: 1000,
        deadline: null,
      }],
    });

    mockGenerateProposal.mockRejectedValueOnce(new Error('Groq timeout'));

    const res = await request(app)
      .post(`/api/proposals/${PROPOSAL_ID}/generate`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(502);
  });

  it('returns 403 for non-owner', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ ...sampleProposal, user_id: OTHER_USER_ID }],
    });

    const res = await request(app)
      .post(`/api/proposals/${PROPOSAL_ID}/generate`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it('returns 404 for non-existent proposal', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/proposals/nonexistent/generate')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
