const dbClient = require('../lib/dbClient');
const { validateInput } = require('../lib/validate');
const { compact, newRecord, validId } = require('./util');

const COLLECTION = 'appointments';
const STATUSES = ['scheduled', 'checked-in', 'in-service', 'completed', 'cancelled', 'no-show'];

async function getAppointment(id) {
  try {
    if (!validId(id)) return null;
    return await dbClient.findOne(COLLECTION, { id });
  } catch (err) {
    console.error('[appointments.model] getAppointment failed:', err.message);
    throw err;
  }
}

async function getAppointments() {
  try {
    return await dbClient.findMany(COLLECTION, {}, { sort: { createdAt: 1 } });
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
    return await dbClient.findMany(COLLECTION, { customerId }, { sort: { start: 1 } });
  } catch (err) {
    console.error('[appointments.model] getAppointmentsByCustomer failed:', err.message);
    throw err;
  }
}

async function getAppointmentsByStaff(staff) {
  try {
    const error = validateInput({ staff }, { staff: { required: true, type: 'string', nonEmpty: true } });
    if (error) throw error;
    return await dbClient.findMany(COLLECTION, { staff }, { sort: { start: 1 } });
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
      service: { required: true, type: 'string', nonEmpty: true, max: 160 },
      start: { required: true, type: 'string', nonEmpty: true },
      durationMin: { required: true, type: 'number', min: 1, max: 1440 },
      price: { required: true, type: 'number', min: 0 },
      status: { required: true, type: 'string', enum: STATUSES },
      room: { required: true, type: 'string', max: 30 },
      staff: { required: true, type: 'string', max: 60 },
      notes: { required: true, type: 'string', max: 2000 },
      fullRoom: { type: 'boolean' },
      source: { type: 'string', enum: ['', 'Yingna', 'Rina', 'Dayu', '其他'] }, // 客户来源
      googleEventId: { type: 'string', max: 200 }, // the synced Google Calendar event ('' when none)
      googleCalendarId: { type: 'string', max: 200 }, // the calendar that event lives in
    });
    if (error) throw error;
    const query = newRecord(compact({
      customerId: input.customerId,
      service: input.service,
      start: input.start,
      durationMin: input.durationMin,
      price: input.price,
      status: input.status,
      room: input.room,
      staff: input.staff,
      notes: input.notes,
      fullRoom: input.fullRoom,
      source: input.source,
      googleEventId: input.googleEventId,
      googleCalendarId: input.googleCalendarId,
    }));
    await dbClient.insertOne(COLLECTION, query);
    return query;
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
      service: { type: 'string', nonEmpty: true, max: 160 },
      start: { type: 'string', nonEmpty: true },
      durationMin: { type: 'number', min: 1, max: 1440 },
      price: { type: 'number', min: 0 },
      status: { type: 'string', enum: STATUSES },
      room: { type: 'string', max: 30 },
      staff: { type: 'string', max: 60 },
      notes: { type: 'string', max: 2000 },
      fullRoom: { type: 'boolean' },
      source: { type: 'string', enum: ['', 'Yingna', 'Rina', 'Dayu', '其他'] }, // 客户来源
      googleEventId: { type: 'string', max: 200 }, // the synced Google Calendar event ('' when none)
      googleCalendarId: { type: 'string', max: 200 }, // the calendar that event lives in
      paymentDeleted: { type: 'boolean' },
    });
    if (error) throw error;
    const query = compact({
      customerId: input.customerId,
      service: input.service,
      start: input.start,
      durationMin: input.durationMin,
      price: input.price,
      status: input.status,
      room: input.room,
      staff: input.staff,
      notes: input.notes,
      fullRoom: input.fullRoom,
      source: input.source,
      googleEventId: input.googleEventId,
      googleCalendarId: input.googleCalendarId,
      paymentDeleted: input.paymentDeleted,
    });
    return await dbClient.findOneAndUpdate(COLLECTION, { id }, { ...query, id, updatedAt: new Date().toISOString() });
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
