const store = require('../services/store');

const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// Website forms are saved to the datastore (MongoDB in production, the JSON file locally),
// so a visitor's request is not lost when the host has no persistent log.
async function postMessage(req, res, next) {
  try {
    const { name, phone, email, interest, message, package: pkg, visitType, price, date, time } = req.body;
    if (!name || !phone || !email) {
      return res.status(400).json({ error: 'name, phone and email are required' });
    }
    const record = {
      name: clean(name, 120), phone: clean(phone, 40), email: clean(email, 160), interest: clean(interest, 200),
      message: clean(message, 4000), package: clean(pkg, 200), visitType: clean(visitType, 20),
      price: clean(price, 20), date: clean(date, 20), time: clean(time, 10),
    };
    console.log('New contact message:', record);
    await store.create('messages', record);
    res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function postApplication(req, res, next) {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required' });
    }
    console.log('New job application:', { name, email });
    await store.create('applications', { name: clean(name, 120), email: clean(email, 160), phone: clean(phone, 40) });
    res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  postMessage,
  postApplication,
};
