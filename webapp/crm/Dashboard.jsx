import { useEffect, useState } from 'react'
import { CalendarCheck, HandCoins, MessageCircle, Phone, TrendingUp, Users } from 'lucide-react'
import { api } from '../api'
import { useCrm } from './data'
import { Card, PageTitle, StatCard, StatusBadge } from './ui'
import { fmtTime, money } from './format'

function ApptRow({ a, name }) {
  return (
    <li className="flex items-center gap-3 px-4 py-2">
      <div className="w-12 shrink-0 text-sm font-medium">{fmtTime(a.start)}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{a.service}</p>
        <p className="truncate text-xs text-muted">{name}</p>
      </div>
      <StatusBadge status={a.status} />
    </li>
  )
}

// A booking to remind the customer about: when it is, and how to reach them.
function ReminderRow({ a, customer }) {
  const c = customer || {}
  const wechat = [c.wechatId, c.wechatNo].filter(Boolean).join(' · ')
  return (
    <li className="flex items-center gap-3 px-4 py-2">
      <div className="w-12 shrink-0 text-sm font-medium">{fmtTime(a.start)}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{c.name || '（已删除客户）'}<span className="font-normal text-muted"> · {a.service}</span></p>
        <p className="flex flex-wrap gap-x-3 text-xs text-muted">
          {c.phone && <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 text-ink hover:underline"><Phone size={11} />{c.phone}</a>}
          {wechat && <span className="inline-flex items-center gap-1"><MessageCircle size={11} />{wechat}</span>}
          {c.email && <span className="truncate">{c.email}</span>}
          {!c.phone && !wechat && !c.email && <span>没有联系方式</span>}
        </p>
      </div>
    </li>
  )
}

function Bars({ months }) {
  const max = Math.max(1, ...months.flatMap((m) => [m.revenue, m.tips]))
  return (
    <div className="flex h-24 items-end gap-2">
      {months.map((m) => (
        <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex h-16 w-full items-end justify-center gap-1">
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
      <PageTitle compact title="总览" sub={new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })} />

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <StatCard compact icon={CalendarCheck} label="今日预约" value={summary.today.length} />
        <StatCard compact icon={Users} label="客户 · 今日 / 总数" value={`${summary.todayCustomers} / ${summary.customers}`} />
        <StatCard compact icon={TrendingUp} label="本月营收" value={money(summary.month.revenue)} hint={`${summary.month.count} 笔`} />
        <StatCard compact icon={HandCoins} label="本月小费" value={money(summary.month.tips)} />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="space-y-3">
          <Card>
            <div className="border-b border-ink/10 px-4 py-2">
              <h2 className="text-sm font-medium">今日预约</h2>
            </div>
            {summary.today.length === 0 ? <p className="px-4 py-3 text-center text-xs text-muted">今天没有预约</p> : (
              <ul className="max-h-28 divide-y divide-ink/10 overflow-y-auto lg:max-h-[calc((100vh-19rem)/2)]">{summary.today.map((a) => <ApptRow key={a.id} a={a} name={name(a)} />)}</ul>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b border-ink/10 px-4 py-2">
              <h2 className="text-sm font-medium">明日预约 · 预约提醒</h2>
              <span className="text-xs text-muted">{summary.tomorrow.length} 位</span>
            </div>
            {summary.tomorrow.length === 0 ? <p className="px-4 py-3 text-center text-xs text-muted">明天没有预约</p> : (
              <ul className="max-h-28 divide-y divide-ink/10 overflow-y-auto lg:max-h-[calc((100vh-19rem)/2)]">{summary.tomorrow.map((a) => <ReminderRow key={a.id} a={a} customer={customerById[a.customerId]} />)}</ul>
            )}
          </Card>
        </div>

        <Card className="px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium">近 6 个月</h2>
            <div className="flex gap-3 text-xs text-muted">
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-gold" />营收</span>
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-ink/25" />小费</span>
            </div>
          </div>
          <Bars months={summary.months} />
        </Card>
      </div>
    </>
  )
}
