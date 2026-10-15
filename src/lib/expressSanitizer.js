// XSS protection for incoming requests: the URL, the query string and the JSON / form body.
// Text that looks like markup is cleaned (tags, script blocks, javascript: links); a URL that carries markup is refused.
// Plain text (Chinese names, "&", quotes) is left untouched, because the pages render it as text.

// Fields that must reach the handler exactly as sent: passwords (any character is allowed) and base64 file data.
const SKIP_KEYS = new Set(['password', 'passwordHash', 'content']);

const BLOCKS = /<\s*(script|style|iframe|object|embed|svg|math)\b[\s\S]*?<\s*\/\s*\1\s*>/gi; // whole <script>…</script>-style blocks
const COMMENTS = /<!--[\s\S]*?-->/g;
const TAGS = /<\s*\/?\s*[a-zA-Z!][^>]*>/g; // any remaining tag
const OPEN_ANGLE = /<(?=\s*[\/a-zA-Z!])/g; // a "<" that still starts something tag-like (no closing ">")
const JS_URL = /\b(?:javascript|vbscript)\s*:/gi;
const DATA_HTML = /\bdata\s*:\s*text\/html/gi;

function cleanString(s) {
  let out = s;
  // Run twice: removing one tag can expose another that was hidden inside it ("<scr<script>ipt>").
  for (let i = 0; i < 2; i += 1) {
    out = out.replace(COMMENTS, '').replace(BLOCKS, '').replace(TAGS, '');
  }
  return out.replace(OPEN_ANGLE, '').replace(JS_URL, '').replace(DATA_HTML, '').replace(/\0/g, '');
}

function sanitize(value, key = '') {
  if (SKIP_KEYS.has(key)) return value;
  if (typeof value === 'string') return cleanString(value);
  if (Array.isArray(value)) return value.map((v) => sanitize(v, key));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (k.startsWith('$') || k.includes('.')) continue; // operator-looking keys never reach a database query
      out[cleanString(k)] = sanitize(v, k);
    }
    return out;
  }
  return value;
}

function looksLikeMarkup(text) {
  return /<\s*\/?\s*[a-z!]/i.test(text) || /\b(?:javascript|vbscript)\s*:/i.test(text) || /on[a-z]{3,}\s*=\s*["'`]/i.test(text);
}

function expressSanitizer(req, res, next) {
  try {
    // The URL: decode it (twice, for double-encoded input) and refuse it when it carries markup.
    let decoded = req.originalUrl || req.url || '';
    for (let i = 0; i < 2; i += 1) {
      try { decoded = decodeURIComponent(decoded); } catch { break; }
    }
    if (looksLikeMarkup(decoded)) return res.status(400).json({ error: 'Invalid request' });

    if (req.query && typeof req.query === 'object') req.query = sanitize(req.query);
    if (req.body && typeof req.body === 'object') req.body = sanitize(req.body);
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = expressSanitizer;
module.exports.sanitize = sanitize;
module.exports.cleanString = cleanString;
