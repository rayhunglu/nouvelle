const { MongoClient } = require('mongodb');

// One MongoClient per process, cached on `global` so a serverless platform (Vercel)
// reuses the connection across invocations instead of reconnecting on every request.
const enabled = () => Boolean(process.env.MONGODB_URI);
const dbName = () => process.env.MONGODB_DB || 'nouvelle';

function getClient() {
  if (!enabled()) return null;
  if (!global.__nouvelleMongoClient) {
    global.__nouvelleMongoClient = new MongoClient(process.env.MONGODB_URI).connect();
  }
  return global.__nouvelleMongoClient;
}

async function getDb() {
  const client = await getClient();
  return client.db(dbName());
}

module.exports = { enabled, dbName, getClient, getDb };
