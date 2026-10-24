import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CalendarDays, CalendarPlus, Check, Clock, FileSignature, HandCoins, LayoutList, Pencil, Plus, Trash2, X } from 'lucide-react'
import { business, categories } from '../data/site'
import { api } from '../api'
import { useAuth } from '../auth'
import { useApptWindow, useCrm, useCustomerAppointments } from './data'
import { dayRange, monthOffsetRange, upcomingRange } from '../lib/timeRange'
import CalendarView from './Calendar'
import PaymentForm from './PaymentForm'
import TimeAxis from './TimeAxis'
import TimeWheel from './TimeWheel'
import CheckInDocs, { docsMissing } from './CheckInDocs'
import { durationFor } from './durations'
import { relatedTo, withStaff } from './staff'

import { defaultOpenStart, findClash, dayAppointments, hhmm, minutesOfDay } from './timeline'
import { ROOMS, roomOf } from './rooms'
import { Card, Empty, Field, Modal, PageTitle, StatusBadge, inputCls } from './ui'
import { CUSTOMER_SOURCES, STATUS, cardBalance, dayKey, fmtDateTime, fmtDay, fmtTime, googleCalendarUrl, money, toLocalInput } from './format'
import { openPicker } from '../lib/util'

// Rooms whose service field follows a category of the public website (slug from webapp/data/site.js):
// 美容单人房 offers 护肤项目 first (with its 60/90-minute packages), then 医美, 美睫 and Spa; 医美双人房 lists 医美 first (injectables, IV drips, devices), then 护肤, 美睫 and Spa; 美睫单人房 lists 美睫 first, then 护肤, 医美 and Spa; 头疗双人房 offers everything (Spa first). Add a room here to link another one.
const ROOM_CATALOG = {
  room1: ['skincare-experts', 'injectables', 'iv-therapy', 'devices', 'spa-care'], room2: ['injectables', 'iv-therapy', 'devices', 'skincare-experts', 'spa-care'], room3: ['lash', 'skincare-experts', 'injectables', 'iv-therapy', 'devices', 'spa-care'],
  room4: ['spa-care', 'skincare-experts', 'injectables', 'iv-therapy', 'devices'],
  '': ['skincare-experts', 'injectables', 'iv-therapy', 'devices', 'lash', 'spa-care', 'microblading'], // no room yet: every service, the room then follows the service
}
// Who a new booking is assigned to by default in each room (other rooms start unassigned; the list lets you pick anyone).
const ROOM_DEFAULT_STAFF = { room1: 'Rina', room2: 'Yingna', room3: 'Dayu' }
const priceOf = (p) => Number(String(p ?? '').replace(/[^\d.]/g, '')) || undefined
// Website treatment headings that are not booked as such (only their packages are), so they stay out of the service list.
const HIDDEN_SERVICES = new Set(['日式小颜徒手矫正', '修丽可水润修复护理', '中式古法面部刮痧', '瑞士瑞妍生机弹绷护理', '日式淋巴芳香精油排毒 SPA', '日式身体焕白 · 果酸嫩肤 SPA', '日式经络 · 背部拔罐SPA', '日式淋巴刮痧 SPA', 'Nouvelle专业祛痘针清'])
// Services left out of one room's list only.
const SCALP_SPA = new Set(['日式头皮抗衰 SPA', '日式头皮 · 净澈焕活 SPA 60 分钟', '日式头皮 · 御龄深养 SPA 90 分钟'])
const PICO_FRACTIONAL = new Set(['探索皮秒', 'CO₂ 点阵激光焕肤']) // 医美双人房 only
const HIDDEN_IN_ROOM = {
  room1: new Set([...SCALP_SPA, ...PICO_FRACTIONAL]),
  room2: SCALP_SPA,
  room3: new Set([...SCALP_SPA, ...PICO_FRACTIONAL]),
  room4: new Set([...PICO_FRACTIONAL, '日式头皮抗衰 SPA']), // the heading only: its 60 / 90 minute packages stay
}
// Services the CRM offers that are not on the website: { after: the website service to follow, ... }.
const EXTRA_SERVICES = [{ after: 'BTL 磁波塑肌燃脂', value: '热拉提', search: 'Thermage lift 热玛吉 拉提' }]

// Services that have a fixed operator: picking one on a new booking fills in 负责员工 (still changeable by hand).
// 项目类别 for a service typed by hand (not on the website list): it decides the usual room, like the website's own categories do.
const CUSTOM_CATEGORIES = [
  { id: 'skincare', label: '护肤项目', room: 'room1' },
  { id: 'medical', label: '医美项目', room: 'room2' },
  { id: 'lash', label: '美睫项目', room: 'room3' },
  { id: 'spa', label: 'Spa 项目', room: 'room4' },
]
const SERVICE_STAFF = [{ re: /拔罐/, staff: 'Rina' }] // 背部拔罐 is Rina's

// Which room a service belongs in. `must` rooms are the only choice (the equipment / bed is there); the others are the
// default for that kind of service and can still be changed. Anything else is up to whoever books it.
const MUST_ROOM = [
  { re: /皮秒|点阵/, room: 'room2' }, // Pico and CO₂ fractional laser: 医美双人房 only
  { re: /日式头皮/, room: 'room4' }, // scalp spa: 头疗双人房 only
]
const PREFER_ROOM = {
  injectables: 'room2', 'iv-therapy': 'room2', devices: 'room2', // 医美项目
  'spa-care': 'room4', // body spa
  lash: 'room3', // 美睫
  'skincare-experts': 'room1', // 美容护肤
}
export function roomRule(service, cat) {
  const must = MUST_ROOM.find((m) => m.re.test(service || ''))
  if (must) return { room: must.room, must: true }
  return PREFER_ROOM[cat] ? { room: PREFER_ROOM[cat], must: false } : null
}
function catalogFor(room) {
  const cats = (ROOM_CATALOG[room] || []).map((slug) => categories.find((c) => c.slug === slug)).filter(Boolean)
  const seen = new Set()
  // 美睫 is booked by style, so its price-list rows (with the single-visit price) stand in for the treatment cards.
  const items = cats.flatMap((c) => (c.priceList ? c.priceList.groups.flatMap((g) => g.rows.map((r) => ({ name: r.name, price: r.member, regularPrice: r.single }))) : c.treatments).map((t) => ({ ...t, cat: c.slug })))
  return items.flatMap((t) => [
    { value: t.name.zh, cat: t.cat, search: t.name.en, price: priceOf(t.price), regularPrice: priceOf(t.regularPrice) },
    ...(t.packages || []).map((pk) => ({
      value: pk.name.zh,
      cat: t.cat,
      search: `${pk.name.en || ''} ${t.name.en || ''}`,
      durationMin: Number((pk.name.zh.match(/(\d+)\s*分钟/) || [])[1]) || undefined,
      price: priceOf(pk.price),
      regularPrice: priceOf(pk.was),
    })),
  ]).flatMap((o) => [o, ...EXTRA_SERVICES.filter((x) => x.after === o.value).map(({ value, search }) => ({ value, search, cat: o.cat }))])
    .filter((o) => !HIDDEN_SERVICES.has(o.value) && !HIDDEN_IN_ROOM[room]?.has(o.value) && !seen.has(o.value) && seen.add(o.value))
}

// Service field: a text box with a scrollable list under it. Opening it shows every service (scroll to reach the
// end); typing (Chinese or English) narrows the list down, and anything typed that is not in the list is kept as free text.
function ServiceCombo({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false)
  const exact = options.some((o) => o.value === value)
  const q = value.trim().toLowerCase()
  const custom = !!q && !exact // typed text that is not on the list can be added by hand
  const shown = !q || exact ? options : options.filter((o) => `${o.value} ${o.search || ''}`.toLowerCase().includes(q))
  return (
    <div className="relative">
      <input
        className={inputCls}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}
        required
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        placeholder={placeholder}
      />
      {open && (shown.length > 0 || custom) && (
        <ul role="listbox" className="absolute inset-x-0 top-full z-30 mt-1 max-h-60 overflow-y-auto overscroll-contain rounded-xl border border-ink/15 bg-white py-1 shadow-lg">
          {custom && (
            <li role="option" aria-selected="false">
              <button type="button" onMouseDown={(e) => { e.preventDefault(); onChange(value.trim()); setOpen(false) }} className="block w-full border-b border-ink/10 px-3 py-2 text-left text-sm font-medium text-gold hover:bg-sand/70">＋ 手动添加「{value.trim()}」{shown.length === 0 && <span className="ml-2 font-normal text-muted">列表里没有找到</span>}</button>
            </li>
          )}
          {shown.map((o) => {
            const hint = [o.tag, o.durationMin && `${o.durationMin} 分钟`, o.price && `$${o.price}`].filter(Boolean).join(' · ')
            return (
              <li key={o.value} role="option" aria-selected={o.value === value}>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); onChange(o.value); setOpen(false) }}
                  className={`flex w-full items-baseline justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-sand/70 ${o.value === value ? 'bg-sand font-medium' : ''}`}
                >
                  <span>{o.value}</span>
                  {hint && <span className="shrink-0 text-xs text-muted">{hint}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// Customer field: search by name, phone, WeChat name or email; "＋ 新添客户" sits at the end of the list (and stays
// reachable when nothing matches), so existing customers are found before a duplicate gets created.
function CustomerCombo({ customers, value, allowNew, onChange, onTypeNew, autoFocus }) {
  const label = (c) => `${c.name}${c.phone ? ` · ${c.phone}` : ''}`
  const chosen = customers.find((c) => c.id === value)
  const [q, setQ] = useState(chosen ? label(chosen) : '')
  const [open, setOpen] = useState(!!autoFocus) // autofocus does not fire onFocus, so the list starts open with the cursor
  const isNew = value === NEW_CUSTOMER
  const text = isNew && !q ? '＋ 新添客户' : q
  const matches = (term) => customers.filter((c) => [c.name, c.phone, c.wechatId, c.wechatNo, c.email, c.id].some((v) => String(v || '').toLowerCase().includes(term)))
  const term = chosen && q === label(chosen) ? '' : q.trim().toLowerCase()
  const shown = term ? matches(term) : customers
  const pick = (id, t) => { onChange(id); setQ(t); setOpen(false) }
  const type = (v) => {
    setQ(v)
    setOpen(true)
    const t = v.trim().toLowerCase()
    // Nothing matches what was typed: switch to adding a new customer, starting from the typed text.
    if (allowNew && t && matches(t).length === 0) { onTypeNew(v.trim()); return }
    if (value) onChange('')
  }
  return (
    <div className="relative">
      <input
        className={inputCls}
        value={text}
        onChange={(e) => type(e.target.value)}
        onFocus={(e) => { setOpen(true); if (isNew && !q) onChange(''); else e.target.select() }}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}
        autoFocus={autoFocus}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        placeholder="搜索姓名 / 手机号 / 微信名 / 邮箱 / ID"
      />
      {open && (
        <ul role="listbox" className="absolute inset-x-0 top-full z-30 mt-1 max-h-60 overflow-y-auto overscroll-contain rounded-xl border border-ink/15 bg-white py-1 shadow-lg">
          {allowNew && (
            <li role="option" aria-selected={isNew}>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); pick(NEW_CUSTOMER, '') }} className="block w-full border-b border-ink/10 px-3 py-2 text-left text-sm font-medium text-gold hover:bg-sand/70">＋ 新添客户</button>
            </li>
          )}
          {shown.map((c) => (
            <li key={c.id} role="option" aria-selected={c.id === value}>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); pick(c.id, label(c)) }} className={`block w-full px-3 py-2 text-left text-sm hover:bg-sand/70 ${c.id === value ? 'bg-sand font-medium' : ''}`}>{label(c)}</button>
            </li>
          ))}
          {term && shown.length === 0 && !allowNew && <li className="px-3 py-2 text-sm text-muted">没有找到匹配的客户</li>}
        </ul>
      )}
    </div>
  )
}

const LOCATION = `${business.locations[0].line1}, ${business.locations[0].line2}`

const NEW_CUSTOMER = '__new__' // value of the "＋ 新添客户" choice in the customer list
const dayOfInput = (date) => { const [y, m, d] = date.split('-').map(Number); return y && m && d ? dayRange(new Date(y, m - 1, d)) : null } // 'YYYY-MM-DD' -> that clinic day as a UTC range

// Switch at the top of the new-booking dialog: a normal appointment, or time blocked off ("有事，不接受预约").
function EntryTabs({ mode, onMode }) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-1 rounded-2xl bg-sand p-1 text-sm" role="tablist">
      {[['appt', '预约'], ['block', '屏蔽时间']].map(([k, l]) => (
        <button key={k} type="button" role="tab" aria-selected={mode === k} onClick={() => onMode(k)}
          className={`rounded-xl py-2 transition ${mode === k ? 'bg-white font-medium shadow-sm' : 'text-muted'}`}>{l}</button>
      ))}
    </div>
  )
}

// Time the clinic does not take bookings: one room, or every room. Shown hatched on the calendar; the server refuses bookings in it.
function BlockForm({ block, draftStart, draftRoom, draftDuration, onClose, onMode }) {
  const { appointments, customerById, save, remove, hours } = useCrm()
  const [f, setF] = useState(() => ({
    room: block ? block.room : draftRoom || '',
    start: block ? toLocalInput(block.start) : draftStart ? toLocalInput(draftStart) : defaultOpenStart(hours),
    durationMin: block ? block.durationMin : draftDuration || 60,
    reason: block?.reason || '',
  }))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [askDelete, setAskDelete] = useState(false)
  const date = f.start.slice(0, 10)
  useApptWindow('blockform', dayOfInput(date)) // the bookings on that day, to warn about the ones inside the blocked stretch
  const startMin = Number(f.start.slice(11, 13)) * 60 + Number(f.start.slice(14, 16))
  const durationMin = Number(f.durationMin) || 60
  const durations = [...new Set([...Array.from({ length: 64 }, (_, i) => (i + 1) * 15), durationMin])].sort((a, b) => a - b)
  const label = (m) => (m % 60 === 0 ? `${m / 60} 小时` : m > 60 ? `${Math.floor(m / 60)} 小时 ${m % 60} 分钟` : `${m} 分钟`)
  // Bookings already inside the stretch stay where they are: tell the user.
  const inside = appointments.filter((a) => a.status !== 'cancelled' && a.status !== 'no-show' && dayKey(a.start) === date && (!f.room || a.room === f.room)
    && minutesOfDay(a.start) < startMin + durationMin && startMin < minutesOfDay(a.start) + (a.durationMin || 60))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await save('blocks', block?.id, { room: f.room, start: new Date(f.start).toISOString(), durationMin, reason: f.reason })
      onClose()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }
  const del = async () => {
    setBusy(true)
    try { await remove('blocks', block.id); onClose() } catch (err) { setError(err.message); setBusy(false) }
  }

  return (
    <Modal inset title={block ? '屏蔽的时间' : '屏蔽时间'} onClose={onClose} loading={busy}>
      {!block && <EntryTabs mode="block" onMode={onMode} />}
      <form onSubmit={submit} className="space-y-4">
        <p className="rounded-xl bg-sand px-4 py-2.5 text-xs text-muted">这段时间有事，不接受预约：在日历上显示为斜线，新增、移动预约都不能落在这里。</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="房间">
            <select className={inputCls} value={f.room} onChange={(e) => setF({ ...f, room: e.target.value })}>
              <option value="">全部房间</option>
              {ROOMS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </Field>
          <Field label="日期 *"><input className={inputCls} type="date" value={date} onChange={(e) => e.target.value && setF({ ...f, start: `${e.target.value}T${f.start.slice(11, 16)}` })} required  onClick={openPicker} onFocus={openPicker} /></Field>
        </div>
        <Field label="时长">
          <select className={inputCls} value={durationMin} onChange={(e) => setF({ ...f, durationMin: Number(e.target.value) })}>
            {durations.map((m) => <option key={m} value={m}>{label(m)}</option>)}
          </select>
        </Field>
        <div>
          <span className="mb-1.5 block text-xs font-medium text-muted">开始时间 · {hhmm(startMin)} – {hhmm(Math.min(startMin + durationMin, 24 * 60))}</span>
          <TimeAxis date={date} startMin={startMin} durationMin={durationMin} room={f.room} appointments={appointments} customerById={customerById} selfId={null} clash={null} onPick={(m) => setF({ ...f, start: `${date}T${hhmm(m)}` })} />
        </div>
        <Field label="原因（选填）"><input className={inputCls} value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} placeholder="例如：外出、培训、设备维护" maxLength={200} /></Field>
        {inside.length > 0 && <p className="text-xs text-amber-700">这段时间已经有 {inside.length} 个预约，它们不会被取消；如需取消请单独处理。</p>}
        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        <div className="flex items-center justify-end gap-2 pt-2">
          {block && (askDelete
            ? <span className="mr-auto flex items-center gap-2 text-sm"><span className="text-rose-800">取消屏蔽？</span><button type="button" onClick={del} disabled={busy} className="rounded-full bg-rose-600 px-4 py-2 text-white hover:bg-rose-700">确定</button><button type="button" onClick={() => setAskDelete(false)} className="rounded-full border border-ink/15 px-4 py-2">不</button></span>
            : <button type="button" onClick={() => setAskDelete(true)} className="mr-auto rounded-full px-4 py-2 text-sm text-rose-700 hover:bg-rose-50">取消屏蔽</button>)}
          <button type="button" onClick={onClose} className="btn-ghost !py-2.5">关闭</button>
          <button className="btn-primary !py-2.5" disabled={busy}>保存</button>
        </div>
      </form>
    </Modal>
  )
}

function ApptForm({ appt, draftStart, draftRoom, draftDuration, onClose, onCheckedIn, onDocs }) {
  const { customers, appointments, services, payments, save, remove, customerById, hours, isClosed, worksOn, staffHours, staffRest, roomWindow, roster } = useCrm()
  const { user, can } = useAuth()
  const lockStaff = !can('assignOthers') // booking for another staff member needs permission: the staff field stays on themselves
  const canBlock = can('manageBlocks')
  const canDeleteAppt = !!appt && can('deleteAppointments')
  const [askDelete, setAskDelete] = useState(false)
  const [mode, setMode] = useState('appt') // 'block' switches this dialog to blocking time off (store manager only)
  const staffSuggestions = withStaff(appointments.map((a) => a.staff), roster)
  const [f, setF] = useState({
    customerId: appt?.customerId || '', // new bookings start with nobody chosen: search first, then add
    service: (appt?.items?.length > 1 ? appt.items[0].service : appt?.service) || '',
    start: appt ? toLocalInput(appt.start) : draftStart ? toLocalInput(draftStart) : defaultOpenStart(hours),
    durationMin: appt?.durationMin || draftDuration || 60,
    price: appt?.price ?? '',
    status: appt?.status || 'scheduled',
    // A new booking in a double room takes both beds by default (the box can still be narrowed to one bed or lengthened).
    fullRoom: appt ? !!appt.fullRoom : (roomOf(draftRoom).beds || 1) > 1,
    room: appt?.room || draftRoom || '',
    // New bookings start with the first listed staff member (Rina); existing ones keep what was saved.
    staff: lockStaff && user?.staffName ? user.staffName : appt ? appt.staff || '' : ROOM_DEFAULT_STAFF[appt?.room || draftRoom || ''] || '',
    notes: appt?.notes || '',
    source: appt?.source || '', // 客户来源
    category: (appt?.items?.length > 1 ? appt.items[0].category : appt?.category) || '', // 项目类别 (only for a service typed by hand)
  })
  // More services booked together (the 加号 under 服务项目): each has its own length and price; the length and price boxes below
  // hold the totals. An existing booking brings its extra services back from `items` (the first item is the main service).
  const [extras, setExtras] = useState(() => (appt?.items?.length > 1 ? appt.items.slice(1).map((x) => ({ service: x.service || '', durationMin: Number(x.durationMin) || 0, price: Number(x.price) || 0, category: x.category || '' })) : []))
  // 备注 follows the customer: choosing a customer fills in the notes kept for them (from their last visit), and saving updates those notes.
  const notesTouched = useRef(false)
  const [nc, setNc] = useState({ firstName: '', lastName: '', gender: 'female', wechatId: '', wechatNo: '', phone: '', email: '' }) // the customer being added
  const setNew = (k) => (e) => setNc({ ...nc, [k]: e.target.value })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [staffPicked, setStaffPicked] = useState(false) // once someone is chosen by hand, changing the room leaves it alone
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  // New bookings follow the room's default staff member until staff is picked by hand.
  const [fullPicked, setFullPicked] = useState(false) // the whole-room box was ticked or cleared by hand: stop defaulting it from the room
  const [roomPicked, setRoomPicked] = useState(!!(appt?.room || draftRoom)) // a room chosen by hand (or by clicking the timeline) is kept for preferred services
  const changeRoom = (e) => {
    const room = e.target.value
    setRoomPicked(true)
    const double = (roomOf(room).beds || 1) > 1
    setF({ ...f, room, fullRoom: !appt && !fullPicked ? double : f.fullRoom && double, ...(!appt && !staffPicked ? { staff: ROOM_DEFAULT_STAFF[room] || '' } : {}) })
  }

  // Service suggestions: the linked website category for this room, otherwise the CRM's own list.
  const [autoPrice, setAutoPrice] = useState('') // the last price filled in from the website, so it can be told apart from a typed one
  const catalog = useMemo(() => catalogFor(f.room), [f.room])
  // Price type: 初次体验价 for a new customer or a service they have not had yet; 会员再来价 / 非会员再来价 for a repeat of a
  // service they already received. It follows the customer and service by itself and can be changed from the dropdown.
  // The website lists a first-experience (member) price and a regular price, so 会员再来价 uses the member price.
  const customer = customerById[f.customerId]
  const isMember = f.customerId === NEW_CUSTOMER || !!customer?.member
  const [tierPicked, setTierPicked] = useState(null)
  const hadBefore = (customerId, service) => !!customerId && customerId !== NEW_CUSTOMER && appointments.some((a) =>
    a.customerId === customerId && a.service === service && a.id !== appt?.id && ['checked-in', 'in-service', 'completed'].includes(a.status))
  const tierFor = (customerId, member, hit) => (!hit || !hadBefore(customerId, hit.value) ? 'first' : member ? 'member' : 'regular')
  const priceByTier = (hit, tier) => (tier === 'regular' ? hit?.regularPrice ?? hit?.price : hit?.price)
  const priceOfHit = (hit, member = isMember, customerId = f.customerId, picked = tierPicked) => priceByTier(hit, (picked !== 'manual' && picked) || tierFor(customerId, member, hit))
  const priced = useMemo(() => catalog.map((o) => ({ ...o, price: priceOfHit(o) })), [catalog, isMember, f.customerId, appointments, tierPicked]) // eslint-disable-line react-hooks/exhaustive-deps
  // Custom services that were typed before are remembered (in the CRM's own service list, with their 项目类别) and offered in the menu.
  const customMem = useMemo(() => Object.fromEntries(services.filter((x) => x.category).map((x) => [x.name, x])), [services])
  const menuOptions = useMemo(() => {
    if (!catalog.length) return services.map((x) => ({ value: x.name }))
    const known = new Set(catalog.map((o) => o.value))
    const label = (id) => CUSTOM_CATEGORIES.find((c) => c.id === id)?.label
    return [...priced, ...Object.values(customMem).filter((x) => !known.has(x.name)).map((x) => ({ value: x.name, tag: label(x.category) }))]
  }, [catalog, priced, services, customMem])
  const serviceHit = catalog.find((x) => x.value === f.service)
  const customService = !!f.service.trim() && !serviceHit // typed by hand: ask which kind of service it is
  const mustRule = (() => { const r = roomRule(f.service, serviceHit?.cat); return r?.must ? r : null })()
  const tier = (tierPicked !== 'manual' && tierPicked) || tierFor(f.customerId, isMember, serviceHit)
  const TIERS = [['first', '初次体验价'], ['member', '会员再来价'], ['regular', '非会员再来价']]
  const pickTier = (t) => {
    setTierPicked(t)
    if (t === 'manual') return
    const web = serviceHit && priceByTier(serviceHit, t)
    if (web) { setAutoPrice(String(web)); setF({ ...f, price: String(web) }) }
  }
  // One price control: a dropdown showing the price type and amount (e.g. 初次体验价 $198) whenever the website lists a price
  // for the service, switching to a plain number box for 手动输入价格, for services without a website price, and for any
  // saved or typed amount that is not one of the three prices.
  const tierPrice = serviceHit ? priceByTier(serviceHit, tier) : undefined
  const manualPrice = !tierPrice || tierPicked === 'manual' || (f.price !== '' && Number(f.price) !== tierPrice)
  const pickService = (e) => {
    const value = e.target.value
    const hit = catalog.find((x) => x.value === value)
    // Choosing a service fills in its length (from the package, the name, or the defaults table) and its website price;
    // everything stays editable.
    const mins = hit?.durationMin ?? durationFor(value)
    // Picking a service sets its website price, or clears the box when the website lists none, so a price never carries
    // over from the previous service; typing in the box afterwards (or changing customer) never overwrites it.
    let price = f.price
    setTierPicked(null) // a new service starts from the automatic price type again
    const web = priceOfHit(hit, isMember, f.customerId, null)
    if (web) { price = String(web); setAutoPrice(price) } else { price = ''; setAutoPrice('') } // no website price: leave the box blank for a manual amount
    // Room rule: a must-room service moves the booking there; a preferred room is applied unless one was picked by hand.
    const rule = roomRule(value, hit?.cat)
    const room = rule && (rule.must || !roomPicked) ? rule.room : f.room
    const roomChange = room !== f.room
      ? { room, fullRoom: !appt && !fullPicked ? (roomOf(room).beds || 1) > 1 : f.fullRoom && (roomOf(room).beds || 1) > 1, ...(!appt && !staffPicked && !lockStaff ? { staff: ROOM_DEFAULT_STAFF[room] || '' } : {}) }
      : {}
    const fixedStaff = SERVICE_STAFF.find((r) => r.re.test(value))?.staff
    const staff = fixedStaff && !appt && !staffPicked && !lockStaff ? { staff: fixedStaff } : {}
    const exMin = extras.reduce((n, x) => n + x.durationMin, 0)
    const exPrice = extras.reduce((n, x) => n + x.price, 0)
    if (extras.length && price !== '') price = String(Math.round((Number(price) + exPrice) * 100) / 100) // the box shows the total of every service
    else if (extras.length && exPrice) price = String(exPrice)
    setF({ ...f, service: value, price, ...roomChange, ...staff, category: hit ? '' : customMem[value]?.category ?? f.category, ...(mins ? { durationMin: mins + exMin } : {}) })
  }
  // Extra services: adding / changing / removing one moves the total length and price by that service's share.
  const addExtra = () => setExtras([...extras, { service: '', durationMin: 0, price: 0, category: '' }])
  const changeExtra = (i, patch) => {
    const old = extras[i]
    const next = { ...old, ...patch }
    setExtras(extras.map((x, n) => (n === i ? next : x)))
    setF({ ...f, durationMin: Math.max(15, Number(f.durationMin) + next.durationMin - old.durationMin), price: String(Math.max(0, Math.round(((Number(f.price) || 0) + next.price - old.price) * 100) / 100)) })
  }
  const pickExtra = (i, value) => {
    const hit = catalog.find((x) => x.value === value)
    changeExtra(i, { service: value, durationMin: hit?.durationMin ?? durationFor(value) ?? 0, price: Number(priceOfHit(hit, isMember, f.customerId, null)) || 0, category: hit ? '' : customMem[value]?.category ?? extras[i]?.category ?? '' })
  }
  const removeExtra = (i) => {
    const old = extras[i]
    setExtras(extras.filter((_, n) => n !== i))
    setF({ ...f, durationMin: Math.max(15, Number(f.durationMin) - old.durationMin), price: String(Math.max(0, Math.round(((Number(f.price) || 0) - old.price) * 100) / 100)) })
  }
  // Choosing the kind of a custom service moves the booking to that kind's usual room (unless a room was picked by hand).
  const pickCategory = (id) => {
    const cat = CUSTOM_CATEGORIES.find((c) => c.id === id)
    const room = cat && !roomPicked && !mustRule ? cat.room : f.room
    const roomChange = room !== f.room
      ? { room, fullRoom: !appt && !fullPicked ? (roomOf(room).beds || 1) > 1 : f.fullRoom && (roomOf(room).beds || 1) > 1, ...(!appt && !staffPicked && !lockStaff ? { staff: ROOM_DEFAULT_STAFF[room] || '' } : {}) }
      : {}
    setF({ ...f, category: id, ...roomChange })
  }
  // Picking another customer switches a website price between member and regular, unless the price was typed by hand.
  // Typed text that matches nobody becomes the new customer's details: a phone number, an email, or a name.
  const typeNew = (text) => {
    const digits = text.replace(/\D/g, '')
    const [first, ...rest] = text.split(/\s+/)
    const from = text.includes('@') ? { email: text } : digits.length >= 6 && /^[\d\s()+-]+$/.test(text) ? { phone: text } : { firstName: first, lastName: rest.join(' ') }
    setNc({ ...nc, firstName: '', lastName: '', phone: '', email: '', ...from })
    pickCustomer(NEW_CUSTOMER)
  }
  const pickCustomer = (customerId) => {
    const next = customerById[customerId]
    const member = customerId === NEW_CUSTOMER || !!next?.member
    const hit = catalog.find((x) => x.value === f.service)
    setTierPicked(null)
    const web = hit ? priceOfHit(hit, member, customerId, null) : undefined
    const carry = !appt && !notesTouched.current ? { notes: next?.notes || '' } : {} // a new booking starts from the customer's saved notes
    if (web && f.price === autoPrice) { setAutoPrice(String(web)); setF({ ...f, customerId, price: String(web), ...carry }) } else setF({ ...f, customerId, ...carry })
  }

  // Start time is edited as a date plus a slot on the day timeline (15-minute steps).
  const date = f.start.slice(0, 10)
  useApptWindow('form', dayOfInput(date)) // the day timeline shows that day's bookings
  useCustomerAppointments(f.customerId && f.customerId !== NEW_CUSTOMER ? f.customerId : null) // their earlier bookings decide first-visit / member / regular pricing
  const startMin = Number(f.start.slice(11, 13)) * 60 + Number(f.start.slice(14, 16))
  const durationMin = Number(f.durationMin) || 60
  const pickSlot = (min) => setF({ ...f, start: `${date}T${hhmm(min)}` })
  const clash = findClash(dayAppointments(appointments, date, appt?.id), f.room, startMin, durationMin, f.fullRoom)
  const durations = [...new Set([...Array.from({ length: 16 }, (_, i) => (i + 1) * 15), durationMin])].sort((a, b) => a - b)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (mustRule && f.room !== mustRule.room) throw new Error(`「${f.service}」必须安排在${roomOf(mustRule.room).name}`)
      let customerId = f.customerId
      if (!customerId) throw new Error('请先搜索并选择客户，或点「＋ 新添客户」')
      if (customerId === NEW_CUSTOMER) {
        // The customer is created first; the appointment then points at the new record.
        const made = await save('customers', null, { ...nc, name: [nc.firstName.trim(), nc.lastName.trim()].filter(Boolean).join(' '), notes: f.notes })
        customerId = made.id
      }
      const added = extras.filter((x) => x.service.trim())
      const exMin = added.reduce((n, x) => n + x.durationMin, 0)
      const exPrice = added.reduce((n, x) => n + x.price, 0)
      const total = Number(f.durationMin)
      // The main service keeps what is left of the totals; the booking's own name lists every service.
      const items = added.length ? [{ service: f.service, durationMin: Math.max(0, total - exMin), price: Math.max(0, Math.round(((Number(f.price) || 0) - exPrice) * 100) / 100), category: customService ? f.category : '' }, ...added.map((x) => ({ ...x, service: x.service.trim(), category: catalog.some((c) => c.value === x.service) ? '' : x.category }))] : []
      const body = { ...f, service: added.length ? [f.service, ...added.map((x) => x.service.trim())].join(' + ') : f.service, items, category: customService ? f.category : '', customerId, start: new Date(f.start).toISOString(), durationMin: Number(f.durationMin), price: f.price === '' ? 0 : Number(f.price) }
      const saved = await save('appointments', appt?.id, body)
      // Remember the custom services typed here (with their 项目类别): they join the service menu from now on.
      const everyone = catalogFor('').map((o) => o.value)
      const customs = [{ service: f.service, category: customService ? f.category : '' }, ...added.map((x) => ({ service: x.service.trim(), category: x.category }))]
        .filter((x) => x.service && x.category && !everyone.includes(x.service))
      for (const x of customs) {
        const have = services.find((y) => y.name === x.service)
        try {
          if (!have) await save('services', null, { name: x.service.slice(0, 80), category: x.category })
          else if (have.category !== x.category) await save('services', have.id, { name: have.name, category: x.category })
        } catch { /* remembering is a convenience: the booking itself is already saved */ }
      }
      // Keep the customer's notes up to date, so the next booking (any date) starts from them.
      const known = customerById[customerId]
      if (known && (notesTouched.current || !appt) && (f.notes || '') !== (known.notes || '')) await save('customers', customerId, { ...known, notes: f.notes })
      onClose()
      if (onCheckedIn && body.status !== appt?.status && (body.status === 'checked-in' || body.status === 'in-service')) onCheckedIn(saved, body.status === 'checked-in' ? 'checkin' : 'service')
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  if (mode === 'block') return <BlockForm draftStart={draftStart} draftRoom={draftRoom} draftDuration={draftDuration} onClose={onClose} onMode={setMode} />

  return (
    <Modal inset title={appt ? '编辑预约' : '新增预约'} onClose={onClose} loading={busy} loadingText={askDelete ? '删除中…' : '保存中…'}>
      {!appt && canBlock && <EntryTabs mode="appt" onMode={setMode} />}
      <form onSubmit={submit} className="space-y-4">
        <Field label="客户 *">
          <CustomerCombo customers={customers} value={f.customerId} allowNew={!appt} onChange={pickCustomer} onTypeNew={typeNew} autoFocus={!appt} />
        </Field>
        {f.customerId === NEW_CUSTOMER && (
          <div className="grid gap-4 rounded-2xl border border-gold/30 bg-sand/50 p-4 sm:grid-cols-2">
            <Field label="First name"><input className={inputCls} value={nc.firstName} onChange={setNew('firstName')} autoComplete="off" /></Field>
            <Field label="Last name"><input className={inputCls} value={nc.lastName} onChange={setNew('lastName')} autoComplete="off" /></Field>
            <Field label="性别">
              <select className={inputCls} value={nc.gender} onChange={setNew('gender')}>
                <option value="female">女</option>
                <option value="male">男</option>
              </select>
            </Field>
            <Field label="微信名"><input className={inputCls} value={nc.wechatId} onChange={setNew('wechatId')} autoComplete="off" /></Field>
            <Field label="微信号"><input className={inputCls} value={nc.wechatNo} onChange={setNew('wechatNo')} autoComplete="off" /></Field>
            <Field label="手机号"><input className={inputCls} type="tel" inputMode="tel" value={nc.phone} onChange={setNew('phone')} autoComplete="off" /></Field>
            <Field label="邮箱"><input className={inputCls} type="email" value={nc.email} onChange={setNew('email')} autoComplete="off" /></Field>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="房间">
            <select className={inputCls} value={f.room} onChange={changeRoom}>
              <option value="" disabled={!!mustRule}>未指定</option>
              {ROOMS.map((r) => <option key={r.id} value={r.id} disabled={(!!mustRule && r.id !== mustRule.room) || ((isClosed(r.id, date) || roomWindow(r.id, date)?.closed) && r.id !== f.room)}>{r.name}{isClosed(r.id, date) ? '（当天已关闭）' : roomWindow(r.id, date)?.closed ? '（当天无人出勤）' : ''}</option>)}
            </select>
            {mustRule && <span className={`mt-1.5 block text-xs ${f.room === mustRule.room ? 'text-gold' : 'text-rose-700'}`}>此项目必须安排在{roomOf(mustRule.room).name}</span>}
          </Field>
          {(roomOf(f.room).beds || 1) > 1 && (
            <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={f.fullRoom} onChange={(e) => { setFullPicked(true); setF({ ...f, fullRoom: e.target.checked }) }} className="h-4 w-4 accent-gold" />占用整间（双人房两个床位都用）</label>
          )}
          <Field label="负责员工">
            <select className={inputCls} value={f.staff} disabled={lockStaff} onChange={(e) => { setStaffPicked(true); setF({ ...f, staff: e.target.value }) }}>
              <option value="">未指定</option>
              {(f.staff && !staffSuggestions.includes(f.staff) ? [...staffSuggestions, f.staff] : staffSuggestions).map((n) => <option key={n} value={n}>{n}{worksOn(n, f.start.slice(0, 10)) ? '' : '（当天休息）'}</option>)}
            </select>
            {f.staff && !worksOn(f.staff, f.start.slice(0, 10)) && <span className="mt-1.5 block text-xs text-rose-700">{f.staff} 这天休息，不能安排预约；请换一位员工或换个日期</span>}
            {f.staff && staffRest(f.staff, f.start.slice(0, 10)) && startMin < staffRest(f.staff, f.start.slice(0, 10)).endMin && staffRest(f.staff, f.start.slice(0, 10)).startMin < startMin + durationMin && (
              <span className="mt-1.5 block text-xs text-rose-700">{f.staff} 这天 {hhmm(staffRest(f.staff, f.start.slice(0, 10)).startMin)}–{hhmm(staffRest(f.staff, f.start.slice(0, 10)).endMin)} 休息，这个时间段不能安排预约</span>
            )}
            {f.staff && worksOn(f.staff, f.start.slice(0, 10)) && staffHours(f.staff, f.start.slice(0, 10)) && (startMin < staffHours(f.staff, f.start.slice(0, 10)).startMin || startMin + durationMin > staffHours(f.staff, f.start.slice(0, 10)).endMin) && (
              <span className="mt-1.5 block text-xs text-rose-700">{f.staff} 的出勤时间是 {hhmm(staffHours(f.staff, f.start.slice(0, 10)).startMin)}–{hhmm(staffHours(f.staff, f.start.slice(0, 10)).endMin)}，这个时间段不在其中</span>
            )}
          </Field>
        </div>
        <Field label="服务项目 *">
          <ServiceCombo
            value={f.service}
            onChange={(value) => pickService({ target: { value } })}
            placeholder={catalog.length ? '点开选择，或输入搜索（中/英文）' : '选择或输入'}
            options={menuOptions}
          />
          {catalog.length > 0 && !customService && <span className="mt-1.5 block text-xs text-gold">已链接官网项目：自动带出时长与价格（{manualPrice ? '手动价格' : TIERS.find(([k]) => k === tier)[1]}）</span>}
        </Field>
        {customService && (
          <Field label="项目类别 *">
            <select className={inputCls} value={f.category} onChange={(e) => pickCategory(e.target.value)} required={!appt || f.service !== appt.service}>
              <option value="">请选择这个自定义项目属于哪一类</option>
              {CUSTOM_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </Field>
        )}
        {extras.map((x, i) => {
          const custom = !!x.service.trim() && !catalog.some((c) => c.value === x.service)
          return (
            <div key={i} className="rounded-2xl border border-ink/10 p-3">
              <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted">
                <span>第 {i + 2} 个项目</span>
                <button type="button" onClick={() => removeExtra(i)} className="inline-flex items-center gap-1 text-rose-700" aria-label="删除这个项目"><X size={14} /> 删除</button>
              </div>
              <ServiceCombo value={x.service} onChange={(value) => pickExtra(i, value)} placeholder="点开选择，或输入搜索（中/英文）" options={menuOptions} />
              {custom && (
                <select className={`${inputCls} mt-2`} value={x.category} onChange={(e) => changeExtra(i, { category: e.target.value })} required aria-label="项目类别">
                  <option value="">请选择这个自定义项目属于哪一类</option>
                  {CUSTOM_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              )}
              {x.service.trim() && <p className="mt-1.5 text-xs text-muted">这个项目：{x.durationMin ? `${x.durationMin} 分钟` : '时长未定'}{x.price ? ` · $${x.price}` : ''}（已计入下面的合计，可在下面改）</p>}
            </div>
          )
        })}
        <button type="button" onClick={addExtra} className="inline-flex items-center gap-1.5 self-start rounded-full border border-dashed border-gold px-3.5 py-1.5 text-sm text-gold hover:bg-gold hover:text-ivory"><Plus size={15} /> 增加项目（同时预约多个）</button>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="日期 *"><input className={inputCls} type="date" value={date} onChange={(e) => e.target.value && setF({ ...f, start: `${e.target.value}T${f.start.slice(11, 16)}` })} required  onClick={openPicker} onFocus={openPicker} /></Field>
          <Field label="时长">
            <select className={inputCls} value={durationMin} onChange={(e) => setF({ ...f, durationMin: Number(e.target.value) })}>
              {durations.map((m) => <option key={m} value={m}>{m >= 60 ? `${Math.floor(m / 60)} 小时${m % 60 ? ` ${m % 60} 分钟` : ''}` : `${m} 分钟`}</option>)}
            </select>
          </Field>
        </div>
        <div>
          <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="text-xs font-medium text-muted">开始时间（上下滚动选择）</span>
            <span className={`text-xs font-medium ${clash ? 'text-rose-700' : 'text-gold'}`}>
              {hhmm(startMin)} – {hhmm(startMin + durationMin)}
            </span>
          </div>
          <TimeWheel startMin={startMin} onPick={pickSlot} />
          {clash && <p role="alert" className="mt-2 text-xs text-rose-700">与「{customerById[clash.customerId]?.name || '其他客户'} · {clash.service}」在同一房间的时间冲突，保存时会被拒绝。</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="价格（$）">
            {manualPrice ? (
              <div className="flex gap-2">
                <input className={`${inputCls} min-w-0 flex-1`} type="number" min="0" step="0.01" value={f.price} onChange={set('price')} placeholder="手动输入价格" autoFocus={tierPicked === 'manual'} aria-label="价格" />
                {serviceHit && tierPrice && (
                  <button type="button" onClick={() => pickTier(tier)} className="btn-ghost !py-2 shrink-0 text-sm">选价格类型</button>
                )}
              </div>
            ) : (
              <select className={inputCls} value={tier} onChange={(e) => pickTier(e.target.value)} aria-label="价格类型">
                {TIERS.map(([k, l]) => <option key={k} value={k}>{l} ${priceByTier(serviceHit, k)}</option>)}
                <option value="manual">手动输入价格…</option>
              </select>
            )}
          </Field>
          <Field label="状态">
            <select className={inputCls} value={f.status} onChange={set('status')}>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </Field>
        </div>
        <Field label="客户来源">
          <select className={inputCls} value={f.source} onChange={set('source')}>
            <option value="">未选择</option>
            {CUSTOMER_SOURCES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </Field>
        <Field label="备注"><textarea className={inputCls} rows={2} value={f.notes} onChange={(e) => { notesTouched.current = true; set('notes')(e) }} /></Field>
        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        {appt && onDocs && ['scheduled', 'checked-in', 'in-service', 'completed'].includes(appt.status) && (
          <button type="button" onClick={() => { onClose(); onDocs(appt) }} className="inline-flex items-center gap-1.5 text-sm text-gold underline underline-offset-4"><FileSignature size={15} /> 文件签署 / Before After 照片</button>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost !py-2.5">取消</button>
          <button className="btn-primary !py-2.5" disabled={busy}>保存</button>
        </div>
        {canDeleteAppt && (askDelete ? (
          <div className="space-y-2 rounded-xl bg-rose-50 px-4 py-3">
            <p className="text-sm text-rose-800">确定删除这个预约？删除后无法恢复。{payments.filter((p) => p.appointmentId === appt.id).length > 0 && `账目里它的 ${payments.filter((p) => p.appointmentId === appt.id).length} 笔记录也会一并删除。`}</p>
            <div className="flex gap-2">
              <button type="button" disabled={busy} onClick={async () => { setBusy(true); setError(''); try { await remove('appointments', appt.id); onClose() } catch (err) { setError(err.message); setBusy(false) } }} className="flex-1 rounded-full bg-rose-600 py-2.5 text-sm text-white hover:bg-rose-700">确定删除</button>
              <button type="button" onClick={() => setAskDelete(false)} className="flex-1 rounded-full border border-ink/15 bg-white py-2.5 text-sm hover:bg-sand/70">不删除</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setAskDelete(true)} className="mt-1 w-full rounded-full border border-rose-200 py-2.5 text-sm text-rose-700 hover:bg-rose-50">删除预约</button>
        ))}
      </form>
    </Modal>
  )
}

const FILTERS = [
  { id: 'upcoming', label: '即将到来' },
  { id: 'all', label: '全部' },
  { id: 'completed', label: '已完成' },
  { id: 'cancelled', label: '已取消' },
]

export default function Appointments() {
  const { appointments, payments, customerById, remove, save, blocks, hours, reload, roster } = useCrm()
  const { can, user } = useAuth()
  const canDelete = can('deleteAppointments')
  const canBlock = can('manageBlocks')
  const navigate = useNavigate()
  const paidIds = useMemo(() => new Set(payments.map((p) => p.appointmentId).filter(Boolean)), [payments])
  const [view, setView] = useState(() => {
    try {
      const v = localStorage.getItem('crm.apptView2')
      return ['list', 'calendar', 'day'].includes(v) ? v : 'day'
    } catch { return 'day' }
  })
  const [resetKey, setResetKey] = useState(0) // bumped by the 今天 tab so the calendar returns to today even when already on the day view
  const [openDate, setOpenDate] = useState(null) // the day picked in the month view: the day view opens on it
  const changeView = (v) => {
    setOpenDate(null)
    if (v === 'day') setResetKey((k) => k + 1)
    setView(v)
    try { localStorage.setItem('crm.apptView2', v) } catch { /* storage unavailable */ }
  }
  // Tapping 预约 in the menu (even while already on this page) lands on today's timeline.
  const location = useLocation()
  useEffect(() => { if (location.state?.day) changeView('day') }, [location.key]) // eslint-disable-line react-hooks/exhaustive-deps
  const [filter, setFilter] = useState('upcoming')
  const [listOffset, setListOffset] = useState(0) // the other lists show one month at a time: months from this one (-1 = last month)
  const listRange = useMemo(() => (view !== 'list' ? null : filter === 'upcoming' ? upcomingRange() : monthOffsetRange(listOffset)), [view, filter, listOffset])
  useApptWindow('list', listRange)
  const [staffFilter, setStaffFilter] = useState('') // picking one staff member shows every booking related to them (they serve it, or they referred the customer), in every view
  const [editing, setEditing] = useState(null)
  // An admin's list shows the owner's payments blanked out; to change or delete one the real row is fetched.
  const openOwnerPayment = async (a) => {
    const stub = payments.find((p) => p.appointmentId === a.id)
    try { setCompleting({ ...a, fullPayment: await api(`/crm/payments/${stub.id}`) }) } catch (err) { alert(err.message) }
  }
  const [completing, setCompleting] = useState(null) // appointment being completed via the payment form
  const [docsFor, setDocsFor] = useState(null) // { appt, mode }: just checked in (consent form + before photos) or put in service (after photos)
  const [error, setError] = useState('')

  const groups = useMemo(() => {
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0)
    let rows = staffFilter ? appointments.filter((a) => relatedTo(a, staffFilter)) : appointments
    if (filter === 'upcoming') rows = rows.filter((a) => a.status === 'scheduled' && new Date(a.start) >= startOfToday)
    if (filter === 'completed') rows = rows.filter((a) => a.status === 'completed' || a.status === 'no-show')
    if (filter === 'cancelled') rows = rows.filter((a) => a.status === 'cancelled')
    rows = [...rows].sort((a, b) => (filter === 'upcoming' ? a.start.localeCompare(b.start) : b.start.localeCompare(a.start)))
    const map = new Map()
    for (const a of rows) {
      const k = dayKey(a.start)
      if (!map.has(k)) map.set(k, [])
      map.get(k).push(a)
    }
    return [...map.entries()]
  }, [appointments, filter, staffFilter])

  // `asked` is true when the caller already confirmed (the calendar menu has its own in-page confirmation).
  // Deleting a booking gives the member card back what the visit took. When the checkout also loaded money onto the card, the person
  // chooses whether that top-up goes too (the dialog shows the card balance before and after); other bookings just ask once.
  const [delAsk, setDelAsk] = useState(null) // { a, undo }
  const del = async (a, asked = false) => {
    const rows = payments.filter((p) => p.appointmentId === a.id)
    if (rows.some((p) => p.topUp > 0)) { setDelAsk({ a, undo: true }); return }
    if (!asked && !window.confirm(`确定删除这个预约？${rows.length ? `账目里它的 ${rows.length} 笔记录也会一并删除。` : ''}`)) return
    setError('')
    try { await remove('appointments', a.id) } catch (err) { setError(err.message) }
  }
  const confirmDelete = async () => {
    const { a, undo } = delAsk
    setDelAsk(null)
    setError('')
    try { await remove('appointments', a.id, undo ? '?undoTopUp=1' : '') } catch (err) { setError(err.message) }
  }
  // The customer's card balance after deleting `a`: the same rules the server applies (a top-up stays unless it is undone too).
  const balanceAfterDelete = (a, undo) => {
    const rest = payments.filter((p) => p.appointmentId !== a.id).concat(undo ? [] : payments.filter((p) => p.appointmentId === a.id && p.topUp > 0).map((p) => ({ ...p, amount: 0, tipAmount: 0, giftUsed: '', paymentMethod: p.topUpMethod || 'cash', tipMethod: p.topUpMethod || 'cash' })))
    return cardBalance(rest, a.customerId)
  }

  // The upload window (consent form + before photos at check in, after photos in service) only opens when something is still missing
  // on this record, so a booking that already has them is not asked again.
  const askDocs = async (a, mode) => {
    if (await docsMissing(a, customerById[a.customerId]?.name, mode)) setDocsFor({ appt: a, mode })
  }

  // Status taken from the double-click menu (check in → in service → check out, or no-show / cancelled).
  const setStatus = async (a, status) => {
    setError('')
    // Check out always opens the settlement screen (amount, tip, payment method); one that was already paid opens its payment to review.
    if (status === 'completed') { setCompleting(a); return }
    try {
      await save('appointments', a.id, {
        customerId: a.customerId, service: a.service, start: a.start, durationMin: a.durationMin, price: a.price, status,
        room: a.room || '', staff: a.staff || '', notes: a.notes || '',
      })
      if (status === 'checked-in' && a.status !== 'checked-in') askDocs(a, 'checkin')
      else if (status === 'in-service' && a.status !== 'in-service') askDocs(a, 'service')
    } catch (err) { setError(err.message) }
  }

  // Dragging a booking on the calendar saves its new start time / room; a clash is refused by the server and shown here.
  const move = async (a, { start, room }) => {
    setError('')
    const rule = roomRule(a.service)
    if (rule?.must && room !== rule.room) { setError(`「${a.service}」必须安排在${roomOf(rule.room).name}`); return }
    try {
      await save('appointments', a.id, {
        customerId: a.customerId, service: a.service, start, durationMin: a.durationMin, price: a.price, status: a.status,
        room, staff: a.staff || '', notes: a.notes || '', fullRoom: !!a.fullRoom && (roomOf(room).beds || 1) > 1,
      })
    } catch (err) { setError(err.message) }
  }

  // Dragging a business-hours boundary on the calendar saves the new opening / closing time for everyone.
  const saveHours = async (patch) => {
    setError('')
    try { await api('/crm/settings', { method: 'PUT', body: patch }); await reload() } catch (err) { setError(err.message) }
  }

  // Moving or resizing a blocked-time box on the calendar saves its new time / room.
  const saveBlock = async (k, patch) => {
    setError('')
    try { await save('blocks', k.id, { room: k.room, start: k.start, durationMin: k.durationMin, reason: k.reason || '', ...patch }) } catch (err) { setError(err.message) }
  }

  // Resize handles on the calendar: a new length (bottom edge) or taking / releasing the whole double room (right edge).
  const resize = async (a, patch) => {
    setError('')
    try {
      await save('appointments', a.id, {
        customerId: a.customerId, service: a.service, start: a.start, durationMin: a.durationMin, price: a.price, status: a.status,
        room: a.room || '', staff: a.staff || '', notes: a.notes || '', fullRoom: !!a.fullRoom, ...patch,
      })
    } catch (err) { setError(err.message) }
  }

  return (
    <>
      <PageTitle compact title="预约" sub="可一键加入 Google 日历">
        <div className="flex rounded-full bg-white p-0.5 text-sm shadow-sm ring-1 ring-ink/10" role="group" aria-label="显示方式">
          {[['day', '当日', Clock], ['list', '列表', LayoutList], ['calendar', '日历', CalendarDays]].map(([v, l, Icon]) => (
            <button key={v} onClick={() => changeView(v)} aria-pressed={view === v}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 transition ${view === v ? 'bg-ink text-ivory' : 'text-muted hover:text-ink'}`}>
              <Icon size={15} /> {l}
            </button>
          ))}
        </div>
        <button onClick={() => setEditing('new')} className="btn-primary !py-2.5"><Plus size={16} /> 新增预约</button>
      </PageTitle>

      {error && <p role="alert" className="mb-4 rounded-xl bg-rose-100 px-4 py-2.5 text-sm text-rose-800">{error}</p>}

      {view === 'day' || view === 'calendar' ? (
        <CalendarView
          key={`${view}-${resetKey}`}
          staff={staffFilter}
          onStaff={setStaffFilter}
          modes={view === 'day' ? ['day'] : ['week', 'month']}
          appointments={appointments}
          customerById={customerById}
          onEdit={setEditing}
          onCreate={(iso, room, durationMin) => setEditing({ draftStart: iso, draftRoom: room, draftDuration: durationMin })}
          onMove={move}
          onDelete={canDelete ? (a) => del(a, true) : undefined}
          onResize={resize}
          onStatus={setStatus}
          paidCount={(a) => payments.filter((p) => p.appointmentId === a.id).length}
          hasTopUp={(a) => payments.some((p) => p.appointmentId === a.id && p.topUp > 0)}
          blocks={blocks}
          onEditBlock={canBlock ? (k) => setEditing({ block: k }) : undefined}
          onSaveBlock={canBlock ? saveBlock : undefined}
          onSaveHours={user?.role === 'admin' || user?.role === 'owner' ? saveHours : undefined}
          initialDate={openDate}
          onOpenDay={(d) => { setView('day'); setOpenDate(d); try { localStorage.setItem('crm.apptView2', 'day') } catch { /* storage unavailable */ } }}
          onDeleteBlock={canBlock ? (k) => remove('blocks', k.id).catch((err) => setError(err.message)) : undefined}
        />
      ) : (
        <>
      <div className="mb-5 flex gap-2 overflow-x-auto">
          {can('viewAllAppointments') && (
            <select value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)} aria-label="按员工筛选" className="order-last ml-auto shrink-0 rounded-full border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold">
              <option value="">全部员工</option>
              {withStaff(appointments.map((a) => a.staff), roster).map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          )}
          {FILTERS.map((x) => (
            <button key={x.id} onClick={() => setFilter(x.id)} className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${filter === x.id ? 'bg-ink text-ivory' : 'bg-white text-muted hover:text-ink'}`}>{x.label}</button>
          ))}
        </div>
  
        {filter !== 'upcoming' && listRange && (
          <div className="mb-4 flex items-center justify-center gap-4 text-sm">
            <button onClick={() => setListOffset((o) => o - 1)} className="rounded-full border border-ink/15 bg-white px-3 py-1.5 hover:border-gold" aria-label="上个月">‹</button>
            <span className="min-w-28 text-center font-medium">{new Date(listRange.start).toLocaleDateString('zh-CN', { timeZone: 'America/Los_Angeles', year: 'numeric', month: 'long' })}</span>
            <button onClick={() => setListOffset((o) => o + 1)} className="rounded-full border border-ink/15 bg-white px-3 py-1.5 hover:border-gold" aria-label="下个月">›</button>
            {listOffset !== 0 && <button onClick={() => setListOffset(0)} className="text-gold hover:underline">本月</button>}
          </div>
        )}
        {groups.length === 0 ? <Card><Empty>没有符合的预约</Empty></Card> : (
          <div className="space-y-6">
            {groups.map(([day, rows]) => (
              <section key={day}>
                <h2 className="mb-2 px-1 text-sm font-medium text-muted">{fmtDay(rows[0].start)}</h2>
                <Card>
                  <ul className="divide-y divide-ink/10">
                    {rows.map((a) => {
                      const name = customerById[a.customerId]?.name || '（已删除客户）'
                      return (
                        <li key={a.id}
                          // Tapping anywhere on the row opens the booking to edit; the little buttons and links on it keep their own jobs.
                          onClick={(e) => { if (!e.target.closest('button, a')) setEditing(a) }}
                          className="flex cursor-pointer flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4 transition hover:bg-sand/40">
                          <div className="w-24 shrink-0 text-sm"><p className="font-medium">{fmtTime(a.start)}</p><p className="text-xs text-muted">{a.durationMin} 分钟</p></div>
                          <div className="min-w-0 flex-1 basis-48">
                            <p className={`truncate font-medium ${a.paymentDeleted ? 'line-through opacity-60' : ''}`}>{a.service}</p>
                            <p className={`truncate text-sm text-muted ${a.paymentDeleted ? 'line-through opacity-60' : ''}`}>{name}</p>
                          {(a.room || a.staff) && (
                            <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted">
                              <i className={`h-2 w-2 shrink-0 rounded-full ${roomOf(a.room).dot}`} />
                              {a.room ? roomOf(a.room).name : ''}{a.room && a.staff ? ' · ' : ''}{a.staff}
                            </p>
                          )}
                          {a.source && <p className="mt-0.5 truncate text-xs text-muted">客户来源：{a.source}</p>}
                          </div>
                          <StatusBadge status={a.status} />
                          {a.paymentDeleted && <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">付款：未结算</span>}
                          <p className="w-16 text-right text-sm text-muted">{a.price && a.status !== 'cancelled' && a.status !== 'no-show' ? money(a.price) : ''}</p>
                          <div className="flex gap-1">
                            {a.status === 'completed' && (paidIds.has(a.id)
                            ? (payments.find((p) => p.appointmentId === a.id)?.hidden
                              ? <button onClick={() => openOwnerPayment(a)} className="px-2 text-xs text-emerald-700 underline" title="修改或删除这笔收款">已记账</button>
                              : <span className="px-2 text-xs text-emerald-700">已记账</span>)
                            : <button onClick={() => navigate('/crm/finance', { state: { appointmentId: a.id } })} className="grid h-9 w-9 place-items-center rounded-full text-gold hover:bg-sand" aria-label="记账" title="记账"><HandCoins size={16} /></button>)}
                          {a.status === 'scheduled' && (
                              <button onClick={() => setCompleting(a)} className="grid h-9 w-9 place-items-center rounded-full text-emerald-700 hover:bg-emerald-50" aria-label="完成并记账" title="完成并记账"><Check size={16} /></button>
                            )}
                            {['scheduled', 'checked-in', 'in-service', 'completed'].includes(a.status) && (
                              <button onClick={() => setDocsFor({ appt: a, mode: 'all' })} className="grid h-9 w-9 place-items-center rounded-full text-gold hover:bg-sand" aria-label="文件签署 / 照片" title="文件签署 / Before After 照片"><FileSignature size={16} /></button>
                            )}
                            <a href={googleCalendarUrl(a, name, LOCATION)} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full hover:bg-sand" aria-label="加入 Google 日历" title="加入 Google 日历"><CalendarPlus size={16} /></a>
                            <button onClick={() => setEditing(a)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-sand" aria-label="编辑"><Pencil size={16} /></button>
                            {canDelete && <button onClick={() => del(a)} className="grid h-9 w-9 place-items-center rounded-full text-rose-700 hover:bg-rose-50" aria-label="删除"><Trash2 size={16} /></button>}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </Card>
              </section>
            ))}
          </div>
        )}
        </>
      )}

      {delAsk && (
        <Modal inset title="删除预约" onClose={() => setDelAsk(null)}>
          <p className="text-sm"><b>{customerById[delAsk.a.customerId]?.name || '客户'}</b> · {delAsk.a.service}（{fmtDateTime(delAsk.a.start)}）</p>
          <p className="mt-2 text-sm text-muted">删除后无法恢复，账目里这个预约的记录会一起删除，这次消费用掉的会员卡余额和赠送项目会退回。</p>
          <label className="mt-3 flex cursor-pointer items-start gap-2 rounded-xl bg-sand px-3 py-2.5 text-sm">
            <input type="checkbox" checked={delAsk.undo} onChange={(e) => setDelAsk({ ...delAsk, undo: e.target.checked })} className="mt-0.5 h-4 w-4 accent-rose-600" />
            <span>
              <b>同时撤销这次的充值（{money(payments.filter((p) => p.appointmentId === delAsk.a.id).reduce((n, p) => n + (p.topUp || 0), 0))}）</b>
              <span className="block text-xs text-muted">勾选：充值和赠送的余额也一起取消，会员卡余额相应减少。不勾选：充值保留。</span>
            </span>
          </label>
          <dl className="mt-3 rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-ink/10">
            <div className="flex justify-between"><dt className="text-muted">现在的会员卡余额</dt><dd>{money(cardBalance(payments, delAsk.a.customerId))}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">删除后的会员卡余额</dt><dd className="font-medium">{money(balanceAfterDelete(delAsk.a, delAsk.undo))}</dd></div>
          </dl>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setDelAsk(null)} className="btn-ghost !py-2.5">取消</button>
            <button type="button" onClick={confirmDelete} className="rounded-full bg-rose-600 px-5 py-2.5 text-sm text-white hover:bg-rose-700">确定删除</button>
          </div>
        </Modal>
      )}
      {completing && <PaymentForm key={completing.id} fromAppointment={completing} payment={completing.fullPayment || payments.find((p) => p.appointmentId === completing.id)} canRemove={!!completing.fullPayment} completeAppointment onClose={() => setCompleting(null)} />}

      {editing && editing.block && <BlockForm key={editing.block.id} block={editing.block} onClose={() => setEditing(null)} />}
      {editing && !editing.block && (
        <ApptForm
          appt={editing === 'new' || editing.draftStart ? null : editing}
          draftStart={editing.draftStart}
          draftRoom={editing.draftRoom}
          draftDuration={editing.draftDuration}
          onClose={() => setEditing(null)}
          onCheckedIn={askDocs}
          onDocs={(a) => setDocsFor({ appt: a, mode: 'all' })}
        />
      )}
      {docsFor && <CheckInDocs key={`${docsFor.appt.id}-${docsFor.mode}`} appt={docsFor.appt} mode={docsFor.mode} customer={customerById[docsFor.appt.customerId]} onClose={() => setDocsFor(null)} />}
    </>
  )
}
