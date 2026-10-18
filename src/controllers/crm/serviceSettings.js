const store = require('../../services/store');
const { wrap, str } = require('./common');

// 服务项目管理: per website treatment, whether it is open for online booking and who can do it.
//   { items: { 'skin-4': { open: false, staff: ['Yingna', 'Rina'] } } }
// A treatment with no entry is open and uses its default people (see controllers/availability.js). `staff: []` means nobody in
// particular (only the room decides). The public availability lookup reads the same row.
const row = async () => (await store.list('settings')).find((x) => x.key === 'services');

const getServiceSettings = wrap(async (req, res) => res.json(((await row()) || {}).items || {}));

// Body: { key | keys: [...], open?: boolean, staff?: [names], hours?: { startMin, endMin } | null } changes those treatments; { key, reset: true }
// puts one back to the defaults. `hours` is the treatment's own bookable window (it only narrows the room's opening hours).
const okMin = (m) => Number.isInteger(m) && m >= 0 && m <= 24 * 60 && m % 15 === 0;
const putServiceSettings = wrap(async (req, res) => {
  const b = req.body || {};
  const keys = (Array.isArray(b.keys) ? b.keys : [b.key]).map((k) => str(k, 64));
  if (!keys.length || keys.length > 60 || keys.some((k) => !/^[a-z0-9][a-z0-9-]{0,62}$/i.test(k))) return res.status(400).json({ error: 'invalid treatment' });
  if ('staff' in b && !Array.isArray(b.staff)) return res.status(400).json({ error: 'staff must be a list' });
  let hours;
  if ('hours' in b) {
    if (b.hours === null) hours = null;
    else {
      const startMin = Number(b.hours && b.hours.startMin);
      const endMin = Number(b.hours && b.hours.endMin);
      if (!okMin(startMin) || !okMin(endMin) || endMin - startMin < 15) return res.status(400).json({ error: '可预约时间需按 15 分钟取整，且结束晚于开始' });
      hours = { startMin, endMin };
    }
  }
  const current = await row();
  const items = { ...((current && current.items) || {}) };
  for (const key of keys) {
    if (b.reset === true) { delete items[key]; continue; }
    const next = { ...(items[key] || {}) };
    if ('open' in b) next.open = b.open !== false;
    if ('staff' in b) next.staff = [...new Set(b.staff.map((n) => str(n, 60)).filter(Boolean))].slice(0, 30);
    if ('hours' in b) { if (hours === null) delete next.hours; else next.hours = hours; }
    if (Object.keys(next).length) items[key] = next; else delete items[key]; // nothing left to remember: back to the defaults
  }
  if (current) await store.update('settings', current.id, { items });
  else await store.create('settings', { key: 'services', items });
  res.json(items);
});

module.exports = { getServiceSettings, putServiceSettings };
