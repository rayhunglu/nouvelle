const dbClient = require('../lib/dbClient');
const { newRecord, validId } = require('./util');

// Metadata of the documents kept in Google Drive for a customer (the bytes themselves are only in Drive).
const COLLECTION = 'customerFiles';

async function listFiles() {
  try {
    return await dbClient.findMany(COLLECTION, {}, { sort: { createdAt: -1 } });
  } catch (err) {
    console.error('[customerFiles.model] listFiles failed:', err.message);
    throw err;
  }
}

async function getFile(id) {
  try {
    if (!validId(id)) return null;
    return await dbClient.findOne(COLLECTION, { id });
  } catch (err) {
    console.error('[customerFiles.model] getFile failed:', err.message);
    throw err;
  }
}

async function createFile(input) {
  try {
    const row = newRecord({ customerId: input.customerId, driveId: input.driveId, name: input.name, mimeType: input.mimeType, size: input.size, uploadedBy: input.uploadedBy });
    await dbClient.insertOne(COLLECTION, row);
    return row;
  } catch (err) {
    console.error('[customerFiles.model] createFile failed:', err.message);
    throw err;
  }
}

async function deleteFile(id) {
  try {
    if (!validId(id)) return false;
    return (await dbClient.deleteOne(COLLECTION, { id })) > 0;
  } catch (err) {
    console.error('[customerFiles.model] deleteFile failed:', err.message);
    throw err;
  }
}

module.exports = { COLLECTION, get: getFile, list: listFiles, create: createFile, remove: deleteFile };
