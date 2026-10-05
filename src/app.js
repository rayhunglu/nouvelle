var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

module.exports.createServer = () => {
  const app = express();

  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

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
