// Small helpers and constants shared by the CRM controllers.

// Express 4 doesn't catch rejected promises: forward them to the error handler.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const STATUSES = ['scheduled', 'checked-in', 'in-service', 'completed', 'cancelled', 'no-show'];
const METHODS = ['cash', 'transfer', 'credit_card', 'other', 'zelle', 'venmo', 'member_card', 'unsettled']; // 'unsettled' = checked out, money not collected yet
// Where a customer came from: one of the staff, or someone else (the booking form's 客户来源).
const SOURCES = ['Yingna', 'Rina', 'Dayu', '其他'];
// Member categories on a customer ('' = not a member; 'member' = a member without a category, kept for older records).
const MEMBER_TIERS = ['', 'member', '1000', '2000', '3000', '5000', 'vip'];
const ROOM_IDS = ['room1', 'room2', 'room3', 'room4'];
const ROOM_NAMES = { room1: '美容单人房', room2: '医美双人房', room3: '美睫单人房', room4: '头疗双人房' };

const str = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const num = (v) => (v === '' || v === null || v === undefined ? NaN : Number(v));

module.exports = { wrap, MEMBER_TIERS, SOURCES, STATUSES, METHODS, ROOM_IDS, ROOM_NAMES, str, num };
