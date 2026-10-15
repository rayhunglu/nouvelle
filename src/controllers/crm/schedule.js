const store = require('../../services/store');
const { wrap, ROOM_IDS, str, num } = require('./common');

// ---- staff attendance: working weekdays plus rest / extra-working dates per staff member ----
// { Rina: { weekdays: [1,2,3,4,5,6], off: ['2026-10-20'], on: ['2026-10-18'] } }. Without an entry, a person works every day.

// Who looks after which room, unless the manager says otherwise on the staff card.
const DEFAULT_ROOM_STAFF = { Rina: ['room1'], Yingna: ['room2'], Dayu: ['room3'] };
const clinicDay = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(d); // YYYY-MM-DD
const laMinutes = (d) => { // minutes since midnight in the clinic's time zone
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d);
  return (Number(parts.find((x) => x.type === 'hour').value) % 24) * 60 + Number(parts.find((x) => x.type === 'minute').value);
};
const hhmmOf = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const weekdayOf = (day) => { const [y, m, d] = day.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); };
const scheduleRow = async () => (await store.list('settings')).find((x) => x.key === 'schedule');
// The working hours that apply to one staff member on one day: that weekday's own hours, else their usual hours, else none.
const hoursOnDay = (own, day) => {
  if (!own) return null;
  if ((own.on || []).includes(day) && own.onHours && own.onHours[day]) return own.onHours[day]; // an extra work day with its own hours
  const d = own.dayHours && own.dayHours[weekdayOf(day)];
  if (d) return d;
  return own.startMin !== null && own.startMin !== undefined && own.endMin !== null && own.endMin !== undefined ? { startMin: own.startMin, endMin: own.endMin } : null;
};
const worksOn = (sched, name, day) => {
  const s = sched && sched[name];
  if (!s) return true;
  if ((s.off || []).includes(day)) return false;
  if ((s.on || []).includes(day)) return true;
  return (s.weekdays || [0, 1, 2, 3, 4, 5, 6]).includes(weekdayOf(day));
};

// Room opening that follows the people looking after it. null = nobody is linked to the room (no effect); { closed: true } = none
// of its people works that day; { startMin, endMin } = the room is staffed only between those times (absent = all day).
function roomByStaff(sched, room, day) {
  const names = [...new Set([...Object.keys(DEFAULT_ROOM_STAFF), ...Object.keys(sched || {})])].filter((n) => {
    const s = sched && sched[n];
    if (s && s.linkRooms === false) return false;
    return ((s && s.rooms) || DEFAULT_ROOM_STAFF[n] || []).includes(room);
  });
  if (!names.length) return null;
  const working = names.filter((n) => worksOn(sched, n, day));
  if (!working.length) return { closed: true };
  const spans = working.map((n) => hoursOnDay(sched && sched[n], day));
  if (spans.some((s) => !s)) return {};
  return { startMin: Math.min(...spans.map((s) => s.startMin)), endMin: Math.max(...spans.map((s) => s.endMin)) };
}

const getSchedule = wrap(async (req, res) => res.json(((await scheduleRow()) || {}).staff || {}));

const putSchedule = wrap(async (req, res) => {
  const b = req.body || {};
  const name = str(b.staff, 60);
  if (!name) return res.status(400).json({ error: 'staff is required' });
  const dates = (v) => [...new Set((Array.isArray(v) ? v : []).filter((d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)))].sort().slice(0, 400);
  const weekdays = [...new Set((Array.isArray(b.weekdays) ? b.weekdays : []).map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n <= 6))].sort();
  // Optional working hours (minutes since midnight, 15-minute steps, both or neither). Without them the clinic's hours apply.
  const okMin = (m) => Number.isInteger(m) && m >= 0 && m <= 24 * 60 && m % 15 === 0;
  const hasHours = b.startMin !== null && b.startMin !== undefined && b.endMin !== null && b.endMin !== undefined && b.startMin !== '' && b.endMin !== '';
  const startMin = hasHours ? num(b.startMin) : null;
  const endMin = hasHours ? num(b.endMin) : null;
  if (hasHours && (!okMin(startMin) || !okMin(endMin) || endMin - startMin < 60)) return res.status(400).json({ error: '出勤时间需按 15 分钟取整，且至少 1 小时' });
  // Working hours for single weekdays ("Mondays 10:00-14:00"): { '1': { startMin, endMin } }. They win over the staff member's usual hours.
  const dayHours = {};
  for (const [k, v] of Object.entries(b.dayHours && typeof b.dayHours === 'object' ? b.dayHours : {})) {
    const day = Number(k);
    if (!Number.isInteger(day) || day < 0 || day > 6 || !v) continue;
    const s = num(v.startMin);
    const e = num(v.endMin);
    if (!okMin(s) || !okMin(e) || e - s < 60) return res.status(400).json({ error: '每个星期的出勤时间需按 15 分钟取整，且至少 1 小时' });
    dayHours[day] = { startMin: s, endMin: e };
  }
  // Specific times on single dates: extra work days with their own hours ("on" + onHours), and part-day rests (restHours: the
  // person rests only between those times that day).
  const dateHours = (v, allowed) => {
    const out = {};
    for (const [d, h] of Object.entries(v && typeof v === 'object' ? v : {})) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || !h) continue;
      const s0 = num(h.startMin);
      const e0 = num(h.endMin);
      if (!okMin(s0) || !okMin(e0) || e0 - s0 < 15) continue;
      if (allowed && !allowed.includes(d)) continue;
      out[d] = { startMin: s0, endMin: e0 };
    }
    return out;
  };
  const onList = dates(b.on);
  const onHours = dateHours(b.onHours, onList);
  const restHours = dateHours(b.restHours, null);
  // The rooms this person looks after: while they work those rooms are open (inside their hours), on their rest days they are closed.
  const rooms = Array.isArray(b.rooms) ? [...new Set(b.rooms.filter((r) => ROOM_IDS.includes(r)))] : (DEFAULT_ROOM_STAFF[name] || []);
  const linkRooms = b.linkRooms !== false;
  const row = await scheduleRow();
  const staff = { ...((row && row.staff) || {}), [name]: { weekdays, off: dates(b.off), on: onList, startMin, endMin, dayHours, rooms, linkRooms, onHours, restHours } };
  if (row) await store.update('settings', row.id, { staff });
  else await store.create('settings', { key: 'schedule', staff });
  res.json(staff);
});

module.exports = { DEFAULT_ROOM_STAFF, clinicDay, laMinutes, hhmmOf, scheduleRow, hoursOnDay, worksOn, roomByStaff, getSchedule, putSchedule };
