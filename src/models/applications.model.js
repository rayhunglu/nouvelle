const dbClient = require('../lib/dbClient');
const { validateInput, PATTERN } = require('../lib/validate');
const { compact, newRecord, validId } = require('./util');

// Job applications from the careers form (the resume itself is only emailed; its file name is kept). Added and deleted, not edited.
const COLLECTION = 'applications';

async function getApplication(id) {
  try {
    if (!validId(id)) return null;
    return await dbClient.findOne(COLLECTION, { id });
  } catch (err) {
    console.error('[applications.model] getApplication failed:', err.message);
    throw err;
  }
}

async function getApplications() {
  try {
    return await dbClient.findMany(COLLECTION, {}, { sort: { createdAt: 1 } });
  } catch (err) {
    console.error('[applications.model] getApplications failed:', err.message);
    throw err;
  }
}

async function createApplication(input) {
  try {
    const error = validateInput(input, {
      name: { required: true, type: 'string', nonEmpty: true, max: 120 },
      email: { required: true, type: 'string', nonEmpty: true, max: 160, pattern: PATTERN.email },
      phone: { type: 'string', max: 40, pattern: PATTERN.phone },
      resumeName: { type: 'string', max: 200 },
    });
    if (error) throw error;
    const query = newRecord(compact({ name: input.name, email: input.email, phone: input.phone, resumeName: input.resumeName }));
    await dbClient.insertOne(COLLECTION, query);
    return query;
  } catch (err) {
    console.error('[applications.model] createApplication failed:', err.message);
    throw err;
  }
}

async function deleteApplication(id) {
  try {
    if (!validId(id)) return false;
    return (await dbClient.deleteOne(COLLECTION, { id })) > 0;
  } catch (err) {
    console.error('[applications.model] deleteApplication failed:', err.message);
    throw err;
  }
}

module.exports = {
  COLLECTION,
  getApplication,
  getApplications,
  createApplication,
  deleteApplication,
  get: getApplication,
  list: getApplications,
  create: createApplication,
  remove: deleteApplication,
  update: async () => { throw Object.assign(new Error('applications cannot be edited'), { status: 400 }); },
};
