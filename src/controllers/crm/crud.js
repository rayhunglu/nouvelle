const store = require('../../services/store');
const { wrap } = require('./common');
const { isStaff, isHiddenFor, visibleRows } = require('../../middleware/crmAccess');

// An admin may not change a payment recorded under the owner (they cannot see it either).
const lockedForAdmin = async (req, collection, id) => { const row = collection === 'payments' ? await store.get(collection, id) : null; return !!row && (await isHiddenFor(req, collection, row)) };

// The five handlers every collection shares (list / get / create / update / remove). Each collection passes its own validator and hooks:
//   validate(body) -> { error } | { data }      hooks: conflict(data, selfId), afterWrite(row, isNew, req, prev), beforeDelete(id, req)
function makeCrud(collection, validate, hooks = {}) {
  const list = wrap(async (req, res) => res.json(await visibleRows(req, collection, await store.list(collection))));

  const get = wrap(async (req, res) => {
    const row = await store.get(collection, req.params.id);
    if (!row || !(await visibleRows(req, collection, [row])).length) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });

  const create = wrap(async (req, res) => {
    const { error, data } = await validate(req.body || {});
    if (error) return res.status(400).json({ error });
    if (isStaff(req)) {
      const { staffName, username } = req.session.user;
      if (collection === 'customers') data.createdBy = username;
      if ((collection === 'appointments' || collection === 'payments') && !req.perms.assignOthers) data.staff = staffName;
      if (collection === 'payments' && data.appointmentId) {
        const a = await store.get('appointments', data.appointmentId);
        if (!a || !(await visibleRows(req, 'appointments', [a])).length) return res.status(403).json({ error: '没有权限' });
      }
    }
    const conflict = hooks.conflict && await hooks.conflict(data, null);
    if (conflict) return res.status(409).json({ error: conflict });
    const created = await store.create(collection, data);
    if (hooks.afterWrite) await hooks.afterWrite(created, true, req, null);
    res.status(201).json(created);
  });

  const update = wrap(async (req, res) => {
    const { error, data } = await validate(req.body || {});
    if (error) return res.status(400).json({ error });
    if (await lockedForAdmin(req, collection, req.params.id)) return res.status(403).json({ error: '没有权限' });
    if (isStaff(req)) {
      const existing = await store.get(collection, req.params.id);
      if (!existing || !(await visibleRows(req, collection, [existing])).length) return res.status(404).json({ error: 'Not found' });
      if ((collection === 'appointments' || collection === 'payments') && !req.perms.assignOthers) data.staff = existing.staff || req.session.user.staffName;
    }
    const conflict = hooks.conflict && await hooks.conflict(data, req.params.id);
    if (conflict) return res.status(409).json({ error: conflict });
    const prev = hooks.afterWrite ? await store.get(collection, req.params.id) : null;
    const row = await store.update(collection, req.params.id, data);
    if (!row) return res.status(404).json({ error: 'Not found' });
    if (hooks.afterWrite) await hooks.afterWrite(row, false, req, prev);
    res.json(row);
  });

  const remove = wrap(async (req, res) => {
    if (await lockedForAdmin(req, collection, req.params.id)) return res.status(403).json({ error: '没有权限' });
    if (isStaff(req)) {
      const existing = await store.get(collection, req.params.id);
      if (!existing || !(await visibleRows(req, collection, [existing])).length) return res.status(404).json({ error: 'Not found' });
    }
    if (hooks.beforeDelete) {
      const blocked = await hooks.beforeDelete(req.params.id, req);
      if (blocked) return res.status(409).json({ error: blocked });
    }
    if (!(await store.remove(collection, req.params.id))) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  });

  return { list, get, create, update, remove };
}

module.exports = { makeCrud };
