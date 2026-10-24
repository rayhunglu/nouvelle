const store = require('../../services/store');
const { wrap } = require('./common');
const { visibleRows } = require('../../middleware/crmAccess');
const { clinicDay } = require('./schedule');

// Dashboard numbers: today's and upcoming bookings, this month's revenue and tips, and the last 6 months.
const getSummary = wrap(async (req, res) => {
  // Days are the clinic's days (Los Angeles time), not the server's: on Vercel the server clock is UTC, which would move an
  // evening booking onto the next day and flip "today" / "tomorrow" in the afternoon.
  const now = new Date();
  const todayKey = clinicDay(now);
  const shiftDay = (key, n) => { const d = new Date(`${key}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const tomorrowKey = shiftDay(todayKey, 1);
  const dateKey = (iso) => clinicDay(new Date(iso));
  const monthKey = (d) => d.slice(0, 7);
  const thisMonth = todayKey.slice(0, 7);

  // Only today's and tomorrow's bookings are needed here, so only that time range is read.
  const appts = await visibleRows(req, 'appointments', await store.list('appointments', { range: { start: Date.now() - 24 * 3600000, end: Date.now() + 48 * 3600000 } }));

  const today = appts.filter((a) => a.status !== 'cancelled' && dateKey(a.start) === todayKey);
  // Tomorrow's bookings still to be served: these are the ones to remind the customer about.
  const tomorrow = appts
    .filter((a) => ['scheduled', 'checked-in', 'in-service'].includes(a.status) && dateKey(a.start) === tomorrowKey)
    .sort((a, b) => a.start.localeCompare(b.start));

  // Unsettled payments (checked out but not yet paid) are owed money, not revenue, until their method is set.
  const received = (rows) => rows.filter((p) => p.paymentMethod !== 'unsettled').reduce((t, p) => t + p.amount, 0);
  const tipsReceived = (rows) => rows.filter((p) => (p.tipMethod || p.paymentMethod) !== 'unsettled').reduce((t, p) => t + (p.tipAmount || 0), 0);
  // Only settled payments count (the unsettled ones are excluded below), and a payment tied to an appointment counts only once
  // that appointment is completed (checked in and checked out); cancelled, no-show or not-yet-served bookings do not.
  const apptStatus = new Map((await store.list('appointments')).map((a) => [a.id, a.status]));
  const payments = (await visibleRows(req, 'payments', await store.list('payments'))).filter((p) => !p.hidden && !p.ownerRelated && (!p.appointmentId || apptStatus.get(p.appointmentId) === 'completed')); // `hidden` = the owner's payments, which an admin does not see
  const inMonth = (p, key) => monthKey(dateKey(p.datetime)) === key;
  const month = payments.filter((p) => inMonth(p, thisMonth));

  // last 6 months, oldest first
  const months = [];
  for (let i = 5; i >= 0; i -= 1) {
    const [y, m] = thisMonth.split('-').map(Number);
    const d = new Date(Date.UTC(y, m - 1 - i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    const rows = payments.filter((p) => inMonth(p, key));
    months.push({ month: key, revenue: received(rows), tips: tipsReceived(rows) });
  }

  res.json({
    customers: (await visibleRows(req, 'customers', await store.list('customers'))).length,
    todayCustomers: new Set(today.map((a) => a.customerId)).size, // distinct customers booked today
    today: today.sort((a, b) => a.start.localeCompare(b.start)),
    tomorrow,
    month: { revenue: received(month), tips: tipsReceived(month), count: month.filter((p) => p.paymentMethod !== 'unsettled').length },
    months,
  });
});

module.exports = { getSummary };
