import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, HandCoins, TrendingUp, Users } from 'lucide-react'
import { api } from '../api'
import { useCrm } from './data'
import { Card, Empty, PageTitle, StatCard, StatusBadge } from './ui'
import { fmtDay, fmtTime, money } from './format'

function ApptRow({ a, name }) {
  return (
    <li className="flex items-center gap-4 px-5 py-3.5">
      <div className="w-16 shrink-0 text-sm font-medium">{fmtTime(a.start)}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{a.service}</p>
        <p className="truncate text-xs text-muted">{name}</p>
      </div>
      <StatusBadge status={a.status} />
    </li>
  )
}

function Bars({ months }) {
  const max = Math.max(1, ...months.flatMap((m) => [m.revenue, m.tips]))
  return (
    <div className="flex h-44 items-end gap-3">
      {months.map((m) => (
        <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-36 w-full items-end justify-center gap-1">
            <div className="w-full max-w-[18px] rounded-t-md bg-gold" style={{ height: `${(m.revenue / max) * 100}%` }} title={`营收 ${money(m.revenue)}`} />
            <div className="w-full max-w-[18px] rounded-t-md bg-ink/25" style={{ height: `${(m.tips / max) * 100}%` }} title={`小费 ${money(m.tips)}`} />
          </div>
          <span className="text-[0.7rem] text-muted">{Number(m.month.slice(5))}月</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { customerById, appointments, payments } = useCrm()
  const [summary, setSummary] = useState(null)

  // Refetch when appointments/transactions change so the numbers stay current.
  useEffect(() => {
    api('/crm/summary').then(setSummary).catch(() => {})
  }, [appointments, payments])

  if (!summary) return <p className="text-sm text-muted">加载中…</p>
  const name = (a) => customerById[a.customerId]?.name || '（已删除客户）'

  return (
    <>
      <PageTitle title="总览" sub={new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={CalendarCheck} label="今日预约" value={summary.today.length} />
        <StatCard icon={Users} label="客户总数" value={summary.customers} />
        <StatCard icon={TrendingUp} label="本月营收" value={money(summary.month.revenue)} hint={`${summary.month.count} 笔收款`} />
        <StatCard icon={HandCoins} label="本月小费" value={money(summary.month.tips)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="border-b border-ink/10 px-5 py-4">
            <h2 className="font-medium">今日预约</h2>
          </div>
          {summary.today.length === 0 ? <Empty>今天没有预约</Empty> : (
            <ul className="divide-y divide-ink/10">{summary.today.map((a) => <ApptRow key={a.id} a={a} name={name(a)} />)}</ul>
          )}
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium">近 6 个月</h2>
            <div className="flex gap-3 text-xs text-muted">
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-gold" />营收</span>
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-ink/25" />小费</span>
            </div>
          </div>
          <Bars months={summary.months} />
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <h2 className="font-medium">未来 7 天</h2>
          <Link to="/crm/appointments" className="text-sm text-gold hover:underline">全部预约</Link>
        </div>
        {summary.upcoming.length === 0 ? <Empty>未来 7 天没有预约</Empty> : (
          <ul className="divide-y divide-ink/10">
            {summary.upcoming.map((a) => (
              <li key={a.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-24 shrink-0 text-sm"><span className="font-medium">{fmtDay(a.start)}</span><br /><span className="text-xs text-muted">{fmtTime(a.start)}</span></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.service}</p>
                  <p className="truncate text-xs text-muted">{name(a)}</p>
                </div>
                <span className="text-sm text-muted">{a.price ? money(a.price) : ''}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}
