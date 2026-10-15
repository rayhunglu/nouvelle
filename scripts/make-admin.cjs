// Makes a manager (role "admin") account in the database, for the first sign-in or when no manager is left.
//   node scripts/make-admin.cjs <username>                      promote an existing account
//   node scripts/make-admin.cjs <username> <email> <password>   create one (password at least 8 characters)
// Reads MONGO_URL from .env like the server does.
process.chdir(require('path').join(__dirname, '..'));
require('dotenv').config();
const dbClient = require('../src/lib/dbClient');
const users = require('../src/models/users.model');
const { newCredentials, MIN_PASSWORD } = require('../src/services/users');

(async () => {
  const [username, email, password] = process.argv.slice(2);
  if (!username) throw new Error('usage: node scripts/make-admin.cjs <username> [<email> <password>]');
  if (!(await dbClient.init())) throw new Error('MONGO_URL is not set');
  await dbClient.connection();
  const existing = await users.getUserByUsername(username);
  if (existing) {
    await users.updateUser(existing.id, { role: 'admin' });
    console.log(`${existing.username} is now an admin`);
  } else {
    if (!email || !password) throw new Error('that account does not exist: give <email> <password> to create it');
    if (password.length < MIN_PASSWORD) throw new Error(`password must be at least ${MIN_PASSWORD} characters`);
    await users.createUser({
      username, role: 'admin', ...newCredentials(password), email, reset_token: '', reset_expires: '', session_epoch: '', login_fails: 0, login_locked_until: '',
      staffName: username, displayName: username, active: true, permissions: {},
    });
    console.log(`admin account ${username} created`);
  }
  await dbClient.disconnect();
})().catch((err) => { console.error(err.message); process.exit(1); });
