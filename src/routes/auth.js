const crypto = require('crypto');

// Test default is admin/admin. Override with CRM_ADMIN_USER / CRM_ADMIN_PASSWORD.
const ADMIN_USER = process.env.CRM_ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.CRM_ADMIN_PASSWORD || 'admin';

if (ADMIN_USER === 'admin' && ADMIN_PASSWORD === 'admin') {
  console.warn('[auth] Using default admin/admin credentials. Set CRM_ADMIN_USER and CRM_ADMIN_PASSWORD before going live.');
}

// Compare via hashes so length differences don't leak and comparison is constant-time.
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

// Very small in-memory brute-force limiter: 10 failures per IP per 15 minutes.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 10;
const fails = new Map();

function tooManyFails(ip) {
  const entry = fails.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.first > WINDOW_MS) {
    fails.delete(ip);
    return false;
  }
  return entry.count >= MAX_FAILS;
}

function recordFail(ip) {
  const entry = fails.get(ip);
  if (!entry || Date.now() - entry.first > WINDOW_MS) fails.set(ip, { first: Date.now(), count: 1 });
  else entry.count += 1;
}

function login(req, res, next) {
  const ip = req.ip;
  if (tooManyFails(ip)) {
    return res.status(429).json({ error: 'Too many attempts. Try again later.' });
  }

  const { username, password } = req.body || {};
  const ok = typeof username === 'string' && typeof password === 'string'
    && safeEqual(username, ADMIN_USER) && safeEqual(password, ADMIN_PASSWORD);

  if (!ok) {
    recordFail(ip);
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  fails.delete(ip);
  // New session id on login prevents session fixation.
  req.session.regenerate((err) => {
    if (err) return next(err);
    req.session.user = { username: ADMIN_USER, role: 'admin' };
    res.json({ user: req.session.user });
  });
}

function logout(req, res, next) {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('nouvelle.sid');
    res.json({ ok: true });
  });
}

function me(req, res) {
  if (req.session && req.session.user) return res.json({ user: req.session.user });
  res.status(401).json({ error: 'Not signed in' });
}

module.exports = { login, logout, me };
