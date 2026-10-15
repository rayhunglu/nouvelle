import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { DEFAULT_ROOM_STAFF, DEFAULT_STAFF } from './staff'

const CrmContext = createContext(null)

// Loads all CRM collections once and exposes reload + simple CRUD helpers.
export function CrmProvider({ children }) {
  const [state, setState] = useState({ customers: [], appointments: [], payments: [], services: [], blocks: [], hours: { openMin: 10 * 60, closeMin: 20 * 60, rooms: {}, closedDays: [] }, schedule: {}, roster: DEFAULT_STAFF, ready: false })

  const reload = useCallback(async () => {
    const [customers, appointments, payments, services, blocks, hours, schedule, roster] = await Promise.all([
      api('/crm/customers'), api('/crm/appointments'), api('/crm/payments'), api('/crm/services'), api('/crm/blocks'), api('/crm/settings'), api('/crm/schedule'), api('/crm/staff-list'),
    ])
    setState({ customers, appointments, payments, services, blocks, hours, schedule, roster, ready: true })
  }, [])

  useEffect(() => { reload().catch(() => {}) }, [reload])

  const save = useCallback(async (kind, id, body) => {
    const row = await api(id ? `/crm/${kind}/${id}` : `/crm/${kind}`, { method: id ? 'PUT' : 'POST', body })
    await reload()
    return row
  }, [reload])

  const remove = useCallback(async (kind, id) => {
    await api(`/crm/${kind}/${id}`, { method: 'DELETE' })
    await reload()
  }, [reload])

  // Opening / closing time of one room: its own override, otherwise the clinic-wide time.
  const hoursFor = useCallback((roomId) => ({
    openMin: state.hours.rooms?.[roomId]?.openMin ?? state.hours.openMin,
    closeMin: state.hours.rooms?.[roomId]?.closeMin ?? state.hours.closeMin,
  }), [state.hours])

  // A room the manager switched off for one day (date = 'YYYY-MM-DD').
  const isClosed = useCallback((roomId, date) => (state.hours.closedDays || []).some((d) => d.room === roomId && d.date === date), [state.hours])

  // Does this staff member work on that day (date = 'YYYY-MM-DD')? A rest date beats an extra-work date beats the weekly pattern;
  // someone without a schedule works every day.
  const worksOn = useCallback((name, date) => {
    const s = state.schedule?.[name]
    if (!s || !date) return true
    if ((s.off || []).includes(date)) return false
    if ((s.on || []).includes(date)) return true
    const [y, m, d] = date.split('-').map(Number)
    return (s.weekdays || [0, 1, 2, 3, 4, 5, 6]).includes(new Date(y, m - 1, d).getDay())
  }, [state.schedule])

  // The working hours that apply to a staff member on a day (date = 'YYYY-MM-DD'): that weekday's own hours, else their usual
  // hours, else null (the clinic's hours).
  const staffHours = useCallback((name, date) => {
    const s = state.schedule?.[name]
    if (!s) return null
    if (date && (s.on || []).includes(date) && s.onHours?.[date]) return { startMin: s.onHours[date].startMin, endMin: s.onHours[date].endMin } // an extra work day with its own hours
    if (date) {
      const [y, m, d] = date.split('-').map(Number)
      const own = s.dayHours?.[new Date(y, m - 1, d).getDay()]
      if (own) return { startMin: own.startMin, endMin: own.endMin }
    }
    return s.startMin !== null && s.startMin !== undefined && s.endMin !== null && s.endMin !== undefined ? { startMin: s.startMin, endMin: s.endMin } : null
  }, [state.schedule])

  // A part-day rest ({ startMin, endMin }) on that date, or null.
  const staffRest = useCallback((name, date) => state.schedule?.[name]?.restHours?.[date] || null, [state.schedule])

  // Room opening that follows its people: null = nobody is linked to the room; { closed: true } = none of them works that day;
  // { startMin, endMin } = staffed only between those times; {} = staffed all day.
  const roomWindow = useCallback((roomId, date) => {
    if (!roomId || !date) return null
    const sched = state.schedule || {}
    const names = [...new Set([...Object.keys(DEFAULT_ROOM_STAFF), ...Object.keys(sched)])].filter((n) => {
      const s = sched[n]
      if (s && s.linkRooms === false) return false
      return ((s && s.rooms) || DEFAULT_ROOM_STAFF[n] || []).includes(roomId)
    })
    if (!names.length) return null
    const working = names.filter((n) => worksOn(n, date))
    if (!working.length) return { closed: true, names }
    const spans = working.map((n) => staffHours(n, date))
    if (spans.some((x) => !x)) return {}
    return { startMin: Math.min(...spans.map((x) => x.startMin)), endMin: Math.max(...spans.map((x) => x.endMin)), names: working }
  }, [state.schedule, worksOn, staffHours])

  const customerById = useMemo(() => Object.fromEntries(state.customers.map((c) => [c.id, c])), [state.customers])
  const serviceById = useMemo(() => Object.fromEntries(state.services.map((x) => [x.id, x])), [state.services])

  return <CrmContext.Provider value={{ ...state, hoursFor, isClosed, worksOn, staffHours, staffRest, roomWindow, customerById, serviceById, reload, save, remove }}>{children}</CrmContext.Provider>
}

export const useCrm = () => useContext(CrmContext)
