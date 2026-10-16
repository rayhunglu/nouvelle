import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Download, HandCoins, Pencil, Plus, Receipt, Trash2, TrendingUp } from 'lucide-react'
import { useAuth } from '../auth'
import { useCrm } from './data'
import PaymentForm from './PaymentForm'
import { projectKind } from './projectKind'
import { Card, Empty, Modal, PageTitle, StatCard, inputCls } from './ui'
import { dayKey, downloadCsv, fmtDateTime, giftLabel, countsForPerformance, methodLabel, money, monthKey, paidAmount, paidTip, performanceOf } from './format'

// First and last day (YYYY-MM-DD) of a month given as YYYY-MM.
const monthRange = (key) => {
  const [y, m] = key.split('-').map(Number)
  return { from: `${key}-01`, to: `${key}-${String(new Date(y, m, 0).getDate()).padStart(2, '0')}` }
}

// Picking a staff member also shows the payments they referred: Rina for 医美 projects, Yingna and Rina for 美睫 projects
// (the 介绍人 of the payment). The payment keeps its own staff member; this only adds it to the referrer's view.
const REFERRER_LINKS = { medical: ['Rina'], lash: ['Yingna', 'Rina'] }
const sameName = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase()

export default function Finance() {
  const { payments, appointments, customerById, serviceById, remove, roster } = useCrm()
  const { can } = useAuth()
  const seeAllStaff = can('viewAllFinance') // the staff filter only matters when other staff's payments are visible
  const canDelete = can('deletePayments')
  const location = useLocation()
  const navigate = useNavigate()
  // The period shown: a start and an end date (inclusive). Empty = no limit on that side. It opens on the current month.
  const [range, setRange] = useState(() => monthRange(monthKey()))
  const { from, to } = range
  const [staffFilter, setStaffFilter] = useState('')
  const [editing, setEditing] = useState(null) // null | 'new' | payment | { fromAppointment }
  const [error, setError] = useState('')

  // Arriving from "记账" on an appointment opens the form prefilled.
  useEffect(() => {
    const id = location.state?.appointmentId
    if (!id) return
    const a = appointments.find((x) => x.id === id)
    if (a) {
      setEditing({ fromAppointment: a })
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location, appointments, navigate])

  const staffNames = useMemo(() => [...new Set([...roster, ...payments.map((p) => p.staff).filter(Boolean)])], [payments, roster])
  const inMonth = (p) => { const d = dayKey(p.datetime); return (!from || d >= from) && (!to || d <= to) }

  const apptById = useMemo(() => Object.fromEntries(appointments.map((a) => [a.id, a])), [appointments])
  // 介绍人 of a payment = the 客户来源 of its appointment. What was typed in the payment's own 介绍人 box (if anything) wins.
  const referrerOf = (p) => p.referralSource || apptById[p.appointmentId]?.source || ''
  // The service a payment settled, by name (the same text the list shows), to tell 医美 from 美睫.
  const serviceNameOf = (p) => p.serviceName || appointments.find((a) => a.id === p.appointmentId)?.service || (p.serviceIds || []).map((id) => serviceById[id]?.name).filter(Boolean).join('、')
  const referredTo = (p, staff) => REFERRER_LINKS[projectKind(serviceNameOf(p))]?.includes(staff) && sameName(referrerOf(p), staff)
  const rows = useMemo(
    () => payments
      .filter((p) => inMonth(p) && (!staffFilter || p.staff === staffFilter || referredTo(p, staffFilter)))
      .sort((a, b) => b.datetime.localeCompare(a.datetime)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [payments, appointments, apptById, serviceById, from, to, staffFilter],
  )
  const counted = (p) => countsForPerformance(p, apptById) // unsettled, or tied to an appointment that is not completed: not counted
  const countedRows = rows.filter(counted)
  const revenue = countedRows.reduce((s, p) => s + paidAmount(p), 0)
  const tips = countedRows.reduce((s, p) => s + paidTip(p), 0)
  const owed = rows.filter((p) => p.paymentMethod === 'unsettled').reduce((s, p) => s + p.amount, 0) // checked out but not paid yet

  const byStaff = useMemo(() => {
    const m = new Map()
    for (const p of payments.filter((x) => inMonth(x) && counted(x))) {
      const k = p.staff || '未指定'
      const cur = m.get(k) || { name: k, count: 0, revenue: 0, tips: 0 }
      if (p.paymentMethod !== 'unsettled') cur.count += 1; cur.revenue += performanceOf(p, payments); cur.tips += paidTip(p)
      m.set(k, cur)
    }
    return [...m.values()].sort((a, b) => b.revenue - a.revenue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments, from, to, apptById])

  // What was settled: the appointment's service when the payment came from one, otherwise the services picked on the payment.
  const serviceNames = (p) => p.serviceName || appointments.find((a) => a.id === p.appointmentId)?.service || p.serviceIds.map((id) => serviceById[id]?.name).filter(Boolean).join('、')

  const [confirmDel, setConfirmDel] = useState(null) // payment waiting for the delete confirmation (an in-page dialog: the browser's own confirm box can be blocked)
  const del = async (p) => {
    setConfirmDel(null)
    setError('')
    try { await remove('payments', p.id) } catch (err) { setError(err.message) }
  }

  // Rina's export has three parts: her own service (服务业绩), the 医美 commission and the 美睫 commission.
  //  1. Payments for clients Rina served herself, except 医美 and 美睫 projects: the 服务业绩.
  //  2. 医美 projects of Rina's (served by her or referred by her): not 服务业绩, only 10% of the amount.
  //  3. 美睫 projects (any staff) whose referrer is Yingna, Rina or Dayu: not 服务业绩; project amount × 0.4 × 0.3 when the referrer is
  //     Yingna or Rina, × 0.3 × 0.3 when it is Dayu.
  // The amount used is the same 业绩 figure as everywhere else (member-card payments already scaled by 2000 / 2200).
  const exportRinaCsv = () => {
    const r2 = (n) => Math.round(n * 100) / 100
    const inPeriod = payments.filter((p) => inMonth(p) && counted(p) && p.paymentMethod !== 'unsettled').sort((a, b) => a.datetime.localeCompare(b.datetime))
    const kind = (p) => projectKind(serviceNameOf(p))
    const service = inPeriod.filter((p) => p.staff === 'Rina' && !kind(p))
    const medical = inPeriod.filter((p) => kind(p) === 'medical' && (p.staff === 'Rina' || sameName(referrerOf(p), 'Rina')))
    const lashFactor = (p) => (sameName(referrerOf(p), 'Yingna') || sameName(referrerOf(p), 'Rina') ? 0.4 * 0.3 : sameName(referrerOf(p), 'Dayu') ? 0.3 * 0.3 : 0)
    const lash = inPeriod.filter((p) => kind(p) === 'lash' && lashFactor(p) > 0)
    const who = (p) => customerById[p.customerId]?.name || ''
    const serviceTotal = service.reduce((n, p) => n + performanceOf(p, payments), 0)
    const medicalRows = medical.map((p) => [performanceOf(p, payments), r2(performanceOf(p, payments) * 0.1)])
    const medicalTotal = medicalRows.reduce((n, r) => n + r[1], 0)
    const lashRows = lash.map((p) => [performanceOf(p, payments), lashFactor(p), r2(performanceOf(p, payments) * lashFactor(p))])
    const lashTotal = lashRows.reduce((n, r) => n + r[2], 0)
    // Tips on the clients Rina served herself.
    const mine = inPeriod.filter((p) => p.staff === 'Rina')
    const tipTotal = mine.reduce((n, p) => n + paidTip(p), 0)
    const tipNoCash = mine.reduce((n, p) => n + ((p.tipMethod || p.paymentMethod) === 'cash' ? 0 : paidTip(p)), 0)
    // Days: every calendar day from the start date to the end date (the first to the last payment when no dates are set).
    const all = [...service, ...medical, ...lash].sort((a, b) => a.datetime.localeCompare(b.datetime))
    const first = from || (all.length ? dayKey(all[0].datetime) : '')
    const last = to || (all.length ? dayKey(all[all.length - 1].datetime) : '')
    const days = first && last ? Math.round((Date.parse(`${last}T00:00:00Z`) - Date.parse(`${first}T00:00:00Z`)) / 86400000) + 1 : 0
    const rent = (950 / 30 / 2) * days // 房租支出: 950 ÷ 30 ÷ 2 × days
    downloadCsv(`nouvelle-payments-${from || 'start'}_${to || 'end'}-Rina.csv`, [
      ['一、Rina 服务业绩'],
      ['收款时间', '客户', '服务项目', '金额（员工业绩）', '实收金额', '小费', '付款方式', '小费付款方式', '介绍人', '员工'],
      ...service.map((p) => [fmtDateTime(p.datetime), who(p), serviceNames(p), performanceOf(p, payments), paidAmount(p), paidTip(p), methodLabel(p.paymentMethod), methodLabel(p.tipMethod || p.paymentMethod), referrerOf(p), p.staff]),
      [],
      ['二、医美提成（医美金额的 10%，不计入服务业绩）'],
      ['收款时间', '客户', '服务项目', '医美金额', '提成比例', '医美提成', '介绍人', '员工'],
      ...medical.map((p, i) => [fmtDateTime(p.datetime), who(p), serviceNames(p), medicalRows[i][0], '10%', medicalRows[i][1], referrerOf(p), p.staff]),
      [],
      ['三、睫毛提成（介绍人 Yingna / Rina：项目业绩×0.4×0.3；介绍人 Dayu：项目业绩×0.3×0.3；不计入服务业绩）'],
      ['收款时间', '客户', '服务项目', '项目业绩', '介绍人', '系数', '睫毛提成', '员工'],
      ...lash.map((p, i) => [fmtDateTime(p.datetime), who(p), serviceNames(p), lashRows[i][0], referrerOf(p), lashRows[i][1], lashRows[i][2], p.staff]),
      [],
      ['日期天数', days],
      ['服务业绩总额', r2(serviceTotal)],
      ['医美提成总额', r2(medicalTotal)],
      ['睫毛提成总额', r2(lashTotal)],
      ['小费总额', r2(tipTotal)],
      ['小费总额（剔除现金支付）', r2(tipNoCash)],
      ['房租支出', r2(rent)],
    ])
  }

  const exportCsv = () => {
    if (staffFilter === 'Rina') return exportRinaCsv()
    const total = countedRows.reduce((n, p) => n + performanceOf(p, payments), 0)
    const tipTotal = countedRows.reduce((n, p) => n + paidTip(p), 0)
    const tipNoCash = countedRows.reduce((n, p) => n + ((p.tipMethod || p.paymentMethod) === 'cash' ? 0 : paidTip(p)), 0)
    // Oldest first, from the start date down to the end date.
    const sorted = [...countedRows].sort((a, b) => a.datetime.localeCompare(b.datetime))
    // Days = every calendar day from the start date to the end date (inclusive). With no start / end date it runs from the first to the last payment.
    const first = from || (sorted.length ? dayKey(sorted[0].datetime) : '')
    const last = to || (sorted.length ? dayKey(sorted[sorted.length - 1].datetime) : '')
    const days = first && last ? Math.round((Date.parse(`${last}T00:00:00Z`) - Date.parse(`${first}T00:00:00Z`)) / 86400000) + 1 : 0
    const r2 = (n) => Math.round(n * 100) / 100
    downloadCsv(`nouvelle-payments-${from || 'start'}_${to || 'end'}-${(staffFilter || '全员').replace(/[\\/:*?"<>|\s]+/g, '_')}.csv`, [
      ['收款时间', '客户', '服务项目', '金额（员工业绩）', '实收金额', '小费', '付款方式', '小费付款方式', '介绍人', '员工'],
      ...sorted.map((p) => [
        fmtDateTime(p.datetime), customerById[p.customerId]?.name || '', serviceNames(p), performanceOf(p, payments), paidAmount(p), paidTip(p),
        methodLabel(p.paymentMethod), methodLabel(p.tipMethod || p.paymentMethod), referrerOf(p), p.staff,
      ]),
      [],
      ['日期天数', days],
      ['总额（员工业绩）', r2(total)],
      ['小费总额', r2(tipTotal)],
      ['小费总额（剔除现金支付）', r2(tipNoCash)],
    ])
  }

  return (
    <>
      <PageTitle compact title="账目" sub="记录每一笔收款 · 导出 CSV 后可直接导入 Google 表格">
        <button onClick={exportCsv} className="btn-ghost !px-4 !py-2" disabled={!rows.length}><Download size={16} /> 导出 CSV</button>
        <button onClick={() => setEditing('new')} className="btn-primary !px-4 !py-2"><Plus size={16} /> 记一笔</button>
      </PageTitle>

      <div className="mb-3 space-y-2">
        <div className="flex items-center gap-2">
          <input type="date" value={from} max={to || undefined} onChange={(e) => setRange({ from: e.target.value, to: e.target.value && to && e.target.value > to ? e.target.value : to })} className={`${inputCls} min-w-0 flex-1 !px-2.5 !py-1.5 !text-sm`} aria-label="开始日期" />
          <span className="text-muted">~</span>
          <input type="date" value={to} min={from || undefined} onChange={(e) => setRange({ from: e.target.value && from && e.target.value < from ? e.target.value : from, to: e.target.value })} className={`${inputCls} min-w-0 flex-1 !px-2.5 !py-1.5 !text-sm`} aria-label="结束日期" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[['本月', monthRange(monthKey())], ['上月', monthRange(monthKey(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)))], ['全部', { from: '', to: '' }]].map(([label, r]) => (
            <button key={label} onClick={() => setRange(r)} className={`rounded-full px-3 py-1.5 text-sm ${range.from === r.from && range.to === r.to ? 'bg-ink text-ivory' : 'bg-white text-muted'}`}>{label}</button>
          ))}
          {seeAllStaff && (<select value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)} aria-label="按员工筛选" className={`${inputCls} !w-auto !px-2.5 !py-1.5 !text-sm ml-auto`}>
            <option value="">全部员工</option>
            {staffNames.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>)}
        </div>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <StatCard compact icon={TrendingUp} label="营收" value={money(revenue)} hint={owed > 0 ? `另有未结算 ${money(owed)}` : undefined} />
        <StatCard compact icon={HandCoins} label="小费" value={money(tips)} />
        <StatCard compact icon={Receipt} label="笔数" value={countedRows.filter((p) => p.paymentMethod !== 'unsettled').length} />
      </div>

      {byStaff.length > 0 && (
        <Card className="mb-3 px-3 py-2.5">
          <h2 className="mb-2 text-sm font-medium">员工业绩{from || to ? `（${from || '…'} ~ ${to || '…'}）` : ''}<span className="ml-2 hidden text-xs font-normal text-muted sm:inline">会员卡充 2000 送 200 的，业绩 = 实收金额 × 2000/2200；其他都按实收金额</span></h2>
          <ul className="grid grid-cols-3 gap-1.5">
            {byStaff.map((s) => (
              <li key={s.name} className="rounded-lg bg-sand px-2.5 py-1.5 text-sm leading-tight">
                <span className="block truncate font-medium">{s.name}</span>
                <span className="block text-[0.7rem] text-muted">{s.count} 笔 · <b className="text-ink">{money(s.revenue)}</b></span>
                <span className="block text-[0.65rem] text-muted">小费 {money(s.tips)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
      {error && <p role="alert" className="mb-3 rounded-xl bg-rose-100 px-4 py-2.5 text-sm text-rose-800">{error}</p>}

      <Card>
        {rows.length === 0 ? <Empty>这个范围内没有收款记录</Empty> : (
          <ul className="max-h-[max(9rem,calc(100dvh-32.5rem))] divide-y divide-ink/10 overflow-y-auto lg:max-h-none">
            {rows.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-0.5 px-4 py-2">
                <div className="min-w-0 flex-1 basis-56">
                  <p className="truncate text-sm font-medium">{customerById[p.customerId]?.name || '（已删除客户）'}<span className="font-normal text-muted"> · {serviceNames(p) || '未选服务'}</span></p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {fmtDateTime(p.datetime)}{p.staff ? ` · 员工 ${p.staff}` : ''}{referrerOf(p) ? ` · 介绍人 ${referrerOf(p)}` : ''}{staffFilter && p.staff !== staffFilter && referredTo(p, staffFilter) ? '（介绍人关联）' : ''}{p.appointmentId ? '' : ' · 临时消费'}{!counted(p) && p.paymentMethod !== 'unsettled' ? ' · 预约未完成，不计业绩' : ''}{p.giftUsed ? ` · 使用赠送 ${giftLabel(p.giftUsed)}` : ''}{p.topUp > 0 ? ` · 充值会员卡 +${money(p.topUp)}${(p.topUpGifts || []).length ? `（赠送 ${p.topUpGifts.map((g) => (g === 'cash200' ? '$200' : giftLabel(g))).join('、')}）` : ''}` : ''}{p.notes ? ` · 备注 ${p.notes}` : ''}
                  </p>
                </div>
                <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs">{methodLabel(p.paymentMethod)}</span>
                <p className="w-24 text-right text-sm leading-tight">
                  <b className={`font-medium ${p.paymentMethod === 'unsettled' ? 'text-amber-600' : 'text-emerald-700'}`}>{money(p.amount)}</b>{p.paymentMethod === 'unsettled' && <span className="block text-xs text-amber-700">未结算 · 应收</span>}
                  {p.paymentMethod !== 'unsettled' && performanceOf(p, payments) !== p.amount && <span className="block text-xs text-muted">业绩 {money(performanceOf(p, payments))}</span>}
                  {p.tipAmount > 0 && <span className="block text-xs text-muted">小费 {money(p.tipAmount)}{p.tipMethod && p.tipMethod !== p.paymentMethod ? `（${methodLabel(p.tipMethod)}）` : ''}</span>}
                </p>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(p)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-sand" aria-label="编辑"><Pencil size={15} /></button>
                  {canDelete && <button onClick={() => setConfirmDel(p)} className="grid h-8 w-8 place-items-center rounded-full text-rose-700 hover:bg-rose-50" aria-label="删除"><Trash2 size={15} /></button>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {confirmDel && (
        <Modal title="删除收款记录" onClose={() => setConfirmDel(null)}>
          <p className="text-sm">确定删除这笔收款？</p>
          <p className="mt-2 text-sm"><b>{customerById[confirmDel.customerId]?.name || '（已删除客户）'}</b> · {serviceNames(confirmDel) || '未选服务'} · {money(confirmDel.amount)}</p>
          <p className="mt-2 text-xs text-muted">只删除这笔收款记录，客户资料保留；预约会保留痕迹，显示为划线、付款「未结算」。删除后无法恢复，营收、员工业绩和客户的会员卡余额会随之变化。</p>
          <div className="flex justify-end gap-2 pt-5">
            <button type="button" onClick={() => setConfirmDel(null)} className="btn-ghost !py-2.5">取消</button>
            <button type="button" onClick={() => del(confirmDel)} className="rounded-full bg-rose-600 px-5 py-2.5 text-sm text-white hover:bg-rose-700">确定删除</button>
          </div>
        </Modal>
      )}
      {editing && (
        <PaymentForm
          payment={editing === 'new' || editing.fromAppointment ? null : editing}
          fromAppointment={editing.fromAppointment}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}
