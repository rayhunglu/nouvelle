var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var crypto = require('crypto');
var mongo = require('./services/mongo');

module.exports.createServer = () => {
  const app = express();

  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  // Session auth (CRM login). MemoryStore is fine for a single-process prototype;
  // use a persistent store (e.g. connect-redis) for production.
  const secret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
  if (!process.env.SESSION_SECRET) {
    console.warn('[session] SESSION_SECRET not set; using a random secret (sessions reset on restart).');
    if (process.env.VERCEL) console.warn('[session] On Vercel every instance would get its own secret: set SESSION_SECRET in the project settings.');
  }
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) app.set('trust proxy', 1);
  // With MONGODB_URI the sessions live in MongoDB, so logins survive restarts and are shared
  // between serverless instances. Without it, express-session's MemoryStore is used (local dev only).
  const sessionOptions = {
    name: 'nouvelle.sid',
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', secure: isProd, maxAge: 1000 * 60 * 60 * 8 },
  };
  if (mongo.enabled()) {
    const { MongoStore } = require('connect-mongo');
    sessionOptions.store = MongoStore.create({
      clientPromise: mongo.getClient(),
      dbName: mongo.dbName(),
      collectionName: 'sessions',
      ttl: 60 * 60 * 8,
    });
  }
  app.use(session(sessionOptions));

  require('./config/routes')(app);

  // UI: serve the Vite build output
  app.use(express.static(path.join(__dirname, '..', 'dist')));
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function (err, req, res, _next) {
    res.status(err.status || 500);
    res.json({ error: err.message });
  });

  var port = normalizePort(process.env.PORT || '3000');
  app.set('port', port);

  return app;
};

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

module.exports.default = async () => Promise.resolve().then(this.createServer);
