const express = require('express');
const store = require('../services/store');

const router = express.Router();

const STATUSES = ['scheduled', 'completed', 'cancelled', 'no-show'];
const METHODS = ['cash', 'transfer', 'credit_card', 'other'];

const str = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const num = (v) => (v === '' || v === null || v === undefined ? NaN : Number(v));

// ---- validators: return { error } or { data } with only whitelisted fields ----

function customerInput(b) {
  const name = str(b.name, 120);
  if (!name) return { error: 'name is required' };
  const tags = Array.isArray(b.tags) ? b.tags.map((t) => str(t, 30)).filter(Boolean).slice(0, 10) : [];
  return { data: { name, phone: str(b.phone, 40), email: str(b.email, 160), wechatId: str(b.wechatId, 60), notes: str(b.notes, 2000), tags } };
}

function appointmentInput(b) {
  const start = new Date(b.start);
  if (!b.customerId || !store.get('customers', b.customerId)) return { error: 'valid customerId is required' };
  if (Number.isNaN(start.getTime())) return { error: 'valid start datetime is required' };
  const service = str(b.service, 160);
  if (!service) return { error: 'service is required' };
  const durationMin = num(b.durationMin || 60);
  const price = b.price === '' || b.price == null ? 0 : num(b.price);
  if (!Number.isFinite(durationMin) || durationMin <= 0 || durationMin > 24 * 60) return { error: 'durationMin must be 1-1440' };
  if (!Number.isFinite(price) || price < 0) return { error: 'price must be 0 or more' };
  const status = b.status || 'scheduled';
  if (!STATUSES.includes(status)) return { error: `status must be one of ${STATUSES.join(', ')}` };
  return {
    data: {
      customerId: b.customerId, service, start: start.toISOString(), durationMin, price, status,
      room: str(b.room, 30), staff: str(b.staff, 60), notes: str(b.notes, 2000),
    },
  };
}

// A room can't host two active appointments at the same time.
const ACTIVE = ['scheduled', 'completed'];
function roomConflict(data, selfId) {
  if (!data.room || !ACTIVE.includes(data.status)) return null;
  const s = new Date(data.start).getTime();
  const e = s + data.durationMin * 60000;
  const clash = store.list('appointments').find((a) => {
    if (a.id === selfId || a.room !== data.room || !ACTIVE.includes(a.status)) return false;
    const as = new Date(a.start).getTime();
    return s < as + (a.durationMin || 60) * 60000 && as < e;
  });
  if (!clash) return null;
  const who = store.get('customers', clash.customerId);
  const t = new Date(clash.start).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `该房间在 ${t} 已有预约（${who ? who.name : '未知客户'} · ${clash.service}），时间冲突`;
}

function paymentInput(b) {
  if (!b.customerId || !store.get('customers', b.customerId)) return { error: 'valid customerId is required' };
  if (b.appointmentId && !store.get('appointments', b.appointmentId)) return { error: 'unknown appointmentId' };
  const when = new Date(b.datetime);
  if (Number.isNaN(when.getTime())) return { error: 'valid datetime is required' };
  const amount = num(b.amount);
  const tipAmount = b.tipAmount === '' || b.tipAmount == null ? 0 : num(b.tipAmount);
  if (!Number.isFinite(amount) || amount < 0) return { error: 'amount must be 0 or more' };
  if (!Number.isFinite(tipAmount) || tipAmount < 0) return { error: 'tipAmount must be 0 or more' };
  if (amount + tipAmount <= 0) return { error: 'amount or tip must be greater than 0' };
  const serviceIds = Array.isArray(b.serviceIds) ? [...new Set(b.serviceIds)] : [];
  if (serviceIds.some((id) => !store.get('services', id))) return { error: 'unknown serviceIds' };
  if (!METHODS.includes(b.paymentMethod)) return { error: `paymentMethod must be one of ${METHODS.join(', ')}` };
  const cents = (n) => Math.round(n * 100) / 100;
  return {
    data: {
      appointmentId: b.appointmentId || null, customerId: b.customerId, datetime: when.toISOString(),
      serviceIds, amount: cents(amount), tipAmount: cents(tipAmount), paymentMethod: b.paymentMethod,
      referralSource: str(b.referralSource, 80), staff: str(b.staff, 60),
    },
  };
}

function serviceInput(b) {
  const name = str(b.name, 80);
  if (!name) return { error: 'name is required' };
  return { data: { name } };
}

// ---- generic CRUD wiring ----

function crud(path, collection, validate, hooks = {}) {
  router.get(path, (req, res) => res.json(store.list(collection)));

  router.get(`${path}/:id`, (req, res) => {
    const row = store.get(collection, req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });

  router.post(path, (req, res) => {
    const { error, data } = validate(req.body || {});
    if (error) return res.status(400).json({ error });
    const conflict = hooks.conflict && hooks.conflict(data, null);
    if (conflict) return res.status(409).json({ error: conflict });
    res.status(201).json(store.create(collection, data));
  });

  router.put(`${path}/:id`, (req, res) => {
    const { error, data } = validate(req.body || {});
    if (error) return res.status(400).json({ error });
    const conflict = hooks.conflict && hooks.conflict(data, req.params.id);
    if (conflict) return res.status(409).json({ error: conflict });
    const row = store.update(collection, req.params.id, data);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });

  router.delete(`${path}/:id`, (req, res) => {
    if (hooks.beforeDelete) {
      const blocked = hooks.beforeDelete(req.params.id);
      if (blocked) return res.status(409).json({ error: blocked });
    }
    if (!store.remove(collection, req.params.id)) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  });
}

crud('/customers', 'customers', customerInput, {
  beforeDelete(id) {
    const n = store.list('appointments').filter((a) => a.customerId === id).length;
    return n ? `Customer has ${n} appointment(s). Delete or reassign them first.` : null;
  },
});
crud('/appointments', 'appointments', appointmentInput, { conflict: roomConflict });
crud('/payments', 'payments', paymentInput);
crud('/services', 'services', serviceInput, {
  conflict(data, selfId) {
    const dup = store.list('services').find((x) => x.id !== selfId && x.name === data.name);
    return dup ? 'A service with this name already exists' : null;
  },
  beforeDelete(id) {
    const n = store.list('payments').filter((p) => p.serviceIds.includes(id)).length;
    return n ? `Service is used by ${n} payment(s) and can't be deleted.` : null;
  },
});

// ---- dashboard summary ----

router.get('/summary', (req, res) => {
  const now = new Date();
  const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay); endOfDay.setDate(endOfDay.getDate() + 1);
  const weekAhead = new Date(startOfDay); weekAhead.setDate(weekAhead.getDate() + 8);
  const pad = (n) => String(n).padStart(2, '0');
  const dateKey = (iso) => { const d = new Date(iso); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const monthKey = (d) => d.slice(0, 7);
  const thisMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

  const appts = store.list('appointments');

  const inRange = (a, from, to) => { const s = new Date(a.start); return s >= from && s < to; };
  const today = appts.filter((a) => a.status !== 'cancelled' && inRange(a, startOfDay, endOfDay));
  const upcoming = appts
    .filter((a) => a.status === 'scheduled' && inRange(a, endOfDay, weekAhead))
    .sort((a, b) => a.start.localeCompare(b.start));

  const sum = (rows, key) => rows.reduce((t, p) => t + p[key], 0);
  const payments = store.list('payments');
  const inMonth = (p, key) => monthKey(dateKey(p.datetime)) === key;
  const month = payments.filter((p) => inMonth(p, thisMonth));

  // last 6 months, oldest first
  const months = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const rows = payments.filter((p) => inMonth(p, key));
    months.push({ month: key, revenue: sum(rows, 'amount'), tips: sum(rows, 'tipAmount') });
  }

  res.json({
    customers: store.list('customers').length,
    today: today.sort((a, b) => a.start.localeCompare(b.start)),
    upcoming,
    month: { revenue: sum(month, 'amount'), tips: sum(month, 'tipAmount'), count: month.length },
    months,
  });
});

module.exports = router;
