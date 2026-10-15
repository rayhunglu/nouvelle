const store = require('../../services/store');
const { wrap } = require('./common');
const { visibleRows } = require('../../middleware/crmAccess');

// Dashboard numbers: today's and upcoming bookings, this month's revenue and tips, and the last 6 months.
const getSummary = wrap(async (req, res) => {
  const now = new Date();
  const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay); endOfDay.setDate(endOfDay.getDate() + 1);
  const weekAhead = new Date(startOfDay); weekAhead.setDate(weekAhead.getDate() + 8);
  const pad = (n) => String(n).padStart(2, '0');
  const dateKey = (iso) => { const d = new Date(iso); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const monthKey = (d) => d.slice(0, 7);
  const thisMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

  const appts = await visibleRows(req, 'appointments', await store.list('appointments'));

  const inRange = (a, from, to) => { const s = new Date(a.start); return s >= from && s < to; };
  const today = appts.filter((a) => a.status !== 'cancelled' && inRange(a, startOfDay, endOfDay));
  const upcoming = appts
    .filter((a) => a.status === 'scheduled' && inRange(a, endOfDay, weekAhead))
    .sort((a, b) => a.start.localeCompare(b.start));

  // Unsettled payments (checked out but not yet paid) are owed money, not revenue, until their method is set.
  const received = (rows) => rows.filter((p) => p.paymentMethod !== 'unsettled').reduce((t, p) => t + p.amount, 0);
  const tipsReceived = (rows) => rows.filter((p) => (p.tipMethod || p.paymentMethod) !== 'unsettled').reduce((t, p) => t + (p.tipAmount || 0), 0);
  const payments = await visibleRows(req, 'payments', await store.list('payments'));
  const inMonth = (p, key) => monthKey(dateKey(p.datetime)) === key;
  const month = payments.filter((p) => inMonth(p, thisMonth));

  // last 6 months, oldest first
  const months = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const rows = payments.filter((p) => inMonth(p, key));
    months.push({ month: key, revenue: received(rows), tips: tipsReceived(rows) });
  }

  res.json({
    customers: (await visibleRows(req, 'customers', await store.list('customers'))).length,
    todayCustomers: new Set(today.map((a) => a.customerId)).size, // distinct customers booked today
    today: today.sort((a, b) => a.start.localeCompare(b.start)),
    upcoming,
    month: { revenue: received(month), tips: tipsReceived(month), count: month.filter((p) => p.paymentMethod !== 'unsettled').length },
    months,
  });
});

module.exports = { getSummary };
