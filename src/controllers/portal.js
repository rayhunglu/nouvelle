// The customer portal: a customer joins or signs in with their email and a one-time code (mailed, valid 10 minutes), then sees their own
// member card balance and visit history. It is kept apart from the CRM on purpose: a signed-in customer is `session.portal = { customerId }`,
// never `session.user`, so none of the CRM routes (which need session.user) open for them, and every answer here is built from that one customer id.
// Whoever can read the mailbox may use the customer record that carries that email, so records are matched by email only (a phone number typed
// into a form proves nothing).
const crypto = require('crypto');
const store = require('../services/store');
const mailer = require('../services/mailer');
const { toE164 } = require('../services/phone');
const { cardBalance } = require('./crm/payments');
const { str } = require('./crm/common');
const { cleanIntake, cleanQuestionnaire } = require('../services/intake');

const MONTH = 30 * 24 * 3600 * 1000;
const CODE_MS = 10 * 60 * 1000; // how long a code is good for
const RESEND_MS = 60 * 1000; // wait between two codes
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OK_SENT = { ok: true, message: 'If this email can sign in, a code has been sent.' };

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const emailOf = (v) => str(v, 160).toLowerCase();
const customerByEmail = async (email) => (await store.list('customers')).find((c) => String(c.email || '').trim().toLowerCase() === email) || null;

// Codes mailed per address: at most 5 an hour (on top of the per-IP limit on the routes), so nobody can use us to flood an inbox.
const sent = new Map();
const recentSends = (email) => {
  const e = sent.get(email);
  if (!e || Date.now() - e.first > 3600000) { sent.delete(email); return 0; }
  return e.count;
};
function recordSend(email) {
  if (sent.size > 5000) for (const [k, v] of sent) if (Date.now() - v.first > 3600000) sent.delete(k);
  const e = sent.get(email);
  if (e && Date.now() - e.first <= 3600000) e.count += 1;
  else sent.set(email, { first: Date.now(), count: 1 });
}

const hashCode = (code, salt) => crypto.createHash('sha256').update(`${salt}:${code}`).digest('hex');

// Mails a fresh code and remembers (in the server-side session, never in the browser) a hash of it and what it is for.
async function sendCode(req, res, email, join) {
  const prev = req.session.portalPending;
  if (prev && prev.email === email && Date.now() - prev.at < RESEND_MS) return res.status(429).json({ error: 'Please wait a minute before asking for another code.' });
  if (recentSends(email) >= 5) return res.status(429).json({ error: 'Too many codes for this email. Try again later.' });
  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  const result = await mailer.sendLoginCode({ to: email, code });
  if (result !== 'sent' && result !== 'dry-run') return res.status(502).json({ error: 'Could not send the code' });
  recordSend(email);
  const salt = crypto.randomBytes(8).toString('hex');
  req.session.portalPending = { email, salt, hash: hashCode(code, salt), join: join || null, at: Date.now(), tries: 0 };
  return res.json(OK_SENT);
}

const need = (res, cond, error, field) => (cond ? false : (res.status(400).json({ error, field }), true));

// Sign in: an email that is not a customer gets the same answer but no mail is sent (nothing reveals who is a customer).
const loginStart = wrap(async (req, res) => {
  const email = emailOf((req.body || {}).email);
  if (need(res, EMAIL.test(email), 'Enter a valid email', 'email')) return;
  if (!(await customerByEmail(email))) {
    req.session.portalPending = { email, none: true, at: Date.now(), tries: 0 };
    return res.json(OK_SENT);
  }
  return sendCode(req, res, email, null);
});

// Join as a member: name, phone and email (WeChat name and Instagram optional). The record is made once the emailed code is right.
const register = wrap(async (req, res) => {
  const b = req.body || {};
  const name = str(b.name, 120);
  const email = emailOf(b.email);
  if (need(res, name, 'Name is required', 'name') || need(res, toE164(b.phone), 'Enter a valid phone number', 'phone')
    || need(res, EMAIL.test(email), 'Enter a valid email', 'email') || need(res, b.agree === true, 'Please agree to receive the verification email', 'agree')) return;
  return sendCode(req, res, email, { name, email, legalName: name, phone: str(b.phone, 40), wechatId: str(b.wechatId, 60), instagramId: str(b.instagramId, 60).replace(/^@+/, '') });
});

// The information form (信息填写): the details and health questionnaires, then the same emailed code.
const join = wrap(async (req, res) => {
  const b = req.body || {};
  const name = str(b.legalName, 120) || str(b.name, 120);
  const email = emailOf(b.email);
  const { error: intakeError, fields } = cleanIntake(b);
  if (need(res, name, 'Full legal name is required', 'legalName') || need(res, b.dob && !intakeError, 'Enter your date of birth', 'dob')
    || need(res, toE164(b.phone), 'Enter a valid phone number', 'phone') || need(res, EMAIL.test(email), 'Enter a valid email', 'email')
    || need(res, fields.emergencyName, 'Emergency contact name is required', 'emergencyName') || need(res, fields.emergencyPhone, 'Emergency contact phone is required', 'emergencyPhone')
    || need(res, b.agree === true, 'Please agree to receive the verification email', 'agree')) return;
  return sendCode(req, res, email, {
    name, email, phone: str(b.phone, 40), wechatId: str(b.wechatId, 60), instagramId: str(b.instagramId, 60).replace(/^@+/, ''),
    legalName: name, dob: fields.dob, emergencyName: fields.emergencyName, emergencyPhone: fields.emergencyPhone, heardFrom: fields.heardFrom || '',
    questionnaire: cleanQuestionnaire(b.questionnaire),
  });
});

// Finds the customer for a verified email (or, after a sign-up, makes them) and signs them in. Returns the customer, or null when there is none.
async function completeSignIn(req, email, join_) {
  const now = new Date().toISOString();
  let customer = await customerByEmail(email);
  if (customer) {
    // Details typed at sign-up only fill blanks; the shop's own record is never overwritten.
    const j = join_ || {};
    const fill = {};
    for (const k of ['phone', 'wechatId', 'instagramId', 'legalName', 'dob', 'emergencyName', 'emergencyPhone', 'heardFrom']) if (j[k] && !customer[k]) fill[k] = j[k];
    if (j.questionnaire && !customer.questionnaire) fill.questionnaire = j.questionnaire;
    customer = (await store.update('customers', customer.id, { ...fill, emailVerifiedAt: now, joinedAt: customer.joinedAt || now, portalEnabled: true, ...(join_ ? { consentPortalAt: now } : {}) })) || customer;
  } else if (join_) {
    const j = join_;
    customer = await store.create('customers', { name: j.name, legalName: j.legalName, dob: j.dob, emergencyName: j.emergencyName, emergencyPhone: j.emergencyPhone, questionnaire: j.questionnaire || undefined, phone: j.phone, email, wechatId: j.wechatId, instagramId: j.instagramId, heardFrom: j.heardFrom || '会员注册 Member sign-up', emailVerifiedAt: now, joinedAt: now, portalEnabled: true, consentPortalAt: now, createdBy: 'portal' });
  } else return null;
  // A fresh session (no old login carries over), kept for 30 days.
  await new Promise((resolve, reject) => req.session.regenerate((err) => (err ? reject(err) : resolve())));
  req.session.portal = { customerId: customer.id };
  req.session.cookie.maxAge = MONTH;
  return customer;
}

// The code: on success the customer is found (or, after a sign-up, made) and signed in. Five wrong tries and the code is void.
const loginVerify = wrap(async (req, res) => {
  const pending = req.session.portalPending;
  const code = String((req.body || {}).code || '').replace(/\D/g, '');
  const bad = () => res.status(401).json({ error: 'That code did not work. Check it and try again.' });
  if (!pending || Date.now() - pending.at > CODE_MS) return res.status(401).json({ error: 'The code expired. Start again.' });
  if (pending.tries >= 5) return res.status(429).json({ error: 'Too many wrong codes. Start again.' });
  pending.tries += 1;
  const right = !pending.none && code.length === 6 && crypto.timingSafeEqual(Buffer.from(hashCode(code, pending.salt)), Buffer.from(pending.hash));
  if (!right || !(await completeSignIn(req, pending.email, pending.join))) return bad();
  return res.json({ ok: true });
});

const logout = (req, res) => {
  req.session.destroy(() => { res.clearCookie('nouvelle.sid'); res.json({ ok: true }); });
};

// Guard for the routes below: a signed-in customer, and a customer that still exists.
const requirePortal = wrap(async (req, res, next) => {
  const id = req.session && req.session.portal && req.session.portal.customerId;
  const customer = id ? await store.get('customers', id) : null;
  if (!customer) return res.status(401).json({ error: 'Please sign in' });
  req.customer = customer;
  next();
});

const CASH_GIFTS = new Set(['cash200', 'cash300']);
const giftItems = (payments) => {
  const m = {};
  for (const p of payments) {
    for (const g of p.topUpGifts || []) if (!CASH_GIFTS.has(g)) m[g] = (m[g] || 0) + 1;
    if (p.giftUsed) m[p.giftUsed] = (m[p.giftUsed] || 0) - 1;
  }
  return Object.entries(m).filter(([, n]) => n > 0).map(([id, count]) => ({ id, count }));
};

const profileOf = (c) => ({ name: c.name, email: c.email || '', phone: c.phone || '', wechatId: c.wechatId || '', instagramId: c.instagramId || '' });

// Name, contact details, member card balance and the free sessions still left.
const me = wrap(async (req, res) => {
  const mine = (await store.list('payments')).filter((p) => p.customerId === req.customer.id);
  res.json({ ...profileOf(req.customer), balance: Math.round(cardBalance(mine, req.customer.id) * 100) / 100, gifts: giftItems(mine) });
});

// The customer's own visits and what they paid, newest first, plus bookings still ahead. Nothing about staff, commissions or notes.
const history = wrap(async (req, res) => {
  const id = req.customer.id;
  const appts = (await store.list('appointments')).filter((a) => a.customerId === id && a.status !== 'cancelled');
  const apptById = new Map(appts.map((a) => [a.id, a]));
  const visits = (await store.list('payments')).filter((p) => p.customerId === id)
    .sort((a, b) => String(b.datetime).localeCompare(String(a.datetime)))
    .map((p) => ({
      id: p.id,
      date: p.datetime,
      service: p.serviceName || (apptById.get(p.appointmentId) || {}).service || (p.topUp > 0 ? '会员卡充值 Card top-up' : ''),
      amount: p.paymentMethod === 'unsettled' ? 0 : p.amount || 0,
      method: p.paymentMethod,
      topUp: p.topUp || 0,
      unsettled: p.paymentMethod === 'unsettled',
    }));
  const upcoming = appts.filter((a) => new Date(a.start).getTime() >= Date.now() && a.status !== 'completed' && a.status !== 'no-show')
    .sort((a, b) => String(a.start).localeCompare(String(b.start))).map((a) => ({ id: a.id, start: a.start, service: a.service }));
  res.json({ visits, upcoming });
});

// The customer may change their own name, WeChat and Instagram. The email is their sign-in, so it is not editable here (that would need a new verification).
const updateMe = wrap(async (req, res) => {
  const b = req.body || {};
  const patch = {};
  if ('name' in b) { patch.name = str(b.name, 120); if (!patch.name) return res.status(400).json({ error: 'Name is required' }); }
  if ('wechatId' in b) patch.wechatId = str(b.wechatId, 60);
  if ('instagramId' in b) patch.instagramId = str(b.instagramId, 60).replace(/^@+/, '');
  const row = await store.update('customers', req.customer.id, patch);
  res.json(profileOf(row || req.customer));
});

module.exports = { join, register, loginStart, loginVerify, logout, requirePortal, me, history, updateMe };
