const dbClient = require('../lib/dbClient');
const { validateInput } = require('../lib/validate');
const { compact, newRecord, validId } = require('./util');

// Time the clinic does not take bookings ("有事，不接受预约"): one room, or every room when `room` is ''.
const COLLECTION = 'blocks';

async function getBlock(id) {
  try {
    if (!validId(id)) return null;
    return await dbClient.findOne(COLLECTION, { id });
  } catch (err) {
    console.error('[blocks.model] getBlock failed:', err.message);
    throw err;
  }
}

async function getBlocks() {
  try {
    return await dbClient.findMany(COLLECTION, {}, { sort: { start: 1 } });
  } catch (err) {
    console.error('[blocks.model] getBlocks failed:', err.message);
    throw err;
  }
}

async function createBlock(input) {
  try {
    const error = validateInput(input, {
      start: { required: true, type: 'string', nonEmpty: true },
      durationMin: { required: true, type: 'number', min: 15, max: 1440 },
      room: { required: true, type: 'string', max: 30 },
      reason: { required: true, type: 'string', max: 200 },
    });
    if (error) throw error;
    const query = newRecord({ start: input.start, durationMin: input.durationMin, room: input.room, reason: input.reason });
    await dbClient.insertOne(COLLECTION, query);
    return query;
  } catch (err) {
    console.error('[blocks.model] createBlock failed:', err.message);
    throw err;
  }
}

async function updateBlock(id, input) {
  try {
    if (!validId(id)) return null;
    const error = validateInput(input, {
      start: { type: 'string', nonEmpty: true },
      durationMin: { type: 'number', min: 15, max: 1440 },
      room: { type: 'string', max: 30 },
      reason: { type: 'string', max: 200 },
    });
    if (error) throw error;
    const query = compact({ start: input.start, durationMin: input.durationMin, room: input.room, reason: input.reason });
    return await dbClient.findOneAndUpdate(COLLECTION, { id }, { ...query, id, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[blocks.model] updateBlock failed:', err.message);
    throw err;
  }
}

async function deleteBlock(id) {
  try {
    if (!validId(id)) return false;
    return (await dbClient.deleteOne(COLLECTION, { id })) > 0;
  } catch (err) {
    console.error('[blocks.model] deleteBlock failed:', err.message);
    throw err;
  }
}

module.exports = {
  COLLECTION,
  getBlock,
  getBlocks,
  createBlock,
  updateBlock,
  deleteBlock,
  get: getBlock,
  list: getBlocks,
  create: createBlock,
  update: updateBlock,
  remove: deleteBlock,
};
