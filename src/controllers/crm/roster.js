const store = require('../../services/store');
const { wrap, str } = require('./common');

// The staff roster: the people who take appointments ("对应员工"). Everyone signed in reads it; the manager adds and removes names.
// Removing a name only takes it off the list: appointments and payments already recorded under it keep it.
const DEFAULT_ROSTER = ['Rina', 'Yingna', 'Dayu'];
const rosterRow = async () => (await store.list('settings')).find((x) => x.key === 'roster');
const namesOf = (row) => (row && Array.isArray(row.names) ? row.names : DEFAULT_ROSTER);

async function saveNames(row, names) {
  if (row) await store.update('settings', row.id, { names });
  else await store.create('settings', { key: 'roster', names });
  return names;
}

const getRoster = wrap(async (req, res) => res.json(namesOf(await rosterRow())));

const addStaff = wrap(async (req, res) => {
  const name = str(req.body && req.body.name, 60);
  if (!name) return res.status(400).json({ error: '请填写员工名字' });
  const row = await rosterRow();
  const names = namesOf(row);
  if (names.some((n) => n.toLowerCase() === name.toLowerCase())) return res.status(409).json({ error: '这位员工已经在名单里' });
  res.status(201).json(await saveNames(row, [...names, name]));
});

const removeStaff = wrap(async (req, res) => {
  const name = str(req.params.name, 60);
  const row = await rosterRow();
  const names = namesOf(row);
  if (!names.includes(name)) return res.status(404).json({ error: 'Not found' });
  if ((await store.list('users')).some((u) => u.staffName === name)) return res.status(409).json({ error: `「${name}」还有登录账号在用，请先改掉或删除那个账号` });
  res.json(await saveNames(row, names.filter((n) => n !== name)));
});

module.exports = { getRoster, addStaff, removeStaff };
