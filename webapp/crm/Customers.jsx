import { useMemo, useState } from 'react'
import { Mail, MessageCircle, Pencil, Phone, Plus, Search, Trash2 } from 'lucide-react'
import { useCrm } from './data'
import { Card, Empty, Field, Modal, PageTitle, StatusBadge, inputCls } from './ui'
import { fmtDateTime, money } from './format'

// Last visit = most recent completed appointment or recorded payment.
function lastVisitOf(customerId, appointments, payments) {
  const times = [
    ...appointments.filter((a) => a.customerId === customerId && a.status === 'completed').map((a) => a.start),
    ...payments.filter((p) => p.customerId === customerId).map((p) => p.datetime),
  ]
  return times.length ? times.reduce((a, b) => (a > b ? a : b)) : null
}
const fmtLast = (iso) => (iso ? fmtDateTime(iso) : '尚未到访')

function CustomerForm({ customer, onClose }) {
  const { save, appointments, payments } = useCrm()
  const [f, setF] = useState({
    name: customer?.name || '', phone: customer?.phone || '', email: customer?.email || '', wechatId: customer?.wechatId || '',
    tags: (customer?.tags || []).join(', '), notes: customer?.notes || '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const history = customer ? appointments.filter((a) => a.customerId === customer.id).sort((a, b) => b.start.localeCompare(a.start)) : []
  const lastVisit = customer ? lastVisitOf(customer.id, appointments, payments) : null
  const spent = customer ? payments.filter((p) => p.customerId === customer.id).reduce((s, p) => s + p.amount, 0) : 0

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
    <Modal title={customer ? '客户资料' : '新增客户'} onClose={onClose} wide={!!customer}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="姓名 *"><input className={inputCls} value={f.name} onChange={set('name')} required autoFocus /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="电话"><input className={inputCls} value={f.phone} onChange={set('phone')} type="tel" /></Field>
          <Field label="微信号"><input className={inputCls} value={f.wechatId} onChange={set('wechatId')} autoComplete="off" /></Field>
        </div>
        <Field label="邮箱"><input className={inputCls} value={f.email} onChange={set('email')} type="email" /></Field>
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
            <p className="text-sm text-muted">上次到访 <b className="text-ink">{fmtLast(lastVisit)}</b> · 累计 <b className="text-ink">{money(spent)}</b></p>
          </div>
          {history.length === 0 ? <p className="text-sm text-muted">暂无预约</p> : (
            <ul className="divide-y divide-ink/10 rounded-xl border border-ink/10 bg-white">
              {history.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <div className="min-w-0"><p className="truncate font-medium">{a.service}</p><p className="text-xs text-muted">{fmtDateTime(a.start)}</p></div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Modal>
  )
}

export default function Customers() {
  const { customers, appointments, payments, remove } = useCrm()
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null) // null | 'new' | customer
  const [error, setError] = useState('')

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return customers
      .filter((c) => !needle || `${c.name} ${c.phone} ${c.email} ${c.wechatId || ''} ${(c.tags || []).join(' ')}`.toLowerCase().includes(needle))
      .sort((a, b) => a.name.localeCompare(b.name, 'zh'))
  }, [customers, q])

  const stats = (id) => ({
    visits: appointments.filter((a) => a.customerId === id && a.status === 'completed').length,
    spent: payments.filter((p) => p.customerId === id).reduce((s, p) => s + p.amount, 0),
    last: lastVisitOf(id, appointments, payments),
  })

  const del = async (c) => {
    if (!window.confirm(`确定删除客户「${c.name}」？`)) return
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
      {error && <p role="alert" className="mb-4 rounded-xl bg-rose-100 px-4 py-2.5 text-sm text-rose-800">{error}</p>}

      <Card>
        {rows.length === 0 ? <Empty>{customers.length ? '没有符合的客户' : '还没有客户，点右上角新增'}</Empty> : (
          <ul className="divide-y divide-ink/10">
            {rows.map((c) => {
              const s = stats(c.id)
              return (
                <li key={c.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4">
                  <button onClick={() => setEditing(c)} className="flex min-w-0 flex-1 basis-56 items-center gap-4 text-left">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sand font-display text-lg text-gold">{c.name.slice(0, 1)}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{c.name}</span>
                      <span className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted">
                        {c.phone && <span className="flex items-center gap-1"><Phone size={12} />{c.phone}</span>}
                        {c.wechatId && <span className="flex items-center gap-1"><MessageCircle size={12} />{c.wechatId}</span>}
                        {c.email && <span className="flex items-center gap-1"><Mail size={12} />{c.email}</span>}
                      </span>
                    </span>
                  </button>
                  <div className="flex flex-wrap gap-1.5">
                    {(c.tags || []).map((t) => <span key={t} className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs text-gold">{t}</span>)}
                  </div>
                  <div className="w-40 text-right text-sm">
                    <p className="font-medium">{money(s.spent)}</p>
                    <p className="text-xs text-muted">{s.visits} 次到访</p>
                    <p className="text-xs text-muted">上次：{s.last ? fmtDateTime(s.last) : '尚未到访'}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(c)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-sand" aria-label="编辑"><Pencil size={16} /></button>
                    <button onClick={() => del(c)} className="grid h-9 w-9 place-items-center rounded-full text-rose-700 hover:bg-rose-50" aria-label="删除"><Trash2 size={16} /></button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      {editing && <CustomerForm customer={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </>
  )
}
