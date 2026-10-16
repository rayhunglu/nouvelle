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
  'checked-in': { label: 'Check in', cls: 'bg-lime-200 text-lime-900' },
  'in-service': { label: 'In service', cls: 'bg-fuchsia-100 text-fuchsia-800' },
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
  { id: 'credit_card', label: 'Credit card' },
  { id: 'cash', label: 'Cash' },
  { id: 'zelle', label: 'Zelle' },
  { id: 'venmo', label: 'Venmo' },
  { id: 'member_card', label: '会员卡' },
  { id: 'other', label: '其他' },
  { id: 'unsettled', label: '未结算' }, // checked out, money not collected yet: owed, not counted as revenue
]
// Older records may still carry this one; it is not offered for new payments.
const LEGACY_METHODS = [{ id: 'transfer', label: '转账' }]
// Member card balance: everything loaded onto the card minus everything paid with it. The amount and the tip can each be
// paid by a different method (`tipMethod`, same as `paymentMethod` when absent).
export const cardSpent = (p) => (p.paymentMethod === 'member_card' ? p.amount : 0) + ((p.tipMethod || p.paymentMethod) === 'member_card' ? p.tipAmount || 0 : 0)
// Top-up gifts: $200 card credit, or a free 光子嫩肤 / 热拉提 session.
export const GIFT_OPTIONS = [
  { id: 'cash200', label: '赠送 $200 余额' },
  { id: 'photofacial', label: '赠送光子嫩肤' },
  { id: 'thermage', label: '赠送热拉提' },
]
export const giftLabel = (id) => GIFT_OPTIONS.find((g) => g.id === id)?.label.replace('赠送', '').trim() || id
export const TOPUP_AMOUNTS = [1000, 2000, 3000]
export const giftsAllowed = (topUp) => (topUp >= 3000 ? 2 : topUp >= 2000 ? 1 : 0)
export const cardLoaded = (p) => (p.topUp || 0) + 200 * (p.topUpGifts || []).filter((g) => g === 'cash200').length
// Free sessions earned from top-ups (光子嫩肤 / 热拉提) minus the ones already used, as { id: count } (zero counts left out).
export const giftItems = (payments, customerId, exceptId) => {
  const m = {}
  for (const p of payments) {
    if (p.customerId !== customerId || p.id === exceptId) continue
    for (const g of p.topUpGifts || []) if (g !== 'cash200') m[g] = (m[g] || 0) + 1
    if (p.giftUsed) m[p.giftUsed] = (m[p.giftUsed] || 0) - 1
  }
  return Object.fromEntries(Object.entries(m).filter(([, n]) => n > 0))
}
// Which gift a service redeems: services whose name contains the gift's project.
export const GIFT_SERVICE = { photofacial: /光子嫩肤/, thermage: /热拉提/ }
export const giftForService = (name) => Object.keys(GIFT_SERVICE).find((g) => GIFT_SERVICE[g].test(name || '')) || ''
// Staff performance of a payment. Only one kind of top-up is discounted: a $2,000 top-up that came with a $200 cash gift. Money
// spent from such a card counts for 2000 / 2200 of the amount paid (a $198 service counts as 198 × 2000 / 2200, about $180).
// Every other payment, and member-card payments from any other top-up, counts for the amount actually paid.
export const cardRatio = (payments, p) => {
  const mine = payments.filter((x) => x.customerId === p.customerId && x.datetime <= p.datetime && (x.topUp || 0) > 0)
  const paid = mine.reduce((n, x) => n + x.topUp, 0)
  const cashGifts = (x) => (x.topUpGifts || []).filter((g) => g === 'cash200').length
  const credited = mine.reduce((n, x) => n + (x.topUp === 2000 && cashGifts(x) === 1 ? 2200 : x.topUp), 0)
  return credited > 0 ? paid / credited : 1
}
// A payment counts toward revenue and staff performance only when it is settled (see paidAmount) and, if it belongs to an
// appointment, that appointment is completed (checked in and out). apptById maps appointment id -> appointment.
export const countsForPerformance = (p, apptById) => !p.appointmentId || apptById[p.appointmentId]?.status === 'completed'
export const paidAmount = (p) => (p.paymentMethod === 'unsettled' ? 0 : p.amount) // what has actually been collected
export const paidTip = (p) => ((p.tipMethod || p.paymentMethod) === 'unsettled' ? 0 : p.tipAmount || 0)
export const performanceOf = (p, payments) => (p.paymentMethod === 'unsettled' ? 0 : p.paymentMethod === 'member_card' ? Math.round(p.amount * cardRatio(payments, p) * 100) / 100 : p.amount)
export const cardBalance = (payments, customerId, exceptId) => payments
  .filter((p) => p.customerId === customerId && p.id !== exceptId)
  .reduce((n, p) => n + cardLoaded(p) - cardSpent(p), 0)
export const methodLabel = (id) => [...METHODS, ...LEGACY_METHODS].find((m) => m.id === id)?.label || '—'

// Member categories. `rank` orders them (highest first); `chip` is the badge colour wherever the customer is shown.
export const MEMBER_TIERS = [
  { id: 'vip', label: 'VIP 会员', rank: 6, chip: 'bg-ink text-gold-light' },
  { id: '5000', label: '5000 会员', rank: 5, chip: 'bg-rose-200 text-rose-900' },
  { id: '3000', label: '3000 会员', rank: 4, chip: 'bg-amber-200 text-amber-900' },
  { id: '2000', label: '2000 会员', rank: 3, chip: 'bg-emerald-200 text-emerald-900' },
  { id: '1000', label: '1000 会员', rank: 2, chip: 'bg-sky-200 text-sky-900' },
  { id: 'member', label: '会员', rank: 1, chip: 'bg-gold text-white' }, // a member without a category (older records)
]
// The category of a customer: their chosen one, or the plain "会员" for older records marked only as a member; null = not a member.
export const tierOf = (c) => MEMBER_TIERS.find((t) => t.id === (c.memberTier || (c.member ? 'member' : ''))) || null
