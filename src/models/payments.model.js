const dbClient = require('../lib/dbClient');
const { validateInput } = require('../lib/validate');
const { compact, newRecord, validId } = require('./util');

const COLLECTION = 'payments';
const METHODS = ['cash', 'transfer', 'credit_card', 'other', 'zelle', 'venmo', 'member_card', 'unsettled'];

async function getPayment(id) {
  try {
    if (!validId(id)) return null;
    return await dbClient.findOne(COLLECTION, { id });
  } catch (err) {
    console.error('[payments.model] getPayment failed:', err.message);
    throw err;
  }
}

async function getPayments() {
  try {
    return await dbClient.findMany(COLLECTION, {}, { sort: { createdAt: 1 } });
  } catch (err) {
    console.error('[payments.model] getPayments failed:', err.message);
    throw err;
  }
}

async function getPaymentsByCustomer(customerId) {
  try {
    const error = validateInput({ customerId }, { customerId: { required: true, type: 'string', nonEmpty: true } });
    if (error) throw error;
    return await dbClient.findMany(COLLECTION, { customerId }, { sort: { datetime: 1 } });
  } catch (err) {
    console.error('[payments.model] getPaymentsByCustomer failed:', err.message);
    throw err;
  }
}

async function getPaymentsByAppointment(appointmentId) {
  try {
    const error = validateInput({ appointmentId }, { appointmentId: { required: true, type: 'string', nonEmpty: true } });
    if (error) throw error;
    return await dbClient.findMany(COLLECTION, { appointmentId }, { sort: { datetime: 1 } });
  } catch (err) {
    console.error('[payments.model] getPaymentsByAppointment failed:', err.message);
    throw err;
  }
}

// A new payment: the checkout form always sends every one of these (empty text / 0 / [] when unused), so all are required.
async function createPayment(input) {
  try {
    const error = validateInput(input, {
      appointmentId: { required: true, type: 'string', nullable: true }, // null for a walk-in with no booking
      customerId: { required: true, type: 'string', nonEmpty: true },
      datetime: { required: true, type: 'string', nonEmpty: true },
      serviceIds: { required: true, type: 'array' },
      amount: { required: true, type: 'number', min: 0 },
      tipAmount: { required: true, type: 'number', min: 0 },
      paymentMethod: { required: true, type: 'string', enum: METHODS },
      tipMethod: { required: true, type: 'string', enum: METHODS },
      referralSource: { required: true, type: 'string', max: 80 },
      staff: { required: true, type: 'string', max: 60 },
      notes: { required: true, type: 'string', max: 500 },
      serviceName: { required: true, type: 'string', max: 160 },
      topUp: { required: true, type: 'number', min: 0 },
      topUpMethod: { required: true, type: 'string' },
      topUpGifts: { required: true, type: 'array' },
      topUpBonus: { type: 'number', min: 0 }, // cash credit given with the top-up, typed by hand
      giftUsed: { required: true, type: 'string' },
    });
    if (error) throw error;
    const query = newRecord({
      appointmentId: input.appointmentId,
      customerId: input.customerId,
      datetime: input.datetime,
      serviceIds: input.serviceIds,
      amount: input.amount,
      tipAmount: input.tipAmount,
      paymentMethod: input.paymentMethod,
      tipMethod: input.tipMethod,
      referralSource: input.referralSource,
      staff: input.staff,
      notes: input.notes,
      serviceName: input.serviceName,
      topUp: input.topUp,
      topUpMethod: input.topUpMethod,
      topUpGifts: input.topUpGifts,
      topUpBonus: input.topUpBonus,
      giftUsed: input.giftUsed,
    });
    await dbClient.insertOne(COLLECTION, query);
    return query;
  } catch (err) {
    console.error('[payments.model] createPayment failed:', err.message);
    throw err;
  }
}

async function updatePayment(id, input) {
  try {
    if (!validId(id)) return null;
    const error = validateInput(input, {
      appointmentId: { type: 'string', nullable: true },
      customerId: { type: 'string', nonEmpty: true },
      datetime: { type: 'string', nonEmpty: true },
      serviceIds: { type: 'array' },
      amount: { type: 'number', min: 0 },
      tipAmount: { type: 'number', min: 0 },
      paymentMethod: { type: 'string', enum: METHODS },
      tipMethod: { type: 'string', enum: METHODS },
      referralSource: { type: 'string', max: 80 },
      staff: { type: 'string', max: 60 },
      notes: { type: 'string', max: 500 },
      serviceName: { type: 'string', max: 160 },
      topUp: { type: 'number', min: 0 },
      topUpMethod: { type: 'string' },
      topUpGifts: { type: 'array' },
      topUpBonus: { type: 'number', min: 0 },
      giftUsed: { type: 'string' },
    });
    if (error) throw error;
    const query = compact({
      appointmentId: input.appointmentId,
      customerId: input.customerId,
      datetime: input.datetime,
      serviceIds: input.serviceIds,
      amount: input.amount,
      tipAmount: input.tipAmount,
      paymentMethod: input.paymentMethod,
      tipMethod: input.tipMethod,
      referralSource: input.referralSource,
      staff: input.staff,
      notes: input.notes,
      serviceName: input.serviceName,
      topUp: input.topUp,
      topUpMethod: input.topUpMethod,
      topUpGifts: input.topUpGifts,
      topUpBonus: input.topUpBonus,
      giftUsed: input.giftUsed,
    });
    return await dbClient.findOneAndUpdate(COLLECTION, { id }, { ...query, id, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[payments.model] updatePayment failed:', err.message);
    throw err;
  }
}

async function deletePayment(id) {
  try {
    if (!validId(id)) return false;
    return (await dbClient.deleteOne(COLLECTION, { id })) > 0;
  } catch (err) {
    console.error('[payments.model] deletePayment failed:', err.message);
    throw err;
  }
}

module.exports = {
  COLLECTION,
  getPayment,
  getPayments,
  getPaymentsByCustomer,
  getPaymentsByAppointment,
  createPayment,
  updatePayment,
  deletePayment,
  get: getPayment,
  list: getPayments,
  create: createPayment,
  update: updatePayment,
  remove: deletePayment,
};
