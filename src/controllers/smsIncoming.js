// Twilio calls this when a customer texts our number (Messaging → the number → "A message comes in"). Only the opt-out words matter here:
// STOP and friends set the customer's `smsOptIn` to false, START and friends turn it back on (for someone who had opted in before).
// Twilio answers those words itself, so this replies with an empty response. Anyone can POST to a public URL, so every call must carry
// Twilio's signature (X-Twilio-Signature, made with TWILIO_AUTH_TOKEN); without it nothing is changed.
const crypto = require('crypto');
const store = require('../services/store');
const { toE164 } = require('../services/phone');

const STOP_WORDS = new Set(['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT']);
const START_WORDS = new Set(['START', 'YES', 'UNSTOP']);
const EMPTY = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

// base64(HMAC-SHA1(auth token, full URL + every POST field as name+value, sorted by name)): https://www.twilio.com/docs/usage/security
function validSignature(req, params) {
  const token = process.env.TWILIO_AUTH_TOKEN;
  const given = req.get('X-Twilio-Signature');
  if (!token || !given) return false;
  const url = process.env.TWILIO_WEBHOOK_URL || `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  const data = Object.keys(params).sort().reduce((acc, k) => acc + k + params[k], url);
  const want = crypto.createHmac('sha1', token).update(data).digest('base64');
  return given.length === want.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(want));
}

// What the customer meant: Twilio's own reading (OptOutType) when it sends one, else the exact word they texted.
function intentOf(params) {
  const type = String(params.OptOutType || '').toUpperCase();
  if (type === 'STOP') return 'stop';
  if (type === 'START') return 'start';
  const word = String(params.Body || '').trim().toUpperCase();
  return STOP_WORDS.has(word) ? 'stop' : START_WORDS.has(word) ? 'start' : null;
}

async function incoming(req, res) {
  try {
    // The signature covers the fields exactly as Twilio sent them, so read the raw body (the sanitizer may have altered req.body).
    const params = req.rawBody ? Object.fromEntries(new URLSearchParams(req.rawBody.toString('utf8'))) : {};
    if (!process.env.TWILIO_AUTH_TOKEN) return res.status(503).type('text/plain').send('SMS webhook is not configured');
    if (!validSignature(req, params)) return res.status(403).type('text/plain').send('Invalid signature');
    const intent = intentOf(params);
    const phone = toE164(params.From);
    if (intent && phone) {
      const now = new Date().toISOString();
      let changed = 0;
      for (const c of (await store.list('customers')).filter((x) => toE164(x.phone) === phone)) {
        if (intent === 'stop' && c.smsOptIn !== false) { await store.update('customers', c.id, { smsOptIn: false, smsOptOutAt: now }); changed += 1; }
        // Texting START only brings back someone who had opted in before; it never opts in a customer who never agreed.
        if (intent === 'start' && c.smsOptIn !== true && c.smsConsentAt) { await store.update('customers', c.id, { smsOptIn: true, smsOptOutAt: '' }); changed += 1; }
      }
      console.log(`[sms] ${intent} from ...${phone.slice(-4)}: ${changed} customer(s) updated`);
    }
    return res.type('text/xml').send(EMPTY);
  } catch (err) {
    console.error('[sms] incoming failed:', err.message);
    return res.status(500).type('text/plain').send('error');
  }
}

module.exports = { incoming, validSignature, intentOf };
