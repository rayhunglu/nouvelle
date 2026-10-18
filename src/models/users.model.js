const dbClient = require('../lib/dbClient');
const { validateInput, PATTERN } = require('../lib/validate');
const { compact, newRecord, validId } = require('./util');

// Staff logins (操作师). Passwords are stored hashed (see services/users.js).
const COLLECTION = 'users';

async function getUser(id) {
  try {
    if (!validId(id)) return null;
    return await dbClient.findOne(COLLECTION, { id });
  } catch (err) {
    console.error('[users.model] getUser failed:', err.message);
    throw err;
  }
}

async function getUsers() {
  try {
    return await dbClient.findMany(COLLECTION, {}, { sort: { createdAt: 1 } });
  } catch (err) {
    console.error('[users.model] getUsers failed:', err.message);
    throw err;
  }
}

// Login names are matched case-insensitively.
async function getUserByUsername(username) {
  try {
    const error = validateInput({ username }, { username: { required: true, type: 'string', nonEmpty: true, max: 30 } });
    if (error) throw error;
    const wanted = username.trim().toLowerCase();
    return (await getUsers()).find((u) => String(u.username).toLowerCase() === wanted) || null;
  } catch (err) {
    console.error('[users.model] getUserByUsername failed:', err.message);
    throw err;
  }
}

// A new account always has every one of these.
async function createUser(input) {
  try {
    const error = validateInput(input, {
      username: { required: true, type: 'string', nonEmpty: true, min: 3, max: 30 },
      encrypt_key: { required: true, type: 'string', nonEmpty: true },
      hash_key: { required: true, type: 'string', nonEmpty: true },
      role: { required: true, type: 'string', enum: ['owner', 'admin', 'staff'] },
      email: { required: true, type: 'string', nonEmpty: true, max: 160, pattern: PATTERN.email },
      reset_token: { required: true, type: 'string' }, // '' when no link is pending
      reset_expires: { required: true, type: 'string' },
      session_epoch: { required: true, type: 'string' }, // '' until the password is first changed
      login_fails: { required: true, type: 'number', integer: true, min: 0 },
      login_locked_until: { required: true, type: 'string' }, // '' when not locked
      staffName: { required: true, type: 'string', nonEmpty: true, max: 60 },
      displayName: { required: true, type: 'string', max: 60 },
      active: { required: true, type: 'boolean' },
      permissions: { required: true, type: 'object' },
    });
    if (error) throw error;
    const query = newRecord({
      username: input.username,
      encrypt_key: input.encrypt_key,
      hash_key: input.hash_key,
      role: input.role,
      email: input.email,
      reset_token: input.reset_token,
      reset_expires: input.reset_expires,
      session_epoch: input.session_epoch,
      login_fails: input.login_fails,
      login_locked_until: input.login_locked_until,
      staffName: input.staffName,
      displayName: input.displayName,
      active: input.active,
      permissions: input.permissions,
    });
    await dbClient.insertOne(COLLECTION, query);
    return query;
  } catch (err) {
    console.error('[users.model] createUser failed:', err.message);
    throw err;
  }
}

// Edits send only what changed (a new password, a toggle, new permissions...). The login name never changes.
async function updateUser(id, input) {
  try {
    if (!validId(id)) return null;
    const error = validateInput(input, {
      encrypt_key: { type: 'string', nonEmpty: true },
      hash_key: { type: 'string', nonEmpty: true },
      role: { type: 'string', enum: ['owner', 'admin', 'staff'] },
      email: { type: 'string', nonEmpty: true, max: 160, pattern: PATTERN.email },
      reset_token: { type: 'string' },
      reset_expires: { type: 'string' },
      session_epoch: { type: 'string' },
      login_fails: { type: 'number', integer: true, min: 0 },
      login_locked_until: { type: 'string' },
      staffName: { type: 'string', nonEmpty: true, max: 60 },
      displayName: { type: 'string', max: 60 },
      active: { type: 'boolean' },
      permissions: { type: 'object' },
    });
    if (error) throw error;
    const query = compact({
      encrypt_key: input.encrypt_key,
      hash_key: input.hash_key,
      role: input.role,
      email: input.email,
      reset_token: input.reset_token,
      reset_expires: input.reset_expires,
      session_epoch: input.session_epoch,
      login_fails: input.login_fails,
      login_locked_until: input.login_locked_until,
      staffName: input.staffName,
      displayName: input.displayName,
      active: input.active,
      permissions: input.permissions,
    });
    return await dbClient.findOneAndUpdate(COLLECTION, { id }, { ...query, id, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[users.model] updateUser failed:', err.message);
    throw err;
  }
}

async function deleteUser(id) {
  try {
    if (!validId(id)) return false;
    return (await dbClient.deleteOne(COLLECTION, { id })) > 0;
  } catch (err) {
    console.error('[users.model] deleteUser failed:', err.message);
    throw err;
  }
}

module.exports = {
  COLLECTION,
  getUser,
  getUsers,
  getUserByUsername,
  createUser,
  updateUser,
  deleteUser,
  get: getUser,
  list: getUsers,
  create: createUser,
  update: updateUser,
  remove: deleteUser,
};
