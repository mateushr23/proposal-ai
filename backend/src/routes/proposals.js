const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { generateProposal } = require('../services/groq');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/proposals — list user's proposals
router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, client_name, segment, service, estimated_value, deadline,
            content, status, created_at, updated_at
     FROM proposals
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [req.user.id]
  );

  res.json({ proposals: rows });
}));

// GET /api/proposals/:id — single proposal
router.get('/:id', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, user_id, client_name, segment, service, estimated_value, deadline,
            content, status, created_at, updated_at
     FROM proposals WHERE id = $1`,
    [req.params.id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: 'Proposal not found' });
  }

  if (rows[0].user_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { user_id, ...proposal } = rows[0];
  res.json(proposal);
}));

// POST /api/proposals — create draft
router.post('/', asyncHandler(async (req, res) => {
  const { client_name, segment, service, estimated_value, deadline } = req.body;

  if (!client_name || !segment || !service) {
    return res.status(400).json({ error: 'client_name, segment, and service are required' });
  }

  const { rows: [proposal] } = await pool.query(
    `INSERT INTO proposals (user_id, client_name, segment, service, estimated_value, deadline)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, client_name, segment, service, estimated_value, deadline, content, status, created_at, updated_at`,
    [req.user.id, client_name, segment, service, estimated_value || 0, deadline || null]
  );

  res.status(201).json(proposal);
}));

// PUT /api/proposals/:id — update proposal
router.put('/:id', asyncHandler(async (req, res) => {
  // Verify ownership
  const { rows: existing } = await pool.query(
    'SELECT id, user_id FROM proposals WHERE id = $1',
    [req.params.id]
  );

  if (existing.length === 0) {
    return res.status(404).json({ error: 'Proposal not found' });
  }

  if (existing[0].user_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { client_name, segment, service, estimated_value, deadline, content } = req.body;

  const { rows: [proposal] } = await pool.query(
    `UPDATE proposals
     SET client_name = COALESCE($1, client_name),
         segment = COALESCE($2, segment),
         service = COALESCE($3, service),
         estimated_value = COALESCE($4, estimated_value),
         deadline = COALESCE($5, deadline),
         content = COALESCE($6, content),
         updated_at = NOW()
     WHERE id = $7
     RETURNING id, client_name, segment, service, estimated_value, deadline, content, status, created_at, updated_at`,
    [client_name, segment, service, estimated_value, deadline, content ? JSON.stringify(content) : null, req.params.id]
  );

  res.json(proposal);
}));

// PATCH /api/proposals/:id/status — update status only
router.patch('/:id/status', asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['draft', 'sent', 'accepted', 'rejected'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  // Verify ownership
  const { rows: existing } = await pool.query(
    'SELECT id, user_id FROM proposals WHERE id = $1',
    [req.params.id]
  );

  if (existing.length === 0) {
    return res.status(404).json({ error: 'Proposal not found' });
  }

  if (existing[0].user_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { rows: [proposal] } = await pool.query(
    `UPDATE proposals SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, status, updated_at`,
    [status, req.params.id]
  );

  res.json(proposal);
}));

// DELETE /api/proposals/:id — delete proposal
router.delete('/:id', asyncHandler(async (req, res) => {
  const { rows: existing } = await pool.query(
    'SELECT id, user_id FROM proposals WHERE id = $1',
    [req.params.id]
  );

  if (existing.length === 0) {
    return res.status(404).json({ error: 'Proposal not found' });
  }

  if (existing[0].user_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  await pool.query('DELETE FROM proposals WHERE id = $1', [req.params.id]);

  res.json({ message: 'Proposal deleted' });
}));

// POST /api/proposals/:id/generate — AI generation
router.post('/:id/generate', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, user_id, client_name, segment, service, estimated_value, deadline
     FROM proposals WHERE id = $1`,
    [req.params.id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: 'Proposal not found' });
  }

  if (rows[0].user_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const proposal = rows[0];

  try {
    const content = await generateProposal({
      client_name: proposal.client_name,
      segment: proposal.segment,
      service: proposal.service,
      estimated_value: proposal.estimated_value,
      deadline: proposal.deadline,
    });

    // Save generated content to proposal
    await pool.query(
      `UPDATE proposals SET content = $1, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(content), proposal.id]
    );

    res.json({ content });
  } catch (err) {
    if (err.status === 502) {
      throw err;
    }
    const groqErr = new Error('Groq API error');
    groqErr.status = 502;
    groqErr.details = err.message;
    throw groqErr;
  }
}));

module.exports = router;
