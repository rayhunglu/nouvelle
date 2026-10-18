import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Ban, Check, ChevronLeft, ChevronRight, LogIn, Play, X } from 'lucide-react'
import { useAuth } from '../auth'
import { useCrm } from './data'
import { Card, Field, Modal, inputCls } from './ui'
import { dayKey, fmtTime } from './format'
import { NO_ROOM, ROOMS, STAFF_COLOR, colorOf, roomOf } from './rooms'
import { relatedTo, withStaff } from './staff'
import { touchLike } from '../lib/util'
import { openPicker } from '../lib/util'

const HOUR_PX = 80 // default: 20px per 15-minute row (the time grid zooms between ZOOM_MIN and ZOOM_MAX)
const ZOOM_MIN = 18
const ZOOM_MAX = 240
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'] // the week runs Sunday to Saturday, left to right

const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
const startOfWeek = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - x.getDay()); return x }
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1)
const keyOf = (d) => dayKey(d.toISOString())
const dayStart = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
const dayEnd = (d) => { const x = dayStart(d); x.setDate(x.getDate() + 1); return x }

// Colour comes from the room only; the status shows as a symbol before the time (see `mark`) and cancelled bookings are struck through.
const chipCls = (a) => `${colorOf(a).chip} ${a.status === 'cancelled' || a.paymentDeleted ? 'line-through opacity-50' : ''}`
// Status icon in front of the time: a small solid badge, so the status stands out without changing the room colour.
const BADGE = {
  'checked-in': { Icon: LogIn, cls: 'bg-lime-500', title: 'Check in' },
  'in-service': { Icon: Play, cls: 'bg-fuchsia-600', title: 'In service' },
  completed: { Icon: Check, cls: 'bg-emerald-600', title: 'Check out' },
  'no-show': { Icon: X, cls: 'bg-rose-600', title: '未到店' },
  cancelled: { Icon: Ban, cls: 'bg-stone-500', title: '已取消' },
}
const mark = (a) => {
  const b = BADGE[a.status]
  if (!b) return null
  return <span title={b.title} className={`mr-1 inline-grid h-4 w-4 place-items-center rounded-full align-[-3px] text-white shadow-sm ring-1 ring-white/70 ${b.cls}`}><b.Icon size={10} strokeWidth={3} /></span>
}
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

function MonthView({ cursor, byDay, customerById, onEdit, onCreate, selected, setSelected, onOpenDay, onSaveHours, hoursReq }) {
  const { isClosed } = useCrm()
  // Drag across days (mouse or trackpad) to pick a range, then open or close rooms for all of those days at once.
  const [range, setRange] = useState(null) // { a, b }: indexes into the grid's cells
  const [dragging, setDragging] = useState(false)
  const justPicked = useRef(false)
  const gridStart = startOfWeek(startOfMonth(cursor))
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
  const rows = days.slice(35).every((d) => d.getMonth() !== cursor.getMonth()) ? 5 : 6
  const today = keyOf(new Date())
  const shown = days.slice(0, rows * 7)
  const lo = range ? Math.min(range.a, range.b) : -1
  const hi = range ? Math.max(range.a, range.b) : -1
  const picked = range && hi > lo ? shown.slice(lo, hi + 1) : []
  useEffect(() => {
    if (!dragging) return undefined
    const end = () => { setDragging(false) }
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
    return () => { window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end) }
  }, [dragging])
  // The room open / close settings pop up in a dialog: after dragging across days, or from the 房间开放设置 button (the whole month at first).
  // The dialog has its own from / to dates, so one day (same date twice) or any stretch can be chosen there too.
  const monthDays = days.filter((d) => d.getMonth() === cursor.getMonth())
  const [hoursDlg, setHoursDlg] = useState(null) // { from, to } as YYYY-MM-DD, or null when closed
  const [hoursBusy, setHoursBusy] = useState(false)
  const [hoursError, setHoursError] = useState('')
  useEffect(() => { if (!dragging && picked.length > 0) setHoursDlg({ from: keyOf(picked[0]), to: keyOf(picked[picked.length - 1]) }) }, [dragging]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (hoursReq && onSaveHours) setHoursDlg({ from: hoursReq.key, to: hoursReq.key }) }, [hoursReq]) // eslint-disable-line react-hooks/exhaustive-deps
  const openMonthHours = () => setHoursDlg({ from: keyOf(monthDays[0]), to: keyOf(monthDays[monthDays.length - 1]) })
  const closeHours = () => { setHoursDlg(null); setRange(null); setHoursError('') }
  const toDate = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d) }
  const dlgDays = (() => {
    if (!hoursDlg || !hoursDlg.from || !hoursDlg.to) return []
    const out = []
    for (let d = toDate(hoursDlg.from); d <= toDate(hoursDlg.to) && out.length < 400; d = addDays(d, 1)) out.push(d)
    return out
  })()
  const target = dlgDays
  const applyRange = async (value, roomIds) => {
    if (!target.length) { setHoursError('请选择开始和结束日期'); return }
    setHoursBusy(true); setHoursError('')
    try { await onSaveHours({ closedBatch: { rooms: roomIds, value, days: target.map((d) => ({ date: keyOf(d), from: dayStart(d).toISOString(), to: dayEnd(d).toISOString() })) } }) } catch (err) { setHoursError(err.message) }
    setHoursBusy(false)
  }
  const label = (d) => `${d.getMonth() + 1}月${d.getDate()}日`

  return (
    <>
      <div className="grid grid-cols-7 border-b border-ink/10 text-center text-xs text-muted">
        {WEEKDAYS.map((w) => <div key={w} className="py-2.5">{w}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {shown.map((d, i) => {
          const k = keyOf(d)
          const items = (byDay.get(k) || []).sort((a, b) => a.start.localeCompare(b.start))
          const inMonth = d.getMonth() === cursor.getMonth()
          return (
            <div
              key={k}
              onPointerDown={(e) => { if (!onSaveHours || e.pointerType === 'touch' || e.button !== 0 || e.target.closest('button')) return; justPicked.current = false; setRange({ a: i, b: i }); setDragging(true) }}
              onPointerEnter={() => { if (dragging) { justPicked.current = true; setRange((r) => (r ? { ...r, b: i } : r)) } }}
              onClick={() => { if (justPicked.current) { justPicked.current = false; return } setRange(null); setSelected(k); if (onSaveHours) { setHoursDlg({ from: k, to: k }); return } if (onOpenDay) { onOpenDay(d); return } if (window.matchMedia('(min-width: 640px)').matches) { const s = new Date(d); s.setHours(10, 0, 0, 0); onCreate(s.toISOString()) } }}
              className={`min-h-[4.5rem] cursor-pointer border-b border-r border-ink/5 p-1 transition hover:bg-sand/60 sm:min-h-[7.5rem] sm:p-1.5 ${i % 7 === 6 ? 'border-r-0' : ''} ${inMonth ? '' : 'bg-ink/[0.03]'} ${selected === k ? 'bg-gold/10' : ''} ${i >= lo && i <= hi && hi > lo ? 'bg-gold/25 ring-1 ring-inset ring-gold/60' : ''} ${dragging ? 'select-none' : ''}`}
            >
              <div className="flex justify-center sm:justify-start">
                <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${k === today ? 'bg-ink text-ivory' : inMonth ? '' : 'text-muted'}`}>{d.getDate()}</span>
              </div>
              {ROOMS.some((r) => isClosed(r.id, k)) && (
                <p className="mt-0.5 flex flex-wrap justify-center gap-0.5 sm:justify-start" title="已关闭的房间">
                  {ROOMS.filter((r) => isClosed(r.id, k)).map((r) => <span key={r.id} className="rounded bg-stone-300 px-1 text-[0.55rem] leading-4 text-stone-700 sm:text-[0.62rem]">关·{r.name.slice(0, 2)}</span>)}
                </p>
              )}
              <div className="mt-1 hidden space-y-1 sm:block">
                {items.slice(0, 3).map((a) => <Chip key={a.id} a={a} name={customerById[a.customerId]?.name || '—'} onEdit={onEdit} />)}
                {items.length > 3 && <p className="px-1 text-[0.7rem] text-muted">还有 {items.length - 3} 个</p>}
              </div>
              <div className="mt-1 flex justify-center gap-0.5 sm:hidden">
                {items.slice(0, 4).map((a) => <i key={a.id} className={`h-1.5 w-1.5 rounded-full ${colorOf(a).dot}`} />)}
              </div>
            </div>
          )
        })}
      </div>
      {onSaveHours && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink/10 bg-sand/50 px-4 py-2.5 text-sm">
          <span className="text-xs text-muted">想关闭或开放房间：在日历上按住拖选几天，或点右边的按钮</span>
          <button type="button" onClick={openMonthHours} className="rounded-full border border-ink/15 bg-white px-3.5 py-1.5 text-sm hover:bg-sand">房间开放设置</button>
        </div>
      )}
      {onSaveHours && hoursDlg && (
        <Modal inset title="房间开放 / 关闭" onClose={closeHours} loading={hoursBusy} loadingText="保存中…">
          <div className="grid grid-cols-2 gap-3">
            <Field label="开始日期"><input className={inputCls} type="date" value={hoursDlg.from} max={hoursDlg.to || undefined} onChange={(e) => setHoursDlg((h) => ({ ...h, from: e.target.value, to: h.to && e.target.value > h.to ? e.target.value : h.to }))}  onClick={openPicker} onFocus={openPicker} /></Field>
            <Field label="结束日期（同一天就是只设一天）"><input className={inputCls} type="date" value={hoursDlg.to} min={hoursDlg.from || undefined} onChange={(e) => setHoursDlg((h) => ({ ...h, to: e.target.value }))}  onClick={openPicker} onFocus={openPicker} /></Field>
          </div>
          <p className="mt-3 text-sm">{target.length > 0 ? <><b>{label(target[0])}{target.length > 1 ? ` – ${label(target[target.length - 1])}` : ''}</b>（共 {target.length} 天）</> : <span className="text-muted">请选择日期</span>}<span className="ml-2 text-xs text-muted">选房间，把这些天设为关闭或开放</span></p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {[...ROOMS, { id: 'all', name: '全部房间', dot: 'bg-ink' }].map((r) => {
              const ids = r.id === 'all' ? ROOMS.map((x) => x.id) : [r.id]
              const closedDays = target.filter((d) => ids.every((id) => isClosed(id, keyOf(d)))).length
              return (
                <li key={r.id} className="rounded-xl border border-ink/10 bg-white px-3 py-2">
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium"><i className={`h-2.5 w-2.5 rounded-full ${r.dot}`} />{r.name}{closedDays > 0 && <span className="ml-auto text-[0.65rem] font-normal text-muted">已关 {closedDays} 天</span>}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button type="button" onClick={() => applyRange(true, ids)} disabled={!target.length} className="rounded-lg bg-stone-200 py-1.5 text-xs text-stone-800 hover:bg-stone-300 disabled:opacity-50">关闭</button>
                    <button type="button" onClick={() => applyRange(false, ids)} disabled={!target.length} className="rounded-lg bg-emerald-100 py-1.5 text-xs text-emerald-900 hover:bg-emerald-200 disabled:opacity-50">开放</button>
                  </div>
                </li>
              )
            })}
          </ul>
          {hoursError && <p role="alert" className="mt-3 text-sm text-rose-700">{hoursError}</p>}
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            {target.length === 1 && onOpenDay && <button type="button" onClick={() => { const d = target[0]; closeHours(); onOpenDay(d) }} className="btn-ghost !py-2.5">查看这天的预约</button>}
            {target.length === 1 && <button type="button" onClick={() => { const d = new Date(target[0]); d.setHours(10, 0, 0, 0); closeHours(); onCreate(d.toISOString()) }} className="btn-ghost !py-2.5">新增预约</button>}
            <button type="button" onClick={closeHours} className="btn-primary !py-2.5">完成</button>
          </div>
        </Modal>
      )}
    </>
  )
}

// Generic time grid, 00:00-24:00 on a 24-hour clock. Each column is a day (week view) or a room (day view).
// It scrolls inside its own frame (the column heads stay put) and, whenever the shown day changes, jumps so the
// red "now" pointer is in view; days other than today open at the first booking, or 09:00.
// The options of a booking (edit, check in / out, no-show, cancel, delete). Opened by a double click or right click on a
// computer, and by tapping the booking on a phone, where it slides up from the bottom of the screen.
function ApptMenu({ menu, setMenu, customerById, onEdit, onStatus, onDelete, paidCount = () => 0, hasTopUp = () => false }) {
  if (!menu) return null
  const phone = touchLike()
  return (

      <div className={`fixed inset-0 z-50 ${phone ? 'flex items-end justify-center bg-ink/30 px-8 pb-[max(1rem,env(safe-area-inset-bottom))]' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setMenu(null) }} onContextMenu={(e) => { e.preventDefault(); setMenu(null) }}>
        <div
          role="menu"
          onPointerDown={(e) => e.stopPropagation()}
          className={phone ? 'max-h-[70dvh] w-full max-w-xs overflow-y-auto rounded-2xl bg-white py-0.5 text-sm shadow-xl' : 'absolute w-52 overflow-hidden rounded-xl border border-ink/15 bg-white py-1 text-sm shadow-xl'}
          style={phone ? undefined : { left: Math.min(menu.x, window.innerWidth - 216), top: Math.max(8, Math.min(menu.y, window.innerHeight - 380)) }}
        >
          <p className={`truncate border-b border-ink/10 text-xs text-muted ${phone ? 'px-4 py-1.5' : 'px-3 py-2'}`}>{fmtTime(menu.a.start)} {customerById[menu.a.customerId]?.name || ''} · {menu.a.service}</p>
          <button role="menuitem" onClick={() => { const a = menu.a; setMenu(null); onEdit(a) }} className={`block w-full text-left hover:bg-sand/70 ${phone ? 'px-4 py-2' : 'px-3 py-2'}`}>编辑预约</button>
          {[['checked-in', 'Check in'], ['in-service', 'In service'], ['completed', 'Check out'], ['no-show', '未到店'], ['cancelled', '取消预约']].map(([st, label]) => (
            <button key={st} role="menuitem" onClick={() => { const a = menu.a; if ((st === 'cancelled' || st === 'no-show') && paidCount(a) > 0) { setMenu({ ...menu, askCancel: st }); return } setMenu(null); if (a.status !== st || st === 'completed') onStatus(a, st) }}
              className={`flex w-full items-center justify-between text-left hover:bg-sand/70 ${phone ? 'px-4 py-2' : 'px-3 py-2'} ${menu.a.status === st ? 'bg-sand font-medium' : ''}`}>
              {label}{menu.a.status === st && <span className="text-xs text-gold">当前</span>}
            </button>
          ))}
          {menu.askCancel && (
            <div className="space-y-2 bg-rose-50 px-3 py-2.5">
              <p className="text-xs text-rose-800">这个预约已有 {paidCount(menu.a)} 笔账目，标记为{menu.askCancel === 'no-show' ? '未到店' : '取消'}后账目里的项目和金额会一并删除。确定{menu.askCancel === 'no-show' ? '标记未到店' : '取消'}？</p>
              <div className="flex gap-2">
                <button role="menuitem" onClick={() => { const a = menu.a; const st = menu.askCancel; setMenu(null); onStatus(a, st) }} className="flex-1 rounded-lg bg-rose-600 py-1.5 text-white hover:bg-rose-700">{menu.askCancel === 'no-show' ? '确定' : '确定取消'}</button>
                <button role="menuitem" onClick={() => setMenu({ ...menu, askCancel: false })} className="flex-1 rounded-lg border border-ink/15 bg-white py-1.5 hover:bg-sand/70">{menu.askCancel === 'no-show' ? '不改' : '不取消'}</button>
              </div>
            </div>
          )}
          {onDelete && (menu.ask ? (
            <div className="space-y-2 bg-rose-50 px-3 py-2.5">
              <p className="text-xs text-rose-800">确定删除这个预约？删除后无法恢复。{paidCount(menu.a) > 0 && `账目里它的 ${paidCount(menu.a)} 笔记录也会一并删除。`}</p>
              <div className="flex gap-2">
                <button role="menuitem" onClick={() => { const a = menu.a; setMenu(null); onDelete(a) }} className="flex-1 rounded-lg bg-rose-600 py-1.5 text-white hover:bg-rose-700">确定删除</button>
                <button role="menuitem" onClick={() => setMenu({ ...menu, ask: false })} className="flex-1 rounded-lg border border-ink/15 bg-white py-1.5 hover:bg-sand/70">不删除</button>
              </div>
            </div>
          ) : (
            <button role="menuitem" onClick={() => { if (hasTopUp(menu.a)) { const a = menu.a; setMenu(null); onDelete(a) } else setMenu({ ...menu, ask: true }) }} className={`block w-full text-left text-rose-700 hover:bg-rose-50 ${phone ? 'px-4 py-2' : 'px-3 py-2'}`}>删除预约</button>
          ))}
          <button role="menuitem" onClick={() => setMenu(null)} className={`block w-full border-t border-ink/10 text-left text-muted hover:bg-sand/70 ${phone ? 'px-4 py-2' : 'px-3 py-2'}`}>关闭菜单</button>
        </div>
      </div>
  )
}

const pad2 = (n) => String(n).padStart(2, '0')

function TimeGrid({ columns, customerById, onEdit, onCreate, onMove, onDelete, onStatus, onResize, paidCount = () => 0, hasTopUp, blocks = [], onEditBlock, onSaveBlock, onDeleteBlock, onSaveHours, hourPx = 80, onZoom, scrollKey }) {
  const HOUR_PX = hourPx // this grid's current zoom (px per hour); shadows the default above
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 20000); return () => clearInterval(t) }, [])
  const scroller = useRef(null)
  // Pinch to zoom the time axis: two fingers moving together shrink it, moving apart enlarge it (trackpad pinch and ctrl + wheel
  // do the same). The time under the fingers stays put.
  const anchor = useRef(null) // { min, offset }: the minute under the pointer and where it sits in the frame
  const pinch = useRef(null) // { dist, px } while two fingers are down
  const hourRef = useRef(hourPx)
  hourRef.current = hourPx
  const [zoomTip, setZoomTip] = useState('')
  const tipTimer = useRef(null)
  const applyZoom = (next, clientY) => {
    const el = scroller.current
    if (!el || !onZoom) return
    const clamped = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, next))
    if (Math.abs(clamped - hourRef.current) < 0.5) return
    const offset = clientY - el.getBoundingClientRect().top
    anchor.current = { min: ((el.scrollTop + offset) / hourRef.current) * 60, offset }
    onZoom(clamped)
    setZoomTip(`${Math.round((clamped / 80) * 100)}%`)
    clearTimeout(tipTimer.current)
    tipTimer.current = setTimeout(() => setZoomTip(''), 900)
  }
  useLayoutEffect(() => {
    const el = scroller.current
    if (!el || !anchor.current) return
    el.scrollTop = Math.max(0, (anchor.current.min / 60) * hourPx - anchor.current.offset)
    anchor.current = null
  }, [hourPx])
  useEffect(() => {
    const el = scroller.current
    if (!el || !onZoom) return undefined
    const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)
    const onWheelZoom = (e) => {
      if (!e.ctrlKey) return // a pinch on a trackpad arrives as ctrl + wheel
      e.preventDefault()
      applyZoom(hourRef.current * Math.exp(-e.deltaY * 0.01), e.clientY)
    }
    const start = (e) => { if (e.touches.length === 2) pinch.current = { dist: dist(e.touches), px: hourRef.current } }
    const move = (e) => {
      if (e.touches.length !== 2 || !pinch.current) return
      e.preventDefault()
      applyZoom(pinch.current.px * (dist(e.touches) / pinch.current.dist), (e.touches[0].clientY + e.touches[1].clientY) / 2)
    }
    const end = (e) => { if (e.touches.length < 2) pinch.current = null }
    el.addEventListener('wheel', onWheelZoom, { passive: false })
    el.addEventListener('touchstart', start, { passive: true })
    el.addEventListener('touchmove', move, { passive: false })
    el.addEventListener('touchend', end)
    el.addEventListener('touchcancel', end)
    return () => {
      el.removeEventListener('wheel', onWheelZoom)
      el.removeEventListener('touchstart', start)
      el.removeEventListener('touchmove', move)
      el.removeEventListener('touchend', end)
      el.removeEventListener('touchcancel', end)
    }
    // applyZoom only reads refs and props that never change identity in a way that matters here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onZoom])
  const [hover, setHover] = useState(null) // the one 15-minute cell under the pointer: { col, q }
  const [drag, setDrag] = useState(null) // a drag in progress: { col, a, b } (quarter-hour cells, a = where it began)
  const lastPointer = useRef('mouse')
  const colEls = useRef({}) // column elements by key, to find the column under the pointer while moving a booking
  const clickTimer = useRef(null)
  const justDragged = useRef(false)
  const press = useRef(null) // a mouse press on a booking: { a, x, y, grab, active }
  const [moving, setMoving] = useState(null) // a booking being dragged: { id, col, q, h }
  const grip = useRef(null) // a resize handle being dragged: { a, kind: 'len' | 'wide', y, x }
  const [resizing, setResizing] = useState(null) // preview of that drag: { id, dur?, full? }
  // Business hours: before opening and after closing is grey. The manager drags the boundary lines: the part over one room
  // changes that room only, the middle knob (and the time column) moves every room together.
  const { hoursFor, isClosed, roomWindow } = useCrm()
  // A room is shut for a day when the manager closed it or none of the people looking after it works.
  const dayOf = (c) => dayKey(c.date.toISOString())
  const staffShut = (c) => c.beds !== undefined && !!c.room && !!roomWindow(c.room, dayOf(c))?.closed
  const shut = (c) => c.beds !== undefined && !!c.room && (isClosed(c.room, dayOf(c)) || staffShut(c))
  const [hdrag, setHdrag] = useState(null) // a boundary being dragged: { scope: 'all' | roomId, key: 'openMin' | 'closeMin', value }
  const gridEl = useRef(null)
  const dayMode = columns.some((c) => c.beds !== undefined) // day view: one column per room (week view: one per day)
  const liveHours = (roomId) => {
    const h = hoursFor(roomId)
    return hdrag && (hdrag.scope === 'all' || hdrag.scope === roomId) ? { ...h, [hdrag.key]: hdrag.value } : h
  }
  const clinic = liveHours('__all') // the clinic-wide hours: the time column and the week view
  const openPx = (clinic.openMin / 60) * HOUR_PX
  const afterClosePx = ((24 * 60 - clinic.closeMin) / 60) * HOUR_PX
  const hm = (m) => `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`
  const startHours = (scope, key) => (e) => {
    if (e.pointerType === 'touch' || e.button !== 0) return
    e.stopPropagation()
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* capture is only a convenience */ }
    setHdrag({ scope, key, value: hoursFor(scope === 'all' ? '__all' : scope)[key] })
  }
  const moveHours = (scope, key) => (e) => {
    if (!hdrag || hdrag.scope !== scope || hdrag.key !== key) return
    e.stopPropagation()
    const y = e.clientY - gridEl.current.getBoundingClientRect().top
    const m = Math.round(((y / HOUR_PX) * 60) / 15) * 15
    // Every affected room keeps at least an hour open.
    const ids = scope === 'all' ? ['__all', ...columns.filter((c) => c.beds !== undefined && c.room).map((c) => c.room)] : [scope]
    const v = key === 'openMin'
      ? Math.max(0, Math.min(m, Math.min(...ids.map((id) => hoursFor(id).closeMin)) - 60))
      : Math.min(24 * 60, Math.max(m, Math.max(...ids.map((id) => hoursFor(id).openMin)) + 60))
    setHdrag((d) => (d && d.value === v ? d : { ...d, value: v }))
    const fr = scroller.current?.getBoundingClientRect()
    if (fr && e.clientY > fr.bottom - 36) scroller.current.scrollTop += 18
    else if (fr && e.clientY < fr.top + 60) scroller.current.scrollTop -= 18
  }
  const endHours = (scope, key) => (e) => {
    e.stopPropagation()
    const d = hdrag
    setHdrag(null)
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* already released */ }
    if (!d || d.scope !== scope || d.key !== key || d.value === hoursFor(scope === 'all' ? '__all' : scope)[key]) return
    onSaveHours(scope === 'all' ? { all: { [key]: d.value } } : { room: scope, [key]: d.value })
  }
  // One draggable boundary segment. `inset` positions it inside its column / the time column / across the whole grid.
  const hoursHandle = (scope, key, min, title, extra = '', chip = '') => {
    const active = hdrag && hdrag.scope === scope && hdrag.key === key
    return (
      <div
        key={`${scope}-${key}`}
        onPointerDown={startHours(scope, key)}
        onPointerMove={moveHours(scope, key)}
        onPointerUp={endHours(scope, key)}
        onPointerCancel={() => setHdrag(null)}
        title={title}
        className={`group absolute z-[28] flex cursor-ns-resize items-center ${extra || 'inset-x-0'}`}
        style={{ top: (min / 60) * HOUR_PX - 5, height: 10 }}
      >
        <span className={`pointer-events-none h-0.5 w-full border-t-2 border-dashed ${active ? 'border-gold' : 'border-transparent group-hover:border-gold/70'}`} />
        <span className={`pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold px-2 py-0.5 text-[0.62rem] font-semibold tabular-nums text-white ${active ? '' : 'opacity-0 group-hover:opacity-100'}`}>{chip}{hm(min)}</span>
      </div>
    )
  }
  const bpress = useRef(null) // a press on a blocked-time box: { k, kind: 'move' | 'top' | 'len', x, y, grab, active }
  const justDraggedBlock = useRef(false)
  // Close (or reopen) a room for the one day of a column; the room name, its coloured dot and the 开放中 / 已关闭 pill all do this.
  const toggleClosed = (c) => onSaveHours({ closed: { room: c.room, date: dayKey(c.date.toISOString()), from: dayStart(c.date).toISOString(), to: dayEnd(c.date).toISOString(), value: !isClosed(c.room, dayKey(c.date.toISOString())) } })
  const [bmenu, setBmenu] = useState(null) // double-click / right-click options of a blocked-time box: { k, x, y, ask }
  const bclick = useRef(null)
  const [bdrag, setBdrag] = useState(null) // preview while moving / resizing a block: { id, col?, q?, startMin?, dur? }
  const [menu, setMenu] = useState(null) // double-click options for a booking: { a, x, y, ask }; ask = confirming the delete
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
    <>
    {bmenu && (
      <div className="fixed inset-0 z-50" onClick={(e) => { if (e.target === e.currentTarget) setBmenu(null) }} onContextMenu={(e) => { e.preventDefault(); setBmenu(null) }}>
        <div role="menu" onPointerDown={(e) => e.stopPropagation()} className="absolute w-52 overflow-hidden rounded-xl border border-ink/15 bg-white py-1 text-sm shadow-xl"
          style={{ left: Math.min(bmenu.x, window.innerWidth - 216), top: Math.max(8, Math.min(bmenu.y, window.innerHeight - 200)) }}>
          <p className="truncate border-b border-ink/10 px-3 py-2 text-xs text-muted">不接受预约 · {fmtTime(bmenu.k.start)} 起 {bmenu.k.durationMin} 分钟{bmenu.k.reason ? ` · ${bmenu.k.reason}` : ''}</p>
          <button role="menuitem" onClick={() => { const k = bmenu.k; setBmenu(null); onEditBlock && onEditBlock(k) }} className="block w-full px-3 py-2 text-left hover:bg-sand/70">编辑屏蔽时间</button>
          {bmenu.ask ? (
            <div className="space-y-2 bg-rose-50 px-3 py-2.5">
              <p className="text-xs text-rose-800">确定删除这段屏蔽？删除后这段时间又可以接受预约。</p>
              <div className="flex gap-2">
                <button role="menuitem" onClick={() => { const k = bmenu.k; setBmenu(null); onDeleteBlock(k) }} className="flex-1 rounded-lg bg-rose-600 py-1.5 text-white hover:bg-rose-700">确定删除</button>
                <button role="menuitem" onClick={() => setBmenu({ ...bmenu, ask: false })} className="flex-1 rounded-lg border border-ink/15 bg-white py-1.5 hover:bg-sand/70">不删除</button>
              </div>
            </div>
          ) : (
            <button role="menuitem" onClick={() => setBmenu({ ...bmenu, ask: true })} className="block w-full px-3 py-2 text-left text-rose-700 hover:bg-rose-50">删除屏蔽预约</button>
          )}
          <button role="menuitem" onClick={() => setBmenu(null)} className="block w-full border-t border-ink/10 px-3 py-2 text-left text-muted hover:bg-sand/70">关闭菜单</button>
        </div>
      </div>
    )}
    <ApptMenu menu={menu} setMenu={setMenu} customerById={customerById} onEdit={onEdit} onStatus={onStatus} onDelete={onDelete} paidCount={paidCount} hasTopUp={hasTopUp} />
    <div ref={scroller} className="relative max-h-[calc(100svh-14rem)] min-h-[22rem] overflow-auto overscroll-contain" style={{ touchAction: onZoom ? 'pan-x pan-y' : undefined }}>
      {zoomTip && <span className="pointer-events-none sticky left-1/2 top-2 z-[40] float-right mr-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-medium text-white">{zoomTip}</span>}
      <div className={`[--gut:2.75rem] sm:[--gut:3.5rem] ${columns.some((c) => c.beds !== undefined) ? 'sm:min-w-[var(--mw)]' : 'md:min-w-[var(--mw)]'}`} style={{ '--mw': `${Math.max(columns.length, 3) * 8 + 3.5}rem` }}>
        <div className="sticky top-0 z-30 grid border-b border-ink/10 bg-white text-center text-xs" style={{ gridTemplateColumns: cols }}>
          <div />
          {columns.map((c) => (
            <div key={c.key} className="border-l border-ink/30 py-2.5 last:border-r">
              {onSaveHours && c.beds !== undefined && c.room ? (
                <button type="button" onClick={() => toggleClosed(c)} className="mx-auto block w-full" aria-label={`${isClosed(c.room, dayKey(c.date.toISOString())) ? '重新开放' : '关闭'} ${roomOf(c.room).name}（仅这一天）`}
                  title={isClosed(c.room, dayKey(c.date.toISOString())) ? '点击重新开放这个房间（仅这一天）' : '点击关闭这个房间（仅这一天，暂不接受预约）'}>{c.header}</button>
              ) : c.header}
              {onSaveHours && c.beds !== undefined && c.room && (
                <button type="button" onClick={() => toggleClosed(c)}
                  title={isClosed(c.room, dayKey(c.date.toISOString())) ? '点击重新开放这个房间（仅这一天）' : '点击关闭这个房间（仅这一天，暂不接受预约）'} aria-pressed={!isClosed(c.room, dayKey(c.date.toISOString()))}
                  className={`mx-auto mt-1 flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.62rem] font-medium transition ${isClosed(c.room, dayKey(c.date.toISOString())) ? 'bg-stone-300 text-stone-700' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'}`}>
                  <i className={`h-1.5 w-1.5 rounded-full ${isClosed(c.room, dayKey(c.date.toISOString())) ? 'bg-stone-500' : 'bg-emerald-600'}`} />{isClosed(c.room, dayKey(c.date.toISOString())) ? '已关闭' : '开放中'}
                </button>
              )}
              {staffShut(c) && !isClosed(c.room, dayOf(c)) && <p className="mx-auto mt-1 w-fit rounded-full bg-amber-100 px-2 py-0.5 text-[0.62rem] font-medium text-amber-800" title={`${(roomWindow(c.room, dayOf(c))?.names || []).join('、')} 休息，房间随之关闭`}>无人出勤</p>}
              {!onSaveHours && c.beds !== undefined && c.room && isClosed(c.room, dayKey(c.date.toISOString())) && <p className="mx-auto mt-1 w-fit rounded-full bg-stone-300 px-2 py-0.5 text-[0.62rem] font-medium text-stone-700">已关闭</p>}
            </div>
          ))}
        </div>
        <div ref={gridEl} className="relative grid" style={{ height: gridH, gridTemplateColumns: cols }}>
          {onSaveHours && !dayMode && [['openMin', '营业开始'], ['closeMin', '营业结束']].map(([key, label]) => hoursHandle('all', key, clinic[key], `${label} ${hm(clinic[key])}（上下拖动调整营业时间）`, '', `${label} `))}
          {onSaveHours && dayMode && [['openMin', '营业开始'], ['closeMin', '营业结束']].map(([key, label]) => hoursHandle('all', key, clinic[key], `${label} ${hm(clinic[key])}：拖动，所有房间一起调整`, 'left-[calc(var(--gut)+(100%-var(--gut))/2-2.75rem)] z-[29] w-[5.5rem] rounded-full', '全部房间 '))}
          <div className="relative">
            {onSaveHours && dayMode && [['openMin', '营业开始'], ['closeMin', '营业结束']].map(([key, label]) => hoursHandle('all', key, clinic[key], `${label} ${hm(clinic[key])}：拖动，所有房间一起调整`, 'inset-x-0'))}
            <div className="pointer-events-none absolute inset-x-0 top-0 bg-ink/[0.07]" style={{ height: openPx }} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-ink/[0.07]" style={{ height: afterClosePx }} />
            {Array.from({ length: 96 }, (_, q) => {
              const h = Math.floor(q / 4)
              const m = (q % 4) * 15
              const onHour = m === 0
              // Zoomed out, the time labels thin out so they never overlap: quarter hours need room, then half hours, then odd hours.
              if (m === 15 || m === 45 ? HOUR_PX < 64 : m === 30 ? HOUR_PX < 40 : HOUR_PX < 28 && h % 2 === 1) return null
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
              ref={(el) => { colEls.current[c.key] = el }}
              onClick={(e) => { if (lastPointer.current === 'touch' && !shut(c)) clickSlot(e, c) }}
              onPointerDown={(e) => {
                lastPointer.current = e.pointerType
                if (e.pointerType === 'touch' || e.button !== 0) return
                if (shut(c)) return // a closed room takes no new bookings
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
              <div className="pointer-events-none absolute inset-x-0 top-0 bg-ink/[0.07]" style={{ height: (Math.max((dayMode ? liveHours(c.room) : clinic).openMin, (dayMode && c.room && roomWindow(c.room, dayOf(c))?.startMin) || 0) / 60) * HOUR_PX }} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-ink/[0.07]" style={{ height: ((24 * 60 - Math.min((dayMode ? liveHours(c.room) : clinic).closeMin, (dayMode && c.room && roomWindow(c.room, dayOf(c))?.endMin) || 24 * 60)) / 60) * HOUR_PX }} />
              {onSaveHours && dayMode && c.room && [['openMin', '营业开始'], ['closeMin', '营业结束']].map(([key, label]) => hoursHandle(c.room, key, liveHours(c.room)[key], `${roomOf(c.room).name} ${label} ${hm(liveHours(c.room)[key])}：拖动只调整这个房间`, 'inset-x-0', ''))}
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
              {moving && moving.col === c.key && (
                <div className="pointer-events-none absolute inset-x-0.5 z-20 rounded-lg bg-gold/40 ring-2 ring-gold" style={{ top: (moving.q * HOUR_PX) / 4, height: moving.h }}>
                  <span className="block px-1.5 pt-0.5 text-[0.66rem] font-semibold leading-tight tabular-nums text-plum-deep">{cellTime(moving.q)}</span>
                </div>
              )}
              {/* Blocked time ("有事，不接受预约"): hatched, in its room's column (every column when it covers all rooms). */}
              {blocks.filter((k) => dayKey(k.start) === dayKey(c.date.toISOString()) && (c.beds !== undefined ? k.room === '' || k.room === c.room : k.room === '')).map((k) => {
                const ks = new Date(k.start)
                const kStart = ks.getHours() * 60 + ks.getMinutes()
                const live = bdrag?.id === k.id ? bdrag : null
                const startMin = live?.startMin ?? kStart
                const dur = live?.dur ?? k.durationMin
                const lifted = live?.col !== undefined
                const editable = !!onSaveBlock
                const colAt = (e) => columns.find((cc) => { const r = colEls.current[cc.key]?.getBoundingClientRect(); return r && e.clientX >= r.left && e.clientX < r.right }) || c
                const grab = (kind) => (e) => {
                  e.stopPropagation()
                  lastPointer.current = e.pointerType
                  justDraggedBlock.current = false
                  if (!editable || e.pointerType === 'touch' || e.button !== 0) return
                  const r = e.currentTarget.closest('[data-block]').getBoundingClientRect()
                  bpress.current = { k, kind, x: e.clientX, y: e.clientY, grab: Math.max(0, Math.floor((e.clientY - r.top) / (HOUR_PX / 4))), active: kind !== 'move' }
                  try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* capture is only a convenience */ }
                }
                const drag = (e) => {
                  const pr = bpress.current
                  if (!pr || pr.k.id !== k.id) return
                  e.stopPropagation()
                  if (pr.kind === 'move') {
                    if (!pr.active && Math.hypot(e.clientX - pr.x, e.clientY - pr.y) < 5) return
                    pr.active = true
                    justDraggedBlock.current = true
                    setHover(null)
                    const hit = colAt(e)
                    const top0 = colEls.current[hit.key].getBoundingClientRect().top
                    const span = Math.max(1, Math.ceil(k.durationMin / 15))
                    const q = Math.max(0, Math.min(96 - span, Math.floor((e.clientY - top0) / (HOUR_PX / 4)) - pr.grab))
                    setBdrag((d) => (d && d.id === k.id && d.col === hit.key && d.q === q ? d : { id: k.id, col: hit.key, q, dur: k.durationMin }))
                  } else if (pr.kind === 'top') {
                    const end = kStart + k.durationMin
                    const sm = Math.max(0, Math.min(end - 15, Math.round((kStart + ((e.clientY - pr.y) * 60) / HOUR_PX) / 15) * 15))
                    setBdrag((d) => (d && d.id === k.id && d.startMin === sm ? d : { id: k.id, startMin: sm, dur: end - sm }))
                  } else {
                    const d2 = Math.max(15, Math.min(24 * 60 - kStart, Math.round((k.durationMin + ((e.clientY - pr.y) * 60) / HOUR_PX) / 15) * 15))
                    setBdrag((d) => (d && d.id === k.id && d.dur === d2 ? d : { id: k.id, startMin: kStart, dur: d2 }))
                  }
                  const fr = scroller.current?.getBoundingClientRect()
                  if (fr && e.clientY > fr.bottom - 36) scroller.current.scrollTop += 18
                  else if (fr && e.clientY < fr.top + 60) scroller.current.scrollTop -= 18
                }
                const drop = (e) => {
                  e.stopPropagation()
                  const pr = bpress.current
                  bpress.current = null
                  const d = bdrag
                  setBdrag(null)
                  try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* already released */ }
                  if (!pr || !pr.active || !d || d.id !== k.id) return
                  if (pr.kind === 'move') {
                    const to = columns.find((cc) => cc.key === d.col)
                    if (!to) return
                    const next = startOf(to, d.q)
                    const room = k.room === '' ? '' : 'beds' in to ? to.room : k.room // an all-room block only changes time
                    if (next.getTime() !== ks.getTime() || room !== k.room) onSaveBlock(k, { start: next.toISOString(), room })
                  } else if (d.startMin !== undefined && (d.startMin !== kStart || d.dur !== k.durationMin)) {
                    const st = new Date(k.start); st.setHours(Math.floor(d.startMin / 60), d.startMin % 60, 0, 0)
                    onSaveBlock(k, { start: st.toISOString(), durationMin: d.dur })
                  }
                }
                const cancel = () => { bpress.current = null; setBdrag(null) }
                return (
                  <div
                    key={k.id}
                    data-block
                    onPointerDown={grab('move')}
                    onPointerMove={drag}
                    onPointerUp={drop}
                    onPointerCancel={cancel}
                    onPointerEnter={() => setHover(null)}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (justDraggedBlock.current) { justDraggedBlock.current = false; return }
                      if (!onEditBlock) return
                      clearTimeout(bclick.current)
                      bclick.current = setTimeout(() => onEditBlock(k), 260) // a double click opens the menu instead
                    }}
                    onDoubleClick={(e) => { e.stopPropagation(); clearTimeout(bclick.current); if (onDeleteBlock) setBmenu({ k, x: e.clientX, y: e.clientY, ask: false }) }}
                    onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); clearTimeout(bclick.current); if (onDeleteBlock) setBmenu({ k, x: e.clientX, y: e.clientY, ask: false }) }}
                    title={`${fmtTime(k.start)} 起 ${k.durationMin} 分钟 · 不接受预约${k.reason ? ` · ${k.reason}` : ''}${editable ? '（可拖动）' : ''}`}
                    className={`group absolute inset-x-0 select-none overflow-hidden border-y border-dashed border-ink/30 px-1.5 py-1 text-left text-[0.68rem] font-medium leading-tight text-ink/70 ${editable ? 'cursor-grab' : 'cursor-not-allowed'} ${lifted ? 'opacity-40' : ''}`}
                    style={{ top: (startMin / 60) * HOUR_PX, height: Math.max(20, (dur / 60) * HOUR_PX), backgroundImage: 'repeating-linear-gradient(135deg, rgba(43,36,32,0.13) 0, rgba(43,36,32,0.13) 6px, rgba(43,36,32,0.04) 6px, rgba(43,36,32,0.04) 12px)' }}
                  >
                    不接受预约{k.room === '' && c.beds !== undefined ? '（全部房间）' : ''}
                    {k.reason && <span className="block truncate font-normal">{k.reason}</span>}
                    {live && !lifted && <span className="absolute bottom-1 right-1.5 rounded bg-ink/70 px-1.5 py-0.5 text-[0.62rem] font-semibold text-white">{`${pad2(Math.floor(startMin / 60))}:${pad2(startMin % 60)} · ${dur} 分钟`}</span>}
                    {editable && (
                      <>
                        <span onPointerDown={grab('top')} onPointerMove={drag} onPointerUp={drop} onPointerCancel={cancel} onClick={(e) => e.stopPropagation()}
                          className="absolute inset-x-0 top-0 grid h-3 cursor-ns-resize place-items-center opacity-0 transition group-hover:opacity-100" title="拖动调整开始时间" aria-hidden="true"><i className="h-1 w-8 rounded-full bg-ink/45" /></span>
                        <span onPointerDown={grab('len')} onPointerMove={drag} onPointerUp={drop} onPointerCancel={cancel} onClick={(e) => e.stopPropagation()}
                          className="absolute inset-x-0 bottom-0 grid h-3 cursor-ns-resize place-items-center opacity-0 transition group-hover:opacity-100" title="拖动调整结束时间" aria-hidden="true"><i className="h-1 w-8 rounded-full bg-ink/45" /></span>
                      </>
                    )}
                  </div>
                )
              })}
              {bdrag && bdrag.col === c.key && (
                <div className="pointer-events-none absolute inset-x-0.5 z-20 rounded-lg border-2 border-dashed border-ink/50 bg-ink/15" style={{ top: (bdrag.q * HOUR_PX) / 4, height: Math.max(20, (bdrag.dur / 60) * HOUR_PX) }}>
                  <span className="block px-1.5 pt-0.5 text-[0.66rem] font-semibold leading-tight tabular-nums text-ink">{cellTime(bdrag.q)} · 不接受预约</span>
                </div>
              )}
              {shut(c) && (
                <div className="pointer-events-none absolute inset-0 z-[26] grid place-items-start justify-items-center pt-24 text-xs font-medium text-ink/60"
                  style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgba(43,36,32,0.10) 0, rgba(43,36,32,0.10) 8px, rgba(43,36,32,0.03) 8px, rgba(43,36,32,0.03) 16px)' }}>
                  <span className="sticky top-24 rounded-full bg-white/85 px-3 py-1 shadow-sm">{isClosed(c.room, dayOf(c)) ? '房间已关闭' : '当天无人出勤'}</span>
                </div>
              )}
              {c.beds > 1 && <div className="pointer-events-none absolute inset-y-0 left-1/2 z-[1] border-l border-dashed border-ink/10" />}
              {layoutDay(c.items, c.beds || 1).map(({ a, lane, lanes }) => {
                const s = new Date(a.start)
                const rs = resizing?.id === a.id ? resizing : null
                const top = ((rs?.startMin ?? s.getHours() * 60 + s.getMinutes()) / 60) * HOUR_PX
                const height = Math.max(24, ((rs?.dur ?? (a.durationMin || 60)) / 60) * HOUR_PX - 2)
                const name = customerById[a.customerId]?.name || '—'
                const lifted = moving?.id === a.id
                // A booking can take the whole double room: it then spans both beds.
                const wide = c.beds > 1 && (rs?.full ?? !!a.fullRoom)
                const wasWide = c.beds > 1 && !!a.fullRoom // handles follow the saved state so a handle never disappears under the pointer mid-drag
                const grabBottom = (e) => { e.stopPropagation(); lastPointer.current = e.pointerType; try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* capture is only a convenience */ } grip.current = { a, kind: 'len', y: e.clientY } }
                const grabTop = (e) => { e.stopPropagation(); lastPointer.current = e.pointerType; try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* capture is only a convenience */ } grip.current = { a, kind: 'top', y: e.clientY } }
                // sign: +1 for the right edge, -1 for the left one (dragging outwards takes the whole room, inwards gives it up)
                const grabSide = (sign) => (e) => { e.stopPropagation(); lastPointer.current = e.pointerType; try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* capture is only a convenience */ } grip.current = { a, kind: 'wide', x: e.clientX, sign } }
                const moveGrip = (e) => {
                  const g = grip.current
                  if (!g) return
                  e.stopPropagation()
                  if (g.kind === 'len') {
                    const start = s.getHours() * 60 + s.getMinutes()
                    const dur = Math.max(15, Math.min(24 * 60 - start, Math.round(((a.durationMin || 60) + ((e.clientY - g.y) * 60) / HOUR_PX) / 15) * 15))
                    setResizing((r) => (r && r.id === a.id && r.dur === dur ? r : { id: a.id, dur }))
                    const fr = scroller.current?.getBoundingClientRect()
                    if (fr && e.clientY > fr.bottom - 36) scroller.current.scrollTop += 18
                  } else if (g.kind === 'top') {
                    // The top edge moves the start; the end stays where it was.
                    const startOld = s.getHours() * 60 + s.getMinutes()
                    const end = startOld + (a.durationMin || 60)
                    const startMin = Math.max(0, Math.min(end - 15, Math.round((startOld + ((e.clientY - g.y) * 60) / HOUR_PX) / 15) * 15))
                    setResizing((r) => (r && r.id === a.id && r.startMin === startMin ? r : { id: a.id, startMin, dur: end - startMin }))
                    const fr = scroller.current?.getBoundingClientRect()
                    if (fr && e.clientY < fr.top + 60) scroller.current.scrollTop -= 18
                  } else {
                    const dx = (e.clientX - g.x) * g.sign
                    const full = dx > 14 ? true : dx < -14 ? false : !!a.fullRoom
                    setResizing((r) => (r && r.id === a.id && r.full === full ? r : { id: a.id, full }))
                  }
                }
                const dropGrip = (e) => {
                  e.stopPropagation()
                  const g = grip.current
                  grip.current = null
                  const r = resizing
                  setResizing(null)
                  try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* already released */ }
                  if (!g || !r || r.id !== a.id) return
                  if (g.kind === 'len' && r.dur !== (a.durationMin || 60)) onResize(a, { durationMin: r.dur })
                  if (g.kind === 'top' && r.dur !== (a.durationMin || 60)) { const st = new Date(a.start); st.setHours(Math.floor(r.startMin / 60), r.startMin % 60, 0, 0); onResize(a, { start: st.toISOString(), durationMin: r.dur }) }
                  if (g.kind === 'wide' && r.full !== !!a.fullRoom) onResize(a, { fullRoom: r.full })
                }
                const stop = (e) => e.stopPropagation()
                return (
                  <button
                    key={a.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (justDragged.current) { justDragged.current = false; return } // the click that ends a drag is not a click
                      if (touchLike()) { setMenu({ a, x: e.clientX, y: e.clientY }); return } // on a phone or iPad a tap shows the options (edit, check in, delete...)
                      if (e.detail === 0 || lastPointer.current === 'touch') { onEdit(a); return }
                      // A single mouse click opens the full editor; waiting a moment lets a double click open the menu instead.
                      clearTimeout(clickTimer.current)
                      clickTimer.current = setTimeout(() => onEdit(a), 260)
                    }}
                    onDoubleClick={(e) => { e.stopPropagation(); clearTimeout(clickTimer.current); setMenu({ a, x: e.clientX, y: e.clientY }) }}
                    onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); clearTimeout(clickTimer.current); setMenu({ a, x: e.clientX, y: e.clientY }) }}
                    onPointerDown={(e) => {
                      e.stopPropagation()
                      lastPointer.current = e.pointerType
                      justDragged.current = false
                      if (e.pointerType === 'touch' || e.button !== 0) return
                      const r = e.currentTarget.getBoundingClientRect()
                      press.current = { a, x: e.clientX, y: e.clientY, grab: Math.max(0, Math.floor((e.clientY - r.top) / (HOUR_PX / 4))), active: false, h: height }
                      try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* capture is only a convenience */ }
                    }}
                    onPointerMove={(e) => {
                      e.stopPropagation()
                      const pr = press.current
                      if (!pr || pr.a.id !== a.id) return
                      if (!pr.active && Math.hypot(e.clientX - pr.x, e.clientY - pr.y) < 5) return
                      pr.active = true
                      justDragged.current = true
                      setHover(null)
                      // The column under the pointer decides the room (day view) or the day (week view).
                      const hit = columns.find((cc) => { const r = colEls.current[cc.key]?.getBoundingClientRect(); return r && e.clientX >= r.left && e.clientX < r.right }) || columns.find((cc) => cc.key === (moving?.col ?? c.key)) || c
                      const top0 = colEls.current[hit.key].getBoundingClientRect().top
                      const span = Math.max(1, Math.ceil((a.durationMin || 60) / 15))
                      const q = Math.max(0, Math.min(96 - span, Math.floor((e.clientY - top0) / (HOUR_PX / 4)) - pr.grab))
                      setMoving((m) => (m && m.id === a.id && m.col === hit.key && m.q === q ? m : { id: a.id, col: hit.key, q, h: pr.h }))
                      const fr = scroller.current?.getBoundingClientRect()
                      if (fr && e.clientY > fr.bottom - 36) scroller.current.scrollTop += 18
                      else if (fr && e.clientY < fr.top + 60) scroller.current.scrollTop -= 18
                    }}
                    onPointerUp={(e) => {
                      e.stopPropagation()
                      const pr = press.current
                      press.current = null
                      try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* already released */ }
                      if (!pr || !pr.active) return
                      const m = moving
                      setMoving(null)
                      const to = m && columns.find((cc) => cc.key === m.col)
                      if (!to) return
                      const next = startOf(to, m.q)
                      const room = 'beds' in to ? to.room : a.room
                      if (next.getTime() === new Date(a.start).getTime() && (room || '') === (a.room || '')) return
                      onMove(a, { start: next.toISOString(), room })
                    }}
                    onPointerCancel={() => { press.current = null; setMoving(null) }}
                    onPointerEnter={() => setHover(null)}
                    className={`group absolute overflow-hidden rounded-lg px-1.5 py-1 text-left text-[0.7rem] leading-tight transition ${!dayMode ? 'max-md:rounded-md max-md:px-0.5 max-md:py-0.5 max-md:text-[0.52rem] max-md:leading-[1.1]' : ''} ${chipCls(a)} ${lifted ? 'opacity-40' : 'cursor-grab'} ${wide ? 'z-[2]' : ''}`}
                    style={{ top, height, left: wide ? '2px' : `calc(${(lane / lanes) * 100}% + 2px)`, width: wide ? 'calc(100% - 4px)' : `calc(${100 / lanes}% - 4px)` }}
                    title={tip(a, name)}
                  >
                    {mark(a)}<b>{fmtTime(a.start)}</b> {name}
                    <span className="block truncate opacity-80">{a.service}</span>
                    {a.staff && <span className="block truncate font-medium">{a.staff}</span>}
                    {a.paymentDeleted && <span className="block truncate text-[0.62rem] font-semibold not-italic">付款：未结算</span>}
                    {rs?.dur && <span className="absolute bottom-2 right-2 rounded bg-ink/70 px-1.5 py-0.5 text-[0.62rem] font-semibold text-white">{rs.startMin !== undefined ? `${pad2(Math.floor(rs.startMin / 60))}:${pad2(rs.startMin % 60)} · ` : ''}{rs.dur} 分钟</span>}
                    {/* Drag the top edge to start earlier or later (the end stays), the bottom edge to change the end; hidden until the pointer is over the booking. */}
                    <span
                      onPointerDown={grabTop} onPointerMove={moveGrip} onPointerUp={dropGrip} onPointerCancel={dropGrip} onClick={stop} onDoubleClick={stop}
                      className="absolute inset-x-0 top-0 grid h-3 cursor-ns-resize place-items-center opacity-0 transition group-hover:opacity-100" title="拖动调整开始时间" aria-hidden="true"
                    ><i className="h-1 w-8 rounded-full bg-ink/45" /></span>
                    <span
                      onPointerDown={grabBottom} onPointerMove={moveGrip} onPointerUp={dropGrip} onPointerCancel={dropGrip} onClick={stop} onDoubleClick={stop}
                      className="absolute inset-x-0 bottom-0 grid h-3 cursor-ns-resize place-items-center opacity-0 transition group-hover:opacity-100" title="拖动调整时长" aria-hidden="true"
                    ><i className="h-1 w-8 rounded-full bg-ink/45" /></span>
                    {/* Double rooms: drag the right edge to take both beds (drag back to give one up). */}
                    {c.beds > 1 && (wasWide || lane < lanes - 1) && (
                      <span
                        onPointerDown={grabSide(1)} onPointerMove={moveGrip} onPointerUp={dropGrip} onPointerCancel={dropGrip} onClick={stop} onDoubleClick={stop}
                        className="absolute inset-y-3 right-0 grid w-3 cursor-ew-resize place-items-center opacity-0 transition group-hover:opacity-100" title={wasWide ? '向左拖回一个床位' : '向右拖占用整间'} aria-hidden="true"
                      ><i className="h-8 w-1 rounded-full bg-ink/45" /></span>
                    )}
                    {c.beds > 1 && (wasWide || lane > 0) && (
                      <span
                        onPointerDown={grabSide(-1)} onPointerMove={moveGrip} onPointerUp={dropGrip} onPointerCancel={dropGrip} onClick={stop} onDoubleClick={stop}
                        className="absolute inset-y-3 left-0 grid w-3 cursor-ew-resize place-items-center opacity-0 transition group-hover:opacity-100" title={wasWide ? '向右拖回一个床位' : '向左拖占用整间'} aria-hidden="true"
                      ><i className="h-8 w-1 rounded-full bg-ink/45" /></span>
                    )}
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
    </>
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
              <p className="text-xs text-muted">周{WEEKDAYS[d.getDay()]}</p>
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
export default function CalendarView({ appointments, customerById, onEdit, onCreate, onMove, onDelete, onStatus, onResize, paidCount, hasTopUp, blocks, onEditBlock, onSaveBlock, onDeleteBlock, onSaveHours, initialDate, onOpenDay, staff: staffProp, onStaff, modes = ['day', 'week', 'month'] }) {
  const [mode, setMode] = useState(() => {
    try {
      const m = localStorage.getItem('crm.calMode')
      return modes.includes(m) ? m : modes.includes('month') ? 'month' : modes[0]
    } catch { return modes.includes('month') ? 'month' : modes[0] }
  })
  const [cursor, setCursor] = useState(() => (initialDate ? new Date(initialDate) : new Date()))
  // Month view / day list: on a phone, tapping a booking shows its options (edit, check in / out, cancel, delete) instead of opening the editor.
  const [phoneMenu, setPhoneMenu] = useState(null)
  const openAppt = (appt) => { if (touchLike()) setPhoneMenu({ a: appt, x: 0, y: 0 }); else onEdit(appt) }
  const [selected, setSelected] = useState(() => keyOf(new Date()))
  const [hiddenRooms, setHiddenRooms] = useState(() => new Set())
  // The staff filter is shared with the list view when the page passes it in; otherwise it is local to this calendar.
  const [staffLocal, setStaffLocal] = useState('')
  const staff = staffProp !== undefined ? staffProp : staffLocal
  const setStaff = onStaff || setStaffLocal
  const noStaffFilter = !useAuth().can('viewAllAppointments') // without that permission only their own bookings are visible, so a staff filter is pointless

  const changeMode = (m) => {
    setMode(m)
    try { localStorage.setItem('crm.calMode', m) } catch { /* storage unavailable */ }
  }
  const toggleRoom = (id) => setHiddenRooms((prev) => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id); else next.add(id)
    return next
  })

  const { worksOn, staffHours, roster } = useCrm() // who is on duty / resting on the shown day
  const staffNames = useMemo(() => withStaff(appointments.map((a) => a.staff), roster), [appointments, roster])
  const roomCounts = useMemo(() => {
    const m = {}
    for (const a of appointments) m[a.room || ''] = (m[a.room || ''] || 0) + 1
    return m
  }, [appointments])

  const visible = useMemo(
    () => appointments.filter((a) => !hiddenRooms.has(a.room || '') && relatedTo(a, staff)),
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

  const [slide, setSlide] = useState(0) // which way the last step went: 1 = later, -1 = earlier (drives the slide-in)
  const swipe = useRef({ x: 0, y: 0, last: 0, multi: false })
  const [hourPx, setHourPx] = useState(() => { try { const v = Number(localStorage.getItem('crm.hourPx')); return v >= ZOOM_MIN && v <= ZOOM_MAX ? v : HOUR_PX } catch { return HOUR_PX } })
  const zoomTo = (v) => { setHourPx(v); try { localStorage.setItem('crm.hourPx', String(Math.round(v))) } catch { /* storage unavailable */ } }
  const step = (dir) => { setSlide(dir); setCursor((c) => (mode === 'month' ? new Date(c.getFullYear(), c.getMonth() + dir, 1) : addDays(c, dir * (mode === 'week' ? 7 : 1)))) }
  // In the week / month calendar, 当日 jumps to today's day timeline; in the day view it just returns to today.
  // The title at the top left opens a month picker: choose a year and a month to jump there (the same day of the month, or its last day).
  // It opens on the month of the shown day: pick a day there to go straight to it, or tap the month title for the year / month list.
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerYear, setPickerYear] = useState(() => new Date().getFullYear())
  const [pickerMonth, setPickerMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1)) // first of the month being looked at
  const [pickerMonths, setPickerMonths] = useState(false) // showing the 12 months of a year instead of the days
  const openPicker = () => { setPickerMonth(new Date(cursor.getFullYear(), cursor.getMonth(), 1)); setPickerYear(cursor.getFullYear()); setPickerMonths(false); setPickerOpen((o) => !o) }
  const [hoursReq, setHoursReq] = useState(null) // asks the month view to open its room open / close dialog for one day
  const pickDate = (d) => {
    if (mode === 'month' && onSaveHours) setHoursReq({ key: keyOf(d), n: Date.now() })
    setSlide(d > cursor ? 1 : -1)
    setCursor(d)
    setSelected(keyOf(d))
    setPickerOpen(false)
  }
  const jumpPickerToMonth = (year, month) => { setPickerMonth(new Date(year, month, 1)); setPickerMonths(false) }
  const goToday = () => {
    if (mode !== 'day' && onOpenDay) { onOpenDay(new Date()); return }
    setSlide(0); setCursor(new Date()); setSelected(keyOf(new Date()))
  }
  // Day, week and month: swipe left for the next one, right for the previous (touch), or a sideways trackpad scroll.
  const paged = true
  const onTouchStart = (e) => { if (e.touches.length > 1) swipe.current.multi = true; swipe.current.x = e.touches[0].clientX; swipe.current.y = e.touches[0].clientY }
  const onTouchEnd = (e) => {
    if (swipe.current.multi) { if (e.touches.length === 0) swipe.current.multi = false; return } // a pinch is not a page swipe
    if (!paged) return
    const dx = e.changedTouches[0].clientX - swipe.current.x
    const dy = e.changedTouches[0].clientY - swipe.current.y
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1)
  }
  const onWheel = (e) => {
    if (!paged || Math.abs(e.deltaX) < 30 || Math.abs(e.deltaX) < Math.abs(e.deltaY) || Date.now() - swipe.current.last < 600) return
    swipe.current.last = Date.now()
    step(e.deltaX > 0 ? 1 : -1)
  }

  const today = keyOf(new Date())
  const weekStart = startOfWeek(cursor)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const label = mode === 'month'
    ? `${cursor.getFullYear()}年${cursor.getMonth() + 1}月`
    : mode === 'day'
      ? `${cursor.getMonth() + 1}月${cursor.getDate()}日 周${WEEKDAYS[cursor.getDay()]}`
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
        <span className="flex flex-col items-center justify-center gap-0.5 px-0.5 text-[0.65rem] font-medium leading-tight sm:flex-row sm:gap-1.5 sm:px-0 sm:text-xs">
          <i className={`h-2.5 w-2.5 shrink-0 rounded-full ${r.dot}`} /> <span>{r.name}</span>
        </span>
      ),
    }))

  // The room names (they also hide / show a room) and the staff filter: in the day view the room names sit to the right of the
  // date and the staff filter to the right of the 出勤 line; in the week / month views they share one row of their own.
  const roomChips = (
    <div className="hidden min-w-0 flex-1 flex-wrap items-center gap-1.5 sm:flex">
      {[...ROOMS, ...(roomCounts[''] ? [NO_ROOM] : [])].map((r) => {
        const off = hiddenRooms.has(r.id)
        return (
          <button key={r.id || 'none'} onClick={() => toggleRoom(r.id)} aria-pressed={!off}
            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.7rem] transition sm:text-xs ${off ? 'border-ink/10 text-muted line-through' : 'border-ink/15'}`}>
            <i className={`h-2.5 w-2.5 rounded-full ${off ? 'bg-stone-300' : r.dot}`} /> {r.name.slice(0, 2)}<span className="hidden sm:inline">{r.name.slice(2)}</span>
          </button>
        )
      })}
      <span className="flex items-center gap-2 text-[0.7rem] text-muted sm:text-xs">预约颜色：{Object.entries(STAFF_COLOR).map(([n, c]) => <span key={n} className="flex items-center gap-1"><i className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />{n}</span>)}</span>
    </div>
  )
  const staffSelect = !noStaffFilter && (
    <select value={staff} onChange={(e) => setStaff(e.target.value)} aria-label="按员工筛选"
      className="shrink-0 rounded-full border border-ink/15 bg-white px-3 py-1 text-xs outline-none focus:border-gold">
      <option value="">全部员工</option>
      {staffNames.map((n) => <option key={n} value={n}>{n}</option>)}
    </select>
  )

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-ink/10 px-1.5 py-1.5 sm:px-4">
        <div className="relative flex shrink-0 items-center">
          <button onClick={() => step(-1)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-sand sm:h-8 sm:w-8" aria-label="上一页"><ChevronLeft size={15} /></button>
          <button onClick={() => step(1)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-sand sm:h-8 sm:w-8" aria-label="下一页"><ChevronRight size={16} /></button>
          <button type="button" onClick={openPicker} aria-expanded={pickerOpen} aria-haspopup="dialog" title="选择日期"
            className="rounded-lg px-1.5 py-0.5 font-display text-[0.95rem] hover:bg-sand sm:text-lg"><h2 className="inline">{label}</h2></button>
          {pickerOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setPickerOpen(false)} />
              <div role="dialog" aria-label="选择日期" className="absolute left-0 top-full z-40 mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-ink/10 bg-white p-3 shadow-xl">
                {pickerMonths ? (
                  <>
                    <div className="mb-2 flex items-center justify-between">
                      <button type="button" onClick={() => setPickerYear((y) => y - 1)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-sand" aria-label="上一年"><ChevronLeft size={16} /></button>
                      <span className="font-display text-base">{pickerYear} 年</span>
                      <button type="button" onClick={() => setPickerYear((y) => y + 1)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-sand" aria-label="下一年"><ChevronRight size={16} /></button>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {Array.from({ length: 12 }, (_, m) => {
                        const here = pickerYear === pickerMonth.getFullYear() && m === pickerMonth.getMonth()
                        const now = new Date()
                        const thisMonth = pickerYear === now.getFullYear() && m === now.getMonth()
                        return (
                          <button type="button" key={m} onClick={() => jumpPickerToMonth(pickerYear, m)} aria-pressed={here}
                            className={`rounded-xl py-2 text-sm transition ${here ? 'bg-ink text-ivory' : thisMonth ? 'bg-sand font-medium hover:bg-sand/70' : 'hover:bg-sand'}`}>{m + 1} 月</button>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-2 flex items-center justify-between">
                      <button type="button" onClick={() => setPickerMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="grid h-8 w-8 place-items-center rounded-full hover:bg-sand" aria-label="上个月"><ChevronLeft size={16} /></button>
                      <button type="button" onClick={() => { setPickerYear(pickerMonth.getFullYear()); setPickerMonths(true) }} title="选择年份和月份" className="rounded-lg px-2 py-1 font-display text-base hover:bg-sand">{pickerMonth.getFullYear()} 年 {pickerMonth.getMonth() + 1} 月</button>
                      <button type="button" onClick={() => setPickerMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="grid h-8 w-8 place-items-center rounded-full hover:bg-sand" aria-label="下个月"><ChevronRight size={16} /></button>
                    </div>
                    <div className="grid grid-cols-7 text-center text-[0.7rem] text-muted">{WEEKDAYS.map((w) => <span key={w} className="py-1">{w}</span>)}</div>
                    <div className="grid grid-cols-7 gap-y-0.5">
                      {Array.from({ length: pickerMonth.getDay() }, (_, i) => <span key={`b${i}`} />)}
                      {Array.from({ length: new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1, 0).getDate() }, (_, i) => {
                        const d = new Date(pickerMonth.getFullYear(), pickerMonth.getMonth(), i + 1)
                        const k = keyOf(d)
                        const here = k === keyOf(cursor)
                        const isToday = k === today
                        const has = (byDay.get(k) || []).length > 0
                        return (
                          <button type="button" key={k} onClick={() => pickDate(d)} aria-pressed={here} aria-label={`${d.getMonth() + 1}月${d.getDate()}日`}
                            className={`relative mx-auto grid h-9 w-9 place-items-center rounded-full text-sm transition ${here ? 'bg-ink text-ivory' : isToday ? 'bg-sand font-semibold hover:bg-sand/70' : 'hover:bg-sand'}`}>
                            {i + 1}
                            {has && <i className={`absolute bottom-1 h-1 w-1 rounded-full ${here ? 'bg-ivory' : 'bg-gold'}`} />}
                          </button>
                        )
                      })}
                    </div>
                    <button type="button" onClick={() => pickDate(new Date())} className="mt-2 w-full rounded-xl border border-ink/15 py-1.5 text-sm hover:bg-sand">今天</button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
        {mode === 'day' && roomChips}
        <div className="ml-auto flex items-center gap-2">
          {mode !== 'day' && <button onClick={goToday} className="rounded-full border border-ink/15 px-3.5 py-1.5 text-sm hover:bg-sand">当日</button>}
          {modes.length > 1 && <div className="flex rounded-full bg-sand p-0.5 text-sm" role="group" aria-label="日历视图">
            {[['day', '日'], ['week', '周'], ['month', '月']].filter(([v]) => modes.includes(v)).map(([v, l]) => (
              <button key={v} onClick={() => changeMode(v)} aria-pressed={mode === v} className={`rounded-full px-4 py-1.5 transition ${mode === v ? 'bg-white shadow-sm' : 'text-muted'}`}>{l}</button>
            ))}
          </div>}
        </div>
      </div>

      {mode !== 'day' && (
        <div className="flex items-center gap-2 border-b border-ink/10 px-3 py-1.5 sm:px-4">
          {roomChips}
          {staffSelect}
        </div>
      )}

      {mode === 'day' && (
        <div className="flex items-center justify-between gap-2 border-b border-ink/10 px-3 py-1.5 sm:px-4">
          <p className="flex min-w-0 flex-1 flex-wrap gap-x-4 gap-y-0.5 text-xs">
<span><span className="text-muted">出勤：</span><b className="font-medium">{roster.filter((n) => worksOn(n, keyOf(cursor))).map((n) => { const h = staffHours(n, keyOf(cursor)); return h ? `${n} ${pad2(Math.floor(h.startMin / 60))}:${pad2(h.startMin % 60)}–${pad2(Math.floor(h.endMin / 60) % 24)}:${pad2(h.endMin % 60)}` : n }).join('、') || '无'}</b></span>
          {roster.some((n) => !worksOn(n, keyOf(cursor))) && <span className="text-rose-700"><span className="opacity-70">休息：</span><b className="font-medium">{roster.filter((n) => !worksOn(n, keyOf(cursor))).join('、')}</b></span>}
          </p>
          {staffSelect}
        </div>
      )}
      <ApptMenu menu={phoneMenu} setMenu={setPhoneMenu} customerById={customerById} onEdit={onEdit} onStatus={onStatus} onDelete={onDelete} paidCount={paidCount} hasTopUp={hasTopUp} />
      <div key={`${mode}-${keyOf(cursor)}`} className={slide > 0 ? 'cal-in-next' : slide < 0 ? 'cal-in-prev' : ''} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onWheel={onWheel}>
      {mode === 'month' && (
        <>
          <MonthView cursor={cursor} byDay={byDay} customerById={customerById} onEdit={openAppt} onCreate={onCreate} selected={selected} setSelected={setSelected} onOpenDay={onOpenDay} onSaveHours={onSaveHours} hoursReq={hoursReq} />
          <div className="border-t border-ink/10 sm:hidden">
            <DayAgenda days={[new Date(`${selected}T12:00:00`)]} byDay={byDay} customerById={customerById} onEdit={openAppt} onCreate={onCreate} emptyHint="这天没有预约，点日期新增" />
          </div>
        </>
      )}
      {mode === 'day' && <TimeGrid hourPx={hourPx} onZoom={zoomTo} columns={roomColumns} customerById={customerById} onEdit={onEdit} onCreate={onCreate} onMove={onMove} onDelete={onDelete} onStatus={onStatus} onResize={onResize} paidCount={paidCount} hasTopUp={hasTopUp} blocks={blocks} onEditBlock={onEditBlock} onSaveBlock={onSaveBlock} onDeleteBlock={onDeleteBlock} onSaveHours={onSaveHours} scrollKey={`day-${keyOf(cursor)}`} />}
      {mode === 'week' && (
        <>
          {/* One column per day, Sunday to Saturday, at every width (on a phone the grid scrolls sideways). */}
          <TimeGrid hourPx={hourPx} onZoom={zoomTo} columns={weekColumns} customerById={customerById} onEdit={onEdit} onCreate={onCreate} onMove={onMove} onDelete={onDelete} onStatus={onStatus} onResize={onResize} paidCount={paidCount} hasTopUp={hasTopUp} blocks={blocks} onEditBlock={onEditBlock} onSaveBlock={onSaveBlock} onDeleteBlock={onDeleteBlock} onSaveHours={onSaveHours} scrollKey={`week-${keyOf(weekStart)}`} />
        </>
      )}
      </div>
    </Card>
  )
}
