const dbClient = require('../lib/dbClient');
const { validateInput, PATTERN } = require('../lib/validate');
const { compact, newRecord, validId } = require('./util');

const COLLECTION = 'customers';
const GENDERS = ['female', 'male', 'other', ''];

async function getCustomer(id) {
  try {
    if (!validId(id)) return null;
    return await dbClient.findOne(COLLECTION, { id });
  } catch (err) {
    console.error('[customers.model] getCustomer failed:', err.message);
    throw err;
  }
}

async function getCustomers() {
  try {
    return await dbClient.findMany(COLLECTION, {}, { sort: { createdAt: 1 } });
  } catch (err) {
    console.error('[customers.model] getCustomers failed:', err.message);
    throw err;
  }
}

// A new customer: the name is the only field that has to be there.
async function createCustomer(input) {
  try {
    const error = validateInput(input, {
      name: { required: true, type: 'string', nonEmpty: true, max: 120 },
      firstName: { type: 'string', max: 60 },
      lastName: { type: 'string', max: 60 },
      gender: { type: 'string', enum: GENDERS },
      member: { type: 'boolean' },
      memberTier: { type: 'string', enum: ['', 'member', '1000', '2000', '3000', '5000', 'vip'] },
      phone: { type: 'string', max: 40, pattern: PATTERN.phone },
      email: { type: 'string', max: 160, pattern: PATTERN.email },
      wechatId: { type: 'string', max: 60 },
      wechatNo: { type: 'string', max: 60 },
      notes: { type: 'string', max: 2000 },
      tags: { type: 'array' },
      createdBy: { type: 'string', max: 60 },
    });
    if (error) throw error;
    const query = newRecord(compact({
      name: input.name,
      firstName: input.firstName,
      lastName: input.lastName,
      gender: input.gender,
      member: input.member,
      memberTier: input.memberTier,
      phone: input.phone,
      email: input.email,
      wechatId: input.wechatId,
      wechatNo: input.wechatNo,
      notes: input.notes,
      tags: input.tags,
      createdBy: input.createdBy,
    }));
    await dbClient.insertOne(COLLECTION, query);
    return query;
  } catch (err) {
    console.error('[customers.model] createCustomer failed:', err.message);
    throw err;
  }
}

// An edit changes only the fields it sends: nothing is required.
async function updateCustomer(id, input) {
  try {
    if (!validId(id)) return null;
    const error = validateInput(input, {
      name: { type: 'string', nonEmpty: true, max: 120 },
      firstName: { type: 'string', max: 60 },
      lastName: { type: 'string', max: 60 },
      gender: { type: 'string', enum: GENDERS },
      member: { type: 'boolean' },
      memberTier: { type: 'string', enum: ['', 'member', '1000', '2000', '3000', '5000', 'vip'] },
      phone: { type: 'string', max: 40, pattern: PATTERN.phone },
      email: { type: 'string', max: 160, pattern: PATTERN.email },
      wechatId: { type: 'string', max: 60 },
      wechatNo: { type: 'string', max: 60 },
      notes: { type: 'string', max: 2000 },
      tags: { type: 'array' },
    });
    if (error) throw error;
    const query = compact({
      name: input.name,
      firstName: input.firstName,
      lastName: input.lastName,
      gender: input.gender,
      member: input.member,
      memberTier: input.memberTier,
      phone: input.phone,
      email: input.email,
      wechatId: input.wechatId,
      wechatNo: input.wechatNo,
      notes: input.notes,
      tags: input.tags,
    });
    return await dbClient.findOneAndUpdate(COLLECTION, { id }, { ...query, id, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[customers.model] updateCustomer failed:', err.message);
    throw err;
  }
}

async function deleteCustomer(id) {
  try {
    if (!validId(id)) return false;
    return (await dbClient.deleteOne(COLLECTION, { id })) > 0;
  } catch (err) {
    console.error('[customers.model] deleteCustomer failed:', err.message);
    throw err;
  }
}

module.exports = {
  COLLECTION,
  getCustomer,
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  // the generic names the store calls
  get: getCustomer,
  list: getCustomers,
  create: createCustomer,
  update: updateCustomer,
  remove: deleteCustomer,
};
