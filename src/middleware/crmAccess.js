const store = require('../services/store');
const { sessionRevoked, roleOf } = require('../services/users');
const { wrap } = require('../controllers/crm/common');

// ---- roles ----
// 老板 (role 'owner') sees and does everything. 管理员 (role 'admin') can use every function too, but cannot see the owner's accounts
// (the payments recorded under the owner's staff name). 店长 below means those two levels. 操作师 (role 'staff') starts with the minimum: their own appointments and
// payments and the customers tied to them, create and update only, no deleting, no account management. The manager can
// widen that per account with these permissions (stored on the account, applied on every request).
const PERMISSIONS = [
  'viewAllAppointments', // see every staff member's appointments
  'viewAllCustomers', // see every customer
  'viewAllFinance', // see all payments and every staff member's performance
  'deleteAppointments',
  'deleteCustomers',
  'deletePayments',
  'manageBlocks', // block / unblock time off
  'assignOthers', // book or record for another staff member
];
const isStaff = (req) => req.session.user.role === 'staff';
const adminOnly = (req, res, next) => (isStaff(req) ? res.status(403).json({ error: '没有权限' }) : next());
const cleanPerms = (p) => Object.fromEntries(PERMISSIONS.map((k) => [k, !!(p && p[k])]));

// Staff permissions come from the account record each time, so changing them (or disabling the account) acts at once.
const loadPermissions = wrap(async (req, res, next) => {
  const u = req.session.user;
  const all = Object.fromEntries(PERMISSIONS.map((k) => [k, true]));
  if (u.builtin) { req.perms = all; return next(); }
  const rec = (await store.list('users')).find((x) => x.username === u.username);
  if (!rec || rec.active === false || sessionRevoked(u, rec)) return req.session.destroy(() => res.status(401).json({ error: 'Authentication required' }));
  u.role = roleOf(rec.role); // an account can be demoted (or promoted) while signed in
  u.staffName = rec.staffName;
  req.perms = u.role !== 'staff' ? all : cleanPerms(rec.permissions);
  return next();
});

const STAFF_ALLOWED = (perms) => ({
  GET: [/^\/(appointments|customers|payments)(\/[^/]+)?$/, /^\/customers\/[^/]+\/files(\/[^/]+)?$/, /^\/services$/, /^\/summary$/, /^\/blocks$/, /^\/settings$/, /^\/schedule$/, /^\/staff-list$/],
  POST: [/^\/(appointments|customers|payments)$/, /^\/customers\/[^/]+\/files$/, ...(perms.manageBlocks ? [/^\/blocks$/] : [])],
  PUT: [/^\/(appointments|customers|payments)\/[^/]+$/, /^\/appointments\/[^/]+\/reminder$/, ...(perms.manageBlocks ? [/^\/blocks\/[^/]+$/] : [])],
  DELETE: [
    ...(perms.deleteAppointments ? [/^\/appointments\/[^/]+$/] : []),
    ...(perms.deleteCustomers ? [/^\/customers\/[^/]+$/, /^\/customers\/[^/]+\/files\/[^/]+$/] : []),
    ...(perms.deletePayments ? [/^\/payments\/[^/]+$/] : []),
    ...(perms.manageBlocks ? [/^\/blocks\/[^/]+$/] : []),
  ],
});
function staffGate(req, res, next) {
  if (!isStaff(req)) return next();
  if ((STAFF_ALLOWED(req.perms)[req.method] || []).some((re) => re.test(req.path))) return next();
  return res.status(403).json({ error: '没有权限' });
}

// Payments whose appointment was cancelled, marked no-show or deleted (before payments were removed together with them)
// are cleaned up once per server start, so old data matches the rule too.
let purged = false;
async function purgeOrphanPayments() {
  const byId = new Map((await store.list('appointments')).map((a) => [a.id, a]));
  for (const p of [...(await store.list('payments'))]) { // a copy: removing rows while looping over the live list would skip some
    if (!p.appointmentId) continue;
    const a = byId.get(p.appointmentId);
    if (a && a.status !== 'cancelled' && a.status !== 'no-show') continue;
    if (p.topUp > 0) {
      await store.update('payments', p.id, { appointmentId: null, amount: 0, tipAmount: 0, giftUsed: '', serviceName: '', serviceIds: [], paymentMethod: p.topUpMethod || 'cash', tipMethod: p.topUpMethod || 'cash' });
    } else {
      await store.remove('payments', p.id);
    }
  }
}
const cleanOrphansOnce = wrap(async (req, res, next) => {
  if (!purged) { purged = true; await purgeOrphanPayments(); }
  next();
});

// What a staff member may see: their own bookings and payments, and the customers connected to them, unless the
// account was given the matching "see all" permission.
// The staff names of the owner account(s): their payments are the ones an admin may not see.
async function ownerStaffNames() {
  return new Set((await store.list('users')).filter((u) => u.role === 'owner').map((u) => u.staffName).filter(Boolean));
}
// What an admin gets of a payment recorded under an owner: only what the member card sums and the 2000/2200 rule need (top-ups,
// gifts, card payments), flagged `hidden`; the screens leave hidden rows out of every list, total and export.
function redactPayment(p) {
  const card = p.paymentMethod === 'member_card';
  const tipCard = (p.tipMethod || p.paymentMethod) === 'member_card';
  return {
    id: p.id, hidden: true, appointmentId: p.appointmentId || null, customerId: p.customerId, datetime: p.datetime, createdAt: p.createdAt,
    paymentMethod: p.paymentMethod, tipMethod: p.tipMethod || p.paymentMethod, amount: card ? p.amount : 0, tipAmount: tipCard ? p.tipAmount || 0 : 0,
    topUp: p.topUp || 0, topUpMethod: p.topUpMethod || '', topUpGifts: p.topUpGifts || [], topUpBonus: p.topUpBonus || 0, giftUsed: p.giftUsed || '', staff: p.staff, serviceIds: [], serviceName: '', referralSource: '', notes: '',
  };
}
const isHiddenFor = async (req, collection, row) => collection === 'payments' && req.session.user.role === 'admin' && (await ownerStaffNames()).has(row.staff);

async function visibleRows(req, collection, rows) {
  if (collection === 'payments' && req.session.user.role === 'admin') {
    const owners = await ownerStaffNames();
    return owners.size ? rows.map((p) => (owners.has(p.staff) ? redactPayment(p) : p)) : rows;
  }
  if (!isStaff(req)) return rows;
  const { staffName, username } = req.session.user;
  if (collection === 'appointments') return req.perms.viewAllAppointments ? rows : rows.filter((r) => r.staff === staffName);
  if (collection === 'payments') return req.perms.viewAllFinance ? rows : rows.filter((r) => r.staff === staffName);
  if (collection === 'customers') {
    if (req.perms.viewAllCustomers) return rows;
    const mine = new Set([
      ...(await store.list('appointments')).filter((a) => a.staff === staffName).map((a) => a.customerId),
      ...(await store.list('payments')).filter((p) => p.staff === staffName).map((p) => p.customerId),
    ]);
    return rows.filter((c) => mine.has(c.id) || c.createdBy === username);
  }
  return rows;
}

module.exports = { PERMISSIONS, isStaff, isHiddenFor, adminOnly, cleanPerms, loadPermissions, staffGate, cleanOrphansOnce, visibleRows };
