const store = require('../services/store');
const { wrap } = require('./crm/common');
const { DEFAULT_ROOM_STAFF, clinicDay, laMinutes, roomByStaff, worksOn, hoursOnDay } = require('./crm/schedule');

// Which times a visitor can still book on the website. Public (no login), read only. For one day and one treatment it returns the
// start times at which the treatment's room is open and free, using the same rules the CRM enforces when it books:
// opening hours (and the room's own hours), days a room is closed, blocked time, the room's staff being at work, and the room's beds.
const STEP = 30; // start times every 30 minutes
const DEFAULT_OPEN = 10 * 60; // used until the CRM has opening hours saved
const DEFAULT_CLOSE = 20 * 60;
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

// 医美 treatments (the website's injectables, devices and IV drips) are all done in 医美双人房 by Yingna, so her own time decides when they can
// be booked, on top of the room. Every one is 60 minutes, except the injectables that take 30: the length is decided here, not by the
// visitor's browser. The keys are the treatment keys in webapp/data/site.js.
const MEDICAL_STAFF = 'Yingna';
const MEDICAL_ROOM = 'room2';
const MEDICAL_60 = [
  'skin-2', 'hair-2', 'injectables-5', // 水光针, PRP 生发, 铃铛童颜线: the injectables that take an hour
  'skin-1', 'skin-3', 'skin-4', 'skin-5', 'skin-7', 'acne-microneedling', 'skin-8', 'hair-3', 'body-1', 'body-2', 'wellness-1', // 仪器类
  'iv-therapy-1', 'iv-therapy-2', 'hormone-stem-cell-2', 'stem-cell', // 点滴类
]
const MEDICAL_30 = ['injectables-1', 'injectables-2', 'injectables-3', 'injectables-4', 'collagen-stimulator', 'body-3', 'wellness-2', 'hormone-stem-cell-1', 'tirzepatide'];
const MEDICAL_MINUTES = Object.fromEntries([...MEDICAL_60.map((k) => [k, 60]), ...MEDICAL_30.map((k) => [k, 30])]);
for (const k of Object.keys(MEDICAL_MINUTES)) SERVICE_ROOM[k] = MEDICAL_ROOM;

// 纹绣 (semi-permanent makeup and removal) is done in 美睫单人房, with a fixed length each (the CRM's default lengths).
const TATTOO_MINUTES = { 'brow-shaping': 45, 'personalized-makeup': 60, 'ombre-brows': 120, 'lash-line-liner': 90, 'brow-removal': 60, 'eyeliner-removal': 60 };
for (const k of Object.keys(TATTOO_MINUTES)) SERVICE_ROOM[k] = 'room3';
const FIXED_MINUTES = { ...MEDICAL_MINUTES, ...TATTOO_MINUTES };

// The people who can do a treatment (the defaults below; 设置 → 服务项目管理 overrides them per treatment, and can switch a treatment off).
// A treatment needs one of them free on top of its room: their own CRM attendance (days at work, hours, part-day rests) and their bookings in
// any room decide the times. 医美 is Yingna; 美睫 and 纹绣 are Dayu.
const SKINCARE_KEYS = ['japanese-face-correction', 'skinceuticals-cleanse-hydrate', 'rejuran-brightening', 'gua-sha', 'acne-clearing'];
const STAFF_FOR = {
  ...Object.fromEntries(SKINCARE_KEYS.map((k) => [k, 'Rina'])), // 护肤 is Rina's (美容单人房); the spa has nobody fixed
  ...Object.fromEntries(Object.keys(MEDICAL_MINUTES).map((k) => [k, MEDICAL_STAFF])),
  'classic-lashes': 'Dayu', 'hybrid-lashes': 'Dayu', 'lash-fills': 'Dayu',
  // 纹绣 has nobody fixed: its times are the window below, not Dayu's attendance (设置 → 服务项目管理 can still pick people).
};
// A treatment's own bookable window (minutes since midnight) when 设置 → 服务项目管理 has none saved: 纹绣 10:00 – 19:00.
const DEFAULT_WINDOW = Object.fromEntries(Object.keys(TATTOO_MINUTES).map((k) => [k, { startMin: 10 * 60, endMin: 19 * 60 }]));

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
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const fixed = has(FIXED_MINUTES, service);
  const staffName = has(STAFF_FOR, service) ? STAFF_FOR[service] : null; // the default person (a list saved in 设置 replaces it)
  const minutes = fixed ? FIXED_MINUTES[service] : Math.round(Number(req.query.minutes) || 60);
  const room = has(SERVICE_ROOM, service) ? SERVICE_ROOM[service] : undefined;
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
  // The opening and closing time are the ones set in the CRM (设置 → 店铺营业时间管理, or the room's own); the website follows them.
  let open = own.openMin ?? hours.openMin ?? DEFAULT_OPEN;
  let close = own.closeMin ?? hours.closeMin ?? DEFAULT_CLOSE;

  // 设置 → 服务项目管理: a treatment can be switched off (nothing to book online), and has its own list of people who can do it.
  const cfg = (((settings.find((x) => x.key === 'services') || {}).items) || {})[service] || {};
  if (cfg.open === false) return res.json({ date: day, minutes, slots: [], reason: 'service-closed' });
  const operators = Array.isArray(cfg.staff) ? cfg.staff : (staffName ? [staffName] : []); // an empty list: nobody in particular, only the room counts
  // The treatment's own bookable window narrows the room's opening hours (it can never open the room outside them).
  const window = cfg.hours || DEFAULT_WINDOW[service] || null;
  if (window) { open = Math.max(open, window.startMin); close = Math.min(close, window.endMin); }

  // Without a list of people, the room's own staff decide when it is open (the old rule); with one, the people do.
  const byStaff = operators.length || window ? null : roomByStaff(sched, room, day);
  if (byStaff && byStaff.closed) return res.json({ date: day, minutes, slots: [], reason: 'closed' });
  if ((hours.closedDays || []).some((d) => d.room === room && d.date === day)) return res.json({ date: day, minutes, slots: [], reason: 'closed' });

  // Someone from the list must be at work that day; a slot is open when at least one of them is free in it.
  const working = operators.filter((n) => worksOn(sched, n, day));
  if (operators.length && !working.length) return res.json({ date: day, minutes, slots: [], reason: 'closed' });

  const dayStart = clinicInstant(day, 0);
  const dayEnd = dayStart + 36 * 3600000;
  const blocks = (await store.list('blocks')).filter((k) => (k.room === '' || k.room === room));
  const allAppts = (await store.list('appointments')).filter((a) => ACTIVE.includes(a.status));
  const booked = allAppts.filter((a) => a.room === room && Date.parse(a.start) < dayEnd && Date.parse(a.start) + (a.durationMin || 60) * 60000 > dayStart);
  const cap = BEDS[room] || 1;
  const earliest = Date.now() + LEAD_MIN * 60000;
  const overlaps = (a, s, e) => s < Date.parse(a.start) + (a.durationMin || 60) * 60000 && Date.parse(a.start) < e;
  // Is this person free from minute m to m + minutes: inside their hours, outside a part-day rest, and not booked in any room?
  const personFree = (name, m, s, e) => {
    const person = sched && sched[name];
    const hrs = hoursOnDay(person, day);
    if (hrs && (m < hrs.startMin || m + minutes > hrs.endMin)) return false;
    const rest = person && person.restHours ? person.restHours[day] : null;
    if (rest && m < rest.endMin && rest.startMin < m + minutes) return false;
    return !allAppts.some((a) => a.staff === name && overlaps(a, s, e));
  };

  const slots = [];
  for (let m = open; m + minutes <= close; m += STEP) {
    if (byStaff && byStaff.startMin !== undefined && (m < byStaff.startMin || m + minutes > byStaff.endMin)) continue;
    const s = clinicInstant(day, m);
    const e = s + minutes * 60000;
    if (working.length && !working.some((n) => personFree(n, m, s, e))) continue;
    if (s < earliest) continue;
    if (blocks.some((k) => s < Date.parse(k.start) + k.durationMin * 60000 && Date.parse(k.start) < e)) continue;
    const used = booked.filter((a) => overlaps(a, s, e)).reduce((n, a) => n + (a.fullRoom && cap > 1 ? cap : 1), 0);
    if (used + 1 > cap) continue;
    slots.push(hhmm(m));
  }
  res.json({ date: day, minutes, slots, open: hhmm(open), close: hhmm(close), reason: slots.length ? undefined : 'full' });
});

module.exports = { getAvailability, SERVICE_ROOM, FIXED_MINUTES, STAFF_FOR, DEFAULT_WINDOW };
