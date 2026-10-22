var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var dbClient = require('./lib/dbClient');
var expressSanitizer = require('./lib/expressSanitizer');
var { sessionInit, filterApis } = require('./lib/expressSession');
var { securityHeaders } = require('./middleware/security');

module.exports.createServer = () => {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1); // one proxy in front (Vercel / a load balancer): req.ip, req.protocol and secure cookies read it
  app.use(securityHeaders); // Cache-Control, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, CORS, CSP
  app.use(logger('dev'));

  // Request bodies. Job applications carry the resume as base64, so that route gets a bigger limit (Vercel caps requests at
  // about 4.5MB); it is mounted first, which makes the parser below skip the body it already read. Everything else stays small.
  const jsonOptions = (limit) => ({ limit, strict: false, type: ['application/json'] });
  app.use('/api/careers', express.json(jsonOptions('5mb')));
  app.use(express.json(jsonOptions('1mb')));
  app.use(express.urlencoded({ extended: false }));
  app.use(expressSanitizer); // XSS: cleans the body and the query string, refuses a URL that carries markup
  app.use(cookieParser());

  // Sessions for everything except /api/health.
  sessionInit();
  app.use(filterApis);

  require('./config/routes')(app);

  // UI: serve the Vite build output (no-cache is set above, so express does not add its own Cache-Control)
  app.use(express.static(path.join(__dirname, '..', 'dist'), { cacheControl: false }));
  // A missing build file (/assets/...) is a real 404: answering it with the page would make a page left open across an update fail with
  // a confusing "Failed to fetch dynamically imported module" instead of a plain missing file.
  app.get(/^\/(?!api|assets\/).*/, (req, res) => {
    if (/^\/((en|zh)\/(account|login|register|join)|crm|staff-login|forgot-password|reset-password)(\/|$)/.test(req.path)) res.setHeader('X-Robots-Tag', 'noindex, nofollow'); // staff and member pages stay out of search engines
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'), { cacheControl: false });
  });

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function (err, req, res, _next) {
    res.status(err.status || 500);
    // Internal error details stay in the server log in production.
    const expose = (err.status || 500) < 500 || process.env.NODE_ENV !== 'production';
    if (!expose) console.error(err);
    res.json({ error: expose ? err.message : 'Internal server error' });
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

// The entry points (src/index.js, api/index.js) call this: connect to MongoDB first, then build the app.
module.exports.default = async () => {
  try {
    if (await dbClient.init()) await dbClient.connection(); // without MONGO_URL the app keeps using its local JSON file
    return this.createServer();
  } catch (err) {
    console.error('[app] startup failed:', err.message);
    throw err;
  }
};
