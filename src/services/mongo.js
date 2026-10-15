const dbClient = require('../lib/dbClient');

// Thin wrapper kept for the older callers: everything now goes through lib/dbClient.js (one shared connection).
const enabled = () => dbClient.enabled();
const dbName = () => dbClient.dbName();
const getClient = () => (dbClient.enabled() ? dbClient.connection() : null);

async function getDb() {
  await dbClient.connection();
  return dbClient.db;
}

module.exports = { enabled, dbName, getClient, getDb };
