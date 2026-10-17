const store = require('../../services/store');
const drive = require('../../services/googleDrive');
const { wrap } = require('./common');
const { isStaff, visibleRows } = require('../../middleware/crmAccess');

// Documents on a customer's page. The browser only talks to this server; the server keeps the bytes in Google Drive.
// Every request first checks the customer is one this user may see, and a file is only served through its own customer's URL.
const MAX_BYTES = 4 * 1024 * 1024; // Vercel rejects request bodies over about 4.5MB
const TYPES = { // allowed extensions -> what is sent back when downloading
  pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', heic: 'image/heic',
  doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', txt: 'text/plain', csv: 'text/csv',
};
const MAGIC = { pdf: '%PDF', png: '\x89PNG', jpg: '\xff\xd8\xff', jpeg: '\xff\xd8\xff' }; // the first bytes must match the extension

const safeName = (n) => String(n || '').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '_').replace(/^\.+/, '').trim().slice(0, 120);

const customerOf = async (req) => {
  const c = await store.get('customers', req.params.id);
  return c && (await visibleRows(req, 'customers', [c])).length ? c : null;
};
const fileOf = async (req, customerId) => {
  const f = await store.get('customerFiles', req.params.fileId);
  return f && f.customerId === customerId ? f : null;
};
const publicRow = (f) => ({ id: f.id, name: f.name, size: f.size, mimeType: f.mimeType, uploadedBy: f.uploadedBy, createdAt: f.createdAt });

const list = wrap(async (req, res) => {
  const c = await customerOf(req);
  if (!c) return res.status(404).json({ error: 'Not found' });
  res.json((await store.list('customerFiles')).filter((f) => f.customerId === c.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(publicRow));
});

// The file is the raw request body. ?label= is what the user called it, ?ext= the real file's extension; the stored name is 客户名_label.ext
const upload = wrap(async (req, res) => {
  const c = await customerOf(req);
  if (!c) return res.status(404).json({ error: 'Not found' });
  if (!drive.enabled()) return res.status(503).json({ error: '文件存储（Google Drive）还没有配置' });
  const label = safeName(req.query.label);
  const ext = String(req.query.ext || '').toLowerCase();
  const name = `${safeName(c.name)}_${label}.${ext}`;
  const buf = req.body;
  if (!label) return res.status(400).json({ error: '请选择或填写文件名称' });
  if (!TYPES[ext]) return res.status(400).json({ error: `不支持这个文件类型（支持：${Object.keys(TYPES).join('、')}）` });
  if (!Buffer.isBuffer(buf) || !buf.length) return res.status(400).json({ error: '文件是空的' });
  if (buf.length > MAX_BYTES) return res.status(413).json({ error: '文件太大（最大 4MB）' });
  if (MAGIC[ext] && buf.subarray(0, MAGIC[ext].length).toString('latin1') !== MAGIC[ext]) return res.status(400).json({ error: '文件内容与扩展名不符' });
  const driveId = await drive.upload({ name, mimeType: TYPES[ext], buffer: buf });
  const row = await store.create('customerFiles', { customerId: c.id, driveId, name, mimeType: TYPES[ext], size: buf.length, uploadedBy: req.session.user.username });
  res.status(201).json(publicRow(row));
});

const download = wrap(async (req, res) => {
  const c = await customerOf(req);
  const f = c && (await fileOf(req, c.id));
  if (!f) return res.status(404).json({ error: 'Not found' });
  const stream = await drive.download(f.driveId);
  res.set({
    'Content-Type': f.mimeType,
    'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(f.name)}`,
    'Content-Length': String(f.size),
    'X-Content-Type-Options': 'nosniff',
  });
  stream.on('error', (err) => { console.error('[customerFiles] download failed:', err.message); res.destroy(err); });
  stream.pipe(res);
});

const remove = wrap(async (req, res) => {
  const c = await customerOf(req);
  const f = c && (await fileOf(req, c.id));
  if (!f) return res.status(404).json({ error: 'Not found' });
  await drive.remove(f.driveId);
  await store.remove('customerFiles', f.id);
  res.json({ ok: true });
});

// Deleting a customer takes their documents too.
async function removeAllOf(customerId) {
  for (const f of (await store.list('customerFiles')).filter((x) => x.customerId === customerId)) {
    try { if (drive.enabled()) await drive.remove(f.driveId); } catch (err) { console.error('[customerFiles] Drive delete failed:', err.message); }
    await store.remove('customerFiles', f.id);
  }
}

module.exports = { list, upload, download, remove, removeAllOf, isStaff };
