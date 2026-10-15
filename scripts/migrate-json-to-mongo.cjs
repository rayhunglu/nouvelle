#!/usr/bin/env node
// Copies the local CRM file (data/crm.json) into MongoDB, for when you switch the app from the file to MONGO_URL.
//   node -r dotenv/config scripts/migrate-json-to-mongo.cjs            dry run: shows what would be copied, writes nothing
//   node -r dotenv/config scripts/migrate-json-to-mongo.cjs --apply    copies; skips any collection that already has documents
//   node -r dotenv/config scripts/migrate-json-to-mongo.cjs --apply --force   copies even into a collection that has documents
// Documents keep their ids, so running it twice does not duplicate them (existing ids are skipped).
const fs = require('fs');
const path = require('path');
const dbClient = require('../src/lib/dbClient');

const FILE = path.join(process.env.CRM_DATA_DIR || path.join(__dirname, '..', 'data'), 'crm.json');
const apply = process.argv.includes('--apply');
const force = process.argv.includes('--force');

(async () => {
  if (!dbClient.enabled()) throw new Error('MONGO_URL is not set');
  const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  console.log(`${apply ? 'APPLY' : 'DRY RUN'}: ${FILE} -> database "${dbClient.dbName()}"`);
  for (const [name, rows] of Object.entries(data)) {
    if (!Array.isArray(rows)) continue;
    const have = (await dbClient.findMany(name, {}, { projection: { id: 1, _id: 0 } })).map((d) => d.id);
    const fresh = rows.filter((r) => !have.includes(r.id));
    const skip = have.length > 0 && !force;
    console.log(` - ${name}: ${rows.length} in file, ${have.length} already in MongoDB -> ${skip ? 'SKIP (collection not empty; use --force)' : `${fresh.length} to copy`}`);
    if (apply && !skip) for (const r of fresh) await dbClient.insertOne(name, r);
  }
  await dbClient.disconnect();
})().catch((e) => { console.error('migration failed:', e.message); process.exit(1); });
