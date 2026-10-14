import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card } from './ui'
import { dayKey, fmtTime } from './format'
import { NO_ROOM, ROOMS, roomOf } from './rooms'
import { withStaff } from './staff'

const HOUR_PX = 80 // 20px per 15-minute row
const SHADE_END_HOUR = 9 // 00:00-09:00 is drawn shaded
const SHADE_START_HOUR = 20 // and so is 20:00-24:00
const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'] // week starts on Monday

const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
const startOfWeek = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x }
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1)
const keyOf = (d) => dayKey(d.toISOString())

// Colour comes from the room; status is shown by style so both read at a glance.
const chipCls = (a) => `${roomOf(a.room).chip} ${a.status === 'cancelled' ? 'line-through opacity-50' : ''}`
const mark = (a) => (a.status === 'completed' ? '✓ ' : a.status === 'no-show' ? '✗ ' : '')
const tip = (a, name) =>
  `${fmtTime(a.start)} ${name} · ${a.service}${a.staff ? ` · ${a.staff}` : ''} · ${roomOf(a.room).name}`

// Assign side-by-side lanes to overlapping appointments within one column.
function layoutDay(items, minLanes = 1) {
  const sorted = [...items].sort((a, b) => a.start.localeCompare(b.start))
  const out = []
  let cluster = []
  let clusterEnd = 0
  const flush = () => {
    const lanesEnd = []
    const placed = cluster.map((a) => {
      const s = new Date(a.start).getTime()
      let lane = lanesEnd.findIndex((end) => end <= s)
      if (lane === -1) { lane = lanesEnd.length; lanesEnd.push(0) }
      lanesEnd[lane] = s + (a.durationMin || 60) * 60000
      return { a, lane }
    })
    placed.forEach((p) => out.push({ ...p, lanes: Math.max(lanesEnd.length, minLanes) }))
    cluster = []
  }
  for (const a of sorted) {
    const s = new Date(a.start).getTime()
    if (cluster.length && s >= clusterEnd) flush()
    cluster.push(a)
    clusterEnd = Math.max(clusterEnd, s + (a.durationMin || 60) * 60000)
  }
  if (cluster.length) flush()
  return out
}

function Chip({ a, name, onEdit }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onEdit(a) }}
      title={tip(a, name)}
      className={`block w-full truncate rounded-md px-1.5 py-0.5 text-left text-[0.7rem] leading-snug transition ${chipCls(a)}`}
    >
      {mark(a)}<b>{fmtTime(a.start)}</b> {name} · {a.service}{a.staff ? ` · ${a.staff}` : ''}
    </button>
  )
}

function MonthView({ cursor, byDay, customerById, onEdit, onCreate, selected, setSelected }) {
  const gridStart = startOfWeek(startOfMonth(cursor))
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
  const rows = days.slice(35).every((d) => d.getMonth() !== cursor.getMonth()) ? 5 : 6
  const today = keyOf(new Date())

  return (
    <>
      <div className="grid grid-cols-7 border-b border-ink/10 text-center text-xs text-muted">
        {WEEKDAYS.map((w) => <div key={w} className="py-2.5">{w}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {days.slice(0, rows * 7).map((d, i) => {
          const k = keyOf(d)
          const items = (byDay.get(k) || []).sort((a, b) => a.start.localeCompare(b.start))
          const inMonth = d.getMonth() === cursor.getMonth()
          return (
            <div
              key={k}
              onClick={() => { setSelected(k); if (window.matchMedia('(min-width: 640px)').matches) { const s = new Date(d); s.setHours(10, 0, 0, 0); onCreate(s.toISOString()) } }}
              className={`min-h-[4.5rem] cursor-pointer border-b border-r border-ink/5 p-1 transition hover:bg-sand/60 sm:min-h-[7.5rem] sm:p-1.5 ${i % 7 === 6 ? 'border-r-0' : ''} ${inMonth ? '' : 'bg-ink/[0.03]'} ${selected === k ? 'bg-gold/10' : ''}`}
            >
              <div className="flex justify-center sm:justify-start">
                <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${k === today ? 'bg-ink text-ivory' : inMonth ? '' : 'text-muted'}`}>{d.getDate()}</span>
              </div>
              <div className="mt-1 hidden space-y-1 sm:block">
                {items.slice(0, 3).map((a) => <Chip key={a.id} a={a} name={customerById[a.customerId]?.name || '—'} onEdit={onEdit} />)}
                {items.length > 3 && <p className="px-1 text-[0.7rem] text-muted">还有 {items.length - 3} 个</p>}
              </div>
              <div className="mt-1 flex justify-center gap-0.5 sm:hidden">
                {items.slice(0, 4).map((a) => <i key={a.id} className={`h-1.5 w-1.5 rounded-full ${roomOf(a.room).dot}`} />)}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

// Generic time grid, 00:00-24:00 on a 24-hour clock. Each column is a day (week view) or a room (day view).
// It scrolls inside its own frame (the column heads stay put) and, whenever the shown day changes, jumps so the
// red "now" pointer is in view; days other than today open at the first booking, or 09:00.
const pad2 = (n) => String(n).padStart(2, '0')

function TimeGrid({ columns, customerById, onEdit, onCreate, scrollKey }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 20000); return () => clearInterval(t) }, [])
  const scroller = useRef(null)
  const [hover, setHover] = useState(null) // the one 15-minute cell under the pointer: { col, q }
  const [drag, setDrag] = useState(null) // a drag in progress: { col, a, b } (quarter-hour cells, a = where it began)
  const lastPointer = useRef('mouse')
  // Safety net: if the button is released outside a column (or the window loses focus) the drag must not stay stuck.
  const dragging = drag !== null
  useEffect(() => {
    if (!dragging) return undefined
    const end = () => setDrag(null)
    window.addEventListener('pointerup', end)
    window.addEventListener('blur', end)
    return () => { window.removeEventListener('pointerup', end); window.removeEventListener('blur', end) }
  }, [dragging])

  const gridH = 24 * HOUR_PX
  const cols = `var(--gut) repeat(${columns.length}, minmax(0, 1fr))`
  const nowTop = (now.getHours() + now.getMinutes() / 60) * HOUR_PX
  const hasToday = columns.some((c) => c.today)

  // Jump to the pointer (today) or to the day's first booking / 09:00 whenever the shown day changes.
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    let target = 9 * HOUR_PX
    if (hasToday) target = nowTop
    else {
      const starts = columns.flatMap((c) => c.items.map((a) => { const d = new Date(a.start); return d.getHours() + d.getMinutes() / 60 }))
      if (starts.length) target = Math.min(...starts) * HOUR_PX
    }
    el.scrollTop = Math.max(0, target - el.clientHeight / 3)
    // Only when the shown day changes: later minute ticks and filter clicks must not move the view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollKey])

  const quarterAt = (e) => Math.max(0, Math.min(95, Math.floor((e.clientY - e.currentTarget.getBoundingClientRect().top) / (HOUR_PX / 4))))
  const startOf = (c, q) => { const s = new Date(c.date); s.setHours(Math.floor(q / 4), (q % 4) * 15, 0, 0); return s }
  const cellTime = (q) => `${pad2(Math.floor(q / 4))}:${pad2((q % 4) * 15)}`

  // Finger taps keep the old behaviour (one tap opens a new booking); a mouse can also drag out a longer slot.
  const clickSlot = (e, c) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const mins = Math.min(45, Math.floor((y % HOUR_PX) / (HOUR_PX / 4)) * 15)
    const s = new Date(c.date)
    s.setHours(Math.floor(y / HOUR_PX), mins, 0, 0)
    onCreate(s.toISOString(), c.room)
  }

  return (
    <div ref={scroller} className="max-h-[calc(100svh-19rem)] min-h-[22rem] overflow-auto overscroll-contain">
      <div className="[--gut:2.75rem] sm:[--gut:3.5rem] sm:min-w-[var(--mw)]" style={{ '--mw': `${Math.max(columns.length, 3) * 8 + 3.5}rem` }}>
        <div className="sticky top-0 z-30 grid border-b border-ink/10 bg-white text-center text-xs" style={{ gridTemplateColumns: cols }}>
          <div />
          {columns.map((c) => (
            <div key={c.key} className="border-l border-ink/30 py-2.5 last:border-r">{c.header}</div>
          ))}
        </div>
        <div className="relative grid" style={{ height: gridH, gridTemplateColumns: cols }}>
          <div className="relative">
            <div className="pointer-events-none absolute inset-x-0 top-0 bg-ink/[0.07]" style={{ height: SHADE_END_HOUR * HOUR_PX }} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-ink/[0.07]" style={{ height: (24 - SHADE_START_HOUR) * HOUR_PX }} />
            {Array.from({ length: 96 }, (_, q) => {
              const h = Math.floor(q / 4)
              const m = (q % 4) * 15
              const onHour = m === 0
              return (
                <span key={q} className={`absolute right-1 tabular-nums sm:right-2 ${onHour ? 'text-[0.72rem] font-medium text-ink/80' : 'text-[0.62rem] text-muted/70'} ${q === 0 ? 'translate-y-0.5' : '-translate-y-1/2'}`} style={{ top: (q * HOUR_PX) / 4 }}>
                  {`${pad2(h)}:${pad2(m)}`}
                </span>
              )
            })}
            {hasToday && (
              <span className="absolute right-0 z-20 -translate-y-1/2 rounded-l-full bg-rose-600 px-2 py-0.5 text-[0.7rem] font-semibold tabular-nums text-white shadow" style={{ top: nowTop }}>
                {`${pad2(now.getHours())}:${pad2(now.getMinutes())}`}
              </span>
            )}
          </div>
          {columns.map((c) => (
            <div
              key={c.key}
              onClick={(e) => { if (lastPointer.current === 'touch') clickSlot(e, c) }}
              onPointerDown={(e) => {
                lastPointer.current = e.pointerType
                if (e.pointerType === 'touch' || e.button !== 0) return
                const q = quarterAt(e)
                try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* capture is only a convenience */ }
                setHover(null)
                setDrag({ col: c.key, a: q, b: q })
              }}
              onPointerMove={(e) => {
                if (e.pointerType === 'touch') return
                const q = quarterAt(e)
                if (drag && drag.col === c.key) {
                  setDrag((d) => (d.b === q ? d : { ...d, b: q }))
                  // Keep the frame scrolling while the pointer is dragged past its top or bottom edge.
                  const fr = scroller.current?.getBoundingClientRect()
                  if (fr && e.clientY > fr.bottom - 36) scroller.current.scrollTop += 18
                  else if (fr && e.clientY < fr.top + 60) scroller.current.scrollTop -= 18
                } else if (!drag) {
                  setHover((h) => (h && h.col === c.key && h.q === q ? h : { col: c.key, q }))
                }
              }}
              onPointerUp={(e) => {
                if (!drag || drag.col !== c.key) return
                const lo = Math.min(drag.a, drag.b)
                const hi = Math.max(drag.a, drag.b)
                setDrag(null)
                try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* already released */ }
                // A plain click keeps the default length; a drag books exactly the cells it covered.
                onCreate(startOf(c, lo).toISOString(), c.room, hi > lo ? (hi - lo + 1) * 15 : undefined)
              }}
              onPointerCancel={() => setDrag(null)}
              onPointerLeave={(e) => { if (!drag && e.pointerType !== 'touch') setHover(null) }}
              className="relative cursor-pointer select-none border-l border-ink/30 last:border-r"
              style={{ backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${HOUR_PX - 1}px, rgba(43,36,32,0.16) ${HOUR_PX - 1}px, rgba(43,36,32,0.16) ${HOUR_PX}px), repeating-linear-gradient(to bottom, transparent 0, transparent ${HOUR_PX / 4 - 1}px, rgba(43,36,32,0.06) ${HOUR_PX / 4 - 1}px, rgba(43,36,32,0.06) ${HOUR_PX / 4}px)` }}>
              {/* 00:00-09:00 and 20:00-24:00 are shaded: outside the working day. */}
              <div className="pointer-events-none absolute inset-x-0 top-0 bg-ink/[0.07]" style={{ height: SHADE_END_HOUR * HOUR_PX }} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-ink/[0.07]" style={{ height: (24 - SHADE_START_HOUR) * HOUR_PX }} />
              {drag && drag.col === c.key && (() => {
                const lo = Math.min(drag.a, drag.b)
                const hi = Math.max(drag.a, drag.b)
                return (
                  <div className="pointer-events-none absolute inset-x-0 z-10 rounded-sm bg-gold/35 ring-1 ring-gold" style={{ top: (lo * HOUR_PX) / 4, height: ((hi - lo + 1) * HOUR_PX) / 4 }}>
                    <span className="block px-1.5 pt-0.5 text-[0.62rem] font-semibold leading-tight tabular-nums text-plum-deep">{`${cellTime(lo)}–${cellTime(hi + 1)}`}</span>
                    {hi > lo && <span className="block px-1.5 text-[0.6rem] leading-tight text-plum-deep/80">{(hi - lo + 1) * 15} 分钟</span>}
                  </div>
                )
              })()}
              {!drag && hover && hover.col === c.key && (
                <div className="pointer-events-none absolute inset-x-0 rounded-sm bg-gold/20 ring-1 ring-gold/50" style={{ top: (hover.q * HOUR_PX) / 4, height: HOUR_PX / 4 }}>
                  <span className="pl-1.5 text-[0.62rem] font-medium leading-5 tabular-nums text-gold">{`${pad2(Math.floor(hover.q / 4))}:${pad2((hover.q % 4) * 15)}`}</span>
                </div>
              )}
              {c.beds > 1 && <div className="pointer-events-none absolute inset-y-0 left-1/2 z-[1] border-l border-dashed border-ink/10" />}
              {layoutDay(c.items, c.beds || 1).map(({ a, lane, lanes }) => {
                const s = new Date(a.start)
                const top = (s.getHours() + s.getMinutes() / 60) * HOUR_PX
                const height = Math.max(24, ((a.durationMin || 60) / 60) * HOUR_PX - 2)
                const name = customerById[a.customerId]?.name || '—'
                return (
                  <button
                    key={a.id}
                    onClick={(e) => { e.stopPropagation(); onEdit(a) }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onPointerMove={(e) => e.stopPropagation()}
                    onPointerEnter={() => setHover(null)}
                    className={`absolute overflow-hidden rounded-lg px-1.5 py-1 text-left text-[0.7rem] leading-tight transition ${chipCls(a)}`}
                    style={{ top, height, left: `calc(${(lane / lanes) * 100}% + 2px)`, width: `calc(${100 / lanes}% - 4px)` }}
                    title={tip(a, name)}
                  >
                    {mark(a)}<b>{fmtTime(a.start)}</b> {name}
                    <span className="block truncate opacity-80">{a.service}</span>
                    {a.staff && <span className="block truncate font-medium">{a.staff}</span>}
                  </button>
                )
              })}
              {c.today && (
                <div className="pointer-events-none absolute inset-x-0 z-20 flex items-center" style={{ top: nowTop }}>
                  <i className="-ml-1 h-2.5 w-2.5 shrink-0 rounded-full bg-rose-600 ring-2 ring-white" /><i className="h-0.5 flex-1 bg-rose-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Compact per-day agenda: week on phones, and the selected day in month view.
function DayAgenda({ days, byDay, customerById, onEdit, onCreate, emptyHint }) {
  const today = keyOf(new Date())
  return (
    <div className="divide-y divide-ink/10">
      {days.map((d) => {
        const k = keyOf(d)
        const items = (byDay.get(k) || []).sort((a, b) => a.start.localeCompare(b.start))
        return (
          <div key={k} className="flex gap-4 px-4 py-3">
            <button
              onClick={() => { const s = new Date(d); s.setHours(10, 0, 0, 0); onCreate(s.toISOString()) }}
              className="w-12 shrink-0 text-center" aria-label="在这天新增预约"
            >
              <p className="text-xs text-muted">周{WEEKDAYS[(d.getDay() + 6) % 7]}</p>
              <p className={`mx-auto mt-0.5 grid h-8 w-8 place-items-center rounded-full text-sm ${k === today ? 'bg-ink text-ivory' : ''}`}>{d.getDate()}</p>
            </button>
            <div className="min-w-0 flex-1 space-y-1.5">
              {items.length === 0 ? <p className="py-1.5 text-sm text-muted">{emptyHint}</p> : items.map((a) => (
                <button key={a.id} onClick={() => onEdit(a)} className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${chipCls(a)}`}>
                  {mark(a)}<b>{fmtTime(a.start)}</b> · {customerById[a.customerId]?.name || '—'}
                  <span className="block truncate text-xs opacity-80">{a.service} · {a.durationMin} 分钟</span>
                  <span className="block truncate text-xs font-medium">{roomOf(a.room).name}{a.staff ? ` · ${a.staff}` : ''}</span>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// `modes` picks which views this instance offers (the Appointments page shows 'day' on its own and 'week'/'month' under Calendar).
export default function CalendarView({ appointments, customerById, onEdit, onCreate, modes = ['day', 'week', 'month'] }) {
  const [mode, setMode] = useState(() => {
    try {
      const m = localStorage.getItem('crm.calMode')
      return modes.includes(m) ? m : modes.includes('month') ? 'month' : modes[0]
    } catch { return modes.includes('month') ? 'month' : modes[0] }
  })
  const [cursor, setCursor] = useState(() => new Date())
  const [selected, setSelected] = useState(() => keyOf(new Date()))
  const [hiddenRooms, setHiddenRooms] = useState(() => new Set())
  const [staff, setStaff] = useState('')

  const changeMode = (m) => {
    setMode(m)
    try { localStorage.setItem('crm.calMode', m) } catch { /* storage unavailable */ }
  }
  const toggleRoom = (id) => setHiddenRooms((prev) => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id); else next.add(id)
    return next
  })

  const staffNames = useMemo(() => withStaff(appointments.map((a) => a.staff)), [appointments])
  const roomCounts = useMemo(() => {
    const m = {}
    for (const a of appointments) m[a.room || ''] = (m[a.room || ''] || 0) + 1
    return m
  }, [appointments])

  const visible = useMemo(
    () => appointments.filter((a) => !hiddenRooms.has(a.room || '') && (!staff || a.staff === staff)),
    [appointments, hiddenRooms, staff],
  )
  const byDay = useMemo(() => {
    const map = new Map()
    for (const a of visible) {
      const k = dayKey(a.start)
      if (!map.has(k)) map.set(k, [])
      map.get(k).push(a)
    }
    return map
  }, [visible])

  const step = (dir) => setCursor((c) => (mode === 'month' ? new Date(c.getFullYear(), c.getMonth() + dir, 1) : addDays(c, dir * (mode === 'week' ? 7 : 1))))
  const goToday = () => { setCursor(new Date()); setSelected(keyOf(new Date())) }

  const today = keyOf(new Date())
  const weekStart = startOfWeek(cursor)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const label = mode === 'month'
    ? `${cursor.getFullYear()}年${cursor.getMonth() + 1}月`
    : mode === 'day'
      ? `${cursor.getMonth() + 1}月${cursor.getDate()}日 周${WEEKDAYS[(cursor.getDay() + 6) % 7]}`
      : `${weekStart.getMonth() + 1}月${weekStart.getDate()}日 – ${addDays(weekStart, 6).getMonth() + 1}月${addDays(weekStart, 6).getDate()}日`

  // Week view: one column per day. Day view: one column per room.
  const weekColumns = weekDays.map((d, i) => ({
    key: keyOf(d), date: d, room: '', today: keyOf(d) === today, items: byDay.get(keyOf(d)) || [],
    header: (
      <>
        <p className="text-muted">周{WEEKDAYS[i]}</p>
        <p className={`mx-auto mt-1 grid h-7 w-7 place-items-center rounded-full text-sm ${keyOf(d) === today ? 'bg-ink text-ivory' : ''}`}>{d.getDate()}</p>
      </>
    ),
  }))
  const dayItems = byDay.get(keyOf(cursor)) || []
  const roomColumns = [...ROOMS, NO_ROOM]
    .filter((r) => r.id !== '' ? !hiddenRooms.has(r.id) : dayItems.some((a) => !a.room))
    .map((r) => ({
      key: r.id || 'none', date: cursor, room: r.id, beds: r.beds || 1, today: keyOf(cursor) === today,
      items: dayItems.filter((a) => (a.room || '') === r.id),
      header: (
        <p className="flex flex-col items-center justify-center gap-0.5 px-0.5 text-[0.65rem] font-medium leading-tight sm:flex-row sm:gap-1.5 sm:px-0 sm:text-xs">
          <i className={`h-2.5 w-2.5 shrink-0 rounded-full ${r.dot}`} /> <span>{r.name}</span>
        </p>
      ),
    }))

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={() => step(-1)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-sand" aria-label="上一页"><ChevronLeft size={18} /></button>
          <button onClick={() => step(1)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-sand" aria-label="下一页"><ChevronRight size={18} /></button>
          <h2 className="ml-1 font-display text-xl">{label}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToday} className="rounded-full border border-ink/15 px-3.5 py-1.5 text-sm hover:bg-sand">今天</button>
          {modes.length > 1 && <div className="flex rounded-full bg-sand p-0.5 text-sm" role="group" aria-label="日历视图">
            {[['day', '日'], ['week', '周'], ['month', '月']].filter(([v]) => modes.includes(v)).map(([v, l]) => (
              <button key={v} onClick={() => changeMode(v)} aria-pressed={mode === v} className={`rounded-full px-4 py-1.5 transition ${mode === v ? 'bg-white shadow-sm' : 'text-muted'}`}>{l}</button>
            ))}
          </div>}
        </div>
      </div>

      {/* Room legend doubles as a filter; staff filter on the right */}
      <div className="flex flex-wrap items-center gap-2 border-b border-ink/10 px-4 py-2.5">
        {[...ROOMS, ...(roomCounts[''] ? [NO_ROOM] : [])].map((r) => {
          const off = hiddenRooms.has(r.id)
          return (
            <button key={r.id || 'none'} onClick={() => toggleRoom(r.id)} aria-pressed={!off}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${off ? 'border-ink/10 text-muted line-through' : 'border-ink/15'}`}>
              <i className={`h-2.5 w-2.5 rounded-full ${off ? 'bg-stone-300' : r.dot}`} /> {r.name}
            </button>
          )
        })}
        <select value={staff} onChange={(e) => setStaff(e.target.value)} aria-label="按员工筛选"
          className="ml-auto rounded-full border border-ink/15 bg-white px-3 py-1 text-xs outline-none focus:border-gold">
          <option value="">全部员工</option>
          {staffNames.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {mode === 'month' && (
        <>
          <MonthView cursor={cursor} byDay={byDay} customerById={customerById} onEdit={onEdit} onCreate={onCreate} selected={selected} setSelected={setSelected} />
          <div className="border-t border-ink/10 sm:hidden">
            <DayAgenda days={[new Date(`${selected}T12:00:00`)]} byDay={byDay} customerById={customerById} onEdit={onEdit} onCreate={onCreate} emptyHint="这天没有预约，点日期新增" />
          </div>
        </>
      )}
      {mode === 'day' && <TimeGrid columns={roomColumns} customerById={customerById} onEdit={onEdit} onCreate={onCreate} scrollKey={`day-${keyOf(cursor)}`} />}
      {mode === 'week' && (
        <>
          <div className="hidden md:block">
            <TimeGrid columns={weekColumns} customerById={customerById} onEdit={onEdit} onCreate={onCreate} scrollKey={`week-${keyOf(weekStart)}`} />
          </div>
          <div className="md:hidden">
            <DayAgenda days={weekDays} byDay={byDay} customerById={customerById} onEdit={onEdit} onCreate={onCreate} emptyHint="没有预约" />
          </div>
        </>
      )}
    </Card>
  )
}
