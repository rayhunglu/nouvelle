import { useMemo, useState } from 'react'
import { Mail, MessageCircle, Pencil, Phone, Plus, Search, Trash2 } from 'lucide-react'
import { useAuth } from '../auth'
import { useCrm } from './data'
import { Card, Empty, Field, Modal, PageTitle, StatusBadge, inputCls } from './ui'
import { MEMBER_TIERS, cardBalance, fmtDateTime, giftItems, giftLabel, money, paidAmount, paidTip, tierOf } from './format'

function TierBadge({ c }) {
  const { payments } = useCrm()
  const t = tierOf(c, payments)
  return t ? <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-medium ${t.chip}`}>{t.label}</span> : null
}

// Last visit = most recent completed appointment or recorded payment.
function lastVisitOf(customerId, appointments, payments) {
  const times = [
    ...appointments.filter((a) => a.customerId === customerId && a.status === 'completed' && !a.paymentDeleted).map((a) => a.start),
    ...payments.filter((p) => p.customerId === customerId).map((p) => p.datetime),
  ]
  return times.length ? times.reduce((a, b) => (a > b ? a : b)) : null
}
const fmtLast = (iso) => (iso ? fmtDateTime(iso) : '尚未到访')

function CustomerForm({ customer, onClose }) {
  const { save, appointments, payments } = useCrm()
  const [f, setF] = useState({
    name: customer?.name || '', phone: customer?.phone || '', email: customer?.email || '', wechatId: customer?.wechatId || '', wechatNo: customer?.wechatNo || '',
    tags: (customer?.tags || []).join(', '), notes: customer?.notes || '', memberTier: customer?.memberTier || (customer?.member ? 'member' : ''),
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const history = customer ? appointments.filter((a) => a.customerId === customer.id).sort((a, b) => b.start.localeCompare(a.start)) : []
  const lastVisit = customer ? lastVisitOf(customer.id, appointments, payments) : null
  const gifts = customer ? giftItems(payments, customer.id) : {}
  const cardBal = customer ? cardBalance(payments, customer.id) : 0
  const spent = customer ? payments.filter((p) => p.customerId === customer.id).reduce((s, p) => s + paidAmount(p), 0) : 0

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await save('customers', customer?.id, { ...f, tags: f.tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean) })
      onClose()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Modal title={customer ? '客户资料' : '新增客户'} onClose={onClose} wide={!!customer} loading={busy}>
      {/* The customer's key details stay pinned at the top while the history below is scrolled. */}
      {customer && (
        <div className="sticky -top-6 z-10 -mx-6 -mt-2 mb-4 border-b border-ink/10 bg-ivory/95 px-6 py-2 backdrop-blur">
          <p className="flex flex-wrap items-center gap-x-2 text-sm font-medium">{customer.name}<TierBadge c={customer} /></p>
          <p className="flex flex-wrap gap-x-3 text-xs text-muted">
            {customer.phone && <span>{customer.phone}</span>}
            {(customer.wechatId || customer.wechatNo) && <span>微信 {[customer.wechatId, customer.wechatNo].filter(Boolean).join(' · ')}</span>}
            <span>累计 <b className="text-ink">{money(spent)}</b></span>
            {cardBal !== 0 && <span>会员卡余额 <b className="text-ink">{money(cardBal)}</b></span>}
          </p>
        </div>
      )}
      <form onSubmit={submit} className="space-y-4">
        <Field label="姓名（选填）"><input className={inputCls} value={f.name} onChange={set('name')} autoFocus placeholder="不填则用微信名 / 电话 / 邮箱代替" /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="电话"><input className={inputCls} value={f.phone} onChange={set('phone')} type="tel" /></Field>
          <Field label="微信名"><input className={inputCls} value={f.wechatId} onChange={set('wechatId')} autoComplete="off" /></Field>
          <Field label="微信号"><input className={inputCls} value={f.wechatNo} onChange={set('wechatNo')} autoComplete="off" /></Field>
        </div>
        <Field label="邮箱"><input className={inputCls} value={f.email} onChange={set('email')} type="email" /></Field>
        <Field label="会员类别（选了就是会员，预约时自动按会员价）">
          <select className={inputCls} value={f.memberTier} onChange={set('memberTier')}>
            <option value="">非会员</option>
            {[...MEMBER_TIERS].reverse().map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          {!f.memberTier && customer && tierOf(customer, payments) && <span className="mt-1 block text-xs text-muted">没有手动选择：按充值累计自动显示为「{tierOf(customer, payments).label}」，选一个就以手动选的为准。</span>}
        </Field>
        <Field label="标签（用逗号分隔）"><input className={inputCls} value={f.tags} onChange={set('tags')} placeholder="VIP, 新客" /></Field>
        <Field label="备注"><textarea className={inputCls} rows={3} value={f.notes} onChange={set('notes')} /></Field>
        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost !py-2.5">取消</button>
          <button className="btn-primary !py-2.5" disabled={busy}>保存</button>
        </div>
      </form>

      {customer && (
        <div className="mt-8 border-t border-ink/10 pt-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-sm font-medium">预约记录（{history.length}）</h3>
            <p className="text-sm text-muted">上次到访 <b className="text-ink">{fmtLast(lastVisit)}</b> · 累计 <b className="text-ink">{money(spent)}</b>{(cardBal !== 0 || payments.some((p) => p.customerId === customer.id && p.topUp > 0)) && <> · 会员卡余额 <b className="text-ink">{money(cardBal)}</b></>}</p>
          </div>
            {Object.keys(gifts).length > 0 && <p className="-mt-1.5 mb-3 text-right text-xs text-emerald-700">赠送项目剩余：{Object.entries(gifts).map(([g, n]) => `${giftLabel(g)} ×${n}`).join('、')}</p>}
          {history.length === 0 ? <p className="text-sm text-muted">暂无预约</p> : (
            <ul className="divide-y divide-ink/10 rounded-xl border border-ink/10 bg-white">
              {history.map((a) => {
                // What this booking cost: its payments (a payment still unsettled is shown as owed), and who served.
                const pays = payments.filter((p) => p.appointmentId === a.id)
                const paid = pays.reduce((n, p) => n + paidAmount(p), 0)
                const owed = pays.filter((p) => p.paymentMethod === 'unsettled').reduce((n, p) => n + p.amount, 0)
                const tip = pays.reduce((n, p) => n + paidTip(p), 0)
                const staff = a.staff || pays.find((p) => p.staff)?.staff
                return (
                  <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                    <div className={`min-w-0 ${a.paymentDeleted ? 'line-through opacity-60' : ''}`}>
                      <p className="truncate font-medium">{a.service}</p>
                      <p className="text-xs text-muted">{fmtDateTime(a.start)}</p>
                      <p className="text-xs text-muted">服务人员：{staff || '—'}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`text-sm font-medium ${pays.length === 0 || a.paymentDeleted ? 'text-muted' : ''}`}>
                        {pays.length === 0 ? '未记账' : paid > 0 ? `消费 ${money(paid)}` : owed > 0 ? `未结算 ${money(owed)}` : '消费 $0'}
                      </p>
                      {tip > 0 && <p className="text-xs text-muted">小费 {money(tip)}</p>}
                      <span className="mt-1 inline-flex items-center gap-2">{a.paymentDeleted && <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">付款：未结算</span>}<StatusBadge status={a.status} /></span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </Modal>
  )
}

export default function Customers() {
  const { customers, appointments, payments, remove } = useCrm()
  const noDelete = !useAuth().can('deleteCustomers') // deleting customers needs the manager's permission
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null) // null | 'new' | customer
  const [error, setError] = useState('')
  const [tierFilter, setTierFilter] = useState('') // '' = everyone, 'none' = not a member, else a member category

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return customers
      .filter((c) => !tierFilter || (tierFilter === 'none' ? !tierOf(c, payments) : tierOf(c, payments)?.id === tierFilter))
      .filter((c) => !needle || `${c.name} ${c.phone} ${c.email} ${c.wechatId || ''} ${c.wechatNo || ''} ${(c.tags || []).join(' ')}`.toLowerCase().includes(needle))
      // Highest category first (VIP, 5000, 3000…), then non-members; by name within each.
      .sort((a, b) => (tierOf(b, payments)?.rank || 0) - (tierOf(a, payments)?.rank || 0) || a.name.localeCompare(b.name, 'zh'))
  }, [customers, payments, q, tierFilter])
  const tierCount = (id) => customers.filter((c) => (id === 'none' ? !tierOf(c, payments) : tierOf(c, payments)?.id === id)).length

  const stats = (id) => ({
    visits: appointments.filter((a) => a.customerId === id && a.status === 'completed' && !a.paymentDeleted).length,
    spent: payments.filter((p) => p.customerId === id).reduce((s, p) => s + paidAmount(p), 0),
    last: lastVisitOf(id, appointments, payments),
  })

  const [confirmDel, setConfirmDel] = useState(null) // customer waiting for the delete confirmation
  const del = async (c) => {
    setConfirmDel(null)
    setError('')
    try { await remove('customers', c.id) } catch (err) { setError(err.message) }
  }

  return (
    <>
      <PageTitle title="客户" sub={`共 ${customers.length} 位`}>
        <button onClick={() => setEditing('new')} className="btn-primary !py-2.5"><Plus size={16} /> 新增客户</button>
      </PageTitle>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input className={`${inputCls} !rounded-2xl !py-3 !pl-11`} placeholder="搜索姓名、电话、微信、邮箱、标签…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="按会员类别筛选">
        <button onClick={() => setTierFilter('')} aria-pressed={tierFilter === ''} className={`rounded-full px-3 py-1 text-xs ${tierFilter === '' ? 'bg-ink text-ivory' : 'bg-white text-muted'}`}>全部 {customers.length}</button>
        {[...MEMBER_TIERS, { id: 'none', label: '非会员', chip: 'bg-stone-200 text-stone-700' }].filter((t) => tierCount(t.id) > 0).map((t) => (
          <button key={t.id} onClick={() => setTierFilter(tierFilter === t.id ? '' : t.id)} aria-pressed={tierFilter === t.id} className={`rounded-full px-3 py-1 text-xs font-medium ${t.chip} ${tierFilter === t.id ? 'ring-2 ring-ink/50' : 'opacity-80 hover:opacity-100'}`}>{t.label} {tierCount(t.id)}</button>
        ))}
      </div>
      {error && <p role="alert" className="mb-4 rounded-xl bg-rose-100 px-4 py-2.5 text-sm text-rose-800">{error}</p>}

      <Card>
        {rows.length === 0 ? <Empty>{customers.length ? '没有符合的客户' : '还没有客户，点右上角新增'}</Empty> : (
          <ul className="divide-y divide-ink/10">
            {rows.map((c) => {
              const s = stats(c.id)
              return (
                <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 min-[480px]:flex-nowrap">
                  <button onClick={() => setEditing(c)} className="flex min-w-0 flex-1 basis-56 items-center gap-3 text-left min-[480px]:basis-0">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sand font-display text-sm text-gold">{c.name.slice(0, 1)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 truncate text-sm font-medium">{c.name}<TierBadge c={c} />{payments.some((p) => p.customerId === c.id && p.topUp > 0) && <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[0.65rem] font-medium text-white">卡余额 {money(cardBalance(payments, c.id))}</span>}{(c.tags || []).map((t) => <span key={t} className="rounded-full bg-gold/15 px-2 py-0.5 text-[0.65rem] font-normal text-gold">{t}</span>)}</span>
                      <span className="flex flex-wrap gap-x-3 text-[0.7rem] leading-snug text-muted min-[480px]:flex-nowrap min-[480px]:overflow-hidden min-[480px]:whitespace-nowrap">
                        {c.phone && <span className="flex items-center gap-1"><Phone size={12} />{c.phone}</span>}
                        {(c.wechatId || c.wechatNo) && <span className="flex items-center gap-1"><MessageCircle size={12} />{[c.wechatId, c.wechatNo].filter(Boolean).join(' · ')}</span>}
                        {c.email && <span className="flex min-w-0 items-center gap-1"><Mail size={12} className="shrink-0" /><span className="truncate">{c.email}</span></span>}
                      </span>
                    </span>
                  </button>
                  <div className="w-36 shrink-0 text-right text-xs leading-snug">
                    <p className="font-medium">{money(s.spent)} <span className="font-normal text-muted">· {s.visits} 次</span></p>
                    <p className="text-[0.7rem] text-muted">上次：{s.last ? fmtDateTime(s.last) : '尚未到访'}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => setEditing(c)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-sand" aria-label="编辑"><Pencil size={15} /></button>
                    {!noDelete && <button onClick={() => setConfirmDel(c)} className="grid h-8 w-8 place-items-center rounded-full text-rose-700 hover:bg-rose-50" aria-label="删除"><Trash2 size={15} /></button>}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      {confirmDel && (
        <Modal title="删除客户" onClose={() => setConfirmDel(null)}>
          <p className="text-sm">确定删除客户「<b>{confirmDel.name}</b>」？</p>
          <p className="mt-2 text-xs text-muted">
            同时会删除 TA 的 {appointments.filter((a) => a.customerId === confirmDel.id).length} 个预约和 {payments.filter((p) => p.customerId === confirmDel.id).length} 笔账目（收款）记录
            {cardBalance(payments, confirmDel.id) > 0 && `，会员卡余额 ${money(cardBalance(payments, confirmDel.id))} 也会一并清除`}，删除后无法恢复。
          </p>
          <div className="flex justify-end gap-2 pt-5">
            <button type="button" onClick={() => setConfirmDel(null)} className="btn-ghost !py-2.5">取消</button>
            <button type="button" onClick={() => del(confirmDel)} className="rounded-full bg-rose-600 px-5 py-2.5 text-sm text-white hover:bg-rose-700">确定删除</button>
          </div>
        </Modal>
      )}
      {editing && <CustomerForm customer={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </>
  )
}
