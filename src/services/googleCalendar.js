const crypto = require('crypto');

// One-way sync of CRM appointments to a Google Calendar (CRM -> Google). A service account writes to the calendar that was
// shared with it ("Make changes to events"). Environment:
//   GOOGLE_SERVICE_ACCOUNT_JSON   the service account key file, either as plain JSON or base64 of it
//   GOOGLE_CALENDAR_ID            the default calendar (GOOGLE_CALENDAR_EMAIL also works): the Gmail address for a main
//                                 calendar, or xxxx@group.calendar.google.com for another one
// Each staff member can have their own calendar (their contact page on 员工管理): their appointments go there, and everyone
// else's go to the default one. The calendar ids are not secrets; the service account must be shared on each calendar.
// Sync never breaks the CRM: every call is time-limited and reports failure through its return value / the log.
const store = require('./store');

const TIME_ZONE = 'America/Los_Angeles';
const SCOPE = 'https://www.googleapis.com/auth/calendar'; // events + reading a calendar's colour labels
const TIMEOUT_MS = 8000;
// Google's event colours. An event is coloured by the staff member the booking belongs to, the same on every calendar it appears on:
// Yingna light purple (Grape, #dbadff), Rina Flamingo (#ff887c), Dayu light green (Sage, #7ae7bf).
// Google's calendar API only knows eleven fixed event colours (ids 1-11: #a4bdfc, #7ae7bf, #dbadff, #ff887c, #fbd75b, #ffb878, #46d6db,
// #e1e1e1, #5484ed, #51b749, #dc2127); there is no brown, and "Lavender" (1) is a periwinkle blue, not purple. Anyone else gets the room's
// colour (brown, purple, dark green, blue in the CRM).
const STAFF_COLOR = { Yingna: '3', Rina: '4', Dayu: '2' };
// Colours outside the eleven fixed ones come from the newer colour labels (June 2026): every calendar carries Google's 24 default labels
// ({ id, backgroundColor }), found by their hex colour; an event uses one through `eventLabelId` (with ?eventLabelVersion=1, which makes
// Google ignore `colorId`). Example: Cocoa (#795548). If the label cannot be found the event falls back to its colorId.
const STAFF_LABEL = {}; // none at the moment (Rina's Cocoa label was not shown by every Google Calendar client, so she uses Flamingo)
const labelCache = new Map(); // calendar id -> { '#795548': label id }
async function labelIdFor(calId, hex) {
  try {
    if (!labelCache.has(calId)) {
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}`, { headers: { Authorization: `Bearer ${await accessToken()}` }, signal: AbortSignal.timeout(TIMEOUT_MS) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data.error && data.error.message) || res.status);
      labelCache.set(calId, Object.fromEntries(((data.labelProperties && data.labelProperties.eventLabels) || []).map((l) => [String(l.backgroundColor).toLowerCase(), l.id])));
    }
    return labelCache.get(calId)[hex] || '';
  } catch (err) {
    console.error('[googleCalendar] colour label lookup failed:', err.message);
    return '';
  }
}
const ROOM_COLOR = { room1: '6', room2: '3', room3: '10', room4: '9' };
const ROOM_NAME = { room1: '美容单人房', room2: '医美双人房', room3: '美睫单人房', room4: '头疗双人房' };

const defaultCalendarId = () => process.env.GOOGLE_CALENDAR_ID || process.env.GOOGLE_CALENDAR_EMAIL || '';

function credentials() {
  const raw = (process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '').trim();
  if (!raw) return null;
  for (const text of [raw, Buffer.from(raw, 'base64').toString('utf8')]) {
    try {
      const j = JSON.parse(text);
      if (j.client_email && j.private_key) return j;
    } catch { /* try the next form */ }
  }
  return null;
}

const enabled = () => Boolean(credentials()); // a calendar is chosen per appointment: the staff member's own, else the default

// The calendar for one staff member's appointments: their own id when set on their page, otherwise the default one.
async function calendarFor(staffName) {
  try {
    const row = (await store.list('settings')).find((x) => x.key === 'profiles');
    const own = row && row.staff && staffName && row.staff[staffName] && row.staff[staffName].calendarId;
    return own || defaultCalendarId();
  } catch {
    return defaultCalendarId();
  }
}

// Which calendars an appointment shows up on:
//   Yingna's: every appointment of the shop.
//   Rina's: appointments she is connected to (she is the operator, or the 介绍人 / 客户来源) and every 美睫 project.
//   Dayu's: only 美睫 projects that are hers (she is the operator or the 介绍人); she does lashes only.
//   Anyone else with their own calendar: only appointments that are theirs (operator or 介绍人).
// A person without a calendar id uses the default calendar, which is also where Yingna's goes when she has none.
const LASH_NAMES = new Set(['单根扁毛', 'YY睫毛', '三叶草', '妈生太阳花', '仙女C+婴儿弯', '盐系鱼尾柳叶', '泰式猫系', '欧美浓密', '国风狐系', '日式漫画系', '下睫毛', '补睫毛（2-3周内）', '经典单根睫毛嫁接', '人气特色款式嫁接', '下睫毛与补睫毛', '睫毛护理']);
const isLash = (appt) => {
  const names = String(appt.service || '').split(' + ').map((x) => x.trim());
  return appt.category === 'lash' || (appt.items || []).some((x) => x && x.category === 'lash') || names.some((n) => LASH_NAMES.has(n) || /睫/.test(n));
};
const LASH_ONLY = new Set(['Dayu']); // people whose calendar holds 美睫 projects only
async function calendarsFor(appt) {
  const row = (await store.list('settings')).find((x) => x.key === 'profiles');
  const profiles = (row && row.staff) || {};
  const own = (name) => (name && profiles[name] && profiles[name].calendarId) || '';
  const ids = new Set();
  const add = (id) => { if (id) ids.add(id); };
  add(own('Yingna') || defaultCalendarId()); // the whole shop
  if (appt.staff === 'Rina' || appt.source === 'Rina' || isLash(appt)) add(own('Rina') || defaultCalendarId());
  for (const name of [appt.staff, appt.source]) if (name && name !== 'Yingna' && name !== 'Rina' && (!LASH_ONLY.has(name) || isLash(appt))) add(own(name));
  return [...ids];
}
// The calendar events an appointment already has: [{ calendarId, eventId }] (older rows keep a single googleEventId / googleCalendarId).
const eventsOf = (appt) => (Array.isArray(appt.googleEvents) && appt.googleEvents.length
  ? appt.googleEvents
  : appt.googleEventId ? [{ calendarId: appt.googleCalendarId || defaultCalendarId(), eventId: appt.googleEventId }] : []);

const b64url = (v) => Buffer.from(typeof v === 'string' ? v : JSON.stringify(v)).toString('base64url');

let token = { value: '', exp: 0 };
async function accessToken() {
  if (token.value && Date.now() < token.exp - 60000) return token.value;
  const c = credentials();
  const now = Math.floor(Date.now() / 1000);
  const head = b64url({ alg: 'RS256', typ: 'JWT' });
  const claim = b64url({ iss: c.client_email, scope: SCOPE, aud: c.token_uri || 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 });
  const sig = crypto.createSign('RSA-SHA256').update(`${head}.${claim}`).sign(c.private_key).toString('base64url');
  const res = await fetch(c.token_uri || 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${head}.${claim}.${sig}` }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Google token: ${data.error_description || data.error || res.status}`);
  token = { value: data.access_token, exp: Date.now() + (data.expires_in || 3600) * 1000 };
  return token.value;
}

async function call(calId, method, path, body, query = '') {
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events${path}${query}`, {
    method,
    headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (res.status === 204) return {};
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(`Google Calendar ${res.status}: ${(data.error && data.error.message) || res.statusText}`), { status: res.status });
  return data;
}

// The event for one appointment: "客人 · 服务", the room as location, staff / notes in the description.
function eventOf(appt, customerName) {
  const start = new Date(appt.start);
  const end = new Date(start.getTime() + (appt.durationMin || 60) * 60000);
  const lines = [
    appt.staff && `员工：${appt.staff}`,
    appt.room && `房间：${ROOM_NAME[appt.room] || appt.room}`,
    appt.source && `客户来源：${appt.source}`,
    appt.notes && `备注：${appt.notes}`,
  ].filter(Boolean);
  return {
    summary: `${customerName || '客户'} · ${appt.service}`,
    location: ROOM_NAME[appt.room] || '',
    description: lines.join('\n'),
    start: { dateTime: start.toISOString(), timeZone: TIME_ZONE },
    end: { dateTime: end.toISOString(), timeZone: TIME_ZONE },
    colorId: STAFF_COLOR[appt.staff] || ROOM_COLOR[appt.room] || undefined,
    // Private marker so synced events can be told apart from ones typed in by hand.
    extendedProperties: { private: { crmAppointmentId: appt.id } },
  };
}

// Creates or updates the event for an appointment in calendar `calId`. Returns { id } on success, { error } otherwise; never throws.
async function upsert(appt, customerName, calId) {
  if (!credentials() || !calId) return { skipped: true };
  try {
    const body = eventOf(appt, customerName);
    let query = '';
    const label = STAFF_LABEL[appt.staff] ? await labelIdFor(calId, STAFF_LABEL[appt.staff]) : '';
    if (label) { body.eventLabelId = label; delete body.colorId; query = '?eventLabelVersion=1'; }
    if (appt.googleEventId) {
      try {
        return { id: (await call(calId, 'PUT', `/${encodeURIComponent(appt.googleEventId)}`, body, query)).id };
      } catch (err) {
        if (err.status !== 404 && err.status !== 410) throw err; // the event was deleted in Google: make a fresh one
      }
    }
    return { id: (await call(calId, 'POST', '', body, query)).id };
  } catch (err) {
    console.error('[googleCalendar] upsert failed:', err.message);
    return { error: err.message };
  }
}

// Removes an appointment's event (already gone counts as success).
async function remove(eventId, calId) {
  if (!credentials() || !eventId || !calId) return { skipped: true };
  try {
    await call(calId, 'DELETE', `/${encodeURIComponent(eventId)}`);
    return { ok: true };
  } catch (err) {
    if (err.status === 404 || err.status === 410) return { ok: true };
    console.error('[googleCalendar] delete failed:', err.message);
    return { error: err.message };
  }
}

// Can the service account write to this calendar? Used by the "检查" button next to a calendar id. It reads the calendar, then
// adds and removes a throw-away event to prove it may change events.
async function check(calId) {
  if (!credentials()) return { ok: false, error: '服务器还没有配置 Google 服务账户（GOOGLE_SERVICE_ACCOUNT_JSON）' };
  if (!calId) return { ok: false, error: '没有填日历 ID' };
  const share = `请在该日历的「设置和共用」里把 ${credentials().client_email} 加为「变更活动」，并确认日历 ID 对。`;
  try {
    const list = await call(calId, 'GET', '?maxResults=1');
    const start = new Date(Date.now() + 3650 * 86400000);
    const probe = await call(calId, 'POST', '', { summary: '连接测试（会立即删除）', start: { dateTime: start.toISOString() }, end: { dateTime: new Date(start.getTime() + 60000).toISOString() } });
    await call(calId, 'DELETE', `/${encodeURIComponent(probe.id)}`);
    return { ok: true, name: list.summary || calId };
  } catch (err) {
    if (err.status === 404) return { ok: false, error: `看不到这个日历。${share}` };
    if (err.status === 403) return { ok: false, error: `只有查看权限，不能修改。${share}` };
    return { ok: false, error: err.message };
  }
}

module.exports = { enabled, defaultCalendarId, calendarFor, calendarsFor, eventsOf, eventOf, isLash, upsert, remove, check, serviceAccountEmail: () => (credentials() || {}).client_email || '' };
