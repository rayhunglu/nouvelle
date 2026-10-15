const store = require('../../services/store');
const { str } = require('./common');
const { makeCrud } = require('./crud');

function serviceInput(b) {
  const name = str(b.name, 80);
  if (!name) return { error: 'name is required' };
  return { data: { name } };
}

module.exports = makeCrud('services', serviceInput, {
  async conflict(data, selfId) {
    const dup = (await store.list('services')).find((x) => x.id !== selfId && x.name === data.name);
    return dup ? 'A service with this name already exists' : null;
  },
  async beforeDelete(id) {
    const n = (await store.list('payments')).filter((p) => p.serviceIds.includes(id)).length;
    return n ? `Service is used by ${n} payment(s) and can't be deleted.` : null;
  },
});

