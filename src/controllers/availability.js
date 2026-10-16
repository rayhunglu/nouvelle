const store = require('../services/store');
const { wrap } = require('./crm/common');
const { DEFAULT_ROOM_STAFF, clinicDay, laMinutes, roomByStaff } = require('./crm/schedule');

// Which times a visitor can still book on the website. Public (no login), read only. For one day and one treatment it returns the
// start times at which the treatment's room is open and free, using the same rules the CRM enforces when it books:
// opening hours (and the room's own hours), days a room is closed, blocked time, the room's staff being at work, and the room's beds.
const STEP = 30; // start times every 30 minutes
const PUBLIC_OPEN = 10 * 60; // the website's advertised hours: 10:00 – 19:00
const PUBLIC_CLOSE = 19 * 60;
const LEAD_MIN = 120; // not bookable online less than two hours ahead
const MAX_DAYS_AHEAD = 90;
const BEDS = { room2: 2, room4: 2 };
const ACTIVE = ['scheduled', 'checked-in', 'in-service', 'completed'];
// Website treatment -> the room it is done in (same as the CRM's room rules).
const SERVICE_ROOM = {
  'japanese-face-correction': 'room1',
  'skinceuticals-cleanse-hydrate': 'room1',
  'rejuran-brightening': 'room1',
  'gua-sha': 'room1',
  'acne-clearing': 'room1',
  'classic-lashes': 'room3',
  'hybrid-lashes': 'room3',
  'lash-fills': 'room3',
  'body-spa': 'room4',
  'head-spa': 'room4',
};

// The instant (ms) at which the clinic's wall clock (America/Los_Angeles) shows `min` minutes after midnight on `day`.
function clinicInstant(day, min) {
  const [y, m, d] = day.split('-').map(Number);
  let t = Date.UTC(y, m - 1, d, Math.floor(min / 60), min % 60) + 8 * 3600000; // start from PST and correct (PDT, day changes)
  for (let i = 0; i < 3; i += 1) {
    const shownDay = clinicDay(new Date(t));
    const dayDiff = (Date.parse(`${day}T00:00:00Z`) - Date.parse(`${shownDay}T00:00:00Z`)) / 60000;
    const diff = dayDiff + min - laMinutes(new Date(t));
    if (!diff) break;
    t += diff * 60000;
  }
  return t;
}

const pad = (n) => String(n).padStart(2, '0');
const hhmm = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

const getAvailability = wrap(async (req, res) => {
  const day = String(req.query.date || '');
  const service = String(req.query.service || '');
  const minutes = Math.round(Number(req.query.minutes) || 60);
  const room = SERVICE_ROOM[service];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(Date.parse(`${day}T00:00:00Z`))) return res.status(400).json({ error: 'invalid date' });
  if (!room) return res.status(400).json({ error: 'unknown service' });
  if (minutes < 15 || minutes > 480) return res.status(400).json({ error: 'invalid length' });

  const today = clinicDay(new Date());
  if (day < today || Date.parse(`${day}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`) > MAX_DAYS_AHEAD * 86400000) {
    return res.json({ date: day, minutes, slots: [], reason: day < today ? 'past' : 'far' });
  }

  const settings = await store.list('settings');
  const hours = settings.find((x) => x.key === 'hours') || {};
  const sched = (settings.find((x) => x.key === 'schedule') || {}).staff;
  const own = (hours.rooms && hours.rooms[room]) || {};
  const open = Math.max(PUBLIC_OPEN, own.openMin ?? hours.openMin ?? PUBLIC_OPEN);
  const close = Math.min(PUBLIC_CLOSE, own.closeMin ?? hours.closeMin ?? PUBLIC_CLOSE);

  // The room's people at work that day: closed, or only staffed for part of it.
  const byStaff = roomByStaff(sched, room, day);
  if (byStaff && byStaff.closed) return res.json({ date: day, minutes, slots: [], reason: 'closed' });
  if ((hours.closedDays || []).some((d) => d.room === room && d.date === day)) return res.json({ date: day, minutes, slots: [], reason: 'closed' });

  const dayStart = clinicInstant(day, 0);
  const dayEnd = dayStart + 36 * 3600000;
  const blocks = (await store.list('blocks')).filter((k) => (k.room === '' || k.room === room));
  const booked = (await store.list('appointments')).filter((a) => a.room === room && ACTIVE.includes(a.status) && Date.parse(a.start) < dayEnd && Date.parse(a.start) + (a.durationMin || 60) * 60000 > dayStart);
  const cap = BEDS[room] || 1;
  const earliest = Date.now() + LEAD_MIN * 60000;

  const slots = [];
  for (let m = open; m + minutes <= close; m += STEP) {
    if (byStaff && byStaff.startMin !== undefined && (m < byStaff.startMin || m + minutes > byStaff.endMin)) continue;
    const s = clinicInstant(day, m);
    const e = s + minutes * 60000;
    if (s < earliest) continue;
    if (blocks.some((k) => s < Date.parse(k.start) + k.durationMin * 60000 && Date.parse(k.start) < e)) continue;
    const used = booked
      .filter((a) => s < Date.parse(a.start) + (a.durationMin || 60) * 60000 && Date.parse(a.start) < e)
      .reduce((n, a) => n + (a.fullRoom && cap > 1 ? cap : 1), 0);
    if (used + 1 > cap) continue;
    slots.push(hhmm(m));
  }
  res.json({ date: day, minutes, slots, reason: slots.length ? undefined : 'full' });
});

module.exports = { getAvailability, SERVICE_ROOM };
