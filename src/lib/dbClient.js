const { MongoClient } = require('mongodb');

// One MongoDB connection for the whole process.
//   MONGO_URL   connection string with the user name and password (MONGODB_URI also works)
//   MONGO_DB    database name (default: the one in the URL path, otherwise "nouvelle")
// Every method is async and wraps its work in try / catch: the error is logged with the method name and then re-thrown, so
// the caller (a model, a route) decides what the user sees.
class MongoDBClient {
  constructor() {
    this.client = null;
    this.db = null;
    this.connecting = null; // the pending connect(), so concurrent callers share one connection
  }

  url() {
    return process.env.MONGO_URL || process.env.MONGODB_URI || '';
  }

  enabled() {
    return Boolean(this.url());
  }

  dbName() {
    if (process.env.MONGO_DB || process.env.MONGODB_DB) return process.env.MONGO_DB || process.env.MONGODB_DB;
    try {
      const path = new URL(this.url().replace(/^mongodb(\+srv)?:/, 'http:')).pathname.replace(/^\//, '');
      if (path) return decodeURIComponent(path);
    } catch { /* fall through to the default */ }
    return 'nouvelle';
  }

  // Creates the MongoClient (no network yet). Returns false when no URL is configured: the app then keeps using its local file.
  async init() {
    try {
      if (!this.enabled()) return false;
      if (!this.client) {
        this.client = new MongoClient(this.url(), { serverSelectionTimeoutMS: 10000, maxPoolSize: 10 });
      }
      return true;
    } catch (err) {
      console.error('[dbClient] init failed:', err.message);
      throw err;
    }
  }

  // Opens the connection (once; later calls reuse it) and returns the connected client.
  async connection() {
    try {
      if (!(await this.init())) throw new Error('MONGO_URL is not set');
      if (!this.connecting) {
        this.connecting = this.client.connect().then(() => {
          this.db = this.client.db(this.dbName());
          return this.client;
        });
      }
      return await this.connecting;
    } catch (err) {
      this.connecting = null; // let the next call try again
      console.error('[dbClient] connection failed:', err.message);
      throw err;
    }
  }

  async disconnect() {
    try {
      if (this.client) await this.client.close();
    } catch (err) {
      console.error('[dbClient] disconnect failed:', err.message);
      throw err;
    } finally {
      this.client = null;
      this.db = null;
      this.connecting = null;
    }
  }

  async getCollection(name) {
    try {
      await this.connection();
      return this.db.collection(name);
    } catch (err) {
      console.error(`[dbClient] getCollection(${name}) failed:`, err.message);
      throw err;
    }
  }

  // Documents in `collection` expire `seconds` after the date stored in `field` (MongoDB removes them in the background).
  async createTTLIndex(collection, field, seconds) {
    try {
      const col = await this.getCollection(collection);
      return await col.createIndex({ [field]: 1 }, { expireAfterSeconds: seconds });
    } catch (err) {
      console.error(`[dbClient] createTTLIndex(${collection}.${field}) failed:`, err.message);
      throw err;
    }
  }

  async insertOne(collection, doc) {
    try {
      const col = await this.getCollection(collection);
      await col.insertOne({ ...doc }); // insertOne adds _id to what it is given: pass a copy
      return doc;
    } catch (err) {
      console.error(`[dbClient] insertOne(${collection}) failed:`, err.message);
      throw err;
    }
  }

  async findOne(collection, filter = {}, options = {}) {
    try {
      const col = await this.getCollection(collection);
      return await col.findOne(filter, { projection: { _id: 0 }, ...options });
    } catch (err) {
      console.error(`[dbClient] findOne(${collection}) failed:`, err.message);
      throw err;
    }
  }

  // options: { sort, limit, skip, projection }
  async findMany(collection, filter = {}, options = {}) {
    try {
      const col = await this.getCollection(collection);
      const { sort, limit, skip, projection } = options;
      let cursor = col.find(filter, { projection: projection || { _id: 0 } });
      if (sort) cursor = cursor.sort(sort);
      if (skip) cursor = cursor.skip(skip);
      if (limit) cursor = cursor.limit(limit);
      return await cursor.toArray();
    } catch (err) {
      console.error(`[dbClient] findMany(${collection}) failed:`, err.message);
      throw err;
    }
  }

  // Updates the first document matching `filter` with the fields of `doc`, or inserts one when there is none.
  async upsert(collection, filter, doc) {
    try {
      const col = await this.getCollection(collection);
      const res = await col.updateOne(filter, { $set: doc }, { upsert: true });
      return { matched: res.matchedCount, modified: res.modifiedCount, upsertedId: res.upsertedId || null };
    } catch (err) {
      console.error(`[dbClient] upsert(${collection}) failed:`, err.message);
      throw err;
    }
  }

  // Updates one existing document and returns the new version (or null when nothing matched).
  async findOneAndUpdate(collection, filter, set) {
    try {
      const col = await this.getCollection(collection);
      return await col.findOneAndUpdate(filter, { $set: set }, { returnDocument: 'after', projection: { _id: 0 } });
    } catch (err) {
      console.error(`[dbClient] findOneAndUpdate(${collection}) failed:`, err.message);
      throw err;
    }
  }

  async deleteOne(collection, filter) {
    try {
      const col = await this.getCollection(collection);
      return (await col.deleteOne(filter)).deletedCount;
    } catch (err) {
      console.error(`[dbClient] deleteOne(${collection}) failed:`, err.message);
      throw err;
    }
  }

  async deleteMany(collection, filter = {}) {
    try {
      const col = await this.getCollection(collection);
      return (await col.deleteMany(filter)).deletedCount;
    } catch (err) {
      console.error(`[dbClient] deleteMany(${collection}) failed:`, err.message);
      throw err;
    }
  }
}

// A serverless host (Vercel) re-runs the module on a warm instance: keep the one client on `global` so it is reused.
const instance = global.__nouvelleDbClient || (global.__nouvelleDbClient = new MongoDBClient());

module.exports = instance;
module.exports.MongoDBClient = MongoDBClient;
