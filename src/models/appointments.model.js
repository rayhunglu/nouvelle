const dbClient = require('../lib/dbClient');
const { validateInput } = require('../lib/validate');
const { compact, newRecord, validId } = require('./util');

const COLLECTION = 'appointments';
const STATUSES = ['scheduled', 'checked-in', 'in-service', 'completed', 'cancelled', 'no-show'];

// Storage: `startTime` and `endTime` are MongoDB Dates (UTC); `endTime` = start + durationMin, always worked out here, never taken from a caller.
// Everything outside this file still sees `start` as an ISO string, so the rest of the app is unchanged. A booking saved before this change has
// only the old `start` string until scripts/migrate-sms-and-month-keys.cjs has run; those are still read (and range-checked in JS).
const toApi = (doc) => {
  if (!doc) return doc;
  const { startTime, endTime, ...rest } = doc;
  return startTime ? { ...rest, start: new Date(startTime).toISOString() } : rest;
};
const times = (start, durationMin) => {
  const startTime = new Date(start);
  return { startTime, endTime: new Date(startTime.getTime() + (durationMin || 60) * 60000) };
};
const byStart = (a, b) => String(a.start).localeCompare(String(b.start));
const ms = (v) => new Date(v).getTime();

async function getAppointment(id) {
  try {
    if (!validId(id)) return null;
    return toApi(await dbClient.findOne(COLLECTION, { id }));
  } catch (err) {
    console.error('[appointments.model] getAppointment failed:', err.message);
    throw err;
  }
}

// No argument: every booking. `customerId`: all of one customer's bookings. `range` { start, end } (ms or dates): bookings that START in [start, end). `overlap` { start, end }: bookings that
// are running at any moment of [start, end), i.e. start < end and their endTime > start. Both use the { startTime, endTime } index.
async function getAppointments({ range, overlap, customerId } = {}) {
  try {
    if (customerId) return getAppointmentsByCustomer(customerId);
    let filter = {};
    let keep = () => true;
    if (range) {
      filter = { $or: [{ startTime: { $gte: new Date(range.start), $lt: new Date(range.end) } }, { startTime: { $exists: false } }] };
      keep = (a) => ms(a.start) >= ms(range.start) && ms(a.start) < ms(range.end);
    } else if (overlap) {
      filter = { $or: [{ startTime: { $lt: new Date(overlap.end) }, endTime: { $gt: new Date(overlap.start) } }, { startTime: { $exists: false } }] };
      keep = (a) => ms(a.start) < ms(overlap.end) && ms(a.start) + (a.durationMin || 60) * 60000 > ms(overlap.start);
    }
    const rows = (await dbClient.findMany(COLLECTION, filter, { sort: range || overlap ? { startTime: 1 } : { createdAt: 1 } })).map(toApi);
    return range || overlap ? rows.filter(keep).sort(byStart) : rows;
  } catch (err) {
    console.error('[appointments.model] getAppointments failed:', err.message);
    throw err;
  }
}

// One argument is all these two need.
async function getAppointmentsByCustomer(customerId) {
  try {
    const error = validateInput({ customerId }, { customerId: { required: true, type: 'string', nonEmpty: true } });
    if (error) throw error;
    return (await dbClient.findMany(COLLECTION, { customerId }, { sort: { startTime: 1 } })).map(toApi).sort(byStart);
  } catch (err) {
    console.error('[appointments.model] getAppointmentsByCustomer failed:', err.message);
    throw err;
  }
}

async function getAppointmentsByStaff(staff) {
  try {
    const error = validateInput({ staff }, { staff: { required: true, type: 'string', nonEmpty: true } });
    if (error) throw error;
    return (await dbClient.findMany(COLLECTION, { staff }, { sort: { startTime: 1 } })).map(toApi).sort(byStart);
  } catch (err) {
    console.error('[appointments.model] getAppointmentsByStaff failed:', err.message);
    throw err;
  }
}

// A new booking: who, what, when and how long are required, and so is everything the booking form always sends.
async function createAppointment(input) {
  try {
    const error = validateInput(input, {
      customerId: { required: true, type: 'string', nonEmpty: true },
      service: { required: true, type: 'string', nonEmpty: true, max: 400 },
      start: { required: true, type: 'string', nonEmpty: true },
      durationMin: { required: true, type: 'number', min: 1, max: 1440 },
      price: { required: true, type: 'number', min: 0 },
      status: { required: true, type: 'string', enum: STATUSES },
      room: { required: true, type: 'string', max: 30 },
      staff: { required: true, type: 'string', max: 60 },
      notes: { required: true, type: 'string', max: 2000 },
      fullRoom: { type: 'boolean' },
      source: { type: 'string', enum: ['', 'Yingna', 'Rina', 'Dayu', '其他'] }, // 客户来源
      items: { type: 'array' }, // services booked together: [{ service, durationMin, price, category }]
      category: { type: 'string', enum: ['', 'skincare', 'medical', 'lash', 'spa'] }, // 项目类别 of a custom (typed) service
      googleEventId: { type: 'string', max: 200 }, // the synced Google Calendar event ('' when none)
      googleCalendarId: { type: 'string', max: 200 }, // the calendar that event lives in
      googleEvents: { type: 'array' }, // every synced event: [{ calendarId, eventId }]
    });
    if (error) throw error;
    if (Number.isNaN(new Date(input.start).getTime())) throw new Error('start must be a valid date');
    const query = newRecord(compact({
      customerId: input.customerId,
      service: input.service,
      ...times(input.start, input.durationMin),
      durationMin: input.durationMin,
      price: input.price,
      status: input.status,
      room: input.room,
      staff: input.staff,
      notes: input.notes,
      fullRoom: input.fullRoom,
      source: input.source,
      category: input.category,
      items: input.items,
      googleEventId: input.googleEventId,
      googleCalendarId: input.googleCalendarId,
      googleEvents: input.googleEvents,
    }));
    await dbClient.insertOne(COLLECTION, query);
    return toApi(query);
  } catch (err) {
    console.error('[appointments.model] createAppointment failed:', err.message);
    throw err;
  }
}

// An edit (a drag on the calendar, a status change, a payment flag) sends only what changed.
async function updateAppointment(id, input) {
  try {
    if (!validId(id)) return null;
    const error = validateInput(input, {
      customerId: { type: 'string', nonEmpty: true },
      service: { type: 'string', nonEmpty: true, max: 400 },
      start: { type: 'string', nonEmpty: true },
      durationMin: { type: 'number', min: 1, max: 1440 },
      price: { type: 'number', min: 0 },
      status: { type: 'string', enum: STATUSES },
      room: { type: 'string', max: 30 },
      staff: { type: 'string', max: 60 },
      notes: { type: 'string', max: 2000 },
      fullRoom: { type: 'boolean' },
      source: { type: 'string', enum: ['', 'Yingna', 'Rina', 'Dayu', '其他'] }, // 客户来源
      items: { type: 'array' }, // services booked together: [{ service, durationMin, price, category }]
      category: { type: 'string', enum: ['', 'skincare', 'medical', 'lash', 'spa'] }, // 项目类别 of a custom (typed) service
      googleEventId: { type: 'string', max: 200 }, // the synced Google Calendar event ('' when none)
      googleCalendarId: { type: 'string', max: 200 }, // the calendar that event lives in
      googleEvents: { type: 'array' }, // every synced event: [{ calendarId, eventId }]
      paymentDeleted: { type: 'boolean' },
      reminded: { type: 'boolean' }, // the day-before reminder to the customer was sent (ticked on the dashboard)
    });
    if (error) throw error;
    // A new start or a new length moves the end too, so both are worked out together from what is stored and what is sent.
    let when = {};
    if (input.start !== undefined || input.durationMin !== undefined) {
      const have = toApi(await dbClient.findOne(COLLECTION, { id }));
      if (!have) return null;
      const start = input.start !== undefined ? input.start : have.start;
      if (Number.isNaN(new Date(start).getTime())) throw new Error('start must be a valid date');
      when = times(start, input.durationMin !== undefined ? input.durationMin : have.durationMin);
    }
    const query = compact({
      customerId: input.customerId,
      service: input.service,
      ...when,
      durationMin: input.durationMin,
      price: input.price,
      status: input.status,
      room: input.room,
      staff: input.staff,
      notes: input.notes,
      fullRoom: input.fullRoom,
      source: input.source,
      category: input.category,
      items: input.items,
      googleEventId: input.googleEventId,
      googleCalendarId: input.googleCalendarId,
      googleEvents: input.googleEvents,
      paymentDeleted: input.paymentDeleted,
      reminded: input.reminded,
    });
    return toApi(await dbClient.findOneAndUpdate(COLLECTION, { id }, { ...query, id, updatedAt: new Date().toISOString() }));
  } catch (err) {
    console.error('[appointments.model] updateAppointment failed:', err.message);
    throw err;
  }
}

async function deleteAppointment(id) {
  try {
    if (!validId(id)) return false;
    return (await dbClient.deleteOne(COLLECTION, { id })) > 0;
  } catch (err) {
    console.error('[appointments.model] deleteAppointment failed:', err.message);
    throw err;
  }
}

module.exports = {
  COLLECTION,
  getAppointment,
  getAppointments,
  getAppointmentsByCustomer,
  getAppointmentsByStaff,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  get: getAppointment,
  list: getAppointments,
  create: createAppointment,
  update: updateAppointment,
  remove: deleteAppointment,
};
