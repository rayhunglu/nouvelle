// Spam checks for the public forms. A bot is answered with a normal "ok" (see routes/contact.js) so it
// gets no hint about what tripped the filter; the submission is simply dropped.

const MIN_FILL_MS = 2500;            // a person needs a few seconds to fill in a form
const MAX_FILL_MS = 6 * 60 * 60 * 1000;

// Random strings such as "rNHusyRPMErkYdbNJbg": 12+ letters with no spaces and several lower->upper switches.
function looksRandom(value) {
  const s = String(value || '').trim();
  if (s.length < 12 || !/^[A-Za-z]+$/.test(s)) return false;
  const switches = (s.match(/[a-z][A-Z]/g) || []).length;
  return switches >= 4 || (s.length >= 18 && switches >= 3);
}

const hasLink = (s) => /https?:\/\/|www\.|\.(com|net|org|ru|cn|top|xyz)\b/i.test(String(s || ''));

// Returns a reason string when the submission looks automated, otherwise null.
// eslint-disable-next-line no-unused-vars
function checkSpam(body, textFields) {
  const b = body || {};
  if (b.company) return 'honeypot';  // hidden field that people never fill in
  const elapsed = Number(b._elapsed);
  if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS || elapsed > MAX_FILL_MS) return 'timing';
  // Gibberish detection is switched off for now; remove the comment marks to turn it back on.
  // for (const f of textFields) if (looksRandom(b[f])) return `random:${f}`;
  const name = String(b.name || '');
  if (hasLink(name)) return 'link-in-name';
  return null;
}

// Phone must contain 7-15 digits and nothing but digits and common separators.
const validPhone = (p) => {
  const s = String(p || '').trim();
  const digits = s.replace(/\D/g, '');
  return /^[\d\s()+.\-–]+$/.test(s) && digits.length >= 7 && digits.length <= 15;
};
const validEmail = (e) => !e || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e).trim());

module.exports = { checkSpam, validPhone, validEmail };
