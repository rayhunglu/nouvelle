const crypto = require('crypto');

// One-time links for setting / resetting a staff password. Only a SHA-256 of the token is stored, so a copy of the
// database cannot be used to take over an account.
const SET_HOURS = 24; // a new account's "set your password" link
const RESET_HOURS = 1; // a "forgot password" link

const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');

// -> { token (goes in the email), reset_token + reset_expires (go on the account) }
function newToken(hours) {
  const token = crypto.randomBytes(32).toString('hex');
  return { token, reset_token: hashToken(token), reset_expires: new Date(Date.now() + hours * 3600 * 1000).toISOString() };
}

function tokenMatches(user, token) {
  if (!user.reset_token || !user.reset_expires || typeof token !== 'string' || !token) return false;
  const a = Buffer.from(user.reset_token, 'hex');
  const b = Buffer.from(hashToken(token), 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b) && new Date(user.reset_expires).getTime() > Date.now();
}

// Where the link points: always APP_URL. The request's own Host header is only trusted in local development, because a forged
// Host would otherwise make the emailed link point at someone else's site. Returns null when there is no safe address.
// The token sits after "#", so it never reaches server logs or Referer headers.
function linkFor(req, token) {
  const base = process.env.APP_URL || (process.env.NODE_ENV === 'development' ? `${req.protocol}://${req.get('host')}` : '');
  return base ? `${base.replace(/\/+$/, '')}/reset-password#token=${token}` : null;
}

module.exports = { SET_HOURS, RESET_HOURS, hashToken, newToken, tokenMatches, linkFor };
