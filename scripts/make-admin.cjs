// Makes a manager account in the database, for the first sign-in or when no manager is left. Role "admin" by default;
// add --owner for the owner level (老板: sees every staff member's accounts).
//   node scripts/make-admin.cjs <username> [--owner]                      promote an existing account
//   node scripts/make-admin.cjs <username> <email> <password> [--owner]   create one (password at least 8 characters)
// Reads MONGO_URL from .env like the server does.
process.chdir(require('path').join(__dirname, '..'));
require('dotenv').config();
const dbClient = require('../src/lib/dbClient');
const users = require('../src/models/users.model');
const { newCredentials, MIN_PASSWORD } = require('../src/services/users');

(async () => {
  const args = process.argv.slice(2);
  const role = args.includes('--owner') ? 'owner' : 'admin';
  const [username, email, password] = args.filter((a) => a !== '--owner');
  if (!username) throw new Error('usage: node scripts/make-admin.cjs <username> [<email> <password>] [--owner]');
  if (!(await dbClient.init())) throw new Error('MONGO_URL is not set');
  await dbClient.connection();
  const existing = await users.getUserByUsername(username);
  if (existing) {
    await users.updateUser(existing.id, { role });
    console.log(`${existing.username} is now ${role === 'owner' ? 'an owner' : 'an admin'}`);
  } else {
    if (!email || !password) throw new Error('that account does not exist: give <email> <password> to create it');
    if (password.length < MIN_PASSWORD) throw new Error(`password must be at least ${MIN_PASSWORD} characters`);
    await users.createUser({
      username, role, ...newCredentials(password), email, reset_token: '', reset_expires: '', session_epoch: '', login_fails: 0, login_locked_until: '',
      staffName: username, displayName: username, active: true, permissions: {},
    });
    console.log(`${role} account ${username} created`);
  }
  await dbClient.disconnect();
})().catch((err) => { console.error(err.message); process.exit(1); });
