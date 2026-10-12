// Basic hardening for the public site: response headers and a small in-memory rate limiter.
// The limiter lives in one process, so on serverless hosts (Vercel) each instance counts separately;
// it still stops a bot hammering a warm instance, and the spam filter in services/spam.js does the rest.

// Content-Security-Policy: only this site's own scripts run. The few outside sources the pages use are
// listed explicitly: Google Fonts (css + font files), the Google Maps embed, and the old site's image host.
// Inline styles stay allowed because React and Tailwind set style attributes.
// Set CSP_REPORT_ONLY=1 to log violations in the browser console without blocking anything.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://img1.wsimg.com",
  'frame-src https://maps.google.com https://www.google.com',
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ');

function securityHeaders(req, res, next) {
  res.setHeader(process.env.CSP_REPORT_ONLY ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy', CSP);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.removeHeader('X-Powered-By');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }
  next();
}

// rateLimit({ windowMs, max }): at most `max` POSTs per IP per window, then 429.
function rateLimit({ windowMs, max }) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    if (hits.size > 5000) for (const [k, v] of hits) if (now - v.first > windowMs) hits.delete(k);
    const entry = hits.get(req.ip);
    if (!entry || now - entry.first > windowMs) {
      hits.set(req.ip, { first: now, count: 1 });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.first + windowMs - now) / 1000));
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    next();
  };
}

module.exports = { securityHeaders, rateLimit };
