// One model per collection; the generic store looks them up by collection name.
module.exports = {
  users: require('./users.model'),
  customers: require('./customers.model'),
  appointments: require('./appointments.model'),
  payments: require('./payments.model'),
  services: require('./services.model'),
  messages: require('./messages.model'),
  applications: require('./applications.model'),
  blocks: require('./blocks.model'),
  settings: require('./settings.model'),
  customerFiles: require('./customerFiles.model'),
};
