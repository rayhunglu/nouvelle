const store = require('../services/store');
const mailer = require('../services/mailer');
const mongo = require('../services/mongo');

const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// Website forms: saved to MongoDB when MONGODB_URI is set (skipped otherwise, never to a JSON file)
// and announced by email (Gmail SMTP) when GMAIL_* is set.
async function postMessage(req, res, next) {
  try {
    const { name, phone, email, wechat, category, categoryEn, interestEn, interest, message, package: pkg, visitType, price, date, time } = req.body;
    // Email and WeChat ID are optional; name and phone are required.
    if (!name || !phone) {
      return res.status(400).json({ error: 'name and phone are required' });
    }
    const record = {
      name: clean(name, 120), phone: clean(phone, 40), email: clean(email, 160), wechat: clean(wechat, 80), category: clean(category, 80), categoryEn: clean(categoryEn, 80), interestEn: clean(interestEn, 120), interest: clean(interest, 200),
      message: clean(message, 4000), package: clean(pkg, 200), visitType: clean(visitType, 20),
      price: clean(price, 20), date: clean(date, 20), time: clean(time, 10),
    };
    console.log('New contact message:', record);
    // Saved only when MongoDB is configured (no JSON-file fallback for website forms); the email
    // notification is independent, and the request counts as received if either one worked.
    let saved = false;
    if (mongo.enabled()) {
      try {
        await store.create('messages', record);
        saved = true;
      } catch (err) {
        console.error('Could not save contact message:', err.message);
      }
    } else {
      console.warn('MONGODB_URI not set; contact message not saved');
    }
    // Awaited so serverless hosts (Vercel) do not freeze the function before the mail is sent.
    const emailed = await mailer.sendContactNotification(record);
    if (!saved && !emailed) {
      return res.status(500).json({ error: 'Could not save or send the message' });
    }
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
    if (mongo.enabled()) {
      await store.create('applications', { name: clean(name, 120), email: clean(email, 160), phone: clean(phone, 40) });
    } else {
      console.warn('MONGODB_URI not set; job application not saved');
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  postMessage,
  postApplication,
};
