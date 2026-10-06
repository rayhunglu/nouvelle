// Guards CRM-only routes. Anything mounted behind this returns 401 JSON
// unless the session was created by a successful login.
function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  res.status(401).json({ error: 'Authentication required' });
}

module.exports = { requireAuth };
