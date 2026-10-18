const dbClient = require('../lib/dbClient');
const { validateInput } = require('../lib/validate');
const { compact, newRecord, validId } = require('./util');

// Key / value rows: business hours ("hours"), staff schedule ("schedule"), staff contact details ("profiles"), the treatments' settings ("services").
// Each key uses a different subset of the fields, so only `key` is required on create.
const COLLECTION = 'settings';
const KEYS = ['hours', 'schedule', 'profiles', 'roster', 'services'];

async function getSetting(key) {
  try {
    const error = validateInput({ key }, { key: { required: true, type: 'string', enum: KEYS } });
    if (error) throw error;
    return await dbClient.findOne(COLLECTION, { key });
  } catch (err) {
    console.error('[settings.model] getSetting failed:', err.message);
    throw err;
  }
}

async function getSettings() {
  try {
    return await dbClient.findMany(COLLECTION, {}, { sort: { createdAt: 1 } });
  } catch (err) {
    console.error('[settings.model] getSettings failed:', err.message);
    throw err;
  }
}

async function createSetting(input) {
  try {
    const error = validateInput(input, {
      key: { required: true, type: 'string', enum: KEYS },
      openMin: { type: 'number', min: 0, max: 1440 },
      closeMin: { type: 'number', min: 0, max: 1440 },
      rooms: { type: 'object' },
      closedDays: { type: 'array' },
      staff: { type: 'object' },
      names: { type: 'array' }, // roster: the staff names
      items: { type: 'object' }, // services: { [treatment key]: { open, staff } }
    });
    if (error) throw error;
    const query = newRecord(compact({
      key: input.key,
      openMin: input.openMin,
      closeMin: input.closeMin,
      rooms: input.rooms,
      closedDays: input.closedDays,
      staff: input.staff,
      names: input.names,
      items: input.items,
    }));
    await dbClient.insertOne(COLLECTION, query);
    return query;
  } catch (err) {
    console.error('[settings.model] createSetting failed:', err.message);
    throw err;
  }
}

// The key itself never changes; everything else is optional.
async function updateSetting(id, input) {
  try {
    if (!validId(id)) return null;
    const error = validateInput(input, {
      openMin: { type: 'number', min: 0, max: 1440 },
      closeMin: { type: 'number', min: 0, max: 1440 },
      rooms: { type: 'object' },
      closedDays: { type: 'array' },
      staff: { type: 'object' },
      names: { type: 'array' }, // roster: the staff names
      items: { type: 'object' }, // services: { [treatment key]: { open, staff } }
    });
    if (error) throw error;
    const query = compact({
      openMin: input.openMin,
      closeMin: input.closeMin,
      rooms: input.rooms,
      closedDays: input.closedDays,
      staff: input.staff,
      names: input.names,
      items: input.items,
    });
    return await dbClient.findOneAndUpdate(COLLECTION, { id }, { ...query, id, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[settings.model] updateSetting failed:', err.message);
    throw err;
  }
}

// Creates the row for `key` or updates it in place.
async function saveSetting(key, input) {
  try {
    const existing = await getSetting(key);
    if (existing) return await updateSetting(existing.id, input);
    return await createSetting({ ...input, key });
  } catch (err) {
    console.error('[settings.model] saveSetting failed:', err.message);
    throw err;
  }
}

async function deleteSetting(id) {
  try {
    if (!validId(id)) return false;
    return (await dbClient.deleteOne(COLLECTION, { id })) > 0;
  } catch (err) {
    console.error('[settings.model] deleteSetting failed:', err.message);
    throw err;
  }
}

module.exports = {
  COLLECTION,
  KEYS,
  getSetting,
  getSettings,
  createSetting,
  updateSetting,
  saveSetting,
  deleteSetting,
  get: async (id) => (validId(id) ? dbClient.findOne(COLLECTION, { id }) : null),
  list: getSettings,
  create: createSetting,
  update: updateSetting,
  remove: deleteSetting,
};
