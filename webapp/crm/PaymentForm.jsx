import { useState } from 'react'
import { api } from '../api'
import { useCrm } from './data'
import { Field, Modal, inputCls } from './ui'
import { METHODS, fmtDateTime, toLocalInput } from './format'

// Dropdown of known people. "其他" reveals a text box for anyone not in the list.
function PersonSelect({ value, onChange, groups, placeholder }) {
  const all = groups.flatMap((g) => g.names)
  const [custom, setCustom] = useState(() => !!value && !all.includes(value))
  return (
    <div className="space-y-2">
      <select
        className={inputCls}
        value={custom ? '__other' : value}
        onChange={(e) => {
          const v = e.target.value
          if (v === '__other') { setCustom(true); onChange('') } else { setCustom(false); onChange(v) }
        }}
      >
        <option value="">{placeholder}</option>
        {groups.filter((g) => g.names.length).map((g) => (
          <optgroup key={g.label} label={g.label}>
            {g.names.map((n) => <option key={n} value={n}>{n}</option>)}
          </optgroup>
        ))}
        <option value="__other">其他（手动输入）</option>
      </select>
      {custom && <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} placeholder="输入姓名" autoFocus />}
    </div>
  )
}

// Payment form. With `completeAppointment`, saving also marks the appointment completed.
export default function PaymentForm({ payment, fromAppointment, completeAppointment = false, onClose }) {
  const { customers, appointments, services, payments, save, reload } = useCrm()
  const appt = fromAppointment || null

  // Names → ids so a completed appointment can pre-select its service.
  const matchedServiceIds = (name) => services.filter((x) => x.name === name).map((x) => x.id)

  const [f, setF] = useState(() => ({
    customerId: payment?.customerId || appt?.customerId || customers[0]?.id || '',
    appointmentId: payment?.appointmentId || appt?.id || '',
    datetime: toLocalInput(payment?.datetime || appt?.start || new Date().toISOString()),
    serviceIds: payment?.serviceIds || (appt ? matchedServiceIds(appt.service) : []),
    amount: payment?.amount ?? (appt?.price || ''),
    tipAmount: payment?.tipAmount || '',
    paymentMethod: payment?.paymentMethod || 'credit_card',
    referralSource: payment?.referralSource || '',
    staff: payment?.staff || appt?.staff || '',
  }))
  const [newService, setNewService] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const customerAppts = appointments
    .filter((a) => a.customerId === f.customerId && a.status !== 'cancelled')
    .sort((a, b) => b.start.localeCompare(a.start))
  const suggestions = (key) => [...new Set(payments.map((p) => p[key]).filter(Boolean))]
  // One shared staff roster: everyone seen on appointments or payments.
  const staffNames = [...new Set([...suggestions('staff'), ...appointments.map((a) => a.staff).filter(Boolean)])].sort((a, b) => a.localeCompare(b, 'zh'))

  const pickAppointment = (id) => {
    const a = appointments.find((x) => x.id === id)
    if (!a) return setF({ ...f, appointmentId: '' })
    setF({
      ...f, appointmentId: id, datetime: toLocalInput(a.start), serviceIds: matchedServiceIds(a.service),
      amount: a.price || f.amount, staff: a.staff || f.staff,
    })
  }
  const toggleService = (id) =>
    setF({ ...f, serviceIds: f.serviceIds.includes(id) ? f.serviceIds.filter((x) => x !== id) : [...f.serviceIds, id] })

  const addService = async () => {
    const name = newService.trim()
    if (!name) return
    try {
      const row = await api('/crm/services', { method: 'POST', body: { name } })
      await reload()
      setF((cur) => ({ ...cur, serviceIds: [...cur.serviceIds, row.id] }))
      setNewService('')
    } catch (err) {
      setError(err.message)
    }
  }

  const skipPayment = async () => {
    setBusy(true)
    setError('')
    try {
      await save('appointments', appt.id, { ...appt, status: 'completed' })
      onClose()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await save('payments', payment?.id, {
        ...f, appointmentId: f.appointmentId || null, datetime: new Date(f.datetime).toISOString(),
        amount: Number(f.amount || 0), tipAmount: Number(f.tipAmount || 0),
      })
      if (completeAppointment && appt) await save('appointments', appt.id, { ...appt, status: 'completed' })
      onClose()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  if (customers.length === 0) {
    return <Modal title="记账" onClose={onClose}><p className="text-sm text-muted">请先到「客户」页新增客户。</p></Modal>
  }

  return (
    <Modal title={completeAppointment ? '完成预约 · 记一笔收款' : payment ? '编辑收款' : '记一笔收款'} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="客户 *">
            <select className={inputCls} value={f.customerId} onChange={(e) => setF({ ...f, customerId: e.target.value, appointmentId: '' })} required>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}{c.phone ? ` · ${c.phone}` : ''}</option>)}
            </select>
          </Field>
          <Field label="关联预约（可选）">
            <select className={inputCls} value={f.appointmentId} onChange={(e) => pickAppointment(e.target.value)}>
              <option value="">无预约（临时消费）</option>
              {customerAppts.map((a) => <option key={a.id} value={a.id}>{fmtDateTime(a.start)} · {a.service}</option>)}
            </select>
          </Field>
        </div>

        <Field label="收款时间 *"><input className={inputCls} type="datetime-local" value={f.datetime} onChange={set('datetime')} required /></Field>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-muted">服务项目</span>
          <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-ink/10 bg-white p-2.5">
            {services.map((x) => {
              const on = f.serviceIds.includes(x.id)
              return (
                <button type="button" key={x.id} onClick={() => toggleService(x.id)} aria-pressed={on}
                  className={`rounded-full border px-3 py-1 text-xs transition ${on ? 'border-ink bg-ink text-ivory' : 'border-ink/15 hover:border-ink/40'}`}>{x.name}</button>
              )
            })}
          </div>
          <div className="mt-2 flex gap-2">
            <input className={inputCls} placeholder="没有想要的？输入新服务名称" value={newService} onChange={(e) => setNewService(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addService() } }} />
            <button type="button" onClick={addService} className="btn-ghost !py-2 shrink-0">新增</button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="金额（$）*"><input className={inputCls} type="number" min="0" step="0.01" value={f.amount} onChange={set('amount')} required /></Field>
          <Field label="小费（$）"><input className={inputCls} type="number" min="0" step="0.01" value={f.tipAmount} onChange={set('tipAmount')} /></Field>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-muted">付款方式 *</span>
          <div className="grid grid-cols-4 gap-1.5 rounded-2xl bg-sand p-1">
            {METHODS.map((m) => (
              <button type="button" key={m.id} onClick={() => setF({ ...f, paymentMethod: m.id })}
                className={`rounded-xl py-2 text-sm transition ${f.paymentMethod === m.id ? 'bg-white font-medium shadow-sm' : 'text-muted'}`}>{m.label}</button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="介绍人">
            <PersonSelect
              value={f.referralSource}
              onChange={(v) => setF((cur) => ({ ...cur, referralSource: v }))}
              placeholder="无 / 未填"
              groups={[
                { label: '员工', names: staffNames },
                { label: '客户', names: customers.map((c) => c.name) },
                { label: '以前填过', names: suggestions('referralSource').filter((n) => !staffNames.includes(n) && !customers.some((c) => c.name === n)) },
              ]}
            />
          </Field>
          <Field label="员工">
            <PersonSelect
              value={f.staff}
              onChange={(v) => setF((cur) => ({ ...cur, staff: v }))}
              placeholder="未指定"
              groups={[{ label: '员工', names: staffNames }]}
            />
          </Field>
        </div>

        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost !py-2.5">取消</button>
          <button className="btn-primary !py-2.5" disabled={busy}>{completeAppointment ? '保存并完成预约' : '保存'}</button>
        </div>
        {completeAppointment && (
          <p className="text-right text-xs text-muted">
            这次不收款？
            <button type="button" className="ml-1 text-gold underline" disabled={busy} onClick={skipPayment}>仅标记完成，不记账</button>
          </p>
        )}
      </form>
    </Modal>
  )
}

