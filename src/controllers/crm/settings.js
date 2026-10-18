const store = require('../../services/store');
const { wrap, ROOM_IDS, num } = require('./common');

// ---- opening hours: the grey, non-business stretches of the calendar (everyone reads them, the manager sets them) ----
// One opening / closing time for the whole clinic, which any single room can override ("rooms": { room2: { openMin, closeMin } }).

const DEFAULT_HOURS = { openMin: 10 * 60, closeMin: 20 * 60 };
const hoursRow = async () => (await store.list('settings')).find((x) => x.key === 'hours');
const hoursOut = (row) => ({
  openMin: row ? row.openMin : DEFAULT_HOURS.openMin,
  closeMin: row ? row.closeMin : DEFAULT_HOURS.closeMin,
  rooms: (row && row.rooms) || {},
  closedDays: (row && row.closedDays) || [], // a room switched off for one day: { room, date: 'YYYY-MM-DD', from, to }
});

const getSettings = wrap(async (req, res) => res.json(hoursOut(await hoursRow())));

// Body: { all: { openMin | closeMin } } sets the clinic-wide time and clears every room's own value for it;
//       { room: 'room2', openMin | closeMin } changes that room only; { room: 'room2', reset: true } makes it follow the clinic again;
//       { closed: { room, date, from, to, value } } closes / opens a room for that one day;
//       { closedBatch: { rooms, days: [{ date, from, to }], value } } the same for several rooms and days at once.
const putSettings = wrap(async (req, res) => {
  const b = req.body || {};
  const row = await hoursRow();
  const cur = hoursOut(row);
  const next = { openMin: cur.openMin, closeMin: cur.closeMin, rooms: JSON.parse(JSON.stringify(cur.rooms)), closedDays: [...cur.closedDays] };
  const ok = (m) => Number.isInteger(m) && m >= 0 && m <= 24 * 60 && m % 15 === 0;
  const keys = ['openMin', 'closeMin'];
  if (b.closedBatch) {
    // { closedBatch: { rooms: [ids], days: [{ date, from, to }], value } }: close / reopen several rooms for several days at once
    // (the month calendar's drag selection).
    const cb = b.closedBatch;
    const rooms = Array.isArray(cb.rooms) ? [...new Set(cb.rooms)].filter((r) => ROOM_IDS.includes(r)) : [];
    const days = Array.isArray(cb.days) ? cb.days.slice(0, 93) : [];
    if (!rooms.length || !days.length) return res.status(400).json({ error: 'pick at least one room and one day' });
    const clean = [];
    for (const d of days) {
      const from = new Date(d && d.from);
      const to = new Date(d && d.to);
      if (!/^\d{4}-\d{2}-\d{2}$/.test((d && d.date) || '') || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from || to - from > 26 * 3600000) return res.status(400).json({ error: 'invalid day' });
      clean.push({ date: d.date, from: from.toISOString(), to: to.toISOString() });
    }
    next.closedDays = next.closedDays.filter((x) => !(rooms.includes(x.room) && clean.some((c) => c.date === x.date)));
    if (cb.value === true) for (const room of rooms) for (const c of clean) next.closedDays.push({ room, ...c });
  } else if (b.closed) {
    // { closed: { room, date, from, to, value } }: close or reopen one room for one day. `from` / `to` are the start and end of
    // that day in the clinic's own time zone (sent by the calendar), so the check works wherever the server runs.
    const c = b.closed;
    const from = new Date(c.from);
    const to = new Date(c.to);
    if (!ROOM_IDS.includes(c.room) || !/^\d{4}-\d{2}-\d{2}$/.test(c.date || '') || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from || to - from > 26 * 3600000) {
      return res.status(400).json({ error: 'invalid room or day' });
    }
    next.closedDays = next.closedDays.filter((d) => !(d.room === c.room && d.date === c.date));
    if (c.value === true) next.closedDays.push({ room: c.room, date: c.date, from: from.toISOString(), to: to.toISOString() });
  } else if (b.all) {
    for (const k of keys) {
      if (!(k in b.all)) continue;
      const v = num(b.all[k]);
      if (!ok(v)) return res.status(400).json({ error: '营业时间需按 15 分钟取整' });
      next[k] = v;
      for (const id of Object.keys(next.rooms)) { delete next.rooms[id][k]; if (!Object.keys(next.rooms[id]).length) delete next.rooms[id]; }
    }
  } else if (b.room && b.reset === true) {
    // { room, reset: true }: the room goes back to following the clinic-wide time.
    if (!ROOM_IDS.includes(b.room)) return res.status(400).json({ error: 'unknown room' });
    delete next.rooms[b.room];
  } else if (b.room) {
    if (!ROOM_IDS.includes(b.room)) return res.status(400).json({ error: 'unknown room' });
    next.rooms[b.room] = next.rooms[b.room] || {};
    for (const k of keys) {
      if (!(k in b)) continue;
      const v = num(b[k]);
      if (!ok(v)) return res.status(400).json({ error: '营业时间需按 15 分钟取整' });
      next.rooms[b.room][k] = v;
    }
  } else {
    // Legacy shape: the clinic-wide pair.
    for (const k of keys) { if (k in b) { const v = num(b[k]); if (!ok(v)) return res.status(400).json({ error: '营业时间需按 15 分钟取整' }); next[k] = v; } }
  }
  for (const id of ['', ...ROOM_IDS]) {
    const o = id ? next.rooms[id] || {} : {};
    const open = o.openMin ?? next.openMin;
    const close = o.closeMin ?? next.closeMin;
    if (close - open < 60) return res.status(400).json({ error: '每个房间至少要营业 1 小时，且开始早于结束' });
  }
  if (row) await store.update('settings', row.id, next);
  else await store.create('settings', { key: 'hours', ...next });
  res.json(next);
});

module.exports = { hoursRow, getSettings, putSettings };
