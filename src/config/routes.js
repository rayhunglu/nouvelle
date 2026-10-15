const { requireAuth } = require('../middleware/auth');
const contact = require('../routes/contact');
const auth = require('../routes/auth');
const express = require('express');
const access = require('../middleware/crmAccess');
const customers = require('../controllers/crm/customers');
const appointments = require('../controllers/crm/appointments');
const payments = require('../controllers/crm/payments');
const blocks = require('../controllers/crm/blocks');
const services = require('../controllers/crm/services');
const users = require('../controllers/crm/users');
const { getSummary } = require('../controllers/crm/summary');
const { getSettings, putSettings } = require('../controllers/crm/settings');
const { getRoster, addStaff, removeStaff } = require('../controllers/crm/roster');
const { getSchedule, putSchedule } = require('../controllers/crm/schedule');
const { getStaffProfile, putStaffProfile, testStaffProfile, checkCalendar } = require('../controllers/crm/staffProfile');
const mongo = require('../services/mongo');
const { rateLimit } = require('../middleware/security');

const REST_PREFIX = '/api';
// Everything under this prefix is for the CRM only and requires a signed-in session.
const CRM_PREFIX = `${REST_PREFIX}/crm`;

// Every CRM route in one place. Handlers live in controllers/crm/; who may call what is decided by middleware/crmAccess.js
// (staff accounts are limited to the routes it allows) and by `adminOnly` (store manager only).
function crmRouter() {
  const r = express.Router();
  const { adminOnly } = access;
  r.use(access.loadPermissions, access.staffGate, access.cleanOrphansOnce);

  // Dashboard
  r.get('/summary', getSummary);

  // Customers
  r.get('/customers', customers.list);
  r.get('/customers/:id', customers.get);
  r.post('/customers', customers.create);
  r.put('/customers/:id', customers.update);
  r.delete('/customers/:id', customers.remove);

  // Appointments
  r.get('/appointments', appointments.list);
  r.get('/appointments/:id', appointments.get);
  r.post('/appointments', appointments.create);
  r.put('/appointments/:id', appointments.update);
  r.delete('/appointments/:id', appointments.remove);

  // Payments
  r.get('/payments', payments.list);
  r.get('/payments/:id', payments.get);
  r.post('/payments', payments.create);
  r.put('/payments/:id', payments.update);
  r.delete('/payments/:id', payments.remove);

  // Blocked time ("有事，不接受预约")
  r.get('/blocks', blocks.list);
  r.get('/blocks/:id', blocks.get);
  r.post('/blocks', blocks.create);
  r.put('/blocks/:id', blocks.update);
  r.delete('/blocks/:id', blocks.remove);

  // Service names
  r.get('/services', services.list);
  r.get('/services/:id', services.get);
  r.post('/services', services.create);
  r.put('/services/:id', services.update);
  r.delete('/services/:id', services.remove);

  // Opening hours and room closures
  r.get('/settings', getSettings);
  r.put('/settings', adminOnly, putSettings);

  // Staff roster (the people who take appointments)
  r.get('/staff-list', getRoster);
  r.post('/staff-list', adminOnly, addStaff);
  r.delete('/staff-list/:name', adminOnly, removeStaff);

  // Staff attendance
  r.get('/schedule', getSchedule);
  r.put('/schedule', adminOnly, putSchedule);

  // Staff contact details and new-booking alerts
  r.get('/staff-profile', adminOnly, getStaffProfile);
  r.put('/staff-profile', adminOnly, putStaffProfile);
  r.post('/staff-profile/test', adminOnly, testStaffProfile);
  r.post('/staff-profile/calendar-check', adminOnly, checkCalendar);

  // Staff accounts
  r.get('/users', adminOnly, users.list);
  r.post('/users', adminOnly, users.create);
  r.put('/users/:id', adminOnly, users.update);
  r.delete('/users/:id', adminOnly, users.remove);

  return r;
}

module.exports = (app) => {
  // Liveness check for the platform: answers before sessions or the datastore are touched.
  app.get(`${REST_PREFIX}/health`, (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

  // Public website endpoints
  // At most 5 submissions per IP per 10 minutes on each public form.
  const formLimit = rateLimit({ windowMs: 10 * 60 * 1000, max: 5 });
  app.post(`${REST_PREFIX}/contact`, formLimit, contact.postMessage);
  app.post(`${REST_PREFIX}/careers`, formLimit, contact.postApplication);

  // Session auth
  app.post(`${REST_PREFIX}/auth/login`, auth.login);
  app.post(`${REST_PREFIX}/auth/logout`, auth.logout);
  app.get(`${REST_PREFIX}/auth/me`, auth.me);
  // Emailed password links: ask for one, then set the password with it
  const resetLimit = rateLimit({ windowMs: 10 * 60 * 1000, max: 10 });
  app.post(`${REST_PREFIX}/auth/forgot`, resetLimit, auth.forgotPassword);
  app.post(`${REST_PREFIX}/auth/reset`, resetLimit, auth.resetPassword);

  // CRM-only API: auth check runs before any CRM handler
  app.use(CRM_PREFIX, requireAuth, crmRouter());
};
