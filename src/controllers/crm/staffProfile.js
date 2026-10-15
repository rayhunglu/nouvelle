const store = require('../../services/store');
const mailer = require('../../services/mailer');
const { wrap, str } = require('./common');

// ---- staff contact details and new-booking alerts ----
// { Rina: { phone, email, carrier: 'tmobile'|'att'|'verizon', notifyEmail, notifySms } } kept in the settings store; manager only.
const profilesRow = async () => (await store.list('settings')).find((x) => x.key === 'profiles');
const noticeLog = []; // the last results, in memory: shown on the staff page so a failed alert is visible
async function notifyStaff(appt, kind = 'new') {
  const profile = (((await profilesRow()) || {}).staff || {})[appt.staff];
  if (!profile || (!profile.email && !profile.phone)) return null;
  const customer = appt.customerId ? await store.get('customers', appt.customerId) : null;
  const result = await mailer.sendStaffBooking(profile, appt, customer && customer.name, kind);
  noticeLog.unshift({ at: new Date().toISOString(), staff: appt.staff, service: appt.service, start: appt.start, kind, ...result });
  noticeLog.length = Math.min(noticeLog.length, 20);
  return result;
}

const getStaffProfile = wrap(async (req, res) => res.json({ staff: ((await profilesRow()) || {}).staff || {}, mailConfigured: mailer.enabled(), log: noticeLog }));

const putStaffProfile = wrap(async (req, res) => {
  const b = req.body || {};
  const name = str(b.staff, 60);
  if (!name) return res.status(400).json({ error: 'staff is required' });
  const email = str(b.email, 160);
  const phone = str(b.phone, 40);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: '邮箱格式不对' });
  if (phone && String(phone).replace(/\D/g, '').length < 10) return res.status(400).json({ error: '手机号至少 10 位' });
  const carrier = ['tmobile', 'att', 'verizon'].includes(b.carrier) ? b.carrier : 'tmobile';
  const row = await profilesRow();
  const staff = { ...((row && row.staff) || {}), [name]: { email, phone, carrier, notifyEmail: b.notifyEmail !== false, notifySms: b.notifySms !== false } };
  if (row) await store.update('settings', row.id, { staff });
  else await store.create('settings', { key: 'profiles', staff });
  res.json(staff);
});

// Sends the staff member a test alert so the manager can check the phone number / email.
const testStaffProfile = wrap(async (req, res) => {
  const name = str(req.body && req.body.staff, 60);
  const result = await notifyStaff({ staff: name, customerId: null, service: '测试提醒', start: new Date(Date.now() + 3600000).toISOString(), durationMin: 60, room: '' }, 'test');
  res.json(result || { error: '先保存这位员工的手机号或邮箱' });
});

module.exports = { notifyStaff, getStaffProfile, putStaffProfile, testStaffProfile };
