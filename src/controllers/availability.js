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
  'body-peel': 'room4', // 日式身体焕白: also a spa treatment (see ROOMS_FOR), nobody fixed
  'lymph-gua-sha': 'room4', // 淋巴刮痧: a spa treatment too (see ROOMS_FOR), nobody fixed
  'back-cupping': 'room4', // 背部拔罐 is a spa treatment (头疗双人房 or 美容单人房, see ROOMS_FOR)
};
// Treatments that can be done in more than one room: a slot is open when any of these rooms is.
const ROOMS_FOR = { 'back-cupping': ['room4', 'room1'], 'body-peel': ['room4', 'room1'], 'lymph-gua-sha': ['room4', 'room1'] };

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
const MEDICAL_30 = ['injectables-1', 'injectables-2', 'injectables-3', 'injectables-4', 'collagen-stimulator', 'collagen-filler', 'body-3', 'wellness-2', 'hormone-stem-cell-1', 'tirzepatide'];
const MEDICAL_MINUTES = Object.fromEntries([...MEDICAL_60.map((k) => [k, 60]), ...MEDICAL_30.map((k) => [k, 30])]);
for (const k of Object.keys(MEDICAL_MINUTES)) SERVICE_ROOM[k] = MEDICAL_ROOM;

// 纹绣 (semi-permanent makeup and removal) takes no room and has nobody fixed: the visitor just picks a day and a time inside the shop's
// opening hours (设置 → 店铺营业时间管理). Each has a fixed length (the CRM's default lengths).
const TATTOO_MINUTES = { 'brow-shaping': 45, 'personalized-makeup': 60, 'ombre-brows': 120, 'lash-line-liner': 90, 'brow-removal': 60, 'eyeliner-removal': 60 };
const FIXED_MINUTES = { ...MEDICAL_MINUTES, ...TATTOO_MINUTES };

// The people who can do a treatment (the defaults below; 设置 → 服务项目管理 overrides them per treatment, and can switch a treatment off).
// A treatment needs one of them free on top of its room: their own CRM attendance (days at work, hours, part-day rests) and their bookings in
// any room decide the times. 医美 is Yingna; 美睫 and 纹绣 are Dayu.
const SKINCARE_KEYS = ['japanese-face-correction', 'skinceuticals-cleanse-hydrate', 'rejuran-brightening', 'gua-sha', 'acne-clearing'];
const STAFF_FOR = {
  ...Object.fromEntries(SKINCARE_KEYS.map((k) => [k, 'Rina'])), // 护肤 is Rina's (美容单人房); the spa has nobody fixed...
  'back-cupping': 'Rina', // ...except the back cupping, which is Rina's
  ...Object.fromEntries(Object.keys(MEDICAL_MINUTES).map((k) => [k, MEDICAL_STAFF])),
  'classic-lashes': 'Dayu', 'hybrid-lashes': 'Dayu', 'lash-fills': 'Dayu',
};
const DEFAULT_WINDOW = {}; // a treatment's own bookable window when 设置 → 服务项目管理 has none saved (none by default)

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
  const noRoom = has(TATTOO_MINUTES, service); // 纹绣: no room, no person
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(Date.parse(`${day}T00:00:00Z`))) return res.status(400).json({ error: 'invalid date' });
  if (!room && !noRoom) return res.status(400).json({ error: 'unknown service' });
  if (minutes < 15 || minutes > 480) return res.status(400).json({ error: 'invalid length' });

  const today = clinicDay(new Date());
  if (day < today || Date.parse(`${day}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`) > MAX_DAYS_AHEAD * 86400000) {
    return res.json({ date: day, minutes, slots: [], reason: day < today ? 'past' : 'far' });
  }

  const settings = await store.list('settings');
  const hours = settings.find((x) => x.key === 'hours') || {};

  if (noRoom) {
    // Only the shop's own opening hours (and a block that closes the whole shop) limit the times.
    const openAt = hours.openMin ?? DEFAULT_OPEN;
    const closeAt = hours.closeMin ?? DEFAULT_CLOSE;
    const shopBlocks = (await store.list('blocks')).filter((k) => k.room === '');
    const earliestAt = Date.now() + LEAD_MIN * 60000;
    const times = [];
    for (let m = openAt; m + minutes <= closeAt; m += STEP) {
      const s0 = clinicInstant(day, m);
      const e0 = s0 + minutes * 60000;
      if (s0 < earliestAt) continue;
      if (shopBlocks.some((k) => s0 < Date.parse(k.start) + k.durationMin * 60000 && Date.parse(k.start) < e0)) continue;
      times.push(hhmm(m));
    }
    return res.json({ date: day, minutes, slots: times, open: hhmm(openAt), close: hhmm(closeAt), reason: times.length ? undefined : 'full' });
  }

  const sched = (settings.find((x) => x.key === 'schedule') || {}).staff;

  // 设置 → 服务项目管理: a treatment can be switched off (nothing to book online), and has its own list of people who can do it.
  const cfg = (((settings.find((x) => x.key === 'services') || {}).items) || {})[service] || {};
  if (cfg.open === false) return res.json({ date: day, minutes, slots: [], reason: 'service-closed' });
  const operators = Array.isArray(cfg.staff) ? cfg.staff : (staffName ? [staffName] : []); // an empty list: nobody in particular, only the room counts
  // The treatment's own bookable window narrows the rooms' opening hours (it can never open a room outside them).
  const window = cfg.hours || DEFAULT_WINDOW[service] || null;

  // The rooms it can be done in (most treatments have one; a back cupping can use either of two). A slot is open when at least one of
  // them is open and free then. The opening and closing time are the CRM's (设置 → 店铺营业时间管理, or the room's own).
  const roomIds = has(ROOMS_FOR, service) ? ROOMS_FOR[service] : [room];
  const dayStart = clinicInstant(day, 0);
  const dayEnd = dayStart + 36 * 3600000;
  const allBlocks = await store.list('blocks');
  const allAppts = (await store.list('appointments')).filter((a) => ACTIVE.includes(a.status));
  const overlaps = (a, s, e) => s < Date.parse(a.start) + (a.durationMin || 60) * 60000 && Date.parse(a.start) < e;
  const rooms = roomIds.map((id) => {
    const own = (hours.rooms && hours.rooms[id]) || {};
    let o = own.openMin ?? hours.openMin ?? DEFAULT_OPEN;
    let c = own.closeMin ?? hours.closeMin ?? DEFAULT_CLOSE;
    if (window) { o = Math.max(o, window.startMin); c = Math.min(c, window.endMin); }
    // Without a list of people, the room's own staff decide when it is open (the old rule); with one, the people do.
    const byStaff = operators.length || window ? null : roomByStaff(sched, id, day);
    const closed = (byStaff && byStaff.closed) || (hours.closedDays || []).some((d) => d.room === id && d.date === day);
    return {
      id, open: o, close: c, byStaff, closed, cap: BEDS[id] || 1,
      blocks: allBlocks.filter((k) => k.room === '' || k.room === id),
      booked: allAppts.filter((a) => a.room === id && Date.parse(a.start) < dayEnd && Date.parse(a.start) + (a.durationMin || 60) * 60000 > dayStart),
    };
  }).filter((r) => !r.closed);
  if (!rooms.length) return res.json({ date: day, minutes, slots: [], reason: 'closed' });
  const open = Math.min(...rooms.map((r) => r.open));
  const close = Math.max(...rooms.map((r) => r.close));

  // Someone from the list must be at work that day; a slot is open when at least one of them is free in it.
  const working = operators.filter((n) => worksOn(sched, n, day));
  if (operators.length && !working.length) return res.json({ date: day, minutes, slots: [], reason: 'closed' });

  const earliest = Date.now() + LEAD_MIN * 60000;
  // Is this person free from minute m to m + minutes: inside their hours, outside a part-day rest, and not booked in any room?
  const personFree = (name, m, s, e) => {
    const person = sched && sched[name];
    const hrs = hoursOnDay(person, day);
    if (hrs && (m < hrs.startMin || m + minutes > hrs.endMin)) return false;
    const rest = person && person.restHours ? person.restHours[day] : null;
    if (rest && m < rest.endMin && rest.startMin < m + minutes) return false;
    return !allAppts.some((a) => a.staff === name && overlaps(a, s, e));
  };
  // Is this room open and free from minute m: inside its hours and staffed time, no block, a bed left?
  const roomFree = (r, m, s, e) => {
    if (m < r.open || m + minutes > r.close) return false;
    if (r.byStaff && r.byStaff.startMin !== undefined && (m < r.byStaff.startMin || m + minutes > r.byStaff.endMin)) return false;
    if (r.blocks.some((k) => s < Date.parse(k.start) + k.durationMin * 60000 && Date.parse(k.start) < e)) return false;
    const used = r.booked.filter((a) => overlaps(a, s, e)).reduce((n, a) => n + (a.fullRoom && r.cap > 1 ? r.cap : 1), 0);
    return used + 1 <= r.cap;
  };

  const slots = [];
  for (let m = open; m + minutes <= close; m += STEP) {
    const s = clinicInstant(day, m);
    const e = s + minutes * 60000;
    if (s < earliest) continue;
    if (working.length && !working.some((n) => personFree(n, m, s, e))) continue;
    if (!rooms.some((r) => roomFree(r, m, s, e))) continue;
    slots.push(hhmm(m));
  }
  res.json({ date: day, minutes, slots, open: hhmm(open), close: hhmm(close), reason: slots.length ? undefined : 'full' });
});

module.exports = { getAvailability, SERVICE_ROOM, FIXED_MINUTES, STAFF_FOR, DEFAULT_WINDOW };
