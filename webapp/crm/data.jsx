import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../api'
import { DEFAULT_ROOM_STAFF, DEFAULT_STAFF } from './staff'

const CrmContext = createContext(null)

const qs = (r) => `start=${encodeURIComponent(r.start)}&end=${encodeURIComponent(r.end)}`

// Loads the CRM collections and exposes reload + simple CRUD helpers. Appointments are NOT loaded all at once: screens ask for what they show,
//   useApptWindow(key, { start, end })   the bookings that start in a time range (UTC ISO, start included, end not): the calendar's day / week / month
//   useCustomerAppointments(customerId)  one customer's bookings, whatever the date (their history)
// `appointments` is whatever has been asked for so far, without duplicates; customerStats has every customer's booking / visit counts,
// and apptIndex maps every booking id to its status / staff / source (what the payment screens look up).
export function CrmProvider({ children }) {
  const [state, setState] = useState({ customers: [], payments: [], services: [], blocks: [], customerStats: {}, apptIndex: {}, hours: { openMin: 10 * 60, closeMin: 20 * 60, rooms: {}, closedDays: [] }, schedule: {}, roster: DEFAULT_STAFF, ready: false })
  const [wins, setWins] = useState({}) // key -> { start, end } the screens ask for
  const [winRows, setWinRows] = useState({}) // key -> the bookings in that range
  const [wanted, setWanted] = useState({}) // customerId -> how many screens ask for their bookings
  const [custRows, setCustRows] = useState({}) // customerId -> their bookings
  const live = useRef({ wins: {}, wanted: {}, got: {}, gotCust: {} }) // what is asked for / already fetched, for callbacks that must not go stale
  live.current.wins = wins
  live.current.wanted = wanted

  const loadWin = useCallback(async (key, r) => {
    const id = `${r.start}|${r.end}`
    live.current.got[key] = id
    const rows = await api(`/crm/appointments?${qs(r)}`)
    if (live.current.got[key] === id) setWinRows((cur) => ({ ...cur, [key]: rows })) // an older answer never replaces a newer one
  }, [])
  const loadCust = useCallback(async (customerId) => {
    live.current.gotCust[customerId] = true
    const rows = await api(`/crm/appointments?customerId=${encodeURIComponent(customerId)}`)
    setCustRows((cur) => ({ ...cur, [customerId]: rows }))
  }, [])

  // Fetch a range / a customer when a screen starts asking for it; forget it when nobody does.
  useEffect(() => {
    for (const [key, r] of Object.entries(wins)) if (live.current.got[key] !== `${r.start}|${r.end}`) loadWin(key, r).catch(() => {})
    for (const key of Object.keys(live.current.got)) if (!wins[key]) { delete live.current.got[key]; setWinRows((cur) => { const { [key]: _gone, ...rest } = cur; return rest }) }
  }, [wins, loadWin])
  useEffect(() => {
    for (const id of Object.keys(wanted)) if (wanted[id] > 0 && !live.current.gotCust[id]) loadCust(id).catch(() => {})
    for (const id of Object.keys(live.current.gotCust)) if (!(wanted[id] > 0)) { delete live.current.gotCust[id]; setCustRows((cur) => { const { [id]: _gone, ...rest } = cur; return rest }) }
  }, [wanted, loadCust])

  const setWindow = useCallback((key, range) => setWins((cur) => {
    if (!range) { if (!cur[key]) return cur; const { [key]: _gone, ...rest } = cur; return rest }
    return cur[key] && cur[key].start === range.start && cur[key].end === range.end ? cur : { ...cur, [key]: range }
  }), [])
  const watchCustomer = useCallback((id) => {
    setWanted((cur) => ({ ...cur, [id]: (cur[id] || 0) + 1 }))
    return () => setWanted((cur) => ({ ...cur, [id]: Math.max(0, (cur[id] || 1) - 1) }))
  }, [])

  const reload = useCallback(async () => {
    const [customers, payments, services, blocks, hours, schedule, roster, customerStats, apptIndex] = await Promise.all([
      api('/crm/customers'), api('/crm/payments'), api('/crm/services'), api('/crm/blocks'), api('/crm/settings'), api('/crm/schedule'), api('/crm/staff-list'), api('/crm/customer-stats'), api('/crm/appointment-index'),
      // the bookings the screens are showing right now
      ...Object.entries(live.current.wins).map(([key, r]) => loadWin(key, r)),
      ...Object.keys(live.current.wanted).filter((id) => live.current.wanted[id] > 0).map((id) => loadCust(id)),
    ])
    setState({ customers, payments, services, blocks, hours, schedule, roster, customerStats, apptIndex, ready: true })
  }, [loadWin, loadCust])

  const appointments = useMemo(() => {
    const byId = new Map()
    for (const rows of [...Object.values(winRows), ...Object.values(custRows)]) for (const a of rows) byId.set(a.id, a)
    return [...byId.values()]
  }, [winRows, custRows])

  useEffect(() => { reload().catch(() => {}) }, [reload])

  const save = useCallback(async (kind, id, body) => {
    const row = await api(id ? `/crm/${kind}/${id}` : `/crm/${kind}`, { method: id ? 'PUT' : 'POST', body })
    await reload()
    return row
  }, [reload])

  const remove = useCallback(async (kind, id, query = '') => {
    await api(`/crm/${kind}/${id}${query}`, { method: 'DELETE' })
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

  return <CrmContext.Provider value={{ ...state, appointments, setWindow, watchCustomer, hoursFor, isClosed, worksOn, staffHours, staffRest, roomWindow, customerById, serviceById, reload, save, remove }}>{children}</CrmContext.Provider>
}

export const useCrm = () => useContext(CrmContext)

// Ask for the bookings that start in `range` ({ start, end }, UTC ISO) while this screen is mounted. `key` names the screen's own window.
export function useApptWindow(key, range) {
  const { setWindow } = useCrm()
  const start = range?.start
  const end = range?.end
  useEffect(() => {
    setWindow(key, start && end ? { start, end } : null)
    return () => setWindow(key, null)
  }, [key, start, end, setWindow])
}

// Ask for one customer's bookings (their whole history) while this screen is mounted.
export function useCustomerAppointments(customerId) {
  const { watchCustomer } = useCrm()
  useEffect(() => (customerId ? watchCustomer(customerId) : undefined), [customerId, watchCustomer])
}
