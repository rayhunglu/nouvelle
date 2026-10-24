const store = require('../../services/store');
const { wrap } = require('./common');
const { isStaff, isHiddenFor, visibleRows } = require('../../middleware/crmAccess');

// An admin may not change a payment recorded under the owner (they cannot see it either), except one that belongs to a booking:
// they check those out, so afterwards they may open, edit and delete that one payment (it still stays out of every list and total).
const lockedForAdmin = async (req, collection, id) => { const row = collection === 'payments' ? await store.get(collection, id) : null; return !!row && !row.appointmentId && (await isHiddenFor(req, collection, row)) };

// The five handlers every collection shares (list / get / create / update / remove). Each collection passes its own validator and hooks:
//   validate(body) -> { error } | { data }      hooks: conflict(data, selfId), afterWrite(row, isNew, req, prev), beforeDelete(id, req)
function makeCrud(collection, validate, hooks = {}) {
  // Appointments are read by time: GET ?start=<UTC ISO>&end=<UTC ISO> returns those that start in [start, end) (start included, end not, so
  // neighbouring days never repeat a booking), oldest first. Both must be ISO 8601 with an explicit zone (Z or +hh:mm) and start < end. Without
  // them the list is everything. The calendar works out each day / week / month range in the clinic's time zone and sends it here.
  const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;
  const rangeOf = (q) => {
    if (collection !== 'appointments' || (q.start === undefined && q.end === undefined)) return { range: null };
    const fix = (v) => String(v).trim().replace(/ (\d{2}:\d{2})$/, '+$1'); // a "+" in a URL arrives as a space
    const [a, b] = [fix(q.start), fix(q.end)];
    if (!ISO.test(a) || !ISO.test(b)) return { error: 'start and end must be ISO 8601 date-times with a time zone, e.g. 2026-10-23T07:00:00.000Z' };
    const [start, end] = [new Date(a).getTime(), new Date(b).getTime()];
    if (Number.isNaN(start) || Number.isNaN(end)) return { error: 'start and end must be valid dates' };
    if (start >= end) return { error: 'start must be before end' };
    return { range: { start, end } };
  };
  const list = wrap(async (req, res) => {
    const { range, error } = rangeOf(req.query);
    if (error) return res.status(400).json({ error });
    // ?customerId=<id> returns every booking of that customer (their history), whatever the date.
    const customerId = collection === 'appointments' && typeof req.query.customerId === 'string' && req.query.customerId ? req.query.customerId : null;
    res.json(await visibleRows(req, collection, await store.list(collection, customerId ? { customerId } : range ? { range } : undefined)));
  });

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
