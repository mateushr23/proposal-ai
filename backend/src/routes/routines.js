const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { runFollowUpRoutine } = require('../services/followUp');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/routines/logs — list routine execution logs
router.get('/logs', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, routine_name, triggered_by, status, proposals_affected,
            details, started_at, finished_at
     FROM routine_logs
     ORDER BY started_at DESC
     LIMIT 50`
  );

  res.json({ logs: rows });
}));

// POST /api/routines/follow-up/trigger — manually trigger follow-up routine
router.post('/follow-up/trigger', asyncHandler(async (req, res) => {
  // Create initial log and return immediately (fire-and-forget)
  const { rows: [log] } = await pool.query(
    `INSERT INTO routine_logs (routine_name, triggered_by, status)
     VALUES ($1, $2, $3) RETURNING id`,
    ['follow-up-routine', 'manual', 'running']
  );

  // Fire and forget — run in background
  runFollowUpRoutineManual(log.id).catch(() => {});

  res.status(202).json({
    message: 'Follow-up routine triggered',
    log_id: log.id,
  });
}));

async function runFollowUpRoutineManual(logId) {
  const { generateFollowUp } = require('../services/groq');

  try {
    const { rows: staleProposals } = await pool.query(
      `SELECT p.id, p.client_name, p.segment, p.service, u.email
       FROM proposals p
       JOIN users u ON u.id = p.user_id
       WHERE p.status = 'sent'
         AND p.updated_at < NOW() - INTERVAL '3 days'`
    );

    const followUps = [];

    for (const proposal of staleProposals) {
      try {
        const message = await generateFollowUp({
          client_name: proposal.client_name,
          segment: proposal.segment,
          service: proposal.service,
        });

        followUps.push({
          proposal_id: proposal.id,
          client_name: proposal.client_name,
          user_email: proposal.email,
          follow_up_message: message,
        });
      } catch (err) {
        followUps.push({
          proposal_id: proposal.id,
          client_name: proposal.client_name,
          error: err.message,
        });
      }
    }

    await pool.query(
      `UPDATE routine_logs
       SET status = $1, proposals_affected = $2, details = $3, finished_at = NOW()
       WHERE id = $4`,
      ['completed', staleProposals.length, JSON.stringify({ follow_ups: followUps }), logId]
    );
  } catch (err) {
    await pool.query(
      `UPDATE routine_logs
       SET status = $1, details = $2, finished_at = NOW()
       WHERE id = $3`,
      ['failed', JSON.stringify({ error: err.message }), logId]
    );
  }
}

module.exports = router;
