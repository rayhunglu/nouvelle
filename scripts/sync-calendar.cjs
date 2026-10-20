// Pushes existing appointments to the Google Calendar (CRM -> Google). Normal edits sync by themselves; this is for the ones
// that were made before the sync was set up. Only appointments that have no calendar event yet are added.
//   node scripts/sync-calendar.cjs            dry run: lists what would be added
//   node scripts/sync-calendar.cjs --apply    creates the missing events on every calendar an appointment belongs to
//   --refresh                                 also update events that already exist (after changing how events look)
//   --all                                     include past appointments too (default: from yesterday on)
process.chdir(require('path').join(__dirname, '..'));
require('dotenv').config();
const dbClient = require('../src/lib/dbClient');
const calendar = require('../src/services/googleCalendar');

(async () => {
  const apply = process.argv.includes('--apply');
  const all = process.argv.includes('--all');
  if (!calendar.enabled()) throw new Error('Google Calendar is not configured (GOOGLE_SERVICE_ACCOUNT_JSON / GOOGLE_CALENDAR_ID)');
  if (!(await dbClient.init())) throw new Error('MONGO_URL is not set');
  await dbClient.connection();
  const since = Date.now() - 24 * 3600 * 1000;
  const live = (a) => a.status !== 'cancelled' && a.status !== 'no-show' && (all || new Date(a.start).getTime() >= since);
  const every = (await dbClient.findMany('appointments', {}, { sort: { start: 1 } })).filter(live);
  // Each appointment goes to every calendar it belongs to (Yingna: all, Rina: hers + lashes, Dayu: hers); missing events are added,
  // and with --refresh the existing ones are updated too.
  const refresh = process.argv.includes('--refresh');
  let count = 0;
  for (const a of every) {
    const customer = await dbClient.findOne('customers', { id: a.customerId });
    const label = `${a.start}  ${customer ? customer.name : '?'} · ${a.service} (${a.staff || '-'})`;
    const targets = await calendar.calendarsFor(a);
    const have = calendar.eventsOf(a);
    const todo = targets.filter((c) => refresh || !have.some((e) => e.calendarId === c));
    if (!todo.length) continue;
    count += 1;
    if (!apply) { console.log(`  would sync to ${todo.length} calendar(s)`, label); continue; }
    const events = [...have];
    for (const calId of todo) {
      const old = have.find((e) => e.calendarId === calId);
      const r = await calendar.upsert({ ...a, googleEventId: old ? old.eventId : '' }, customer && customer.name, calId);
      if (!r.id) { console.log('  FAILED', label, r.error); continue; }
      if (old) old.eventId = r.id; else events.push({ calendarId: calId, eventId: r.id });
    }
    await dbClient.upsert('appointments', { id: a.id }, { googleEvents: events, googleEventId: events[0] ? events[0].eventId : '', googleCalendarId: events[0] ? events[0].calendarId : '' });
    console.log('  synced', label);
  }
  console.log(`${count} appointment(s) to sync${apply ? '' : ' (dry run, add --apply)'}`);
  await dbClient.disconnect();
})().catch((err) => { console.error(err.message); process.exit(1); });
