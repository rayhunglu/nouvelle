const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongo = require('./mongo');

// Tiny JSON-file datastore for the CRM prototype. Swap for a real database
// (Postgres/SQLite) before storing real client data at scale.
const DATA_DIR = process.env.CRM_DATA_DIR || path.join(__dirname, '..', '..', 'data');
const FILE = path.join(DATA_DIR, 'crm.json');

const COLLECTIONS = ['customers', 'appointments', 'payments', 'services', 'messages', 'applications'];

let db = null;

// Starter service catalogue; editable from the CRM (Finance → service chips).
const DEFAULT_SERVICES = [
  '咨询', 'Botox 肉毒素', '玻尿酸填充', 'Belkyra 双下巴溶脂', '童颜针', '替西帕肽减肥针', 'Silhouette InstaLift 童颜线',
  'Thermage 热玛吉', 'Stellar M22 光子嫩肤', '点阵激光', 'Pico 激光', 'RF 射频微针', 'AviClear 祛痘激光',
  'HydraFacial', 'PRP 生发', 'NAD+ 静脉注射', '高压氧舱 HBOT', 'EMSculpt 磁波塑肌', 'BTL 溶脂刀',
  '日式小颜 60 分钟', '日式小颜 90 分钟', '修丽可清洁补水', '修丽可滋润修复', '中式古法面部刮痧', '专业祛痘针清',
  '身体 Spa', '头皮 Spa', '睫毛嫁接 · 经典', '睫毛嫁接 · 混合', '睫毛嫁接 · 浓密', '半永久纹绣', '定制修眉', '个人形象定制妆容', '高级感水雾眉', '自然款美瞳线', '无创洗眉', '无创洗眼线', '产品销售',
];
const newService = (name) => ({ id: crypto.randomUUID(), name, createdAt: new Date().toISOString() });

function seed() {
  const now = new Date();
  const day = (offset, hour, min = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    d.setHours(hour, min, 0, 0);
    return d.toISOString();
  };
  const id = () => crypto.randomUUID();

  const c1 = { id: id(), name: '示例客户 A', phone: '(425) 555-0101', email: 'a@example.com', notes: '偏好下午预约', tags: ['VIP'], createdAt: day(-60, 10) };
  const c2 = { id: id(), name: '示例客户 B', phone: '(425) 555-0102', email: 'b@example.com', notes: '', tags: ['新客'], createdAt: day(-10, 10) };
  const c3 = { id: id(), name: '示例客户 C', phone: '(206) 555-0103', email: '', notes: '对玻尿酸有兴趣', tags: [], createdAt: day(-30, 10) };

  const a1 = { id: id(), customerId: c1.id, service: '日式小颜 60 分钟', start: day(0, 14), durationMin: 60, status: 'scheduled', price: 158, room: 'room1', staff: '示例员工 A', notes: '', createdAt: day(-2, 9) };
  const a2 = { id: id(), customerId: c2.id, service: 'Botox 肉毒素', start: day(1, 11), durationMin: 30, status: 'scheduled', price: 300, room: 'room2', staff: '示例员工 B', notes: '', createdAt: day(-1, 9) };
  const a3 = { id: id(), customerId: c1.id, service: 'HydraFacial', start: day(-7, 15), durationMin: 60, status: 'completed', price: 180, room: 'room3', staff: '示例员工 A', notes: '', createdAt: day(-9, 9) };
  const a4 = { id: id(), customerId: c3.id, service: '咨询', start: day(3, 10), durationMin: 30, status: 'scheduled', price: 0, room: 'room4', staff: '示例员工 B', notes: '', createdAt: day(0, 9) };

  const services = DEFAULT_SERVICES.map(newService);
  const sid = (name) => services.find((x) => x.name === name).id;
  const pay = (offset, customerId, serviceNames, amount, tipAmount, paymentMethod, staff, referralSource = '', appointmentId = null) => ({
    id: id(), appointmentId, customerId, datetime: day(offset, 15), serviceIds: serviceNames.map(sid),
    amount, tipAmount, paymentMethod, staff, referralSource, createdAt: day(offset, 15),
  });

  return {
    customers: [c1, c2, c3],
    appointments: [a1, a2, a3, a4],
    services,
    payments: [
      pay(-7, c1.id, ['HydraFacial'], 180, 30, 'credit_card', '示例员工 A', '', a3.id),
      pay(-20, c2.id, ['日式小颜 60 分钟'], 158, 20, 'cash', '示例员工 B', '示例介绍人'),
      pay(-2, c3.id, ['产品销售'], 95, 0, 'transfer', '示例员工 A'),
    ],
  };
}

function load() {
  if (db) return db;
  let fresh = false;
  try {
    db = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    db = seed();
    fresh = true;
  }
  migrate();
  for (const name of COLLECTIONS) if (!Array.isArray(db[name])) db[name] = [];
  // On a read-only host (Vercel without MONGODB_URI) this fails; surface a clear message instead of
  // leaving a half-initialised db behind.
  if (fresh) {
    try {
      persist();
    } catch (err) {
      db = null;
      throw new Error(`Cannot write ${FILE} (${err.code || err.message}). Set MONGODB_URI for a hosted datastore.`);
    }
  }
  return db;
}

// Older files stored income/expense "transactions". Keep income as payments, drop expenses.
function migrate() {
  let changed = false;
  if (!Array.isArray(db.services) || db.services.length === 0) {
    db.services = DEFAULT_SERVICES.map(newService);
    changed = true;
  }
  if (Array.isArray(db.transactions)) {
    db.payments = db.payments || [];
    for (const t of db.transactions) {
      if (t.type !== 'income') continue;
      db.payments.push({
        id: t.id, appointmentId: null, customerId: t.customerId || null,
        datetime: new Date(`${t.date}T12:00:00`).toISOString(), serviceIds: [],
        amount: t.amount, tipAmount: 0, paymentMethod: t.method === 'card' ? 'credit_card' : (t.method || ''),
        staff: '', referralSource: '', createdAt: t.createdAt,
      });
    }
    delete db.transactions;
    changed = true;
  }
  if (changed) persist();
}

function persist() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, FILE); // atomic replace so a crash can't leave half a file
}

// ---- file backend (local development, no MONGODB_URI) ----

const fileStore = {
  async list(name) {
    return load()[name];
  },
  async get(name, id) {
    return load()[name].find((r) => r.id === id) || null;
  },
  async create(name, data) {
    const record = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    load()[name].push(record);
    persist();
    return record;
  },
  async update(name, id, data) {
    const rows = load()[name];
    const i = rows.findIndex((r) => r.id === id);
    if (i === -1) return null;
    rows[i] = { ...rows[i], ...data, id, updatedAt: new Date().toISOString() };
    persist();
    return rows[i];
  },
  async remove(name, id) {
    const rows = load()[name];
    const i = rows.findIndex((r) => r.id === id);
    if (i === -1) return false;
    rows.splice(i, 1);
    persist();
    return true;
  },
};

// ---- MongoDB backend (production / Vercel) ----
// One collection per name; documents keep our own string `id` (the Mongo `_id` is hidden).

const NO_ID = { projection: { _id: 0 } };
let ready = null;

// Index on `id` and the starter service catalogue (only when the catalogue is empty).
function init() {
  if (!ready) {
    ready = (async () => {
      const db = await mongo.getDb();
      await Promise.all(COLLECTIONS.map((c) => db.collection(c).createIndex({ id: 1 }, { unique: true })));
      if ((await db.collection('services').estimatedDocumentCount()) === 0) {
        await db.collection('services').insertMany(DEFAULT_SERVICES.map(newService));
      }
    })().catch((err) => {
      ready = null; // retry on the next request
      throw err;
    });
  }
  return ready;
}

async function col(name) {
  await init();
  return (await mongo.getDb()).collection(name);
}

const mongoStore = {
  async list(name) {
    return (await col(name)).find({}, NO_ID).sort({ createdAt: 1 }).toArray();
  },
  async get(name, id) {
    return (await col(name)).findOne({ id }, NO_ID);
  },
  async create(name, data) {
    const record = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    await (await col(name)).insertOne({ ...record }); // insertOne adds _id to what it is given, so pass a copy
    return record;
  },
  async update(name, id, data) {
    return (await col(name)).findOneAndUpdate(
      { id },
      { $set: { ...data, id, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after', projection: { _id: 0 } },
    );
  },
  async remove(name, id) {
    return (await (await col(name)).deleteOne({ id })).deletedCount > 0;
  },
};

// Every method is async; the backend is picked once from MONGODB_URI.
module.exports = mongo.enabled() ? mongoStore : fileStore;
