const dbClient = require('../lib/dbClient');
const { validateInput } = require('../lib/validate');
const { newRecord, validId } = require('./util');

// The service names offered when recording a payment: just a name each.
const COLLECTION = 'services';

async function getService(id) {
  try {
    if (!validId(id)) return null;
    return await dbClient.findOne(COLLECTION, { id });
  } catch (err) {
    console.error('[services.model] getService failed:', err.message);
    throw err;
  }
}

async function getServices() {
  try {
    return await dbClient.findMany(COLLECTION, {}, { sort: { createdAt: 1 } });
  } catch (err) {
    console.error('[services.model] getServices failed:', err.message);
    throw err;
  }
}

async function createService(input) {
  try {
    const error = validateInput(input, { name: { required: true, type: 'string', nonEmpty: true, max: 80 }, category: { type: 'string', enum: ['', 'skincare', 'medical', 'lash', 'spa'] } });
    if (error) throw error;
    const query = newRecord({ name: input.name, ...(input.category ? { category: input.category } : {}) });
    await dbClient.insertOne(COLLECTION, query);
    return query;
  } catch (err) {
    console.error('[services.model] createService failed:', err.message);
    throw err;
  }
}

async function updateService(id, input) {
  try {
    if (!validId(id)) return null;
    const error = validateInput(input, { name: { type: 'string', nonEmpty: true, max: 80 }, category: { type: 'string', enum: ['', 'skincare', 'medical', 'lash', 'spa'] } });
    if (error) throw error;
    return await dbClient.findOneAndUpdate(COLLECTION, { id }, { ...(input.name !== undefined ? { name: input.name } : {}), ...(input.category !== undefined ? { category: input.category } : {}), id, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[services.model] updateService failed:', err.message);
    throw err;
  }
}

async function deleteService(id) {
  try {
    if (!validId(id)) return false;
    return (await dbClient.deleteOne(COLLECTION, { id })) > 0;
  } catch (err) {
    console.error('[services.model] deleteService failed:', err.message);
    throw err;
  }
}

module.exports = {
  COLLECTION,
  getService,
  getServices,
  createService,
  updateService,
  deleteService,
  get: getService,
  list: getServices,
  create: createService,
  update: updateService,
  remove: deleteService,
};
