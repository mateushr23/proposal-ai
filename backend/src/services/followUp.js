const pool = require('../config/db');
const { generateFollowUp } = require('./groq');

async function runFollowUpRoutine(triggeredBy = 'cron') {
  // Create log entry
  const { rows: [log] } = await pool.query(
    `INSERT INTO routine_logs (routine_name, triggered_by, status)
     VALUES ($1, $2, $3) RETURNING *`,
    ['follow-up-routine', triggeredBy, 'running']
  );

  try {
    // Find proposals sent more than 3 days ago with no update
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

    // Update log as completed
    await pool.query(
      `UPDATE routine_logs
       SET status = $1, proposals_affected = $2, details = $3, finished_at = NOW()
       WHERE id = $4`,
      ['completed', staleProposals.length, JSON.stringify({ follow_ups: followUps }), log.id]
    );

    return { log_id: log.id, proposals_affected: staleProposals.length };
  } catch (err) {
    // Update log as failed
    await pool.query(
      `UPDATE routine_logs
       SET status = $1, details = $2, finished_at = NOW()
       WHERE id = $3`,
      ['failed', JSON.stringify({ error: err.message }), log.id]
    );

    throw err;
  }
}

module.exports = { runFollowUpRoutine };
