const { requireAuth } = require('../middleware/auth');
const contact = require('../routes/contact');
const auth = require('../routes/auth');
const crm = require('../routes/crm');

const REST_PREFIX = '/api';
// Everything under this prefix is for the CRM only and requires a signed-in session.
const CRM_PREFIX = `${REST_PREFIX}/crm`;

module.exports = (app) => {
  // Health check: answers JSON only when this Express app is the one serving the request.
  app.get(`${REST_PREFIX}/hello`, (req, res) => {
    res.json({ message: 'hello from express', time: new Date().toISOString() });
  });

  // Public website endpoints
  app.post(`${REST_PREFIX}/contact`, contact.postMessage);
  app.post(`${REST_PREFIX}/careers`, contact.postApplication);

  // Session auth
  app.post(`${REST_PREFIX}/auth/login`, auth.login);
  app.post(`${REST_PREFIX}/auth/logout`, auth.logout);
  app.get(`${REST_PREFIX}/auth/me`, auth.me);

  // CRM-only API: auth check runs before any CRM handler
  app.use(CRM_PREFIX, requireAuth, crm);
};
