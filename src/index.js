#!/usr/bin/env node

// Local / long-running entry point (`npm start`). On Vercel this file is not used:
// api/index.js hands the same Express app to the platform instead of listening.
const app = require('./app').default;

app().then((app) => {
  const port = app.get('port');

  const server = app.listen(port, () => {
    console.log('Listening on port ' + port);
  });

  server.on('error', (error) => {
    if (error.code === 'EACCES') {
      console.error('Port ' + port + ' requires elevated privileges');
      process.exit(1);
    }
    if (error.code === 'EADDRINUSE') {
      console.error('Port ' + port + ' is already in use');
      process.exit(1);
    }
    throw error;
  });
});
