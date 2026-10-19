import { useRef, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../auth'
import { useCrm } from './data'
import { Field, Modal, inputCls } from './ui'
import { CUSTOMER_SOURCES, GIFT_OPTIONS, METHODS, TOPUP_AMOUNTS, cardBalance, fmtDateTime, giftForService, giftCash, giftItems, giftLabel, giftsAllowed, isCashGift, money, toLocalInput } from './format'
import { openPicker } from '../lib/util'

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
const SERVICE_CATEGORIES = [
  { id: 'skincare', label: '护肤项目' },
  { id: 'medical', label: '医美项目' },
  { id: 'lash', label: '美睫项目' },
  { id: 'spa', label: 'Spa 项目' },
]

export default function PaymentForm({ payment, fromAppointment, completeAppointment = false, onClose }) {
  const { customers, appointments, services, payments, save, reload } = useCrm()
  const noAssign = !useAuth().can('assignOthers') // recording for another staff member needs permission
  const appt = fromAppointment || null

  // Names → ids so a completed appointment can pre-select its service.
  const matchedServiceIds = (name) => services.filter((x) => x.name === name).map((x) => x.id)

  // A booking for a service that the customer holds a free gift for (光子嫩肤 / 热拉提) redeems it by default.
  const giftOfService = appt && giftForService(appt.service)
  const startGift = giftOfService && !payment && (giftItems(payments, appt.customerId)[giftOfService] || 0) > 0 ? giftOfService : ''
  const [f, setF] = useState(() => ({
    customerId: payment?.customerId || appt?.customerId || customers[0]?.id || '',
    appointmentId: payment?.appointmentId || appt?.id || '',
    datetime: toLocalInput(payment?.datetime || appt?.start || new Date().toISOString()),
    serviceIds: payment?.serviceIds || (appt ? matchedServiceIds(appt.service) : []),
    amount: payment ? payment.amount : startGift ? '0' : (appt?.price || ''),
    tipAmount: payment?.tipAmount || '',
    paymentMethod: payment?.paymentMethod || (startGift ? 'member_card' : 'credit_card'),
    giftUsed: payment ? payment.giftUsed || '' : startGift,
    tipMethod: payment?.tipMethod && payment.tipMethod !== payment.paymentMethod ? payment.tipMethod : '', // '' = same as the payment method
    referralSource: payment ? payment.referralSource || '' : appt?.source || '', // 介绍人 starts from the booking's 客户来源
    // 备注 follows the customer: a new checkout starts from the booking's notes, else the notes kept for the customer.
    notes: payment ? payment.notes || '' : appt?.notes || customers.find((c) => c.id === (appt?.customerId || customers[0]?.id))?.notes || '',
    topUp: payment?.topUp || '',
    topUpGifts: payment?.topUpGifts || [],
    topUpMethod: payment?.topUpMethod || 'credit_card',
    staff: payment?.staff || appt?.staff || '',
  }))
  const notesTouched = useRef(false)
  const [newService, setNewService] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const [topUpOpen, setTopUpOpen] = useState(!!payment?.topUp)
  const [customTopUp, setCustomTopUp] = useState(false)
  // Picking an amount keeps only as many gifts as that amount earns.
  const pickTopUp = (v) => {
    setCustomTopUp(!TOPUP_AMOUNTS.includes(Number(v)) && v !== '')
    setF((cur) => ({ ...cur, topUp: v, topUpGifts: cur.topUpGifts.slice(0, giftsAllowed(Number(v || 0))) }))
  }
  // Amount buttons step by $100 and never go below zero.
  const stepTopUp = (d) => pickTopUp(String(Math.max(0, Math.round((Number(f.topUp || 0) + d) * 100) / 100)))
  // Gifts switch freely: when every gift is already chosen, picking another replaces the earliest pick.
  // Switch the visit between redeeming the free gift ($0 on the member card) and paying the normal price.
  const redeemGift = (on) => setF((cur) => (on
    ? { ...cur, giftUsed: giftOfService, amount: '0', paymentMethod: 'member_card' }
    : { ...cur, giftUsed: '', amount: String(appt?.price || ''), paymentMethod: 'credit_card' }))
  const toggleGift = (id) => setF((cur) => {
    if (cur.topUpGifts.includes(id)) return { ...cur, topUpGifts: cur.topUpGifts.filter((x) => x !== id) }
    const max = giftsAllowed(Number(cur.topUp || 0))
    return { ...cur, topUpGifts: [...cur.topUpGifts, id].slice(-Math.max(1, max)) }
  })
  const quick = completeAppointment && !!appt // check-out from the calendar: only amount, tip and payment method

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
      amount: a.price || f.amount, staff: a.staff || f.staff, referralSource: f.referralSource || a.source || '',
    })
  }
  const toggleService = (id) =>
    setF({ ...f, serviceIds: f.serviceIds.includes(id) ? f.serviceIds.filter((x) => x !== id) : [...f.serviceIds, id] })

  // A service made here also needs its 项目类别, so 医美 / 美睫 work counts correctly in 账目 (and the service joins the booking menu).
  const addService = async () => {
    const name = newService.trim()
    if (!name) return
    if (!newCategory) { setError('请先选择这个新服务的项目类别'); return }
    try {
      const have = services.find((x) => x.name === name)
      const row = have
        ? await api(`/crm/services/${have.id}`, { method: 'PUT', body: { name, category: newCategory } })
        : await api('/crm/services', { method: 'POST', body: { name, category: newCategory } })
      await reload()
      setF((cur) => ({ ...cur, serviceIds: cur.serviceIds.includes(row.id) ? cur.serviceIds : [...cur.serviceIds, row.id] }))
      setNewService('')
      setNewCategory('')
      setError('')
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

  const submit = async (e, unsettled = false) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await save('payments', payment?.id, {
        ...f, ...(unsettled ? { paymentMethod: 'unsettled', tipMethod: 'unsettled' } : {}), appointmentId: f.appointmentId || null, datetime: new Date(f.datetime).toISOString(),
        amount: Number(f.amount || 0), tipAmount: Number(f.tipAmount || 0), topUp: Number(f.topUp || 0), topUpGifts: f.topUpGifts.slice(0, giftsAllowed(Number(f.topUp || 0))), giftUsed: unsettled ? '' : f.giftUsed, serviceName: appt?.service || payment?.serviceName || '', tipMethod: unsettled ? 'unsettled' : f.tipMethod || f.paymentMethod,
      })
      if (completeAppointment && appt) await save('appointments', appt.id, { ...appt, status: 'completed', notes: f.notes, ...(CUSTOMER_SOURCES.includes(f.referralSource) ? { source: f.referralSource } : {}) }) // the booking keeps what was written at check out
      // The notes belong to the customer too: save them so the next booking (any date) starts from them.
      const known = customers.find((c) => c.id === f.customerId)
      if (known && (notesTouched.current || !payment) && (f.notes || '') !== (known.notes || '')) await save('customers', known.id, { ...known, notes: f.notes })
      onClose()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  if (customers.length === 0) {
    return <Modal inset title="记账" onClose={onClose}><p className="text-sm text-muted">请先到「客户」页新增客户。</p></Modal>
  }

  return (
    <Modal inset title={quick ? 'Check out · 结算' : completeAppointment ? '完成预约 · 记一笔收款' : payment ? '编辑收款' : '记一笔收款'} onClose={onClose} wide={!quick} loading={busy}>
      <form onSubmit={submit} className="space-y-4">
        {quick ? (
          <>
            <p className="rounded-xl bg-sand px-4 py-3 text-sm"><b>{customers.find((c) => c.id === f.customerId)?.name}</b> · {appt.service}</p>
            {giftOfService && (f.giftUsed || (giftItems(payments, f.customerId, payment?.id)[giftOfService] || 0) > 0) && (
              <label className="flex items-center gap-2 rounded-xl border border-emerald-600/40 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900">
                <input type="checkbox" checked={!!f.giftUsed} onChange={(e) => redeemGift(e.target.checked)} className="h-4 w-4 accent-emerald-600" />
                使用赠送项目：{giftLabel(giftOfService)}（可用 ×{(giftItems(payments, f.customerId, payment?.id)[giftOfService] || 0)}），付款方式记会员卡、金额 $0
              </label>
            )}
          </>
        ) : (
          <>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="客户 *">
            <select className={inputCls} value={f.customerId} onChange={(e) => setF({ ...f, customerId: e.target.value, appointmentId: '', ...(!payment && !notesTouched.current ? { notes: customers.find((c) => c.id === e.target.value)?.notes || '' } : {}) })} required>
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

        <Field label="收款时间 *"><input className={inputCls} type="datetime-local" value={f.datetime} onChange={set('datetime')} required  onClick={openPicker} onFocus={openPicker} /></Field>

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
            <select className={`${inputCls} !w-auto shrink-0`} value={newCategory} onChange={(e) => setNewCategory(e.target.value)} aria-label="项目类别">
              <option value="">项目类别</option>
              {SERVICE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <button type="button" onClick={addService} className="btn-ghost !py-2 shrink-0">新增</button>
          </div>
        </div>

          </>
        )}

        <Field label={quick ? '金额（税后价 $）*' : '金额（$）*'}><input className={inputCls} type="number" min="0" step="0.01" value={f.amount} onChange={set('amount')} required /></Field>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-muted">付款方式 *</span>
          <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-sand p-1">
            {METHODS.filter((m) => !(quick && m.id === 'unsettled')).map((m) => (
              <button type="button" key={m.id} onClick={() => setF({ ...f, paymentMethod: m.id })}
                className={`rounded-xl py-2 text-sm transition ${m.id === 'unsettled' ? 'col-span-3' : ''} ${f.paymentMethod === m.id ? 'bg-white font-medium shadow-sm' : 'text-muted'}`}>{m.label}</button>
            ))}
          </div>
          {f.paymentMethod === 'unsettled' && <p className="mt-1.5 text-xs text-amber-700">未结算：先完成这次服务，金额记为应收，暂不计入营收、小费和员工业绩；收到款后，到账目里编辑这笔，改成实际的付款方式。</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="小费（$）">
            <div className="mb-1.5 flex gap-1.5">
              {[15, 18, 20].map((pct) => {
                const v = Math.round(Number(f.amount || 0) * pct) / 100
                const on = Number(f.amount) > 0 && Number(f.tipAmount) === v
                return (
                  <button type="button" key={pct} disabled={!(Number(f.amount) > 0)} onClick={() => setF({ ...f, tipAmount: String(v) })} aria-pressed={on}
                    className={`flex-1 rounded-xl border py-1.5 text-sm transition disabled:opacity-40 ${on ? 'border-ink bg-ink text-ivory' : 'border-ink/15 hover:border-ink/40'}`}>{pct}%</button>
                )
              })}
            </div>
            <input className={inputCls} type="number" min="0" step="0.01" value={f.tipAmount} onChange={set('tipAmount')} placeholder="手动输入" />
          </Field>
          <Field label="小费付款方式">
            <select className={inputCls} value={f.tipMethod} onChange={set('tipMethod')}>
              <option value="">同付款方式（{METHODS.find((m) => m.id === f.paymentMethod)?.label}）</option>
              {METHODS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </Field>
        </div>
        {quick && <p className="text-right text-sm text-muted">合计 <b className="text-lg text-ink">${(Number(f.amount || 0) + Number(f.tipAmount || 0)).toFixed(2)}</b></p>}

        {/* Member card: load money onto the card at this visit (optional), and see what a card payment leaves behind. */}
        <div className="rounded-xl border border-ink/10 bg-white p-3">
          {topUpOpen ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <span className="mb-1.5 block text-xs font-medium text-muted">会员卡充值金额</span>
                <div className="grid grid-cols-4 gap-1.5 rounded-2xl bg-sand p-1">
                  {TOPUP_AMOUNTS.map((n) => (
                    <button type="button" key={n} onClick={() => pickTopUp(String(n))} aria-pressed={Number(f.topUp) === n}
                      className={`rounded-xl py-2 text-sm transition ${Number(f.topUp) === n ? 'bg-white font-medium shadow-sm' : 'text-muted'}`}>${n.toLocaleString()}</button>
                  ))}
                  <button type="button" onClick={() => { setCustomTopUp(true); if (TOPUP_AMOUNTS.includes(Number(f.topUp))) pickTopUp('') }} aria-pressed={customTopUp || (f.topUp !== '' && !TOPUP_AMOUNTS.includes(Number(f.topUp)))}
                    className={`rounded-xl py-2 text-sm transition ${customTopUp || (f.topUp !== '' && !TOPUP_AMOUNTS.includes(Number(f.topUp))) ? 'bg-white font-medium shadow-sm' : 'text-muted'}`}>其他</button>
                </div>
                {/* Free amount: type it, or step it up and down in $100 (buttons or the arrow keys). */}
                <div className="mt-2 flex items-stretch gap-1.5">
                  <button type="button" onClick={() => stepTopUp(-100)} disabled={!(Number(f.topUp) > 0)} aria-label="减 100" className="w-10 shrink-0 rounded-xl border border-ink/15 text-lg leading-none transition hover:border-ink/40 disabled:opacity-40">−</button>
                  <input className={`${inputCls} min-w-0 flex-1 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                    type="number" min="0" step="any" value={f.topUp} onChange={(e) => pickTopUp(e.target.value)} placeholder="输入充值金额（↑↓ 每次 100）" aria-label="充值金额"
                    onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); stepTopUp(e.key === 'ArrowUp' ? 100 : -100) } }} />
                  <button type="button" onClick={() => stepTopUp(100)} aria-label="加 100" className="w-10 shrink-0 rounded-xl border border-ink/15 text-lg leading-none transition hover:border-ink/40">＋</button>
                </div>
              </div>
              <Field label="充值付款方式">
                <select className={inputCls} value={f.topUpMethod} onChange={set('topUpMethod')}>
                  {METHODS.filter((m) => m.id !== 'member_card' && m.id !== 'unsettled').map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </Field>
              <p className="self-end text-xs text-muted">$1,000 无赠送；$2,000、$3,000 可任选赠送项目（可多选）</p>
              {giftsAllowed(Number(f.topUp || 0)) > 0 && (
                <div className="sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-medium text-muted">赠送（任选，可多选，已选 {f.topUpGifts.length} 项）</span>
                  <div className="flex flex-wrap gap-2">
                    {GIFT_OPTIONS.filter((g) => f.topUpGifts.includes(g.id) || (g.id === 'cash300' ? Number(f.topUp || 0) >= 3000 : g.id === 'cash200' ? Number(f.topUp || 0) < 3000 : true)).map((g) => {
                      const on = f.topUpGifts.includes(g.id)
                      return (
                        <button type="button" key={g.id} onClick={() => toggleGift(g.id)} aria-pressed={on}
                          className={`rounded-full border px-3.5 py-1.5 text-sm transition ${on ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-ink/15 hover:border-ink/40'}`}>{g.label}</button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button type="button" onClick={() => setTopUpOpen(true)} className="text-sm text-gold underline">＋ 本次充值会员卡</button>
          )}
          {(f.paymentMethod === 'member_card' || f.tipMethod === 'member_card' || Number(f.topUp) > 0 || f.giftUsed) && (() => {
            const before = cardBalance(payments, f.customerId, payment?.id)
            const load = Number(f.topUp || 0)
            const gifts = f.topUpGifts.slice(0, giftsAllowed(load))
            const bonus = giftCash(gifts)
            const freeItems = gifts.filter((g) => !isCashGift(g))
            const spend = Number(f.amount || 0) + Number(f.tipAmount || 0)
            const tipBy = f.tipMethod || f.paymentMethod
            const deduct = (f.paymentMethod === 'member_card' ? Number(f.amount || 0) : 0) + (tipBy === 'member_card' ? Number(f.tipAmount || 0) : 0)
            const after = before + load + bonus - deduct
            const remain = giftItems(payments, f.customerId, payment?.id)
            for (const g of gifts.filter((x) => !isCashGift(x))) remain[g] = (remain[g] || 0) + 1 // earned in this same checkout
            if (f.giftUsed) remain[f.giftUsed] = (remain[f.giftUsed] || 0) - 1
            const left = Object.entries(remain).filter(([, n]) => n > 0)
            return (
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-t border-ink/10 pt-3 text-sm">
                <dt className="text-muted">本次消费</dt><dd className="text-right">{money(spend)}（金额 {money(Number(f.amount || 0))} + 小费 {money(Number(f.tipAmount || 0))}{Number(f.tipAmount) > 0 && tipBy !== f.paymentMethod ? `，小费用 ${METHODS.find((m) => m.id === tipBy)?.label}` : ''}）</dd>
                <dt className="text-muted">服务人员</dt><dd className="text-right">{f.staff || '未指定'}</dd>
                {f.giftUsed && <><dt className="text-muted">消耗赠送项目</dt><dd className="text-right text-emerald-700">{giftLabel(f.giftUsed)} ×1</dd></>}
                {load > 0 && <><dt className="text-muted">本次充值</dt><dd className="text-right text-emerald-700">+{money(load)}</dd></>}
                {bonus > 0 && <><dt className="text-muted">赠送余额</dt><dd className="text-right text-emerald-700">+{money(bonus)}</dd></>}
                {freeItems.length > 0 && <><dt className="text-muted">赠送项目</dt><dd className="text-right text-emerald-700">{freeItems.map(giftLabel).join('、')}</dd></>}
                <dt className="text-muted">扣款金额</dt><dd className="text-right">{deduct > 0 ? `−${money(deduct)}` : f.giftUsed ? '$0（使用赠送项目，不扣余额）' : '— （本次未用会员卡付款）'}</dd>
                <dt className="text-muted">会员卡余额</dt>
                <dd className={`text-right font-medium ${after < 0 ? 'text-rose-700' : ''}`}>{money(before)} → <b className="text-base">{money(after)}</b>{after < 0 && '（余额不足）'}</dd>
              <dt className="text-muted">剩余赠送项目</dt><dd className="text-right">{left.length ? left.map(([g, n]) => `${giftLabel(g)} ×${n}`).join('、') : '无'}</dd>
              </dl>
            )
          })()}
        </div>

        {/* 客户来源 (= 介绍人): starts from the booking's, can be changed here; older free-text values stay selectable. */}
        <Field label="客户来源">
          <select className={inputCls} value={f.referralSource} onChange={set('referralSource')}>
            <option value="">未选择</option>
            {[...CUSTOMER_SOURCES, ...(f.referralSource && !CUSTOMER_SOURCES.includes(f.referralSource) ? [f.referralSource] : [])].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </Field>

        {!quick && (
          <>
        <div className="grid gap-4 sm:grid-cols-2">
          {!noAssign && (<Field label="员工">
            <PersonSelect
              value={f.staff}
              onChange={(v) => setF((cur) => ({ ...cur, staff: v }))}
              placeholder="未指定"
              groups={[{ label: '员工', names: staffNames }]}
            />
          </Field>)}
        </div>

          </>
        )}

        <Field label="备注"><textarea className={inputCls} rows={2} value={f.notes} onChange={(e) => { notesTouched.current = true; set('notes')(e) }} placeholder={f.paymentMethod === 'other' ? '其他付款方式请在这里说明' : '选填'} /></Field>

        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost !py-2.5">取消</button>
          {quick && (
            <button type="button" onClick={(e) => submit(e, true)} disabled={busy || !(Number(f.amount) > 0)} title="先完成这次服务，金额记为应收，暂不计入营收、小费和员工业绩"
              className="rounded-full border border-amber-600 px-5 py-2.5 text-sm font-medium text-amber-700 transition hover:bg-amber-50 disabled:opacity-40">未结算</button>
          )}
          <button className="btn-primary !py-2.5" disabled={busy || (cardBalance(payments, f.customerId, payment?.id) + Number(f.topUp || 0) + giftCash(f.topUpGifts.slice(0, giftsAllowed(Number(f.topUp || 0)))) - (f.paymentMethod === 'member_card' ? Number(f.amount || 0) : 0) - ((f.tipMethod || f.paymentMethod) === 'member_card' ? Number(f.tipAmount || 0) : 0) < -0.004)}>{quick ? '确认结算' : completeAppointment ? '保存并完成预约' : '保存'}</button>
        </div>
        {quick && <p className="text-right text-xs text-amber-700">「未结算」：先完成这次服务，金额记为应收，暂不计入营收、小费和员工业绩；收到款后到账目里改成实际付款方式。</p>}
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

