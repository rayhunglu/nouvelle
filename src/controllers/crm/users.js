const store = require('../../services/store');
const crypto = require('crypto');
const { newCredentials, MIN_PASSWORD } = require('../../services/users');
const mailer = require('../../services/mailer');
const { SET_HOURS, newToken, linkFor } = require('../../services/passwordReset');
const { PATTERN } = require('../../lib/validate');
const { wrap, str } = require('./common');
const { cleanPerms } = require('../../middleware/crmAccess');

// Staff accounts (store manager only).
const ADMIN_NAME = (process.env.CRM_ADMIN_USER || '').toLowerCase(); // '' when the built-in admin is off
const publicUser = ({ passwordHash, encrypt_key, hash_key, reset_token, reset_expires, session_epoch, login_fails, login_locked_until, ...rest }) => ({ ...rest, pendingPassword: !!reset_token && new Date(reset_expires).getTime() > Date.now(), permissions: cleanPerms(rest.permissions) });

const list = wrap(async (req, res) => res.json((await store.list('users')).map(publicUser)));

// The manager no longer picks a password: the new person gets an email with a link to set their own.
const create = wrap(async (req, res) => {
  const b = req.body || {};
  const username = str(b.username, 30);
  const staffName = str(b.staffName, 60);
  const email = str(b.email, 160);
  if (!/^[A-Za-z0-9_.-]{3,30}$/.test(username)) return res.status(400).json({ error: '登录名需 3-30 位，只能用字母、数字、_ . -' });
  if (!PATTERN.email.test(email)) return res.status(400).json({ error: '请填写正确的邮箱，设置密码的链接会寄到这里' });
  if (!staffName) return res.status(400).json({ error: '请选择员工' });
  const taken = (ADMIN_NAME && username.toLowerCase() === ADMIN_NAME) || (await store.list('users')).some((u) => u.username.toLowerCase() === username.toLowerCase());
  if (taken) return res.status(409).json({ error: '这个登录名已被使用' });
  const link = newToken(SET_HOURS);
  // Until the link is used the account has a random password nobody knows.
  const row = await store.create('users', {
    username, role: b.role === 'admin' ? 'admin' : 'staff', ...newCredentials(crypto.randomBytes(32).toString('hex')), email, reset_token: link.reset_token, reset_expires: link.reset_expires, session_epoch: '', login_fails: 0, login_locked_until: '',
    staffName, displayName: str(b.displayName, 60) || staffName, active: true, permissions: cleanPerms(b.permissions),
  });
  const mail = await mailer.sendPasswordLink({ to: email, name: row.displayName, link: linkFor(req, link.token), kind: 'new' });
  res.status(201).json({ ...publicUser(row), mail });
});

const update = wrap(async (req, res) => {
  const b = req.body || {};
  const patch = {};
  const target = await store.get('users', req.params.id);
  if (!target) return res.status(404).json({ error: 'Not found' });
  // Nobody can lock themselves out by demoting or disabling their own account.
  const self = target.username === req.session.user.username;
  if (self && (('role' in b && b.role !== 'admin' && target.role === 'admin') || b.active === false)) return res.status(400).json({ error: '不能降级或停用自己的账号' });
  if ('role' in b) patch.role = b.role === 'admin' ? 'admin' : 'staff';
  if ('staffName' in b) { patch.staffName = str(b.staffName, 60); if (!patch.staffName) return res.status(400).json({ error: '请选择员工' }); }
  if ('displayName' in b) patch.displayName = str(b.displayName, 60);
  if ('permissions' in b) patch.permissions = cleanPerms(b.permissions);
  if ('email' in b) {
    patch.email = str(b.email, 160);
    if (!PATTERN.email.test(patch.email)) return res.status(400).json({ error: '邮箱格式不对' });
  }
  // "Send the set-password email again": a fresh 24 hour link to the account's address.
  let link = null;
  if (b.sendLink === true) {
    const current = await store.get('users', req.params.id);
    const to = patch.email || (current && current.email);
    if (!current) return res.status(404).json({ error: 'Not found' });
    if (!to) return res.status(400).json({ error: '这个账号还没有邮箱，请先填写' });
    link = newToken(SET_HOURS);
    patch.reset_token = link.reset_token;
    patch.reset_expires = link.reset_expires;
  }
  if ('active' in b) patch.active = b.active === true;
  if (typeof b.password === 'string' && b.password) {
    if (b.password.length < MIN_PASSWORD) return res.status(400).json({ error: `密码至少 ${MIN_PASSWORD} 位` });
    // The new password signs that person out everywhere, and clears any lock.
    Object.assign(patch, newCredentials(b.password), { reset_token: '', reset_expires: '', session_epoch: new Date().toISOString(), login_fails: 0, login_locked_until: '' });
  }
  const row = await store.update('users', req.params.id, patch);
  if (!row) return res.status(404).json({ error: 'Not found' });
  const mail = link ? await mailer.sendPasswordLink({ to: row.email, name: row.displayName, link: linkFor(req, link.token), kind: 'new' }) : undefined;
  res.json({ ...publicUser(row), ...(mail ? { mail } : {}) });
});

const remove = wrap(async (req, res) => {
  const target = await store.get('users', req.params.id);
  if (target && target.username === req.session.user.username) return res.status(400).json({ error: '不能删除自己的账号' });
  if (!(await store.remove('users', req.params.id))) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

module.exports = { list, create, update, remove };
