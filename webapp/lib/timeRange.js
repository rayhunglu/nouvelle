// UTC start / end for the calendar's day, week and month, as ISO strings for GET /crm/appointments?start=&end=. The range is [start, end):
// start is included, end is not. Days are the calendar's own days (the same local days it draws), so a 23- or 25-hour DST day comes out right.
const at = (y, m, d) => new Date(y, m, d) // local midnight; month / day overflow rolls over (m = 12 is January next year)
const range = (from, to) => ({ start: from.toISOString(), end: to.toISOString() })
const dayStart = (date) => at(date.getFullYear(), date.getMonth(), date.getDate())
const weekStart = (date) => at(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay()) // Sunday-first weeks, as the calendar shows them

export const dayRange = (date) => { const s = dayStart(date); return range(s, at(s.getFullYear(), s.getMonth(), s.getDate() + 1)) }
export const weekRange = (date) => { const s = weekStart(date); return range(s, at(s.getFullYear(), s.getMonth(), s.getDate() + 7)) }
export const monthRange = (date) => range(at(date.getFullYear(), date.getMonth(), 1), at(date.getFullYear(), date.getMonth() + 1, 1))
// The month view also draws the last days of the month before and the first days of the next, so it asks for the whole grid (6 weeks).
export const monthGridRange = (date) => { const s = weekStart(at(date.getFullYear(), date.getMonth(), 1)); return range(s, at(s.getFullYear(), s.getMonth(), s.getDate() + 42)) }
// From the start of today to `days` days ahead.
export const upcomingRange = (days = 730) => { const s = dayStart(new Date()); return range(s, at(s.getFullYear(), s.getMonth(), s.getDate() + days)) }
// A whole calendar month, `offset` months from this one (0 = this month, -1 = last month).
export const monthOffsetRange = (offset = 0) => { const n = new Date(); return range(at(n.getFullYear(), n.getMonth() + offset, 1), at(n.getFullYear(), n.getMonth() + offset + 1, 1)) }

// The range a calendar mode needs for the day it is showing.
export const rangeFor = (mode, date) => (mode === 'month' ? monthGridRange(date) : mode === 'week' ? weekRange(date) : dayRange(date))
