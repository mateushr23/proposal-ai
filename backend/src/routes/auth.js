const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

function setTokenCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'A senha precisa ter no mínimo 6 caracteres' });
  }

  // Check for existing user
  const { rows: existing } = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existing.length > 0) {
    return res.status(409).json({ error: 'Este e-mail já está cadastrado' });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const { rows: [user] } = await pool.query(
    `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at`,
    [email, passwordHash]
  );

  const token = generateToken(user);

  setTokenCookie(res, token);
  res.status(201).json({
    user: { id: user.id, email: user.email },
  });
}));

// POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  }

  const { rows } = await pool.query(
    'SELECT id, email, password_hash FROM users WHERE email = $1',
    [email]
  );

  if (rows.length === 0) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos' });
  }

  const user = rows[0];
  const validPassword = await bcrypt.compare(password, user.password_hash);

  if (!validPassword) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos' });
  }

  const token = generateToken(user);

  setTokenCookie(res, token);
  res.json({
    user: { id: user.id, email: user.email },
  });
}));

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'Logout realizado' });
});

// GET /api/auth/me — return current user from cookie token
router.get('/me', (req, res) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    res.json({ user: { id: decoded.id, email: decoded.email } });
  } catch {
    res.clearCookie('token', { path: '/' });
    return res.status(401).json({ error: 'Token inválido' });
  }
});

module.exports = router;
