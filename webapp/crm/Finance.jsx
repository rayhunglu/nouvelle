import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Download, HandCoins, Pencil, Plus, Receipt, Trash2, TrendingUp } from 'lucide-react'
import { useCrm } from './data'
import PaymentForm from './PaymentForm'
import { Card, Empty, PageTitle, StatCard, inputCls } from './ui'
import { downloadCsv, fmtDateTime, methodLabel, money, monthKey } from './format'

export default function Finance() {
  const { payments, appointments, customerById, serviceById, remove } = useCrm()
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
  const revenue = rows.reduce((s, p) => s + p.amount, 0)
  const tips = rows.reduce((s, p) => s + p.tipAmount, 0)

  const byStaff = useMemo(() => {
    const m = new Map()
    for (const p of payments.filter(inMonth)) {
      const k = p.staff || '未指定'
      const cur = m.get(k) || { name: k, count: 0, revenue: 0, tips: 0 }
      cur.count += 1; cur.revenue += p.amount; cur.tips += p.tipAmount
      m.set(k, cur)
    }
    return [...m.values()].sort((a, b) => b.revenue - a.revenue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments, month])

  const serviceNames = (p) => p.serviceIds.map((id) => serviceById[id]?.name).filter(Boolean).join('、')

  const del = async (p) => {
    if (!window.confirm('确定删除这笔收款记录？')) return
    setError('')
    try { await remove('payments', p.id) } catch (err) { setError(err.message) }
  }

  const exportCsv = () =>
    downloadCsv(`nouvelle-payments-${month || 'all'}.csv`, [
      ['收款时间', '客户', '服务项目', '金额', '小费', '付款方式', '介绍人', '员工', '关联预约'],
      ...rows.map((p) => [
        fmtDateTime(p.datetime), customerById[p.customerId]?.name || '', serviceNames(p), p.amount, p.tipAmount,
        methodLabel(p.paymentMethod), p.referralSource, p.staff, p.appointmentId ? '是' : '否',
      ]),
    ])

  return (
    <>
      <PageTitle title="账目" sub="记录每一笔收款 · 导出 CSV 后可直接导入 Google 表格">
        <button onClick={exportCsv} className="btn-ghost !py-2.5" disabled={!rows.length}><Download size={16} /> 导出 CSV</button>
        <button onClick={() => setEditing('new')} className="btn-primary !py-2.5"><Plus size={16} /> 记一笔</button>
      </PageTitle>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className={`${inputCls} !w-auto`} aria-label="月份" />
        <button onClick={() => setMonth('')} className={`rounded-full px-4 py-2 text-sm ${!month ? 'bg-ink text-ivory' : 'bg-white text-muted'}`}>全部月份</button>
        <select value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)} aria-label="按员工筛选" className={`${inputCls} !w-auto sm:ml-auto`}>
          <option value="">全部员工</option>
          {staffNames.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard icon={TrendingUp} label="营收" value={money(revenue)} />
        <StatCard icon={HandCoins} label="小费" value={money(tips)} />
        <StatCard icon={Receipt} label="笔数" value={rows.length} />
      </div>

      {byStaff.length > 0 && (
        <Card className="mb-6 p-5">
          <h2 className="mb-3 text-sm font-medium">员工业绩{month ? `（${month}）` : ''}</h2>
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
                    {fmtDateTime(p.datetime)}{p.staff ? ` · 员工 ${p.staff}` : ''}{p.referralSource ? ` · 介绍人 ${p.referralSource}` : ''}{p.appointmentId ? '' : ' · 临时消费'}
                  </p>
                </div>
                <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs">{methodLabel(p.paymentMethod)}</span>
                <p className="w-28 text-right text-sm">
                  <b className="font-medium text-emerald-700">{money(p.amount)}</b>
                  {p.tipAmount > 0 && <span className="block text-xs text-muted">小费 {money(p.tipAmount)}</span>}
                </p>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(p)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-sand" aria-label="编辑"><Pencil size={16} /></button>
                  <button onClick={() => del(p)} className="grid h-9 w-9 place-items-center rounded-full text-rose-700 hover:bg-rose-50" aria-label="删除"><Trash2 size={16} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

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
