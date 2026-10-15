#!/usr/bin/env node
// Creates the database and its collections (with the unique `id` index each one uses) on whatever MONGO_URL points at.
// Safe to run again: existing collections and indexes are left alone.
//   node -r dotenv/config scripts/setup-mongo.cjs
const dbClient = require('../src/lib/dbClient');

const COLLECTIONS = ['customers', 'appointments', 'payments', 'services', 'messages', 'applications', 'users', 'blocks', 'settings'];

(async () => {
  if (!dbClient.enabled()) throw new Error('MONGO_URL is not set');
  await dbClient.connection();
  const have = (await dbClient.db.listCollections().toArray()).map((c) => c.name);
  console.log(`database "${dbClient.dbName()}"`);
  for (const name of COLLECTIONS) {
    if (!have.includes(name)) await dbClient.db.createCollection(name);
    await dbClient.db.collection(name).createIndex({ id: 1 }, { unique: true });
    console.log(` - ${name}: ${have.includes(name) ? 'already there' : 'created'}, unique index on id`);
  }
  await dbClient.disconnect();
})().catch((e) => { console.error('setup failed:', e.message); process.exit(1); });
