const store = require('../../services/store');
const { METHODS, str, num } = require('./common');
const { makeCrud } = require('./crud');

async function paymentInput(b) {
  if (!b.customerId || !(await store.get('customers', b.customerId))) return { error: 'valid customerId is required' };
  if (b.appointmentId && !(await store.get('appointments', b.appointmentId))) return { error: 'unknown appointmentId' };
  const when = new Date(b.datetime);
  if (Number.isNaN(when.getTime())) return { error: 'valid datetime is required' };
  const amount = num(b.amount);
  const tipAmount = b.tipAmount === '' || b.tipAmount == null ? 0 : num(b.tipAmount);
  if (!Number.isFinite(amount) || amount < 0) return { error: 'amount must be 0 or more' };
  if (!Number.isFinite(tipAmount) || tipAmount < 0) return { error: 'tipAmount must be 0 or more' };
  const topUp = b.topUp === '' || b.topUp == null ? 0 : num(b.topUp);
  if (!Number.isFinite(topUp) || topUp < 0) return { error: 'topUp must be 0 or more' };
  const topUpMethod = topUp > 0 ? b.topUpMethod : '';
  if (topUp > 0 && !METHODS.includes(topUpMethod)) return { error: `topUpMethod must be one of ${METHODS.join(', ')}` };
  if (topUp > 0 && (topUpMethod === 'member_card' || topUpMethod === 'unsettled')) return { error: 'a card top-up must be paid by a real payment method' };
  // Top-up gifts, for any top-up amount. A cash credit typed by hand (topUpBonus), or free sessions: the presets, or any service picked by hand
  // ('svc:<name>'). The old ready-made $200 / $300 credits are still read.
  const GIFTS = ['cash200', 'cash300', 'photofacial', 'thermage'];
  const clean = (g) => (typeof g === 'string' && g.startsWith('svc:') ? `svc:${str(g.slice(4), 80)}` : g);
  const okGift = (g) => GIFTS.includes(g) || (typeof g === 'string' && g.startsWith('svc:') && g.length > 4);
  const allowed = topUp > 0 ? 24 : 0;
  const topUpGifts = Array.isArray(b.topUpGifts) ? [...new Set(b.topUpGifts.map(clean))].filter(okGift) : [];
  if (topUpGifts.length > allowed) return { error: `this top-up includes at most ${allowed} gift(s)` };
  const topUpBonus = b.topUpBonus === '' || b.topUpBonus == null ? 0 : num(b.topUpBonus);
  if (!Number.isFinite(topUpBonus) || topUpBonus < 0 || topUpBonus > 100000) return { error: 'topUpBonus must be between 0 and 100000' };
  if (topUpBonus > 0 && topUp <= 0) return { error: 'a gift amount needs a top-up' };
  const giftUsed = b.giftUsed && okGift(clean(b.giftUsed)) && !String(b.giftUsed).startsWith('cash') ? clean(b.giftUsed) : ''; // a free top-up gift session redeemed at this visit
  // A $0 payment is fine: the visit may be used up from a package the customer already bought, so nothing is collected.
  const serviceIds = Array.isArray(b.serviceIds) ? [...new Set(b.serviceIds)] : [];
  const known = new Set((await store.list('services')).map((x) => x.id));
  if (serviceIds.some((id) => !known.has(id))) return { error: 'unknown serviceIds' };
  if (!METHODS.includes(b.paymentMethod)) return { error: `paymentMethod must be one of ${METHODS.join(', ')}` };
  const cents = (n) => Math.round(n * 100) / 100;
  return {
    data: {
      appointmentId: b.appointmentId || null, customerId: b.customerId, datetime: when.toISOString(),
      serviceIds, amount: cents(amount), tipAmount: cents(tipAmount), paymentMethod: b.paymentMethod,
      referralSource: str(b.referralSource, 80), staff: str(b.staff, 60), notes: str(b.notes, 500),
      // Member card: `topUp` is money loaded onto the customer's card at this visit (paid by `topUpMethod`).
      topUp: cents(topUp), topUpMethod, topUpGifts, topUpBonus: cents(topUpBonus), giftUsed,
      serviceName: str(b.serviceName, 160), // what was settled, as named on the appointment
      tipMethod: METHODS.includes(b.tipMethod) ? b.tipMethod : b.paymentMethod,
    },
  };
}

// Member card balance = everything loaded onto the card minus everything paid with it (the amount and/or the tip, each by its own method).
const cardSpent = (p) => (p.paymentMethod === 'member_card' ? p.amount : 0) + ((p.tipMethod || p.paymentMethod) === 'member_card' ? p.tipAmount || 0 : 0);
const CASH_GIFTS = { cash200: 200, cash300: 300 };
const cardLoaded = (p) => (p.topUp || 0) + (p.topUpGifts || []).reduce((n, g) => n + (CASH_GIFTS[g] || 0), 0) + (Number(p.topUpBonus) || 0); // top-up plus any gift credit (older $200 / $300 gifts, or the amount typed by hand)
const cardBalance = (payments, customerId, exceptId) => payments
  .filter((p) => p.customerId === customerId && p.id !== exceptId)
  .reduce((n, p) => n + cardLoaded(p) - cardSpent(p), 0);

const crud = makeCrud('payments', paymentInput, {
  // Deleting a payment keeps its appointment, flagged so every screen shows it struck through with payment 未结算;
  // recording a payment for that appointment again clears the flag.
  async beforeDelete(id) {
    const p = await store.get('payments', id);
    if (p && p.appointmentId && (await store.get('appointments', p.appointmentId))) await store.update('appointments', p.appointmentId, { paymentDeleted: true });
    return null;
  },
  async afterWrite(row) {
    if (row.appointmentId) {
      const a = await store.get('appointments', row.appointmentId);
      if (a && a.paymentDeleted) await store.update('appointments', a.id, { paymentDeleted: false });
    }
  },
  async conflict(data, selfId) {
    if (data.giftUsed) {
      const all = (await store.list('payments')).filter((p) => p.customerId === data.customerId && p.id !== selfId);
      const earned = all.reduce((n, p) => n + (p.topUpGifts || []).filter((g) => g === data.giftUsed).length, 0) + (data.topUpGifts || []).filter((g) => g === data.giftUsed).length;
      const used = all.filter((p) => p.giftUsed === data.giftUsed).length;
      if (earned - used < 1) return '该客户没有可用的赠送项目';
    }
    const due = cardSpent(data);
    if (!due) return null;
    const balance = cardBalance(await store.list('payments'), data.customerId, selfId) + cardLoaded(data);
    return Math.round((balance - due) * 100) < 0 ? `会员卡余额不足（余额 $${balance.toFixed(2)}，需扣 $${due.toFixed(2)}）` : null;
  },
});
crud.cardBalance = cardBalance; // the customer portal shows the same balance
module.exports = crud;
