import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Bell, CalendarOff, ChevronRight, KeyRound, Plus, Trash2, UserCheck, UserX, X } from 'lucide-react'
import { api } from '../api'
import { Card, Empty, Field, Modal, PageTitle, inputCls } from './ui'
import { DEFAULT_ROOM_STAFF } from './staff'
import { ROOMS } from './rooms'
import { useCrm } from './data'

// What the manager can switch on for an account. Everything is off by default: an operator sees only their own bookings.
export const PERMISSION_OPTIONS = [
  { key: 'viewAllAppointments', label: '查看所有员工的预约', hint: '否则只看到负责员工是自己的预约' },
  { key: 'viewAllCustomers', label: '查看所有客户', hint: '否则只看到和自己预约、账目有关的客户' },
  { key: 'viewAllFinance', label: '查看所有账目和员工业绩', hint: '否则只看到自己的收款和业绩' },
  { key: 'assignOthers', label: '可为其他员工安排预约和记账', hint: '否则预约和收款的负责员工固定是自己' },
  { key: 'manageBlocks', label: '屏蔽时间（不接受预约）', hint: '新增、拖动、删除屏蔽的时间段' },
  { key: 'deleteAppointments', label: '删除预约', hint: '' },
  { key: 'deletePayments', label: '删除账目（收款记录）', hint: '' },
  { key: 'deleteCustomers', label: '删除客户', hint: '会连带删除该客户的预约和账目' },
]

// ---- 员工管理 (store manager only) ----
// The list of staff comes first. Adding a name (or tapping one) opens that person's own page: login account, contact details
// and alerts, and attendance.

const accountsOf = (users, name) => (users || []).filter((u) => u.staffName === name)

export default function StaffAccounts() {
  const { roster, reload } = useCrm()
  const navigate = useNavigate()
  const [users, setUsers] = useState(null)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { api('/crm/users').then(setUsers).catch((e) => setError(e.message)) }, [])

  const add = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const n = name.trim()
      await api('/crm/staff-list', { method: 'POST', body: { name: n } })
      await reload()
      navigate(`/crm/staff/${encodeURIComponent(n)}`)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <>
      <PageTitle title="员工管理" sub="先添加员工的名字，再进入 TA 的页面设置登录账号、联系方式和出勤" />
      {error && <p role="alert" className="mb-4 rounded-xl bg-rose-100 px-4 py-2.5 text-sm text-rose-800">{error}</p>}

      <Card className="mb-6 p-5">
        <form onSubmit={add} className="flex max-w-md gap-2">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="新员工的名字" maxLength={60} required />
          <button className="btn-primary !py-2.5 shrink-0" disabled={busy}><Plus size={16} /> 添加员工</button>
        </form>
      </Card>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {roster.map((n) => {
          const accts = accountsOf(users, n)
          return (
            <li key={n}>
              <Link to={`/crm/staff/${encodeURIComponent(n)}`} className="block rounded-2xl border border-ink/10 bg-white p-4 transition hover:border-gold hover:shadow-sm">
                <p className="flex items-center gap-2 font-medium">{n}<ChevronRight size={16} className="ml-auto text-muted" /></p>
                <p className="mt-1 text-xs text-muted">
                  {users === null ? '加载中…' : accts.length === 0 ? '还没有登录账号' : accts.map((u) => `${u.username}${u.role === 'admin' ? '（管理员）' : ''}${u.pendingPassword ? ' · 待设置密码' : ''}${u.active === false ? ' · 已停用' : ''}`).join('、')}
                </p>
              </Link>
            </li>
          )
        })}
      </ul>
    </>
  )
}

// One person's page: their login accounts, contact details / alerts, and attendance.
export function StaffDetail() {
  const { name } = useParams()
  const { roster, reload } = useCrm()
  const navigate = useNavigate()
  const [users, setUsers] = useState(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // null | 'new' | user
  const [confirmDel, setConfirmDel] = useState(null)
  const [confirmRemove, setConfirmRemove] = useState(false)

  const load = useCallback(() => api('/crm/users').then(setUsers).catch((e) => setError(e.message)), [])
  useEffect(() => { load() }, [load])

  if (!roster.includes(name)) {
    return (
      <>
        <Link to="/crm/staff" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> 员工列表</Link>
        <Empty>名单里没有「{name}」。</Empty>
      </>
    )
  }
  const accts = accountsOf(users, name)

  const toggle = async (u) => {
    setError('')
    try { await api(`/crm/users/${u.id}`, { method: 'PUT', body: { active: u.active === false } }); await load() } catch (e) { setError(e.message) }
  }
  const del = async (u) => {
    setConfirmDel(null)
    setError('')
    try { await api(`/crm/users/${u.id}`, { method: 'DELETE' }); await load() } catch (e) { setError(e.message) }
  }
  const removeFromRoster = async () => {
    setConfirmRemove(false)
    setError('')
    try { await api(`/crm/staff-list/${encodeURIComponent(name)}`, { method: 'DELETE' }); await reload(); navigate('/crm/staff') } catch (e) { setError(e.message) }
  }

  return (
    <>
      <Link to="/crm/staff" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> 员工列表</Link>
      <PageTitle title={name} sub="这位员工的登录账号、联系方式和出勤">
        <button onClick={() => setConfirmRemove(true)} className="rounded-full border border-rose-200 px-4 py-2 text-sm text-rose-700 hover:bg-rose-50">从名单移除</button>
      </PageTitle>
      {error && <p role="alert" className="mb-4 rounded-xl bg-rose-100 px-4 py-2.5 text-sm text-rose-800">{error}</p>}

      <h2 className="mb-3 text-sm font-medium">登录账号与权限</h2>
      <Card className="mb-6">
        {!users ? <Empty>加载中…</Empty> : accts.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted">
            <p>{name} 还没有登录账号。</p>
            <button onClick={() => setEditing('new')} className="btn-primary mt-4 !py-2.5"><Plus size={16} /> 新增账号</button>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-ink/10">
              {accts.map((u) => (
                <li key={u.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4">
                  <div className="min-w-0 flex-1 basis-48">
                    <p className="truncate font-medium">{u.displayName || u.staffName}{u.active === false && <span className="ml-2 rounded-full bg-stone-200 px-2 py-0.5 text-xs text-stone-600">已停用</span>}{u.role === 'admin' && <span className="ml-2 rounded-full bg-plum/15 px-2 py-0.5 text-xs text-plum-deep">管理员</span>}{u.pendingPassword && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">待设置密码</span>}</p>
                    <p className="text-xs text-muted">登录名 {u.username}{u.email ? ` · ${u.email}` : ' · 未填邮箱'}</p>
                    <p className="mt-1 flex flex-wrap gap-1">
                      {PERMISSION_OPTIONS.filter((o) => u.permissions?.[o.key]).map((o) => <span key={o.key} className="rounded-full bg-gold/15 px-2 py-0.5 text-[0.68rem] text-gold">{o.label}</span>)}
                      {!PERMISSION_OPTIONS.some((o) => u.permissions?.[o.key]) && <span className="text-[0.68rem] text-muted">基础权限：只看自己的预约，不能删除</span>}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(u)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-sand" aria-label="设置权限和密码" title="设置权限和密码"><KeyRound size={16} /></button>
                    <button onClick={() => toggle(u)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-sand" aria-label={u.active === false ? '启用' : '停用'} title={u.active === false ? '启用' : '停用'}>{u.active === false ? <UserCheck size={16} /> : <UserX size={16} />}</button>
                    <button onClick={() => setConfirmDel(u)} className="grid h-9 w-9 place-items-center rounded-full text-rose-700 hover:bg-rose-50" aria-label="删除账号" title="删除账号"><Trash2 size={16} /></button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-ink/10 px-5 py-3"><button onClick={() => setEditing('new')} className="text-sm text-gold hover:underline">+ 再加一个账号</button></div>
          </>
        )}
      </Card>

      <ProfileManager only={name} />

      <ScheduleManager only={name} />

      {editing && <AccountForm user={editing === 'new' ? null : editing} staffName={name} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} />}
      {confirmDel && (
        <Modal title="删除账号" onClose={() => setConfirmDel(null)}>
          <p className="text-sm">确定删除「<b>{confirmDel.displayName || confirmDel.staffName}</b>」的登录账号（{confirmDel.username}）？</p>
          <p className="mt-2 text-xs text-muted">只删除登录账号，TA 的预约和账目记录不受影响。</p>
          <div className="flex justify-end gap-2 pt-5">
            <button type="button" onClick={() => setConfirmDel(null)} className="btn-ghost !py-2.5">取消</button>
            <button type="button" onClick={() => del(confirmDel)} className="rounded-full bg-rose-600 px-5 py-2.5 text-sm text-white hover:bg-rose-700">确定删除</button>
          </div>
        </Modal>
      )}
      {confirmRemove && (
        <Modal title="从名单移除" onClose={() => setConfirmRemove(false)}>
          <p className="text-sm">确定把「<b>{name}</b>」从员工名单移除？</p>
          <p className="mt-2 text-xs text-muted">已有的预约和账目记录不受影响。如果 TA 还有登录账号，需要先删除账号。</p>
          <div className="flex justify-end gap-2 pt-5">
            <button type="button" onClick={() => setConfirmRemove(false)} className="btn-ghost !py-2.5">取消</button>
            <button type="button" onClick={removeFromRoster} className="rounded-full bg-rose-600 px-5 py-2.5 text-sm text-white hover:bg-rose-700">确定移除</button>
          </div>
        </Modal>
      )}
    </>
  )
}

// Contact details for each staff member, used to text / email them when a new appointment is made for them.
function ProfileManager({ only }) {
  const { roster: all } = useCrm()
  const roster = useMemo(() => (only ? [only] : all), [only, all])
  const [data, setData] = useState(null) // { staff: {name: profile}, mailConfigured, log }
  const [drafts, setDrafts] = useState({})
  const [msg, setMsg] = useState({}) // per staff: last save / test message
  const load = useCallback(() => api('/crm/staff-profile').then((d) => { setData(d); setDrafts((cur) => Object.fromEntries(roster.map((n) => [n, cur[n] || { phone: d.staff[n]?.phone || '', email: d.staff[n]?.email || '', carrier: d.staff[n]?.carrier || 'tmobile', notifyEmail: d.staff[n]?.notifyEmail !== false, notifySms: d.staff[n]?.notifySms !== false }]))) }).catch(() => {}), [roster])
  useEffect(() => { load() }, [load])
  const set = (name, k, v) => setDrafts((d) => ({ ...d, [name]: { ...d[name], [k]: v } }))
  const flash = (name, text, ok = true) => setMsg((m) => ({ ...m, [name]: { text, ok } }))
  const save = async (name) => {
    try { await api('/crm/staff-profile', { method: 'PUT', body: { staff: name, ...drafts[name] } }); flash(name, '已保存'); load() } catch (e) { flash(name, e.message, false) }
  }
  const test = async (name) => {
    try {
      await api('/crm/staff-profile', { method: 'PUT', body: { staff: name, ...drafts[name] } })
      const r = await api('/crm/staff-profile/test', { method: 'POST', body: { staff: name } })
      flash(name, `测试提醒：邮件 ${r.email || '—'}；短信 ${r.sms || '—'}`, !/failed/.test(`${r.email}${r.sms}`)); load()
    } catch (e) { flash(name, e.message, false) }
  }
  if (!data) return null
  const label = (v) => (v === 'sent' ? '已发送' : v === 'dry-run' ? '演练（未真发）' : String(v).replace('skipped: ', '未发：').replace('failed: ', '失败：'))
  return (
    <Card className="mb-6 p-5">
      <div className="mb-1 flex items-center gap-2"><Bell size={16} className="text-gold" /><h2 className="text-sm font-medium">员工资料与新预约提醒</h2></div>
      <p className="mb-3 text-xs text-muted">给员工填手机号和邮箱后，有预约安排给 TA（新建，或从别人名下转给 TA）时，系统会自动发短信和邮件提醒。TA 自己建的预约不会提醒 TA。</p>
      {!data.mailConfigured && <p className="mb-3 rounded-xl bg-amber-100 px-4 py-2 text-xs text-amber-900">服务器还没有设置发件邮箱（GMAIL_EMAIL / GMAIL_APP_PASSWORD），所以现在提醒发不出去；资料可以先填好保存。</p>}
      <ul className={only ? 'grid gap-4' : 'grid gap-4 lg:grid-cols-3'}>
        {roster.map((name) => {
          const d = drafts[name]
          if (!d) return null
          const m = msg[name]
          return (
            <li key={name} className="rounded-2xl border border-ink/10 bg-white p-4">
              <p className="mb-3 font-medium">{name}</p>
              <div className="space-y-2.5">
                <Field label="手机号"><input className={inputCls} type="tel" inputMode="tel" value={d.phone} onChange={(e) => set(name, 'phone', e.target.value)} placeholder="例如 425 555 0100" autoComplete="off" /></Field>
                <Field label="手机运营商（短信用）">
                  <select className={inputCls} value={d.carrier} onChange={(e) => set(name, 'carrier', e.target.value)}>
                    <option value="tmobile">T-Mobile</option>
                    <option value="att">AT&T</option>
                    <option value="verizon">Verizon</option>
                  </select>
                </Field>
                <Field label="邮箱"><input className={inputCls} type="email" value={d.email} onChange={(e) => set(name, 'email', e.target.value)} placeholder="name@example.com" autoComplete="off" /></Field>
                <div className="flex gap-4 text-xs">
                  <label className="flex items-center gap-1.5"><input type="checkbox" checked={d.notifySms} onChange={(e) => set(name, 'notifySms', e.target.checked)} className="h-3.5 w-3.5 accent-gold" />短信提醒</label>
                  <label className="flex items-center gap-1.5"><input type="checkbox" checked={d.notifyEmail} onChange={(e) => set(name, 'notifyEmail', e.target.checked)} className="h-3.5 w-3.5 accent-gold" />邮件提醒</label>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => save(name)} className="rounded-lg bg-ink px-3 py-1.5 text-xs text-ivory">保存</button>
                <button type="button" onClick={() => test(name)} disabled={!d.phone && !d.email} className="rounded-lg border border-ink/15 px-3 py-1.5 text-xs hover:bg-sand disabled:opacity-40">保存并发测试提醒</button>
              </div>
              {m && <p className={`mt-2 text-xs ${m.ok ? 'text-emerald-700' : 'text-rose-700'}`}>{m.text}</p>}
            </li>
          )
        })}
      </ul>
      {data.log.length > 0 && (
        <details className="mt-3 text-xs">
          <summary className="cursor-pointer text-muted">最近发出的提醒（{data.log.length}）</summary>
          <ul className="mt-2 space-y-1">
            {data.log.slice(0, 8).map((l, i) => (
              <li key={i} className="rounded-lg bg-sand px-3 py-1.5">{new Date(l.at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })} · {l.staff} · {l.kind === 'test' ? '测试' : l.service} — 邮件：{label(l.email)}；短信：{label(l.sms)}</li>
            ))}
          </ul>
        </details>
      )}
    </Card>
  )
}

const WEEK = ['日', '一', '二', '三', '四', '五', '六']
const QUARTERS = Array.from({ length: 97 }, (_, i) => i * 15) // 00:00 … 24:00 in 15-minute steps
const hm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const niceDate = (s) => { const [y, m, d] = s.split('-').map(Number); return `${m}月${d}日 周${WEEK[new Date(y, m - 1, d).getDay()]}` }

// Attendance: which weekdays each staff member works, plus single rest days and extra working days. Bookings cannot be made
// for someone on a rest day (the calendar and the booking form say so).
function ScheduleManager({ only }) {
  const { schedule, reload, roster: all } = useCrm()
  const roster = useMemo(() => (only ? [only] : all), [only, all])
  const [error, setError] = useState('')
  const [draft, setDraft] = useState({}) // per staff: { date, kind }

  const get = (name) => ({
    weekdays: schedule[name]?.weekdays ?? [0, 1, 2, 3, 4, 5, 6], off: schedule[name]?.off ?? [], on: schedule[name]?.on ?? [],
    startMin: schedule[name]?.startMin ?? null, endMin: schedule[name]?.endMin ?? null, // working hours; null = the clinic's hours
    dayHours: schedule[name]?.dayHours ?? {}, // other hours for single weekdays: { 1: { startMin, endMin } }
    rooms: schedule[name]?.rooms ?? DEFAULT_ROOM_STAFF[name] ?? [], // the rooms this person looks after
    linkRooms: schedule[name]?.linkRooms !== false, // their attendance opens / closes those rooms
    onHours: schedule[name]?.onHours ?? {}, restHours: schedule[name]?.restHours ?? {}, // times on single dates
  })
  const save = async (name, next) => {
    setError('')
    try { await api('/crm/schedule', { method: 'PUT', body: { staff: name, ...next } }); await reload() } catch (e) { setError(e.message) }
  }
  const toggleDay = (name, day) => {
    const s = get(name)
    save(name, { ...s, weekdays: s.weekdays.includes(day) ? s.weekdays.filter((x) => x !== day) : [...s.weekdays, day] })
  }
  // Working hours: pick the start and the end, or clear them to follow the clinic's hours.
  const setHours = (name, which, value) => {
    const s = get(name)
    if (value === '') { save(name, { ...s, startMin: null, endMin: null }); return }
    const m = Number(value)
    let startMin = which === 'start' ? m : s.startMin ?? Math.max(0, m - 8 * 60)
    let endMin = which === 'end' ? m : s.endMin ?? Math.min(24 * 60, m + 8 * 60)
    // Always at least an hour between 出勤 and 退勤: nudge the one that was not just changed.
    if (endMin - startMin < 60) { if (which === 'start') endMin = Math.min(24 * 60, startMin + 60); else startMin = Math.max(0, endMin - 60) }
    save(name, { ...s, startMin, endMin })
  }
  // Different hours for one weekday ("Mondays 10:00–14:00"); clearing either end goes back to the usual hours.
  const setDayHours = (name, day, which, value) => {
    const s = get(name)
    const dh = { ...s.dayHours }
    if (value === '') delete dh[day]
    else {
      const m = Number(value)
      const base = dh[day] || { startMin: s.startMin ?? 9 * 60, endMin: s.endMin ?? 18 * 60 }
      let startMin = which === 'start' ? m : base.startMin
      let endMin = which === 'end' ? m : base.endMin
      if (endMin - startMin < 60) { if (which === 'start') endMin = Math.min(24 * 60, startMin + 60); else startMin = Math.max(0, endMin - 60) }
      dh[day] = { startMin, endMin }
    }
    save(name, { ...s, dayHours: dh })
  }
  const toggleRoom = (name, id) => {
    const s = get(name)
    save(name, { ...s, rooms: s.rooms.includes(id) ? s.rooms.filter((r) => r !== id) : [...s.rooms, id] })
  }
  const removeDate = (name, kind, date) => {
    const s = get(name)
    const onHours = { ...s.onHours }
    const restHours = { ...s.restHours }
    delete onHours[date]; delete restHours[date]
    save(name, { ...s, ...(kind === 'part' ? {} : { [kind]: s[kind].filter((d) => d !== date) }), onHours, restHours })
  }
  const today = ymd(new Date())

  return (
    <Card className="mb-2 p-5">
      <div className="mb-1 flex items-center gap-2"><CalendarOff size={16} className="text-gold" /><h2 className="text-sm font-medium">出勤与休息</h2></div>
      <p className="mb-4 text-xs text-muted">点星期几设置每周固定出勤（深色 = 上班）。某天临时休息或加班，在下面添加特殊日期。休息的员工不能被安排预约。</p>
      {error && <p role="alert" className="mb-3 rounded-xl bg-rose-100 px-4 py-2 text-sm text-rose-800">{error}</p>}
      <ul className={only ? 'grid gap-4' : 'grid gap-4 lg:grid-cols-3'}>
        {roster.map((name) => {
          const s = get(name)
          const dr = draft[name] || { date: '', kind: 'off' }
          return (
            <li key={name} className="rounded-2xl border border-ink/10 bg-white p-4">
              <p className="mb-3 font-medium">{name}</p>
              <div className="grid grid-cols-7 gap-1" role="group" aria-label={`${name} 每周出勤`}>
                {WEEK.map((w, i) => {
                  const on = s.weekdays.includes(i)
                  return <button key={w} type="button" onClick={() => toggleDay(name, i)} aria-pressed={on} title={`周${w}${on ? ' 上班' : ' 休息'}`}
                    className={`rounded-lg py-1.5 text-xs transition ${on ? 'bg-ink text-ivory' : 'bg-sand text-muted line-through'}`}>{w}</button>
                })}
              </div>
              <p className="mt-2 text-xs text-muted">休息：{s.weekdays.length === 7 ? '每天都上班' : WEEK.filter((_, i) => !s.weekdays.includes(i)).map((w) => `周${w}`).join('、') || '—'}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <label className="block"><span className="mb-1 block text-muted">出勤时间</span>
                  <select value={s.startMin ?? ''} onChange={(e) => setHours(name, 'start', e.target.value)} aria-label="出勤时间" className={`${inputCls} !px-2 !py-1.5 text-xs`}>
                    <option value="">跟随营业时间</option>
                    {QUARTERS.slice(0, -1).map((m) => <option key={m} value={m}>{hm(m)}</option>)}
                  </select>
                </label>
                <label className="block"><span className="mb-1 block text-muted">退勤时间</span>
                  <select value={s.endMin ?? ''} onChange={(e) => setHours(name, 'end', e.target.value)} aria-label="退勤时间" className={`${inputCls} !px-2 !py-1.5 text-xs`}>
                    <option value="">跟随营业时间</option>
                    {QUARTERS.slice(1).map((m) => <option key={m} value={m}>{hm(m)}</option>)}
                  </select>
                </label>
              </div>
              <div className="mt-3 rounded-xl border border-ink/10 px-3 py-2 text-xs">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="font-medium">负责房间</span>
                  <label className="flex cursor-pointer items-center gap-1.5 text-muted" title="开启后：这个人休息的日子，他负责的房间自动关闭；有出勤时间的话，房间只在这段时间开放">
                    <input type="checkbox" checked={s.linkRooms} onChange={(e) => save(name, { ...s, linkRooms: e.target.checked })} className="h-3.5 w-3.5 accent-gold" />出勤联动房间开放
                  </label>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ROOMS.map((r) => {
                    const on = s.rooms.includes(r.id)
                    return <button key={r.id} type="button" onClick={() => toggleRoom(name, r.id)} aria-pressed={on}
                      className={`flex items-center gap-1 rounded-full border px-2.5 py-1 transition ${on ? 'border-ink bg-ink text-ivory' : 'border-ink/15 text-muted'} ${!s.linkRooms ? 'opacity-50' : ''}`}><i className={`h-2 w-2 rounded-full ${r.dot}`} />{r.name}</button>
                  })}
                </div>
                <p className="mt-1.5 text-muted">{s.linkRooms ? (s.rooms.length ? '休息日这些房间自动关闭，出勤时间之外房间灰色不开放。' : '没有负责的房间，出勤不影响房间。') : '联动已关闭，出勤不影响房间。'}</p>
              </div>
              <details className="mt-3 rounded-xl border border-ink/10 px-3 py-2 text-xs" open={Object.keys(s.dayHours).length > 0}>
                <summary className="cursor-pointer select-none text-muted">按星期设置不同的时间段{Object.keys(s.dayHours).length > 0 ? `（已设 ${Object.keys(s.dayHours).length} 天）` : ''}</summary>
                <ul className="mt-2 space-y-1.5">
                  {WEEK.map((w, i) => (s.weekdays.includes(i) ? (
                    <li key={w} className="grid grid-cols-[2.2rem_1fr_1fr] items-center gap-1.5">
                      <span className="font-medium">周{w}</span>
                      <select value={s.dayHours[i]?.startMin ?? ''} onChange={(e) => setDayHours(name, i, 'start', e.target.value)} aria-label={`周${w} 出勤时间`} className={`${inputCls} !px-1.5 !py-1 text-xs`}>
                        <option value="">同上</option>
                        {QUARTERS.slice(0, -1).map((m) => <option key={m} value={m}>{hm(m)}</option>)}
                      </select>
                      <select value={s.dayHours[i]?.endMin ?? ''} onChange={(e) => setDayHours(name, i, 'end', e.target.value)} aria-label={`周${w} 退勤时间`} className={`${inputCls} !px-1.5 !py-1 text-xs`}>
                        <option value="">同上</option>
                        {QUARTERS.slice(1).map((m) => <option key={m} value={m}>{hm(m)}</option>)}
                      </select>
                    </li>
                  ) : null))}
                </ul>
                <p className="mt-2 text-muted">不设的星期，用上面的出勤和退勤时间（都没设就跟随营业时间）。</p>
              </details>
              <RestPicker
                name={name}
                off={s.off}
                on={s.on}
                onHours={s.onHours}
                restHours={s.restHours}
                kind={dr.kind || 'off'}
                onKind={(k) => setDraft({ ...draft, [name]: { ...dr, kind: k } })}
                onConfirm={(kind, dates, times) => {
                  // A date is rest (whole day), part-day rest, or an extra working day: never two at once.
                  const off = new Set(s.off.filter((d) => !dates.includes(d)))
                  const on = new Set(s.on.filter((d) => !dates.includes(d)))
                  const onHours = { ...s.onHours }
                  const restHours = { ...s.restHours }
                  for (const d of dates) { delete onHours[d]; delete restHours[d] }
                  for (const d of dates) {
                    if (kind === 'off') { if (times) restHours[d] = times; else off.add(d) }
                    else { on.add(d); if (times) onHours[d] = times }
                  }
                  save(name, { ...s, off: [...off].sort(), on: [...on].sort(), onHours, restHours })
                }}
                onClear={(dates) => {
                  const onHours = { ...s.onHours }
                  const restHours = { ...s.restHours }
                  for (const d of dates) { delete onHours[d]; delete restHours[d] }
                  save(name, { ...s, off: s.off.filter((d) => !dates.includes(d)), on: s.on.filter((d) => !dates.includes(d)), onHours, restHours })
                }}
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {s.off.filter((d) => d >= today).map((d) => (
                  <span key={`off-${d}`} className="flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[0.7rem] text-rose-800">休息 {niceDate(d)}<button type="button" onClick={() => removeDate(name, 'off', d)} aria-label="删除" className="hover:text-rose-950"><X size={11} /></button></span>
                ))}
                {s.on.filter((d) => d >= today).map((d) => (
                  <span key={`on-${d}`} className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[0.7rem] text-emerald-800">加班 {niceDate(d)}{s.onHours[d] ? ` ${hm(s.onHours[d].startMin)}–${hm(s.onHours[d].endMin)}` : ''}<button type="button" onClick={() => removeDate(name, 'on', d)} aria-label="删除" className="hover:text-emerald-950"><X size={11} /></button></span>
                ))}
                {Object.keys(s.restHours).filter((d) => d >= today).sort().map((d) => (
                  <span key={`part-${d}`} className="flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[0.7rem] text-rose-800 ring-1 ring-rose-200">休息 {niceDate(d)} {hm(s.restHours[d].startMin)}–{hm(s.restHours[d].endMin)}<button type="button" onClick={() => removeDate(name, 'part', d)} aria-label="删除" className="hover:text-rose-950"><X size={11} /></button></span>
                ))}
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

// A small month calendar for rest days and extra working days. Click days (or press and drag across a stretch) to select them,
// optionally give the times (an extra work day with its own hours, or a rest that covers only part of the day), then press 确认.
function RestPicker({ name, off, on, onHours, restHours, kind, onKind, onConfirm, onClear }) {
  const [month, setMonth] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1) })
  const [picked, setPicked] = useState([]) // 'YYYY-MM-DD' strings selected but not yet confirmed
  const [drag, setDrag] = useState(null) // { a, b } cell indexes while the mouse is down
  const [startMin, setStartMin] = useState('') // '' = the whole day (rest) / the usual hours (extra work)
  const [endMin, setEndMin] = useState('')
  const dragging = useRef(false)
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const start = new Date(first); start.setDate(1 - first.getDay())
  const cells = Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d })
  const lo = drag ? Math.min(drag.a, drag.b) : -1
  const hi = drag ? Math.max(drag.a, drag.b) : -1
  const hasTimes = startMin !== '' && endMin !== ''
  const timesError = (startMin !== '') !== (endMin !== '') ? '出勤和退勤时间要一起选' : hasTimes && Number(endMin) - Number(startMin) < 15 ? '退勤时间要晚于出勤时间' : ''

  useEffect(() => {
    const end = () => {
      if (!dragging.current) return
      dragging.current = false
      setDrag((cur) => {
        if (cur) {
          const dates = cells.slice(Math.min(cur.a, cur.b), Math.max(cur.a, cur.b) + 1).map(ymd)
          // Selecting is a toggle: a stretch that is entirely selected already is deselected.
          setPicked((p) => (dates.every((d) => p.includes(d)) ? p.filter((d) => !dates.includes(d)) : [...new Set([...p, ...dates])].sort()))
        }
        return null
      })
    }
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
    return () => { window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end) }
  })

  const confirm = () => {
    if (!picked.length || timesError) return
    onConfirm(kind, picked, hasTimes ? { startMin: Number(startMin), endMin: Number(endMin) } : null)
    setPicked([]); setStartMin(''); setEndMin('')
  }
  const timeOptions = (from, to) => QUARTERS.slice(from, to).map((m) => <option key={m} value={m}>{hm(m)}</option>)

  return (
    <div className="mt-3 rounded-xl border border-ink/10 p-2 text-xs">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="grid h-6 w-6 place-items-center rounded-full hover:bg-sand" aria-label="上个月">‹</button>
          <span className="w-20 text-center font-medium">{month.getFullYear()}年{month.getMonth() + 1}月</span>
          <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="grid h-6 w-6 place-items-center rounded-full hover:bg-sand" aria-label="下个月">›</button>
        </div>
        <div className="flex rounded-full bg-sand p-0.5" role="group" aria-label="标记类型">
          {[['off', '休息'], ['on', '加班']].map(([k, l]) => (
            <button key={k} type="button" onClick={() => onKind(k)} aria-pressed={kind === k} className={`rounded-full px-2.5 py-0.5 ${kind === k ? 'bg-white font-medium shadow-sm' : 'text-muted'}`}>{l}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-7 text-center text-muted">{WEEK.map((w) => <span key={w} className="py-0.5">{w}</span>)}</div>
      <div className="grid select-none grid-cols-7 gap-px" style={{ touchAction: 'none' }} aria-label={`${name} 休息日期`}>
        {cells.map((d, i) => {
          const k = ymd(d)
          const inMonth = d.getMonth() === month.getMonth()
          const isOff = off.includes(k)
          const isOn = on.includes(k)
          const isPart = !!restHours[k]
          const preview = (i >= lo && i <= hi) || picked.includes(k)
          return (
            <button
              key={k}
              type="button"
              data-day={k}
              onPointerDown={(e) => { if (e.button !== 0) return; e.preventDefault(); dragging.current = true; setDrag({ a: i, b: i }) }}
              onPointerEnter={() => { if (dragging.current) setDrag((cur) => (cur ? { ...cur, b: i } : cur)) }}
              title={isPart ? `${hm(restHours[k].startMin)}–${hm(restHours[k].endMin)} 休息` : isOn && onHours[k] ? `加班 ${hm(onHours[k].startMin)}–${hm(onHours[k].endMin)}` : undefined}
              className={`grid h-7 place-items-center rounded-md text-[0.7rem] tabular-nums transition ${preview ? 'bg-gold/40 ring-1 ring-gold' : isOff ? 'bg-rose-200 font-medium text-rose-900' : isPart ? 'bg-rose-100 font-medium text-rose-800 ring-1 ring-inset ring-rose-300' : isOn ? 'bg-emerald-200 font-medium text-emerald-900' : inMonth ? 'hover:bg-sand' : 'text-muted/50 hover:bg-sand'} ${k === ymd(new Date()) ? 'underline underline-offset-2' : ''}`}
              aria-label={niceDate(k)}
              aria-pressed={preview || isOff || isOn || isPart}
            >{d.getDate()}</button>
          )
        })}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="block"><span className="mb-0.5 block text-muted">出勤时间</span>
          <select value={startMin} onChange={(e) => setStartMin(e.target.value)} aria-label="所选日期的出勤时间" className={`${inputCls} !px-2 !py-1 text-xs`}>
            <option value="">{kind === 'off' ? '全天休息' : '同平时'}</option>
            {timeOptions(0, -1)}
          </select>
        </label>
        <label className="block"><span className="mb-0.5 block text-muted">退勤时间</span>
          <select value={endMin} onChange={(e) => setEndMin(e.target.value)} aria-label="所选日期的退勤时间" className={`${inputCls} !px-2 !py-1 text-xs`}>
            <option value="">{kind === 'off' ? '全天休息' : '同平时'}</option>
            {timeOptions(1)}
          </select>
        </label>
      </div>
      <p className="mt-1 text-muted">
        {kind === 'off'
          ? (hasTimes ? `只在 ${hm(Number(startMin))}–${hm(Number(endMin))} 休息，其余时间照常上班。` : '不选时间 = 整天休息；选了时间 = 只在这段时间休息。')
          : (hasTimes ? `加班日的出勤时间 ${hm(Number(startMin))}–${hm(Number(endMin))}。` : '不选时间 = 按平时的出勤时间加班；选了时间 = 这天用这个出勤时间。')}
      </p>
      {timesError && <p className="mt-1 text-rose-700">{timesError}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-muted">{picked.length ? `已选 ${picked.length} 天：${picked.length <= 3 ? picked.map((d) => d.slice(5).replace('-', '/')).join('、') : `${picked[0].slice(5).replace('-', '/')} … ${picked[picked.length - 1].slice(5).replace('-', '/')}`}` : '点日期或按住拖动来选择'}</span>
        <span className="ml-auto flex gap-1.5">
          {picked.length > 0 && <button type="button" onClick={() => setPicked([])} className="rounded-lg border border-ink/15 px-2.5 py-1 hover:bg-sand">清除选择</button>}
          {picked.some((d) => off.includes(d) || on.includes(d) || restHours[d]) && <button type="button" onClick={() => { onClear(picked); setPicked([]) }} className="rounded-lg border border-rose-300 px-2.5 py-1 text-rose-700 hover:bg-rose-50">取消所选的标记</button>}
          <button type="button" onClick={confirm} disabled={!picked.length || !!timesError} className="rounded-lg bg-ink px-3 py-1 text-ivory disabled:opacity-40">确认</button>
        </span>
      </div>
      <p className="mt-1.5 text-muted"><span className="inline-block h-2 w-2 rounded-sm bg-rose-300 align-middle" /> 休息 <span className="ml-1 inline-block h-2 w-2 rounded-sm bg-rose-100 align-middle ring-1 ring-rose-300" /> 部分时段休息 <span className="ml-1 inline-block h-2 w-2 rounded-sm bg-emerald-300 align-middle" /> 加班</p>
    </div>
  )
}

function AccountForm({ user, staffName, onClose, onSaved }) {
  const { roster } = useCrm()
  const [f, setF] = useState({ username: user?.username || '', role: user?.role || 'staff', email: user?.email || '', password: '', staffName: user?.staffName || staffName || roster[0] || '', displayName: user?.displayName || '' })
  const [perms, setPerms] = useState(() => Object.fromEntries(PERMISSION_OPTIONS.map((o) => [o.key, !!user?.permissions?.[o.key]])))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const mailText = (m) => (m === 'sent' ? `设置密码的邮件已寄到 ${f.email}` : m === 'dry-run' ? '（测试模式：邮件没有真的寄出，链接在服务器日志里）' : `邮件没有寄出（${m}）`)

  const submit = async (e, sendLink = false) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      let saved
      if (user) saved = await api(`/crm/users/${user.id}`, { method: 'PUT', body: { password: f.password, role: f.role, email: f.email, staffName: f.staffName, displayName: f.displayName, permissions: perms, ...(sendLink ? { sendLink: true } : {}) } })
      else saved = await api('/crm/users', { method: 'POST', body: { username: f.username, role: f.role, email: f.email, staffName: f.staffName, displayName: f.displayName, permissions: perms } })
      if (saved.mail) { setNotice(mailText(saved.mail)); setBusy(false); if (saved.mail !== 'sent' && saved.mail !== 'dry-run') return; setTimeout(onSaved, 1800); return }
      onSaved()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Modal title={user ? `设置 · ${user.displayName || user.staffName}` : '新增员工账号'} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        {!user && <Field label="登录名 *"><input className={inputCls} value={f.username} onChange={set('username')} autoComplete="off" required autoFocus placeholder="例如 rina" /></Field>}
        <Field label="角色">
          <select className={inputCls} value={f.role} onChange={set('role')}>
            <option value="staff">员工（按下面的权限）</option>
            <option value="admin">管理员（店长，全部权限，可管理员工账号）</option>
          </select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="对应员工 *">
            <select className={inputCls} value={f.staffName} onChange={set('staffName')}>
              {(roster.includes(f.staffName) || !f.staffName ? roster : [...roster, f.staffName]).map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
          <Field label="显示名称"><input className={inputCls} value={f.displayName} onChange={set('displayName')} placeholder="不填则用员工名" /></Field>
          <Field label="邮箱 *（设置密码的链接寄到这里）"><input className={inputCls} type="email" value={f.email} onChange={set('email')} autoComplete="off" required placeholder="name@example.com" /></Field>
        </div>
        {user ? (
          <div className="grid items-end gap-4 sm:grid-cols-2">
            <Field label="新密码（不改就留空）"><input className={inputCls} type="text" value={f.password} onChange={set('password')} autoComplete="new-password" minLength={f.password ? 8 : undefined} /></Field>
            <button type="button" onClick={(e) => submit(e, true)} disabled={busy || !f.email} className="rounded-xl border border-ink/15 px-4 py-2.5 text-sm hover:bg-sand disabled:opacity-40">保存并重新寄设置密码邮件</button>
          </div>
        ) : <p className="text-xs text-muted">新账号不用设密码：保存后系统会寄一封邮件，对方点链接自己设置密码（24 小时内有效）。</p>}

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-muted">权限（勾选后这个账号才可以）</span>
            <label className="flex cursor-pointer items-center gap-1.5 text-xs">
              <input type="checkbox" checked={PERMISSION_OPTIONS.every((o) => perms[o.key])} onChange={(e) => setPerms(Object.fromEntries(PERMISSION_OPTIONS.map((o) => [o.key, e.target.checked])))} className="h-3.5 w-3.5 accent-gold" />全选
            </label>
          </div>
          <ul className="divide-y divide-ink/10 rounded-xl border border-ink/10 bg-white">
            {PERMISSION_OPTIONS.map((o) => (
              <li key={o.key}>
                <label className="flex cursor-pointer items-start gap-3 px-4 py-2.5 text-sm hover:bg-sand/50">
                  <input type="checkbox" checked={perms[o.key]} onChange={(e) => setPerms({ ...perms, [o.key]: e.target.checked })} className="mt-0.5 h-4 w-4 accent-gold" />
                  <span><span className="font-medium">{o.label}</span>{o.hint && <span className="block text-xs text-muted">{o.hint}</span>}</span>
                </label>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">所有账号都能：看自己的预约和账目，新建客户和预约，Check in / Check out 结算。改完权限，对方下次操作或切回页面时就会生效。</p>
        </div>
        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        {notice && <p role="status" className="text-sm text-emerald-700">{notice}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost !py-2.5">取消</button>
          <button className="btn-primary !py-2.5" disabled={busy}>保存</button>
        </div>
      </form>
    </Modal>
  )
}
