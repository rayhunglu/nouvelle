// Prints a random secret for SESSION_SECRET:  node scripts/generate-secret.cjs
// Put the line in .env, and in Vercel > Settings > Environment Variables. Changing it later signs everyone out.
const crypto = require('crypto');
console.log(`SESSION_SECRET=${crypto.randomBytes(32).toString('hex')}`);
