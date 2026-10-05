const REST_PREFIX = '/api';
const contact = require('../routes/contact');

module.exports = (app) => {
  app.post(`${REST_PREFIX}/contact`, contact.postMessage);
  app.post(`${REST_PREFIX}/careers`, contact.postApplication);
};
