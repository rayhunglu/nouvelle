// Phone numbers as E.164 (+15551234567). A bare 10-digit number (or 11 digits starting with 1) is taken as a US number; anything else needs its own + country code.
function toE164(raw) {
  const s = String(raw || '').trim();
  const digits = s.replace(/\D/g, '');
  if (s.startsWith('+')) return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits[0] === '1') return `+${digits}`;
  return null;
}

module.exports = { toE164 };
