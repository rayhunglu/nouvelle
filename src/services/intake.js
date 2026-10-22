// The intake details and health questionnaire of a customer, cleaned to known shapes and sizes. Shared by the CRM (staff) and the member portal (the customer).
const { str } = require('../controllers/crm/common');

const INTAKE = [['legalName', 120], ['dob', 10], ['emergencyName', 120], ['emergencyPhone', 40], ['heardFrom', 200]];
const key = (k) => /^[a-z0-9_]{1,30}$/.test(k);
const ticks = (t) => ({ items: Array.isArray(t && t.items) ? t.items.map((x) => str(x, 30)).filter(key).slice(0, 20) : [], other: str(t && t.other, 300) });

// { error } or { fields }: only the keys present in `b` are returned, so saving elsewhere never wipes them.
function cleanIntake(b) {
  const fields = Object.fromEntries(INTAKE.filter(([k]) => k in b).map(([k, n]) => [k, str(b[k], n)]));
  if (fields.dob && !/^\d{4}-\d{2}-\d{2}$/.test(fields.dob)) return { error: 'dob must be YYYY-MM-DD' };
  return { fields };
}

// The health questionnaire: { yn: { id: { v, note } }, b: { items, other }, d: { items, other } }.
function cleanQuestionnaire(q) {
  if (!q || typeof q !== 'object') return null;
  const yn = {};
  if (q.yn && typeof q.yn === 'object') {
    for (const [k, v] of Object.entries(q.yn).slice(0, 40)) if (key(k) && v) yn[k] = { v: ['yes', 'no', 'na', 'unsure'].includes(v.v) ? v.v : '', note: str(v.note, 500) };
  }
  const types = ['medical', 'beauty', 'lash', 'body_spa', 'head_spa', 'spa'];
  const services = [...new Set([...(Array.isArray(q.services) ? q.services : []), ...(q.service ? [q.service] : [])])].filter((x) => types.includes(x));
  return { services, yn, b: ticks(q.b), d: ticks(q.d) };
}

module.exports = { cleanIntake, cleanQuestionnaire };
