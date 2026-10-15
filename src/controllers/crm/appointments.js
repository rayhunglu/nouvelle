const store = require('../../services/store');
const { STATUSES, ROOM_NAMES, str, num } = require('./common');
const { makeCrud } = require('./crud');
const { hoursRow } = require('./settings');
const { notifyStaff } = require('./staffProfile');
const { scheduleRow, clinicDay, laMinutes, hhmmOf, hoursOnDay, worksOn, roomByStaff } = require('./schedule');

async function appointmentInput(b) {
  const start = new Date(b.start);
  if (!b.customerId || !(await store.get('customers', b.customerId))) return { error: 'valid customerId is required' };
  if (Number.isNaN(start.getTime())) return { error: 'valid start datetime is required' };
  const service = str(b.service, 160);
  if (!service) return { error: 'service is required' };
  const durationMin = num(b.durationMin || 60);
  const price = b.price === '' || b.price == null ? 0 : num(b.price);
  if (!Number.isFinite(durationMin) || durationMin <= 0 || durationMin > 24 * 60) return { error: 'durationMin must be 1-1440' };
  if (!Number.isFinite(price) || price < 0) return { error: 'price must be 0 or more' };
  const status = b.status || 'scheduled';
  if (!STATUSES.includes(status)) return { error: `status must be one of ${STATUSES.join(', ')}` };
  return {
    data: {
      customerId: b.customerId, service, start: start.toISOString(), durationMin, price, status,
      room: str(b.room, 30), staff: str(b.staff, 60), notes: str(b.notes, 2000),
      // A booking can take a whole double room (both beds); stored only when sent so other edits never reset it.
      ...('fullRoom' in b ? { fullRoom: b.fullRoom === true } : {}),
    },
  };
}

// A room can't host more active appointments at the same time than it has beds (double rooms have two).
const ACTIVE = ['scheduled', 'checked-in', 'in-service', 'completed'];
const BEDS = { room2: 2, room4: 2 };
async function roomConflict(data, selfId) {
  if (!ACTIVE.includes(data.status)) return null;
  // Blocked time: bookings can't be created, moved or lengthened into it. An existing booking that is only changing status
  // (same time and room) is left alone.
  const before = selfId ? await store.get('appointments', selfId) : null;
  const moved = !before || before.start !== data.start || before.durationMin !== data.durationMin || (before.room || '') !== (data.room || '');
  // A staff member on a rest day is not booked (checked when the booking is new, or its time / staff changes).
  if (data.staff && (!before || before.start !== data.start || before.durationMin !== data.durationMin || (before.staff || '') !== data.staff)) {
    const sched = ((await scheduleRow()) || {}).staff;
    const startAt = new Date(data.start);
    const day = clinicDay(startAt);
    if (!worksOn(sched, data.staff, day)) return `${data.staff} 在 ${day} 休息，不能安排预约`;
    // ...and only inside their working hours, when the manager set some.
    // A part-day rest blocks just that stretch.
    const rest = sched && sched[data.staff] && sched[data.staff].restHours && sched[data.staff].restHours[day];
    if (rest) {
      const r0 = laMinutes(startAt);
      if (r0 < rest.endMin && rest.startMin < r0 + data.durationMin) return `${data.staff} 当天 ${hhmmOf(rest.startMin)}–${hhmmOf(rest.endMin)} 休息，这个时间段不能安排预约`;
    }
    const hrs0 = hoursOnDay(sched && sched[data.staff], day);
    if (hrs0) {
      const s0 = laMinutes(startAt);
      if (s0 < hrs0.startMin || s0 + data.durationMin > hrs0.endMin) return `${data.staff} 当天的出勤时间是 ${hhmmOf(hrs0.startMin)}–${hhmmOf(hrs0.endMin)}，这个时间段不在其中`;
    }
  }
  if (data.room && (!before || before.start !== data.start || before.durationMin !== data.durationMin || (before.room || '') !== data.room)) {
    const sched = ((await scheduleRow()) || {}).staff;
    const startAt = new Date(data.start);
    const rw = roomByStaff(sched, data.room, clinicDay(startAt));
    if (rw && rw.closed) return `${ROOM_NAMES[data.room]} 当天负责的员工都休息，房间不开放`;
    if (rw && rw.startMin !== undefined) {
      const s0 = laMinutes(startAt);
      if (s0 < rw.startMin || s0 + data.durationMin > rw.endMin) return `${ROOM_NAMES[data.room]} 当天只有 ${hhmmOf(rw.startMin)}–${hhmmOf(rw.endMin)} 有员工出勤，这个时间段不开放`;
    }
  }
  if (moved) {
    const hrs = await hoursRow();
    const bs0 = new Date(data.start).getTime();
    if (data.room && hrs && (hrs.closedDays || []).some((d) => d.room === data.room && bs0 < new Date(d.to).getTime() && new Date(d.from).getTime() < bs0 + data.durationMin * 60000)) return '这个房间这一天关闭，暂不接受预约';
    const bs = bs0;
    const be = bs + data.durationMin * 60000;
    const hit = (await store.list('blocks')).find((k) => (k.room === '' || k.room === data.room)
      && bs < new Date(k.start).getTime() + k.durationMin * 60000 && new Date(k.start).getTime() < be);
    if (hit) return `该时间段已被屏蔽（${hit.reason || '暂不接受预约'}）`;
  }
  if (!data.room) return null;
  const cap = BEDS[data.room] || 1;
  const stored = selfId && data.fullRoom === undefined ? await store.get('appointments', selfId) : null;
  const full = (data.fullRoom !== undefined ? data.fullRoom : !!(stored && stored.fullRoom)) && cap > 1;
  const s = new Date(data.start).getTime();
  const e = s + data.durationMin * 60000;
  const overlapping = (await store.list('appointments')).filter((a) => {
    if (a.id === selfId || a.room !== data.room || !ACTIVE.includes(a.status)) return false;
    const as = new Date(a.start).getTime();
    return s < as + (a.durationMin || 60) * 60000 && as < e;
  });
  // A booking that takes the whole room uses every bed; otherwise each booking uses one.
  const used = overlapping.reduce((n, a) => n + (a.fullRoom && cap > 1 ? cap : 1), 0);
  if (used + (full ? cap : 1) <= cap) return null;
  const clash = overlapping[0];
  const who = await store.get('customers', clash.customerId);
  const t = new Date(clash.start).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `该房间在 ${t} 已有预约（${who ? who.name : '未知客户'} · ${clash.service}），时间冲突`;
}

// Payments tied to an appointment go away with it. A payment that also loaded money onto a member card keeps that
// top-up (as a plain top-up record); only the service amount, tip and any gift redeemed are taken back.
async function dropPaymentsOf(appointmentId) {
  for (const p of (await store.list('payments')).filter((x) => x.appointmentId === appointmentId)) {
    if (p.topUp > 0) {
      await store.update('payments', p.id, { appointmentId: null, amount: 0, tipAmount: 0, giftUsed: '', serviceName: '', serviceIds: [], paymentMethod: p.topUpMethod || 'cash', tipMethod: p.topUpMethod || 'cash' });
    } else {
      await store.remove('payments', p.id);
    }
  }
}

module.exports = makeCrud('appointments', appointmentInput, {
  conflict: roomConflict,
  async afterWrite(row, isNew, req, prev) {
    if (row.status === 'cancelled' || row.status === 'no-show') { await dropPaymentsOf(row.id); return; } // cancelling or a no-show takes its payments back
    // A new booking (or one handed over to someone else) is announced to the staff member it belongs to, unless they made it themselves.
    const handedOver = !isNew && prev && (prev.staff || '') !== (row.staff || '');
    if (row.staff && (isNew || handedOver) && row.status === 'scheduled' && !(req.session.user.role === 'staff' && req.session.user.staffName === row.staff)) {
      notifyStaff(row).catch((err) => console.error('staff notice failed:', err.message)); // in the background: the booking is already saved
    }
  },
  async beforeDelete(id) { await dropPaymentsOf(id); return null; }, // so does deleting
});

