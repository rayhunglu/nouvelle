const crypto = require('crypto');
const store = require('../services/store');
const mailer = require('../services/mailer');
const { RESET_HOURS, newToken, tokenMatches, linkFor } = require('../services/passwordReset');
const { roleOf, newCredentials, verifyPassword, verifyLegacyPassword, DUMMY_USER, MIN_PASSWORD, LOGIN_MAX_FAILS, LOCK_MS, sessionRevoked } = require('../services/users');

// The built-in manager account exists only when CRM_ADMIN_USER and CRM_ADMIN_PASSWORD are both set (there is no default).
// Normally managers are accounts with role "admin" in the database (see scripts/make-admin.cjs).
const ADMIN_USER = process.env.CRM_ADMIN_USER;
const ADMIN_PASSWORD = process.env.CRM_ADMIN_PASSWORD;
const BUILTIN_ADMIN = Boolean(ADMIN_USER && ADMIN_PASSWORD);
if (!BUILTIN_ADMIN) console.log('[auth] Built-in admin is off (CRM_ADMIN_USER / CRM_ADMIN_PASSWORD not set); sign in with a database account.');

// Compare via hashes so length differences don't leak and comparison is constant-time.
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

// In-memory limiter per IP: 5 failures per 15 minutes. Each account also locks itself (stored on the account, so every
// server instance sees it) after 5 wrong passwords in a row.
const WINDOW_MS = 15 * 60 * 1000;
const fails = new Map();

function tooManyFails(ip) {
  const entry = fails.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.first > WINDOW_MS) {
    fails.delete(ip);
    return false;
  }
  return entry.count >= LOGIN_MAX_FAILS;
}

function recordFail(ip) {
  if (fails.size > 5000) for (const [k, v] of fails) if (Date.now() - v.first > WINDOW_MS) fails.delete(k);
  const entry = fails.get(ip);
  if (!entry || Date.now() - entry.first > WINDOW_MS) fails.set(ip, { first: Date.now(), count: 1 });
  else entry.count += 1;
}

const TOO_MANY = { error: 'Too many attempts. Try again later.' };

async function login(req, res, next) {
  const ip = req.ip;
  if (tooManyFails(ip)) return res.status(429).json(TOO_MANY);

  const { username, password } = req.body || {};
  const valid = typeof username === 'string' && typeof password === 'string';
  const isAdmin = BUILTIN_ADMIN && valid && safeEqual(username, ADMIN_USER) && safeEqual(password, ADMIN_PASSWORD);

  // Otherwise look for a database account by login name or email.
  let staff = null;
  if (valid && !isAdmin) {
    try {
      const who = username.trim().toLowerCase();
      const u = (await store.list('users')).find((x) => (x.username.toLowerCase() === who || (x.email && x.email.toLowerCase() === who)) && x.active !== false);
      if (!u) {
        verifyPassword(password, DUMMY_USER); // same cost as a real check, so response time does not reveal which accounts exist
        recordFail(ip);
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      if (u.login_locked_until && Date.parse(u.login_locked_until) > Date.now()) return res.status(429).json(TOO_MANY);
      // Encrypt the typed password with the account's encrypt_key and compare it with hash_key.
      let good = verifyPassword(password, u);
      if (!good && !u.hash_key && verifyLegacyPassword(password, u.passwordHash)) {
        good = true;
        await store.update('users', u.id, newCredentials(password)); // move an old account to encrypt_key / hash_key
      }
      if (good) {
        staff = u;
        if (u.login_fails || u.login_locked_until) await store.update('users', u.id, { login_fails: 0, login_locked_until: '' });
      } else {
        const count = (u.login_fails || 0) + 1;
        await store.update('users', u.id, count >= LOGIN_MAX_FAILS
          ? { login_fails: 0, login_locked_until: new Date(Date.now() + LOCK_MS).toISOString() }
          : { login_fails: count });
      }
    } catch (err) {
      return next(err);
    }
  }

  if (!isAdmin && !staff) {
    recordFail(ip);
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  fails.delete(ip);
  // New session id on login prevents session fixation.
  req.session.regenerate((err) => {
    if (err) return next(err);
    req.session.isLoggedIn = true;
    req.session.user = isAdmin
      ? { username: ADMIN_USER, role: 'owner', builtin: true, loginAt: Date.now() }
      : { username: staff.username, role: roleOf(staff.role), loginAt: Date.now(), staffName: staff.staffName, displayName: staff.displayName || staff.staffName, permissions: staff.permissions || {} };
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

// Staff permissions can change while someone is signed in, so they are read fresh from the account.
async function me(req, res, next) {
  const u = req.session && req.session.user;
  if (!u || req.session.isLoggedIn !== true) return res.status(401).json({ error: 'Not signed in' });
  if (u.builtin) return res.json({ user: u }); // the built-in manager account has no record to refresh from
  try {
    const rec = (await store.list('users')).find((x) => x.username === u.username);
    if (!rec || rec.active === false || sessionRevoked(u, rec)) return req.session.destroy(() => res.status(401).json({ error: 'Not signed in' }));
    req.session.user = { ...u, role: roleOf(rec.role), staffName: rec.staffName, displayName: rec.displayName || rec.staffName, permissions: rec.permissions || {} };
    return res.json({ user: req.session.user });
  } catch (err) {
    return next(err);
  }
}

// "Forgot password": always answers ok straight away and does the work afterwards, so neither the answer nor its timing
// reveals whether an account exists.
function forgotPassword(req, res) {
  res.json({ ok: true });
  const who = String((req.body && (req.body.username || req.body.email)) || '').trim().toLowerCase();
  if (!who) return;
  (async () => {
    const u = (await store.list('users')).find((x) => x.active !== false && x.email && (x.username.toLowerCase() === who || x.email.toLowerCase() === who));
    if (!u) return;
    const link = newToken(RESET_HOURS);
    await store.update('users', u.id, { reset_token: link.reset_token, reset_expires: link.reset_expires });
    const sent = await mailer.sendPasswordLink({ to: u.email, name: u.displayName || u.staffName, link: linkFor(req, link.token), kind: 'reset' });
    if (!/^(sent|dry-run)$/.test(sent)) console.warn('[auth] password reset mail:', sent);
  })().catch((err) => console.error('[auth] forgot password failed:', err.message));
}

// Sets the password from the emailed link (new account or forgotten password). The link works once.
async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body || {};
    if (typeof password !== 'string' || password.length < MIN_PASSWORD) return res.status(400).json({ error: `密码至少 ${MIN_PASSWORD} 位` });
    const u = typeof token === 'string' && token ? (await store.list('users')).find((x) => tokenMatches(x, token)) : null;
    if (!u || u.active === false) return res.status(400).json({ error: '链接无效或已过期，请重新申请' });
    // A new password signs out every session opened before it, and clears any lock.
    await store.update('users', u.id, { ...newCredentials(password), reset_token: '', reset_expires: '', session_epoch: new Date().toISOString(), login_fails: 0, login_locked_until: '' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, logout, me, forgotPassword, resetPassword };
