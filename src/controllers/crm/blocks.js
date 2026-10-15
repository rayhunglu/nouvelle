const { ROOM_IDS, str, num } = require('./common');
const { makeCrud } = require('./crud');

// A blocked stretch of time ("有事，不接受预约") in one room, or in every room when `room` is empty.
function blockInput(b) {
  const start = new Date(b.start);
  if (Number.isNaN(start.getTime())) return { error: 'valid start datetime is required' };
  const durationMin = num(b.durationMin || 60);
  if (!Number.isFinite(durationMin) || durationMin < 15 || durationMin > 24 * 60) return { error: 'durationMin must be 15-1440' };
  const room = str(b.room, 30);
  if (room && !ROOM_IDS.includes(room)) return { error: 'unknown room' };
  return { data: { start: start.toISOString(), durationMin, room, reason: str(b.reason, 200) } };
}

module.exports = makeCrud('blocks', blockInput);
