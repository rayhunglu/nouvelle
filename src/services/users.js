const crypto = require('crypto');

// Staff passwords are never stored. Each account keeps a random `encrypt_key` and a `hash_key`,
// which is the password encrypted with that key (crypto.scrypt, key = encrypt_key).
function encrypt(password, encryptKey) {
  return crypto.scryptSync(String(password), String(encryptKey), 64).toString('hex');
}

// For a new account or a password change: a fresh random key plus the matching hash.
function newCredentials(password) {
  const encrypt_key = crypto.randomBytes(32).toString('hex');
  return { encrypt_key, hash_key: encrypt(password, encrypt_key) };
}

function sameHex(a, b) {
  const x = Buffer.from(String(a), 'hex');
  const y = Buffer.from(String(b), 'hex');
  return x.length > 0 && x.length === y.length && crypto.timingSafeEqual(x, y);
}

// Login check: encrypt the typed password with the account's encrypt_key and compare with hash_key.
function verifyPassword(password, user) {
  if (!user || !user.encrypt_key || !user.hash_key) return false;
  return sameHex(encrypt(password, user.encrypt_key), user.hash_key);
}

// Accounts made before encrypt_key existed have "scrypt:<salt>:<hash>"; still accepted once, then upgraded on login.
function verifyLegacyPassword(password, stored) {
  const [kind, salt, hash] = String(stored || '').split(':');
  if (kind !== 'scrypt' || !salt || !hash) return false;
  return sameHex(crypto.scryptSync(String(password), salt, 64).toString('hex'), hash);
}

// Used when the login name is unknown, so a missing account costs the same time as a wrong password.
const DUMMY_USER = { encrypt_key: crypto.randomBytes(32).toString('hex'), hash_key: crypto.randomBytes(64).toString('hex') };

const MIN_PASSWORD = 8;
const LOGIN_MAX_FAILS = 5; // wrong passwords in a row before the account is locked
const LOCK_MS = 15 * 60 * 1000;

// A password change (or reset) sets session_epoch; sessions that signed in before it are no longer valid.
const sessionRevoked = (sessionUser, record) => Boolean(record && record.session_epoch && (sessionUser.loginAt || 0) < Date.parse(record.session_epoch));

// Account levels: 老板 owner (everything, including every staff member's accounts), 管理员 admin (every function, but not the owner's
// accounts) and 员工 staff (own bookings and own accounts, widened by permissions).
const ROLES = ['owner', 'admin', 'staff'];
const roleOf = (r) => (ROLES.includes(r) ? r : 'staff');

module.exports = { ROLES, roleOf, newCredentials, verifyPassword, verifyLegacyPassword, DUMMY_USER, MIN_PASSWORD, LOGIN_MAX_FAILS, LOCK_MS, sessionRevoked };
