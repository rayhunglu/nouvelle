import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, CalendarPlus, Check, Clock, HandCoins, LayoutList, Pencil, Plus, Trash2 } from 'lucide-react'
import { business, categories } from '../data/site'
import { useCrm } from './data'
import CalendarView from './Calendar'
import PaymentForm from './PaymentForm'
import TimeAxis from './TimeAxis'
import { durationFor } from './durations'
import { STAFF, withStaff } from './staff'
import { defaultOpenStart, findClash, dayAppointments, hhmm } from './timeline'
import { ROOMS, roomOf } from './rooms'
import { Card, Empty, Field, Modal, PageTitle, StatusBadge, inputCls } from './ui'
import { STATUS, dayKey, fmtDay, fmtTime, googleCalendarUrl, money, toLocalInput } from './format'

// Rooms whose service field follows a category of the public website (slug from webapp/data/site.js):
// 美容单人房 offers 护肤项目 first (with its 60/90-minute packages), then 医美, 美睫 and Spa; 医美双人房 lists 医美 first (injectables, IV drips, devices), then 护肤, 美睫 and Spa; 美睫单人房 lists 美睫 first, then 护肤, 医美 and Spa; 头疗双人房 offers everything (Spa first). Add a room here to link another one.
const ROOM_CATALOG = {
  room1: ['skincare-experts', 'injectables', 'iv-therapy', 'devices', 'lash', 'spa-care'], room2: ['injectables', 'iv-therapy', 'devices', 'skincare-experts', 'lash', 'spa-care'], room3: ['lash', 'skincare-experts', 'injectables', 'iv-therapy', 'devices', 'spa-care'],
  room4: ['spa-care', 'skincare-experts', 'injectables', 'iv-therapy', 'devices', 'lash', 'microblading'] }
// Who a new booking is assigned to by default in each room (other rooms start unassigned; the list lets you pick anyone).
const ROOM_DEFAULT_STAFF = { room1: STAFF[0], room2: STAFF[1], room3: STAFF[2] }
const priceOf = (p) => Number(String(p ?? '').replace(/[^\d.]/g, '')) || undefined
// Website treatment headings that are not booked as such (only their packages are), so they stay out of the service list.
const HIDDEN_SERVICES = new Set(['日式小颜徒手矫正', '修丽可水润修复护理', '中式古法面部刮痧', '瑞士瑞妍生机弹绷护理', '日式淋巴排毒 SPA'])
// Services left out of one room's list only.
const SCALP_SPA = new Set(['日式头皮抗衰 SPA', '日式头皮 · 净澈焕活 SPA 60 分钟', '日式头皮 · 御龄深养 SPA 90 分钟'])
const HIDDEN_IN_ROOM = { room1: SCALP_SPA, room2: SCALP_SPA, room3: SCALP_SPA }
function catalogFor(room) {
  const cats = (ROOM_CATALOG[room] || []).map((slug) => categories.find((c) => c.slug === slug)).filter(Boolean)
  const seen = new Set()
  // 美睫 is booked by style, so its price-list rows (with the single-visit price) stand in for the treatment cards.
  const items = cats.flatMap((c) => (c.priceList ? c.priceList.groups.flatMap((g) => g.rows.map((r) => ({ name: r.name, price: r.member, regularPrice: r.single }))) : c.treatments))
  return items.flatMap((t) => [
    { value: t.name.zh, search: t.name.en, price: priceOf(t.price), regularPrice: priceOf(t.regularPrice) },
    ...(t.packages || []).map((pk) => ({
      value: pk.name.zh,
      search: `${pk.name.en || ''} ${t.name.en || ''}`,
      durationMin: Number((pk.name.zh.match(/(\d+)\s*分钟/) || [])[1]) || undefined,
      price: priceOf(pk.price),
      regularPrice: priceOf(pk.was),
    })),
  ]).filter((o) => !HIDDEN_SERVICES.has(o.value) && !HIDDEN_IN_ROOM[room]?.has(o.value) && !seen.has(o.value) && seen.add(o.value))
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
            const hint = [o.durationMin && `${o.durationMin} 分钟`, o.price && `$${o.price}`].filter(Boolean).join(' · ')
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

function ApptForm({ appt, draftStart, draftRoom, draftDuration, onClose }) {
  const { customers, appointments, services, save, customerById } = useCrm()
  const staffSuggestions = withStaff(appointments.map((a) => a.staff))
  const [f, setF] = useState({
    customerId: appt?.customerId || '', // new bookings start with nobody chosen: search first, then add
    service: appt?.service || '',
    start: appt ? toLocalInput(appt.start) : draftStart ? toLocalInput(draftStart) : defaultOpenStart(),
    durationMin: appt?.durationMin || draftDuration || 60,
    price: appt?.price ?? '',
    status: appt?.status || 'scheduled',
    room: appt?.room || draftRoom || '',
    // New bookings start with the first listed staff member (Rina); existing ones keep what was saved.
    staff: appt ? appt.staff || '' : ROOM_DEFAULT_STAFF[appt?.room || draftRoom || ''] || '',
    notes: appt?.notes || '',
  })
  const [nc, setNc] = useState({ firstName: '', lastName: '', gender: 'female', wechatId: '', wechatNo: '', phone: '', email: '' }) // the customer being added
  const setNew = (k) => (e) => setNc({ ...nc, [k]: e.target.value })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [staffPicked, setStaffPicked] = useState(false) // once someone is chosen by hand, changing the room leaves it alone
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  // New bookings follow the room's default staff member until staff is picked by hand.
  const changeRoom = (e) => {
    const room = e.target.value
    setF({ ...f, room, ...(!appt && !staffPicked ? { staff: ROOM_DEFAULT_STAFF[room] || '' } : {}) })
  }

  // Service suggestions: the linked website category for this room, otherwise the CRM's own list.
  const [autoPrice, setAutoPrice] = useState('') // the last price filled in from the website, so it can be told apart from a typed one
  const catalog = useMemo(() => catalogFor(f.room), [f.room])
  // Member prices apply to members and to a new customer's first visit (the website offers the member price on the
  // first experience); everyone else gets the regular price when the website lists one.
  const customer = customerById[f.customerId]
  const isMember = f.customerId === NEW_CUSTOMER || !!customer?.member
  const priceFor = (hit) => (isMember ? hit?.price : hit?.regularPrice ?? hit?.price)
  const priced = useMemo(() => catalog.map((o) => ({ ...o, price: priceFor(o) })), [catalog, isMember]) // eslint-disable-line react-hooks/exhaustive-deps
  const pickService = (e) => {
    const value = e.target.value
    const hit = catalog.find((x) => x.value === value)
    // Choosing a service fills in its length (from the package, the name, or the defaults table) and its website price;
    // everything stays editable.
    const mins = hit?.durationMin ?? durationFor(value)
    // A price that came from the website is replaced by the next service's price (or cleared when the website has none);
    // a price typed by hand is never touched.
    let price = f.price
    const web = priceFor(hit)
    if (web) { price = String(web); setAutoPrice(price) } else if (f.price === autoPrice) { price = ''; setAutoPrice('') }
    setF({ ...f, service: value, price, ...(mins ? { durationMin: mins } : {}) })
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
    const web = hit ? (member ? hit.price : hit.regularPrice ?? hit.price) : undefined
    if (web && f.price === autoPrice) { setAutoPrice(String(web)); setF({ ...f, customerId, price: String(web) }) } else setF({ ...f, customerId })
  }

  // Start time is edited as a date plus a slot on the day timeline (15-minute steps).
  const date = f.start.slice(0, 10)
  const startMin = Number(f.start.slice(11, 13)) * 60 + Number(f.start.slice(14, 16))
  const durationMin = Number(f.durationMin) || 60
  const pickSlot = (min) => setF({ ...f, start: `${date}T${hhmm(min)}` })
  const clash = findClash(dayAppointments(appointments, date, appt?.id), f.room, startMin, durationMin)
  const durations = [...new Set([...Array.from({ length: 16 }, (_, i) => (i + 1) * 15), durationMin])].sort((a, b) => a - b)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      let customerId = f.customerId
      if (!customerId) throw new Error('请先搜索并选择客户，或点「＋ 新添客户」')
      if (customerId === NEW_CUSTOMER) {
        // The customer is created first; the appointment then points at the new record.
        const made = await save('customers', null, { ...nc, name: [nc.firstName.trim(), nc.lastName.trim()].filter(Boolean).join(' ') })
        customerId = made.id
      }
      const body = { ...f, customerId, start: new Date(f.start).toISOString(), durationMin: Number(f.durationMin), price: f.price === '' ? 0 : Number(f.price) }
      await save('appointments', appt?.id, body)
      onClose()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Modal title={appt ? '编辑预约' : '新增预约'} onClose={onClose}>
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
              <option value="">未指定</option>
              {ROOMS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </Field>
          <Field label="负责员工">
            <select className={inputCls} value={f.staff} onChange={(e) => { setStaffPicked(true); setF({ ...f, staff: e.target.value }) }}>
              <option value="">未指定</option>
              {(f.staff && !staffSuggestions.includes(f.staff) ? [...staffSuggestions, f.staff] : staffSuggestions).map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
        </div>
        <Field label="服务项目 *">
          <ServiceCombo
            value={f.service}
            onChange={(value) => pickService({ target: { value } })}
            placeholder={catalog.length ? '点开选择，或输入搜索（中/英文）' : '选择或输入'}
            options={catalog.length ? priced : services.map((x) => ({ value: x.name }))}
          />
          {catalog.length > 0 && <span className="mt-1.5 block text-xs text-gold">已链接官网项目：自动带出时长与价格（{f.customerId === NEW_CUSTOMER ? '初次体验价' : isMember ? '会员价' : '非会员价'}）</span>}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="日期 *"><input className={inputCls} type="date" value={date} onChange={(e) => e.target.value && setF({ ...f, start: `${e.target.value}T${f.start.slice(11, 16)}` })} required /></Field>
          <Field label="时长">
            <select className={inputCls} value={durationMin} onChange={(e) => setF({ ...f, durationMin: Number(e.target.value) })}>
              {durations.map((m) => <option key={m} value={m}>{m >= 60 ? `${Math.floor(m / 60)} 小时${m % 60 ? ` ${m % 60} 分钟` : ''}` : `${m} 分钟`}</option>)}
            </select>
          </Field>
        </div>
        <div>
          <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="text-xs font-medium text-muted">开始时间（每格 15 分钟，点空白格选择）</span>
            <span className={`text-xs font-medium ${clash ? 'text-rose-700' : 'text-gold'}`}>
              {hhmm(startMin)} – {hhmm(startMin + durationMin)}
            </span>
          </div>
          <TimeAxis date={date} startMin={startMin} durationMin={durationMin} room={f.room} appointments={appointments} customerById={customerById} selfId={appt?.id} clash={clash} onPick={pickSlot} />
          {clash && <p role="alert" className="mt-2 text-xs text-rose-700">与「{customerById[clash.customerId]?.name || '其他客户'} · {clash.service}」在同一房间的时间冲突，保存时会被拒绝。</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="价格（$）"><input className={inputCls} type="number" min="0" step="0.01" value={f.price} onChange={set('price')} /></Field>
          <Field label="状态">
            <select className={inputCls} value={f.status} onChange={set('status')}>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </Field>
        </div>
        <Field label="备注"><textarea className={inputCls} rows={2} value={f.notes} onChange={set('notes')} /></Field>
        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost !py-2.5">取消</button>
          <button className="btn-primary !py-2.5" disabled={busy}>保存</button>
        </div>
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
  const { appointments, payments, customerById, remove } = useCrm()
  const navigate = useNavigate()
  const paidIds = useMemo(() => new Set(payments.map((p) => p.appointmentId).filter(Boolean)), [payments])
  const [view, setView] = useState(() => {
    try {
      const v = localStorage.getItem('crm.apptView2')
      return ['list', 'calendar', 'day'].includes(v) ? v : 'day'
    } catch { return 'day' }
  })
  const changeView = (v) => {
    setView(v)
    try { localStorage.setItem('crm.apptView2', v) } catch { /* storage unavailable */ }
  }
  const [filter, setFilter] = useState('upcoming')
  const [editing, setEditing] = useState(null)
  const [completing, setCompleting] = useState(null) // appointment being completed via the payment form
  const [error, setError] = useState('')

  const groups = useMemo(() => {
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0)
    let rows = appointments
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
  }, [appointments, filter])

  const del = async (a) => {
    if (!window.confirm('确定删除这个预约？')) return
    setError('')
    try { await remove('appointments', a.id) } catch (err) { setError(err.message) }
  }

  return (
    <>
      <PageTitle title="预约" sub="可一键加入 Google 日历">
        <div className="flex rounded-full bg-white p-0.5 text-sm shadow-sm ring-1 ring-ink/10" role="group" aria-label="显示方式">
          {[['day', '日', Clock], ['list', '列表', LayoutList], ['calendar', '日历', CalendarDays]].map(([v, l, Icon]) => (
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
          key={view}
          modes={view === 'day' ? ['day'] : ['week', 'month']}
          appointments={appointments}
          customerById={customerById}
          onEdit={setEditing}
          onCreate={(iso, room, durationMin) => setEditing({ draftStart: iso, draftRoom: room, draftDuration: durationMin })}
        />
      ) : (
        <>
      <div className="mb-5 flex gap-2 overflow-x-auto">
          {FILTERS.map((x) => (
            <button key={x.id} onClick={() => setFilter(x.id)} className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${filter === x.id ? 'bg-ink text-ivory' : 'bg-white text-muted hover:text-ink'}`}>{x.label}</button>
          ))}
        </div>
  
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
                        <li key={a.id} className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4">
                          <div className="w-24 shrink-0 text-sm"><p className="font-medium">{fmtTime(a.start)}</p><p className="text-xs text-muted">{a.durationMin} 分钟</p></div>
                          <div className="min-w-0 flex-1 basis-48">
                            <p className="truncate font-medium">{a.service}</p>
                            <p className="truncate text-sm text-muted">{name}</p>
                          {(a.room || a.staff) && (
                            <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted">
                              <i className={`h-2 w-2 shrink-0 rounded-full ${roomOf(a.room).dot}`} />
                              {a.room ? roomOf(a.room).name : ''}{a.room && a.staff ? ' · ' : ''}{a.staff}
                            </p>
                          )}
                          </div>
                          <StatusBadge status={a.status} />
                          <p className="w-16 text-right text-sm text-muted">{a.price ? money(a.price) : ''}</p>
                          <div className="flex gap-1">
                            {a.status === 'completed' && (paidIds.has(a.id)
                            ? <span className="px-2 text-xs text-emerald-700">已记账</span>
                            : <button onClick={() => navigate('/crm/finance', { state: { appointmentId: a.id } })} className="grid h-9 w-9 place-items-center rounded-full text-gold hover:bg-sand" aria-label="记账" title="记账"><HandCoins size={16} /></button>)}
                          {a.status === 'scheduled' && (
                              <button onClick={() => setCompleting(a)} className="grid h-9 w-9 place-items-center rounded-full text-emerald-700 hover:bg-emerald-50" aria-label="完成并记账" title="完成并记账"><Check size={16} /></button>
                            )}
                            <a href={googleCalendarUrl(a, name, LOCATION)} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full hover:bg-sand" aria-label="加入 Google 日历" title="加入 Google 日历"><CalendarPlus size={16} /></a>
                            <button onClick={() => setEditing(a)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-sand" aria-label="编辑"><Pencil size={16} /></button>
                            <button onClick={() => del(a)} className="grid h-9 w-9 place-items-center rounded-full text-rose-700 hover:bg-rose-50" aria-label="删除"><Trash2 size={16} /></button>
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

      {completing && <PaymentForm fromAppointment={completing} completeAppointment onClose={() => setCompleting(null)} />}

      {editing && (
        <ApptForm
          appt={editing === 'new' || editing.draftStart ? null : editing}
          draftStart={editing.draftStart}
          draftRoom={editing.draftRoom}
          draftDuration={editing.draftDuration}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}
