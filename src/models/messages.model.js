const dbClient = require('../lib/dbClient');
const { validateInput, PATTERN } = require('../lib/validate');
const { compact, newRecord, validId } = require('./util');

// Website contact-form messages. They are only added and deleted, never edited.
const COLLECTION = 'messages';

async function getMessage(id) {
  try {
    if (!validId(id)) return null;
    return await dbClient.findOne(COLLECTION, { id });
  } catch (err) {
    console.error('[messages.model] getMessage failed:', err.message);
    throw err;
  }
}

async function getMessages() {
  try {
    return await dbClient.findMany(COLLECTION, {}, { sort: { createdAt: 1 } });
  } catch (err) {
    console.error('[messages.model] getMessages failed:', err.message);
    throw err;
  }
}

// Name and phone are required; everything else the form may leave blank.
async function createMessage(input) {
  try {
    const error = validateInput(input, {
      name: { required: true, type: 'string', nonEmpty: true, max: 120 },
      phone: { required: true, type: 'string', nonEmpty: true, max: 40, pattern: PATTERN.phone },
      email: { type: 'string', max: 160, pattern: PATTERN.email },
      wechat: { type: 'string', max: 80 },
      category: { type: 'string', max: 80 },
      categoryEn: { type: 'string', max: 80 },
      interest: { type: 'string', max: 200 },
      interestEn: { type: 'string', max: 120 },
      package: { type: 'string', max: 200 },
      visitType: { type: 'string', max: 20 },
      price: { type: 'string', max: 20 },
      date: { type: 'string', max: 20 },
      time: { type: 'string', max: 10 },
      message: { type: 'string', max: 4000 },
    });
    if (error) throw error;
    const query = newRecord(compact({
      name: input.name,
      phone: input.phone,
      email: input.email,
      wechat: input.wechat,
      category: input.category,
      categoryEn: input.categoryEn,
      interest: input.interest,
      interestEn: input.interestEn,
      package: input.package,
      visitType: input.visitType,
      price: input.price,
      date: input.date,
      time: input.time,
      message: input.message,
    }));
    await dbClient.insertOne(COLLECTION, query);
    return query;
  } catch (err) {
    console.error('[messages.model] createMessage failed:', err.message);
    throw err;
  }
}

async function deleteMessage(id) {
  try {
    if (!validId(id)) return false;
    return (await dbClient.deleteOne(COLLECTION, { id })) > 0;
  } catch (err) {
    console.error('[messages.model] deleteMessage failed:', err.message);
    throw err;
  }
}

module.exports = {
  COLLECTION,
  getMessage,
  getMessages,
  createMessage,
  deleteMessage,
  get: getMessage,
  list: getMessages,
  create: createMessage,
  remove: deleteMessage,
  // messages are never edited
  update: async () => { throw Object.assign(new Error('messages cannot be edited'), { status: 400 }); },
};
