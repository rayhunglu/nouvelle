import { dayKey } from './format'
import { ROOMS } from './rooms'

// Shared by the appointment form and its day timeline: one row per 15 minutes.
export const SLOT = 15 // minutes per row
export const ROW = 30 // px per row
export const OPEN = 10 * 60 // 10:00, the clinic's opening time
export const CLOSE = 19 * 60 // 19:00

const pad = (n) => String(n).padStart(2, '0')
export const hhmm = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
export const minutesOfDay = (iso) => {
  const d = new Date(iso)
  return d.getHours() * 60 + d.getMinutes()
}

const ACTIVE = ['scheduled', 'completed']

// Appointments on `date` (YYYY-MM-DD) that still take up a room, without the one being edited.
export function dayAppointments(appointments, date, selfId) {
  return appointments.filter((a) => a.id !== selfId && ACTIVE.includes(a.status) && dayKey(a.start) === date)
}

// First appointment in the same room that overlaps [start, start + duration), or null.
export function findClash(list, room, startMin, durationMin) {
  if (!room) return null
  const end = startMin + durationMin
  const beds = ROOMS.find((r) => r.id === room)?.beds || 1
  const overlapping = list.filter((a) => {
    if (a.room !== room) return false
    const s = minutesOfDay(a.start)
    return startMin < s + (a.durationMin || 60) && s < end
  })
  // A double room only clashes once every bed is taken.
  return overlapping.length >= beds ? overlapping[0] : null
}

// A "new appointment" default start inside opening hours: the next whole hour today, otherwise 10:00 on the next open day.
export function defaultOpenStart() {
  const d = new Date()
  d.setMinutes(0, 0, 0)
  d.setHours(d.getHours() + 1)
  const min = d.getHours() * 60
  if (min >= CLOSE) {
    d.setDate(d.getDate() + 1)
    d.setHours(OPEN / 60)
  } else if (min < OPEN) {
    d.setHours(OPEN / 60)
  }
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
