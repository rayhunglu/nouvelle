import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card } from './ui'
import { dayKey, fmtTime } from './format'
import { NO_ROOM, ROOMS, roomOf } from './rooms'

const HOUR_PX = 56
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
function layoutDay(items) {
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
    placed.forEach((p) => out.push({ ...p, lanes: lanesEnd.length }))
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

// Generic time grid. Each column is a day (week view) or a room (day view).
function TimeGrid({ columns, customerById, onEdit, onCreate }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t) }, [])

  const { startHour, endHour } = useMemo(() => {
    let lo = 8, hi = 21
    for (const c of columns) for (const a of c.items) {
      const s = new Date(a.start)
      lo = Math.min(lo, s.getHours())
      hi = Math.max(hi, Math.ceil(s.getHours() + s.getMinutes() / 60 + (a.durationMin || 60) / 60))
    }
    return { startHour: lo, endHour: Math.min(24, hi) }
  }, [columns])
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
  const gridH = hours.length * HOUR_PX
  const cols = `3.5rem repeat(${columns.length}, minmax(0, 1fr))`
  const nowTop = ((now.getHours() + now.getMinutes() / 60) - startHour) * HOUR_PX

  const clickSlot = (e, c) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mins = Math.round(((e.clientY - rect.top) / HOUR_PX) * 2) * 30
    const s = new Date(c.date)
    s.setHours(startHour, 0, 0, 0)
    s.setMinutes(mins)
    onCreate(s.toISOString(), c.room)
  }

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: `${Math.max(columns.length, 3) * 8 + 3.5}rem` }}>
        <div className="grid border-b border-ink/10 text-center text-xs" style={{ gridTemplateColumns: cols }}>
          <div />
          {columns.map((c) => (
            <div key={c.key} className="py-2.5">{c.header}</div>
          ))}
        </div>
        <div className="relative grid" style={{ height: gridH, gridTemplateColumns: cols }}>
          <div className="relative">
            {hours.map((h, i) => (
              <span key={h} className="absolute right-2 -translate-y-1/2 text-[0.7rem] text-muted" style={{ top: i * HOUR_PX }}>{i === 0 ? '' : `${String(h).padStart(2, '0')}:00`}</span>
            ))}
          </div>
          {columns.map((c) => (
            <div key={c.key} onClick={(e) => clickSlot(e, c)} className="relative cursor-pointer border-l border-ink/5 hover:bg-sand/40"
              style={{ backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${HOUR_PX - 1}px, rgba(43,36,32,0.06) ${HOUR_PX - 1}px, rgba(43,36,32,0.06) ${HOUR_PX}px)` }}>
              {layoutDay(c.items).map(({ a, lane, lanes }) => {
                const s = new Date(a.start)
                const top = ((s.getHours() + s.getMinutes() / 60) - startHour) * HOUR_PX
                const height = Math.max(24, ((a.durationMin || 60) / 60) * HOUR_PX - 2)
                const name = customerById[a.customerId]?.name || '—'
                return (
                  <button
                    key={a.id}
                    onClick={(e) => { e.stopPropagation(); onEdit(a) }}
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
              {c.today && nowTop >= 0 && nowTop <= gridH && (
                <div className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top: nowTop }}>
                  <i className="-ml-1 h-2 w-2 rounded-full bg-rose-500" /><i className="h-px flex-1 bg-rose-500" />
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

export default function CalendarView({ appointments, customerById, onEdit, onCreate }) {
  const [mode, setMode] = useState(() => {
    try {
      const m = localStorage.getItem('crm.calMode')
      return ['day', 'week', 'month'].includes(m) ? m : 'month'
    } catch { return 'month' }
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

  const staffNames = useMemo(() => [...new Set(appointments.map((a) => a.staff).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh')), [appointments])
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
      key: r.id || 'none', date: cursor, room: r.id, today: keyOf(cursor) === today,
      items: dayItems.filter((a) => (a.room || '') === r.id),
      header: (
        <p className="flex items-center justify-center gap-1.5 font-medium">
          <i className={`h-2.5 w-2.5 rounded-full ${r.dot}`} /> {r.name}
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
          <div className="flex rounded-full bg-sand p-0.5 text-sm" role="group" aria-label="日历视图">
            {[['day', '日'], ['week', '周'], ['month', '月']].map(([v, l]) => (
              <button key={v} onClick={() => changeMode(v)} aria-pressed={mode === v} className={`rounded-full px-4 py-1.5 transition ${mode === v ? 'bg-white shadow-sm' : 'text-muted'}`}>{l}</button>
            ))}
          </div>
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
      {mode === 'day' && <TimeGrid columns={roomColumns} customerById={customerById} onEdit={onEdit} onCreate={onCreate} />}
      {mode === 'week' && (
        <>
          <div className="hidden md:block">
            <TimeGrid columns={weekColumns} customerById={customerById} onEdit={onEdit} onCreate={onCreate} />
          </div>
          <div className="md:hidden">
            <DayAgenda days={weekDays} byDay={byDay} customerById={customerById} onEdit={onEdit} onCreate={onCreate} emptyHint="没有预约" />
          </div>
        </>
      )}
    </Card>
  )
}
