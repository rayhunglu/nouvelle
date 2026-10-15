const crypto = require('crypto');
const session = require('express-session');
const dbClient = require('./dbClient');

// Sessions for the CRM login. The secret is SESSION_SECRET.
// With MONGO_URL the sessions live in MongoDB, so logins survive restarts and are shared between serverless instances;
// without it express-session's MemoryStore is used (local development only).
let sessionParser = null;

function sessionInit() {
  // Secure cookies need HTTPS, so only local development (NODE_ENV=development in .env) goes without.
  const secure = process.env.NODE_ENV !== 'development';
  // The signing secret comes from SESSION_SECRET (every serverless instance must share it, or a login made on one instance is
  // rejected by the next). Without it a random one is made at start: fine locally, but on Vercel logins would keep dropping.
  let secret = process.env.SESSION_SECRET;
  if (!secret) {
    secret = crypto.randomBytes(32).toString('hex');
    console.warn('[session] SESSION_SECRET not set; using a random secret (sessions reset on restart). Make one with: node scripts/generate-secret.cjs');
  }
  const options = {
    name: 'nouvelle.sid',
    secret,
    genid: () => crypto.randomBytes(16).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'strict', secure, maxAge: 8 * 3600 * 1000 },
  };
  if (dbClient.enabled()) {
    const { MongoStore } = require('connect-mongo');
    options.store = MongoStore.create({
      clientPromise: dbClient.connection(),
      dbName: dbClient.dbName(),
      collectionName: 'sessions',
      ttl: 60 * 60 * 8,
    });
  }
  sessionParser = session(options);
  return sessionParser;
}

// Everything except the health check goes through the session parser (the health check must answer without touching the store).
function filterApis(req, res, next) {
  if (req.url.split('?')[0] === '/api/health') return next();
  if (!sessionParser) sessionInit();
  return sessionParser(req, res, next);
}

module.exports = { sessionInit, filterApis };
