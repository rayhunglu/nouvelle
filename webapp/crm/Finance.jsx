import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Download, HandCoins, Pencil, Plus, Receipt, Trash2, TrendingUp } from 'lucide-react'
import { useAuth } from '../auth'
import { useCrm } from './data'
import PaymentForm from './PaymentForm'
import { Card, Empty, Modal, PageTitle, StatCard, inputCls } from './ui'
import { dayKey, downloadCsv, fmtDateTime, giftLabel, methodLabel, money, monthKey, paidAmount, paidTip, performanceOf } from './format'

export default function Finance() {
  const { payments, appointments, customerById, serviceById, remove } = useCrm()
  const { can } = useAuth()
  const seeAllStaff = can('viewAllFinance') // the staff filter only matters when other staff's payments are visible
  const canDelete = can('deletePayments')
  const location = useLocation()
  const navigate = useNavigate()
  const [month, setMonth] = useState(monthKey())
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

  const staffNames = useMemo(() => [...new Set(payments.map((p) => p.staff).filter(Boolean))], [payments])
  const inMonth = (p) => !month || monthKey(new Date(p.datetime)) === month

  const rows = useMemo(
    () => payments
      .filter((p) => inMonth(p) && (!staffFilter || p.staff === staffFilter))
      .sort((a, b) => b.datetime.localeCompare(a.datetime)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [payments, month, staffFilter],
  )
  const revenue = rows.reduce((s, p) => s + paidAmount(p), 0)
  const tips = rows.reduce((s, p) => s + paidTip(p), 0)
  const owed = rows.filter((p) => p.paymentMethod === 'unsettled').reduce((s, p) => s + p.amount, 0) // checked out but not paid yet

  const byStaff = useMemo(() => {
    const m = new Map()
    for (const p of payments.filter(inMonth)) {
      const k = p.staff || '未指定'
      const cur = m.get(k) || { name: k, count: 0, revenue: 0, tips: 0 }
      if (p.paymentMethod !== 'unsettled') cur.count += 1; cur.revenue += performanceOf(p, payments); cur.tips += paidTip(p)
      m.set(k, cur)
    }
    return [...m.values()].sort((a, b) => b.revenue - a.revenue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments, month])

  // What was settled: the appointment's service when the payment came from one, otherwise the services picked on the payment.
  const serviceNames = (p) => p.serviceName || appointments.find((a) => a.id === p.appointmentId)?.service || p.serviceIds.map((id) => serviceById[id]?.name).filter(Boolean).join('、')

  const [confirmDel, setConfirmDel] = useState(null) // payment waiting for the delete confirmation (an in-page dialog: the browser's own confirm box can be blocked)
  const del = async (p) => {
    setConfirmDel(null)
    setError('')
    try { await remove('payments', p.id) } catch (err) { setError(err.message) }
  }

  const exportCsv = () => {
    const total = rows.reduce((n, p) => n + performanceOf(p, payments), 0)
    const tipTotal = rows.reduce((n, p) => n + paidTip(p), 0)
    const tipNoCash = rows.reduce((n, p) => n + ((p.tipMethod || p.paymentMethod) === 'cash' ? 0 : paidTip(p)), 0)
    const days = new Set(rows.map((p) => dayKey(p.datetime))).size
    const r2 = (n) => Math.round(n * 100) / 100
    downloadCsv(`nouvelle-payments-${month || 'all'}-${(staffFilter || '全员').replace(/[\\/:*?"<>|\s]+/g, '_')}.csv`, [
      ['收款时间', '客户', '服务项目', '金额（员工业绩）', '实收金额', '小费', '付款方式', '小费付款方式', '介绍人', '员工'],
      ...rows.map((p) => [
        fmtDateTime(p.datetime), customerById[p.customerId]?.name || '', serviceNames(p), performanceOf(p, payments), paidAmount(p), paidTip(p),
        methodLabel(p.paymentMethod), methodLabel(p.tipMethod || p.paymentMethod), p.referralSource, p.staff,
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
      <PageTitle title="账目" sub="记录每一笔收款 · 导出 CSV 后可直接导入 Google 表格">
        <button onClick={exportCsv} className="btn-ghost !py-2.5" disabled={!rows.length}><Download size={16} /> 导出 CSV</button>
        <button onClick={() => setEditing('new')} className="btn-primary !py-2.5"><Plus size={16} /> 记一笔</button>
      </PageTitle>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className={`${inputCls} !w-auto`} aria-label="月份" />
        <button onClick={() => setMonth('')} className={`rounded-full px-4 py-2 text-sm ${!month ? 'bg-ink text-ivory' : 'bg-white text-muted'}`}>全部月份</button>
        {seeAllStaff && (<select value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)} aria-label="按员工筛选" className={`${inputCls} !w-auto sm:ml-auto`}>
          <option value="">全部员工</option>
          {staffNames.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>)}
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard icon={TrendingUp} label="营收" value={money(revenue)} hint={owed > 0 ? `另有未结算 ${money(owed)}` : undefined} />
        <StatCard icon={HandCoins} label="小费" value={money(tips)} />
        <StatCard icon={Receipt} label="笔数" value={rows.length} />
      </div>

      {byStaff.length > 0 && (
        <Card className="mb-6 p-5">
          <h2 className="mb-3 text-sm font-medium">员工业绩{month ? `（${month}）` : ''}<span className="ml-2 text-xs font-normal text-muted">会员卡付款按实收比例折算（例：充 2000 送 200，业绩 = 金额 × 2000/2200）</span></h2>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {byStaff.map((s) => (
              <li key={s.name} className="flex items-center justify-between rounded-xl bg-sand px-4 py-2.5 text-sm">
                <span className="font-medium">{s.name}</span>
                <span className="text-right text-xs text-muted">{s.count} 笔 · <b className="text-ink">{money(s.revenue)}</b> + 小费 {money(s.tips)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
      {error && <p role="alert" className="mb-4 rounded-xl bg-rose-100 px-4 py-2.5 text-sm text-rose-800">{error}</p>}

      <Card>
        {rows.length === 0 ? <Empty>这个范围内没有收款记录</Empty> : (
          <ul className="divide-y divide-ink/10">
            {rows.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-x-5 gap-y-1 px-5 py-4">
                <div className="min-w-0 flex-1 basis-56">
                  <p className="truncate text-sm font-medium">{customerById[p.customerId]?.name || '（已删除客户）'}<span className="font-normal text-muted"> · {serviceNames(p) || '未选服务'}</span></p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {fmtDateTime(p.datetime)}{p.staff ? ` · 员工 ${p.staff}` : ''}{p.referralSource ? ` · 介绍人 ${p.referralSource}` : ''}{p.appointmentId ? '' : ' · 临时消费'}{p.giftUsed ? ` · 使用赠送 ${giftLabel(p.giftUsed)}` : ''}{p.topUp > 0 ? ` · 充值会员卡 +${money(p.topUp)}${(p.topUpGifts || []).length ? `（赠送 ${p.topUpGifts.map((g) => (g === 'cash200' ? '$200' : giftLabel(g))).join('、')}）` : ''}` : ''}{p.notes ? ` · 备注 ${p.notes}` : ''}
                  </p>
                </div>
                <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs">{methodLabel(p.paymentMethod)}</span>
                <p className="w-28 text-right text-sm">
                  <b className={`font-medium ${p.paymentMethod === 'unsettled' ? 'text-amber-600' : 'text-emerald-700'}`}>{money(p.amount)}</b>{p.paymentMethod === 'unsettled' && <span className="block text-xs text-amber-700">未结算 · 应收</span>}
                  {p.paymentMethod !== 'unsettled' && performanceOf(p, payments) !== p.amount && <span className="block text-xs text-muted">业绩 {money(performanceOf(p, payments))}</span>}
                  {p.tipAmount > 0 && <span className="block text-xs text-muted">小费 {money(p.tipAmount)}{p.tipMethod && p.tipMethod !== p.paymentMethod ? `（${methodLabel(p.tipMethod)}）` : ''}</span>}
                </p>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(p)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-sand" aria-label="编辑"><Pencil size={16} /></button>
                  {canDelete && <button onClick={() => setConfirmDel(p)} className="grid h-9 w-9 place-items-center rounded-full text-rose-700 hover:bg-rose-50" aria-label="删除"><Trash2 size={16} /></button>}
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
