// Pushes existing appointments to the Google Calendar (CRM -> Google). Normal edits sync by themselves; this is for the ones
// that were made before the sync was set up. Only appointments that have no calendar event yet are added.
//   node scripts/sync-calendar.cjs            dry run: lists what would be added
//   node scripts/sync-calendar.cjs --apply    creates the events
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
  const rows = (await dbClient.findMany('appointments', {}, { sort: { start: 1 } }))
    .filter((a) => !a.googleEventId && a.status !== 'cancelled' && a.status !== 'no-show' && (all || new Date(a.start).getTime() >= since));
  if (process.argv.includes('--refresh')) {
    const existing = (await dbClient.findMany('appointments', {}, { sort: { start: 1 } }))
      .filter((a) => a.googleEventId && a.status !== 'cancelled' && a.status !== 'no-show' && (all || new Date(a.start).getTime() >= since));
    console.log(`${existing.length} existing event(s) to refresh${apply ? '' : ' (dry run, add --apply)'}`);
    for (const a of existing) {
      const customer = await dbClient.findOne('customers', { id: a.customerId });
      const label = `${a.start}  ${customer ? customer.name : '?'} · ${a.service} (${a.staff || '-'})`;
      if (!apply) { console.log('  would refresh', label); continue; }
      const r = await calendar.upsert(a, customer && customer.name, a.googleCalendarId || (await calendar.calendarFor(a.staff)));
      console.log(r.id ? '  refreshed' : `  FAILED ${r.error}`, label);
    }
  }
  console.log(`${rows.length} appointment(s) without a calendar event${apply ? '' : ' (dry run, add --apply to create them)'}`);
  for (const a of rows) {
    const customer = await dbClient.findOne('customers', { id: a.customerId });
    const label = `${a.start}  ${customer ? customer.name : '?'} · ${a.service}`;
    if (!apply) { console.log('  would add', label); continue; }
    const target = await calendar.calendarFor(a.staff);
    if (!target) { console.log('  skipped (no calendar)', label); continue; }
    const r = await calendar.upsert(a, customer && customer.name, target);
    if (r.id) { await dbClient.upsert('appointments', { id: a.id }, { googleEventId: r.id, googleCalendarId: target }); console.log('  added', label); } else console.log('  FAILED', label, r.error);
  }
  await dbClient.disconnect();
})().catch((err) => { console.error(err.message); process.exit(1); });
