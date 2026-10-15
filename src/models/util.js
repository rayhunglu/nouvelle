const crypto = require('crypto');

// Small helpers the models share. The rules themselves (what each function accepts) live in each model function.

// Keeps only the keys that were actually given: an update must not overwrite a field with `undefined`.
const compact = (query) => Object.fromEntries(Object.entries(query).filter(([, v]) => v !== undefined));

// A new document: our own string `id` (the Mongo `_id` is hidden everywhere) and its creation time.
const newRecord = (query) => ({ ...query, id: crypto.randomUUID(), createdAt: new Date().toISOString() });

// ids are plain strings: this rejects query objects such as {"$ne": null} sent by a caller.
const validId = (id) => typeof id === 'string' && id.length > 0;

module.exports = { compact, newRecord, validId };
