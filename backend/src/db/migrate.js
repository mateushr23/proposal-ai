require('dotenv').config();
const pool = require('../config/db');

const migration = `
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";

  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_name VARCHAR(255) NOT NULL,
    segment VARCHAR(255) NOT NULL,
    service VARCHAR(255) NOT NULL,
    estimated_value NUMERIC(12,2) NOT NULL DEFAULT 0,
    deadline DATE,
    content JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
      CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_proposals_user_id ON proposals(user_id);

  CREATE TABLE IF NOT EXISTS routine_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_name VARCHAR(100) NOT NULL,
    triggered_by VARCHAR(20) NOT NULL DEFAULT 'cron',
    status VARCHAR(20) NOT NULL DEFAULT 'running',
    proposals_affected INTEGER NOT NULL DEFAULT 0,
    details JSONB,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ
  );

  CREATE INDEX IF NOT EXISTS idx_routine_logs_routine_name ON routine_logs(routine_name);
`;

async function runMigrations() {
  try {
    await pool.query(migration);
    process.stdout.write('Migrations completed successfully\n');
  } catch (err) {
    process.stderr.write(`Migration failed: ${err.message}\n`);
    process.exit(1);
  }
}

// Run directly if called as script
if (require.main === module) {
  runMigrations().then(() => process.exit(0));
} else {
  module.exports = runMigrations;
}
