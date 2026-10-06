export const money = (n) => {
  const v = Number(n || 0)
  const body = Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  return `${v < 0 ? '-' : ''}$${body}`
}

const pad = (n) => String(n).padStart(2, '0')

export const dayKey = (iso) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
export const todayKey = () => dayKey(new Date().toISOString())
export const monthKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`

export const fmtDay = (iso) =>
  new Date(iso).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })
export const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
export const fmtDateTime = (iso) => `${fmtDay(iso)} ${fmtTime(iso)}`

// <input type="datetime-local"> needs local time without timezone
export const toLocalInput = (iso) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
export const defaultStart = () => {
  const d = new Date()
  d.setMinutes(0, 0, 0)
  d.setHours(d.getHours() + 1)
  return toLocalInput(d.toISOString())
}

export const STATUS = {
  scheduled: { label: '已预约', cls: 'bg-sky-100 text-sky-800' },
  completed: { label: '已完成', cls: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: '已取消', cls: 'bg-stone-200 text-stone-600' },
  'no-show': { label: '未到', cls: 'bg-rose-100 text-rose-800' },
}

// One-click "add to Google Calendar" link (no API keys needed).
export function googleCalendarUrl(appt, customerName, location = '') {
  const start = new Date(appt.start)
  const end = new Date(start.getTime() + (appt.durationMin || 60) * 60000)
  const f = (d) => d.toISOString().replace(/[-:]|\.\d{3}/g, '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${appt.service} · ${customerName}`,
    dates: `${f(start)}/${f(end)}`,
    details: appt.notes || '',
    location,
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

// CSV with BOM so Excel / Google Sheets open Chinese text correctly.
export function downloadCsv(filename, rows) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = rows.map((r) => r.map(esc).join(',')).join('\n')
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

export const METHODS = [
  { id: 'cash', label: '现金' },
  { id: 'transfer', label: '转账' },
  { id: 'credit_card', label: '信用卡' },
  { id: 'other', label: '其他' },
]
export const methodLabel = (id) => METHODS.find((m) => m.id === id)?.label || '—'
