import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, CalendarPlus, Check, HandCoins, LayoutList, Pencil, Plus, Trash2 } from 'lucide-react'
import { business } from '../data/site'
import { useCrm } from './data'
import CalendarView from './Calendar'
import PaymentForm from './PaymentForm'
import { ROOMS, roomOf } from './rooms'
import { Card, Empty, Field, Modal, PageTitle, StatusBadge, inputCls } from './ui'
import { STATUS, defaultStart, dayKey, fmtDay, fmtTime, googleCalendarUrl, money, toLocalInput } from './format'

const LOCATION = `${business.locations[0].line1}, ${business.locations[0].line2}`

function ApptForm({ appt, draftStart, draftRoom, onClose }) {
  const { customers, appointments, services, save } = useCrm()
  const staffSuggestions = [...new Set(appointments.map((a) => a.staff).filter(Boolean))]
  const [f, setF] = useState({
    customerId: appt?.customerId || customers[0]?.id || '',
    service: appt?.service || '',
    start: appt ? toLocalInput(appt.start) : draftStart ? toLocalInput(draftStart) : defaultStart(),
    durationMin: appt?.durationMin || 60,
    price: appt?.price ?? '',
    status: appt?.status || 'scheduled',
    room: appt?.room || draftRoom || '',
    staff: appt?.staff || '',
    notes: appt?.notes || '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const body = { ...f, start: new Date(f.start).toISOString(), durationMin: Number(f.durationMin), price: f.price === '' ? 0 : Number(f.price) }
      await save('appointments', appt?.id, body)
      onClose()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  if (customers.length === 0) {
    return <Modal title="新增预约" onClose={onClose}><p className="text-sm text-muted">请先到「客户」页新增客户，再建立预约。</p></Modal>
  }

  return (
    <Modal title={appt ? '编辑预约' : '新增预约'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="客户 *">
          <select className={inputCls} value={f.customerId} onChange={set('customerId')} required>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}{c.phone ? ` · ${c.phone}` : ''}</option>)}
          </select>
        </Field>
        <Field label="服务项目 *">
          <input className={inputCls} list="services" value={f.service} onChange={set('service')} required placeholder="选择或输入" />
          <datalist id="services">{services.map((x) => <option key={x.id} value={x.name} />)}</datalist>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="开始时间 *"><input className={inputCls} type="datetime-local" value={f.start} onChange={set('start')} required /></Field>
          <Field label="时长（分钟）"><input className={inputCls} type="number" min="5" step="5" value={f.durationMin} onChange={set('durationMin')} /></Field>
          <Field label="价格（$）"><input className={inputCls} type="number" min="0" step="0.01" value={f.price} onChange={set('price')} /></Field>
          <Field label="状态">
            <select className={inputCls} value={f.status} onChange={set('status')}>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="房间">
            <select className={inputCls} value={f.room} onChange={set('room')}>
              <option value="">未指定</option>
              {ROOMS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </Field>
          <Field label="负责员工">
            <input className={inputCls} list="staff" value={f.staff} onChange={set('staff')} placeholder="输入或选择" />
            <datalist id="staff">{staffSuggestions.map((n) => <option key={n} value={n} />)}</datalist>
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
    try { return localStorage.getItem('crm.apptView') === 'calendar' ? 'calendar' : 'list' } catch { return 'list' }
  })
  const changeView = (v) => {
    setView(v)
    try { localStorage.setItem('crm.apptView', v) } catch { /* storage unavailable */ }
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
          {[['list', '列表', LayoutList], ['calendar', '日历', CalendarDays]].map(([v, l, Icon]) => (
            <button key={v} onClick={() => changeView(v)} aria-pressed={view === v}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 transition ${view === v ? 'bg-ink text-ivory' : 'text-muted hover:text-ink'}`}>
              <Icon size={15} /> {l}
            </button>
          ))}
        </div>
        <button onClick={() => setEditing('new')} className="btn-primary !py-2.5"><Plus size={16} /> 新增预约</button>
      </PageTitle>

      {error && <p role="alert" className="mb-4 rounded-xl bg-rose-100 px-4 py-2.5 text-sm text-rose-800">{error}</p>}

      {view === 'calendar' ? (
        <CalendarView
          appointments={appointments}
          customerById={customerById}
          onEdit={setEditing}
          onCreate={(iso, room) => setEditing({ draftStart: iso, draftRoom: room })}
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
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}
