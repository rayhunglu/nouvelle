const store = require('../../services/store');
const { MEMBER_TIERS, str } = require('./common');
const { makeCrud } = require('./crud');
const calendar = require('../../services/googleCalendar');

function customerInput(b) {
  const firstName = str(b.firstName, 60);
  const lastName = str(b.lastName, 60);
  // A name is optional: without one the customer is listed under their WeChat name / number, phone or email,
  // so at least one of those must be given.
  const name = str(b.name, 120) || [firstName, lastName].filter(Boolean).join(' ')
    || str(b.wechatId, 60) || str(b.wechatNo, 60) || str(b.phone, 40) || str(b.email, 160);
  if (!name) return { error: 'name, WeChat, phone or email is required' };
  const tags = Array.isArray(b.tags) ? b.tags.map((t) => str(t, 30)).filter(Boolean).slice(0, 10) : [];
  // First / last name are stored only when sent, so editing a customer elsewhere never wipes them.
  const split = 'firstName' in b || 'lastName' in b ? { firstName, lastName } : {};
  const gender = ['female', 'male', 'other'].includes(b.gender) ? b.gender : '';
  const genderField = 'gender' in b ? { gender } : {};
  // The category decides membership (any category except '' is a member); `member` stays in step because pricing reads it.
  const tierField = 'memberTier' in b ? { memberTier: MEMBER_TIERS.includes(b.memberTier) ? b.memberTier : '' } : {};
  const memberField = 'memberTier' in b ? { member: tierField.memberTier !== '' } : 'member' in b ? { member: b.member === true } : {};
  return { data: { name, ...split, ...genderField, ...tierField, ...memberField, phone: str(b.phone, 40), email: str(b.email, 160), wechatId: str(b.wechatId, 60), wechatNo: str(b.wechatNo, 60), notes: str(b.notes, 2000), tags } };
}

module.exports = makeCrud('customers', customerInput, {
  // Deleting a customer removes everything of theirs: appointments and payment records (the member card goes with them).
  async beforeDelete(id) {
    for (const a of (await store.list('appointments')).filter((x) => x.customerId === id)) {
      if (a.googleEventId) await calendar.remove(a.googleEventId, a.googleCalendarId || calendar.defaultCalendarId()); // their calendar events go with them
      await store.remove('appointments', a.id);
    }
    for (const p of (await store.list('payments')).filter((x) => x.customerId === id)) await store.remove('payments', p.id);
    return null;
  },
});
