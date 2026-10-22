import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from '../lib/router'
import { CheckCircle2, Clock, MapPin, MessageCircle, Phone } from 'lucide-react'
import { useLang } from '../i18n'
import { business, categories, serviceGroups } from '../data/site'
import { BOOKABLE, singleMinutes } from '../data/bookable'
import { clearConsultService, getConsultService, setConsultService } from '../consult'
import { ui } from '../components/ui'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import { openPicker } from '../lib/util'

const field = 'w-full rounded-2xl border border-ink/10 bg-ivory px-4 py-3.5 outline-none transition focus:border-gold'

const readBase64 = (file) => new Promise((resolve, reject) => {
  const r = new FileReader()
  r.onload = () => resolve(String(r.result).split(',')[1] || '')
  r.onerror = reject
  r.readAsDataURL(file)
})

function useApiSubmit(endpoint, onSuccess, transform) {
  // When the form appeared: the server rejects submissions made faster than a person could type.
  const [shownAt] = useState(() => Date.now())
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState(false) // false, or the reason (the server's message) once a send has failed
  const onSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setFailed(false)
    const form = new FormData(e.target)
    const raw = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === 'string'))
    const data = { ...(transform ? transform(raw) : raw), _elapsed: Date.now() - shownAt }
    try {
      // The resume travels inside the JSON body as base64 (the careers API emails it as an attachment).
      const file = form.get('resume')
      if (file instanceof File && file.size > 0) {
        if (file.size > 3 * 1024 * 1024) throw new Error('resume too large')
        data.resumeName = file.name
        data.resumeData = await readBase64(file)
      }
      const res = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setSent(true)
        onSuccess?.()
      } else {
        const body = await res.json().catch(() => null)
        setFailed((body && body.error) || true)
      }
    } catch {
      // network/API error — form stays visible so the visitor can retry
      setFailed(true)
    } finally {
      setSending(false)
    }
  }
  return [sent, onSubmit, { sending, failed }]
}

function Sent({ text }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[2rem] bg-sand p-12 text-center">
      <CheckCircle2 size={40} className="text-gold" />
      <p className="font-display text-2xl">{text}</p>
    </div>
  )
}

// Online booking: choose a package (60 / 90 min services) or a style (lashes), a visit type, a date and a time.
// First visit and returning member pay the same price; a returning non-member pays the regular price.
// Which treatments can be booked, and their fixed lengths, are in data/bookable.js (the CRM's 服务项目管理 uses the same list).
const treatmentByKey = (key) => categories.flatMap((c) => c.treatments).find((x) => x.key === key)
const PACKAGE_MINUTES = [60, 90]
const PACKAGE_MINUTES_FOR = { 'back-cupping': [30, 60], 'body-peel': [60, 60], 'lymph-gua-sha': [30, 60] } // treatments whose two packages have other lengths
// Lashes: every set takes 60 minutes; the lower lashes (下睫毛) and a fill (补睫毛) take 30. The same lengths are the CRM's defaults.
const lashMinutes = (name) => (/下睫毛|补睫毛/.test(name?.zh || '') ? 30 : 60)
const optionsFor = (key) => {
  const item = treatmentByKey(key)
  if (BOOKABLE[key] === 'single') return [{ name: item.name, first: '', member: '', return: '', minutes: singleMinutes(key) }]
  if (BOOKABLE[key] === 'packages') {
    return item.packages.map((pk, i) => ({
      name: pk.name,
      sub: { en: pk.perks.en.join(' · '), zh: pk.perks.zh.join(' · ') },
      first: pk.price,
      member: pk.price,
      return: pk.was,
      minutes: (PACKAGE_MINUTES_FOR[key] || PACKAGE_MINUTES)[i],
    }))
  }
  return item.prices.map((r, i) => ({
    name: r.name,
    sub: item.styles?.[i]?.body,
    first: `$${r.member}`,
    member: `$${r.member}`,
    return: `$${r.single}`,
    minutes: lashMinutes(r.name),
  }))
}
const VISITS = [
  { key: 'first', label: { en: 'First visit', zh: '初次体验' } },
  { key: 'member', label: { en: 'Returning member', zh: '会员再来' } },
  { key: 'return', label: { en: 'Returning non-member', zh: '非会员再来' } },
]
const visitOf = (key) => VISITS.find((v) => v.key === key)
const OPEN_MIN = 10 * 60
const CLOSE_MIN = 19 * 60
const pad = (n) => String(n).padStart(2, '0')
const clock = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const slotsFor = (minutes) => {
  const out = []
  for (let m = OPEN_MIN; m + minutes <= CLOSE_MIN; m += 30) out.push(clock(m))
  return out
}

// What the visitor has picked: the option (package / style), its visit-type label and price.
function bookingInfo(key, b) {
  const opts = optionsFor(key)
  const index = opts[b.pkg] ? b.pkg : 0
  const opt = opts[index]
  return { opt, index, visit: visitOf(b.visit), price: opt[b.visit] }
}

function bookingSummary(key, b, t) {
  const { opt, visit, price } = bookingInfo(key, b)
  return [
    `【${t({ en: 'Booking', zh: '预约' })}】${t(opt.name)}`,
    BOOKABLE[key] === 'single' && `${t({ en: 'Length', zh: '时长' })}: ${opt.minutes} ${t({ en: 'min', zh: '分钟' })}`,
    price && `${t({ en: 'Visit', zh: '到访类型' })}: ${t(visit.label)}`,
    price && `${t({ en: 'Price', zh: '价格' })}: ${price}`,
    `${t({ en: 'Date', zh: '日期' })}: ${b.date} ${b.time}`,
  ].filter(Boolean).join(' | ')
}

// The times still open on a day, asked from the server (it knows the room's hours, closures and bookings).
// status: 'idle' (no date yet) | 'loading' | 'ok' | 'error' (the lookup failed: the form falls back to the plain time list).
function useOpenTimes(serviceKey, date, minutes) {
  const [state, setState] = useState({ status: 'idle', slots: [], reason: '', open: '', close: '' })
  useEffect(() => {
    if (!date) { setState({ status: 'idle', slots: [], reason: '' }); return undefined }
    const ctl = new AbortController()
    setState((cur) => ({ ...cur, status: 'loading' }))
    fetch(`/api/availability?${new URLSearchParams({ date, service: serviceKey, minutes: String(minutes) })}`, { signal: ctl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('lookup failed'))))
      .then((d) => setState({ status: 'ok', slots: d.slots || [], reason: d.reason || '', open: d.open || '', close: d.close || '' }))
      .catch((err) => { if (err.name !== 'AbortError') setState({ status: 'error', slots: [], reason: '' }) })
    return () => ctl.abort()
  }, [serviceKey, date, minutes])
  return state
}

function ServiceBooking({ serviceKey, value, onChange }) {
  const { t } = useLang()
  const opts = optionsFor(serviceKey)
  const { opt, index, price } = bookingInfo(serviceKey, value)
  const open = useOpenTimes(serviceKey, value.date, opt.minutes)
  const slots = open.status === 'error' ? slotsFor(opt.minutes) : open.slots
  const isStyles = BOOKABLE[serviceKey] === 'styles'
  const isMedical = BOOKABLE[serviceKey] === 'single'
  const set = (patch) => onChange({ ...value, ...patch })
  const choose = 'cursor-pointer rounded-2xl border px-4 py-3 text-left transition'
  const on = 'border-gold bg-gold/10'
  const off = 'border-ink/10 bg-ivory hover:border-gold'
  return (
    <div className="space-y-5 rounded-[1.5rem] bg-sand p-5 sm:col-span-2 sm:p-6">
      {isMedical && (
        <p className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="font-display text-xl">{t(opt.name)}</span>
          <span className="text-sm text-muted">{t({ en: 'About', zh: '预计时长' })} {opt.minutes} {t({ en: 'minutes', zh: '分钟' })}</span>
        </p>
      )}
      {!isMedical && (
      <div>
        <p className="eyebrow mb-3">{isStyles ? t({ en: 'Style', zh: '选择款式' }) : t({ en: 'Package', zh: '选择套餐' })}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {opts.map((o, i) => (
            <button
              type="button"
              key={i}
              aria-pressed={index === i}
              onClick={() => set({ pkg: i, time: '' })}
              className={`${choose} ${index === i ? on : off}`}
            >
              <span className="block font-medium">{t(o.name)}</span>
              {o.sub && <span className="mt-1 line-clamp-2 block text-sm text-muted">{t(o.sub)}</span>}
            </button>
          ))}
        </div>
      </div>
      )}

      {price && (
      <div>
        <p className="eyebrow mb-3">{t({ en: 'Visit type', zh: '初次或再来' })}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {VISITS.map((v) => (
            <button type="button" key={v.key} aria-pressed={value.visit === v.key} onClick={() => set({ visit: v.key })} className={`${choose} flex items-baseline justify-between gap-3 sm:flex-col sm:items-start sm:gap-1 ${value.visit === v.key ? on : off}`}>
              <span className="font-medium">{t(v.label)}</span>
              <span className="font-display text-2xl">{opt[v.key]}</span>
            </button>
          ))}
        </div>
      </div>
      )}

      <div className="space-y-4">
        <label className="block sm:max-w-xs">
          <span className="eyebrow mb-2 block">{t({ en: 'Date', zh: '预约日期' })}</span>
          <input required type="date" min={todayStr()} value={value.date} onChange={(e) => set({ date: e.target.value, time: '' })} className={field}  onClick={openPicker} onFocus={openPicker} />
        </label>
        <div className="relative">
          <span className="eyebrow mb-2 block">{t({ en: 'Available times', zh: '可预约时间' })}</span>
          {/* A hidden field so the browser still asks for a time before the form is sent. */}
          <input required readOnly tabIndex={-1} aria-hidden="true" value={value.time} className="pointer-events-none absolute bottom-0 left-1/2 h-0 w-0 opacity-0" />
          {!value.date ? (
            <p className="rounded-2xl border border-dashed border-ink/15 px-4 py-3 text-sm text-muted">{t({ en: 'Choose a date to see the times that are open.', zh: '请先选择日期，这里会显示当天可预约的时间。' })}</p>
          ) : open.status === 'loading' ? (
            <p className="px-1 py-3 text-sm text-muted" role="status">{t({ en: 'Checking available times…', zh: '正在查询可预约时间…' })}</p>
          ) : slots.length === 0 ? (
            <p className="rounded-2xl bg-ivory px-4 py-3 text-sm text-ink" role="status">
              {open.reason === 'service-closed'
                ? t({ en: 'This treatment is not open for online booking right now. Please call or send us a message.', zh: '这个项目暂时不开放网上预约，请致电或留言咨询。' })
                : open.reason === 'closed'
                ? t({ en: 'We are closed for this treatment on that day. Please choose another date.', zh: '这一天该项目不开放预约，请选择其他日期。' })
                : open.reason === 'past' || open.reason === 'far'
                  ? t({ en: 'Please choose a date within the next three months.', zh: '请选择未来三个月内的日期。' })
                  : t({ en: 'No times left on that day. Please choose another date.', zh: '这一天已约满，请选择其他日期。' })}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5" role="group" aria-label={t({ en: 'Available times', zh: '可预约时间' })}>
              {slots.map((x) => (
                <button
                  type="button"
                  key={x}
                  aria-pressed={value.time === x}
                  onClick={() => set({ time: x })}
                  className={`rounded-xl border px-2 py-2.5 text-sm tabular-nums transition ${value.time === x ? 'border-gold bg-gold text-ivory' : 'border-ink/10 bg-ivory hover:border-gold'}`}
                >
                  {x}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="flex flex-wrap items-baseline justify-between gap-2 border-t border-ink/10 pt-4">
        <span className="text-sm text-muted">{t(opt.name)}{price ? ` · ${t(visitOf(value.visit).label)}` : ''}</span>
        {price ? <span className="font-display text-3xl">{price}</span> : <span className="text-sm text-muted">{t({ en: 'Price confirmed when we call you', zh: '价格由我们与您确认' })}</span>}
      </p>
      <p className="text-xs text-muted">{open.open && open.close
          ? t({ en: `Open ${open.open} – ${open.close} that day. Our team will confirm your appointment by phone or email.`, zh: `当天营业时间 ${open.open} – ${open.close}，我们会通过电话或邮件与您确认预约。` })
          : t({ en: 'Open 10:00 am – 7:00 pm. Our team will confirm your appointment by phone or email.', zh: '营业时间 10:00 – 19:00，我们会通过电话或邮件与您确认预约。' })}</p>
    </div>
  )
}

export default function Contact() {
  const { t } = useLang()
  const [applied, onApply] = useApiSubmit('careers')
  const loc = business.locations[0]

  // A "Consult" button on a service page leaves the service key in a cookie.
  // It only seeds the form once; after that the visitor can change both selects.
  const findService = (key) => {
    // 'group:<id>' pre-selects only the top-level category (e.g. the Products page enquiry button).
    if (key.startsWith('group:')) {
      const g = serviceGroups.find((x) => x.id === key.slice(6))
      return g ? { group: g.id, value: '' } : null
    }
    for (const g of serviceGroups) for (const sec of g.sections) for (const x of sec.items) {
      if (x.key === key) return { group: g.id, value: x.value }
    }
    return null
  }
  const [preset] = useState(() => findService(getConsultService()))
  const [group, setGroup] = useState(preset?.group || '')
  const [interest, setInterest] = useState(preset?.value || '')

  // Keep the cookie in step with the visitor's choice (cleared when nothing is chosen).
  const chooseService = (value) => {
    setInterest(value)
    const item = serviceGroups.flatMap((g) => g.sections.flatMap((sec) => sec.items)).find((x) => x.value === value)
    if (item) setConsultService(item.key); else clearConsultService()
  }
  const activeGroup = serviceGroups.find((g) => g.id === group)

  const [params] = useSearchParams()
  const serviceItems = serviceGroups.flatMap((g) => g.sections.flatMap((sec) => sec.items))
  const bookKey = Object.keys(BOOKABLE).find((k) => serviceItems.find((x) => x.key === k)?.value === interest) || ''
  const pkgParam = Number(params.get('package'))
  const [booking, setBooking] = useState({ pkg: Number.isInteger(pkgParam) && pkgParam > 0 ? pkgParam : 0, visit: 'first', date: '', time: '' })
  const [sent, onSubmit, { sending, failed }] = useApiSubmit('contact', clearConsultService, (raw) => {
    if (!bookKey) return raw
    const { opt, visit, price } = bookingInfo(bookKey, booking)
    return {
      ...raw,
      package: t(opt.name),
      visitType: visit.key,
      price,
      date: booking.date,
      time: booking.time,
      message: [bookingSummary(bookKey, booking, t), raw.message].filter(Boolean).join('\n'),
    }
  })
  const formRef = useRef(null)
  useEffect(() => {
    if (preset) formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [preset])

  return (
    <>
      <PageHeader
        eyebrow={t(ui.nav.contact)}
        title={t({ en: 'Let’s plan your visit', zh: '预约您的到访' })}
        intro={
          <>
            {t({ en: 'Reach out with questions, comments or scheduling requests. We warmly welcome your visit.', zh: '欢迎咨询、留言或预约。我们诚挚地欢迎您的到来。' })}
            <span className="block">{t({ en: 'Ample, convenient free parking on site', zh: '配备充足便捷的免费停车位' })}</span>
          </>
        }
      >
        <a href={business.phoneHref} className="btn-primary mt-8"><Phone size={16} /> {business.phone}</a>
      </PageHeader>

      <section className="container-x grid gap-12 py-16 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <h2 className="font-display text-3xl">{t({ en: 'Appointments & Inquiries', zh: '预约与咨询' })}</h2>
          {sent ? (
            <div className="mt-8"><Sent text={t({ en: 'Thank you — we’ll be in touch soon.', zh: '感谢留言，我们会尽快联系您。' })} /></div>
          ) : (
            <form ref={formRef} onSubmit={onSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
              <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
              <input required name="name" placeholder={t({ en: 'Name', zh: '姓名' })} className={field} autoComplete="name" />
              <input required name="phone" type="tel" placeholder={t({ en: 'Phone', zh: '电话' })} className={field} autoComplete="tel" />
              <input name="email" type="email" placeholder={t({ en: 'Email (optional)', zh: '邮箱（选填）' })} className={field} autoComplete="email" />
              <input name="wechat" placeholder={t({ en: 'WeChat ID (optional)', zh: '微信号（选填）' })} className={field} autoComplete="off" />
              {/* Step 1: big title */}
              <select
                value={group}
                onChange={(e) => { setGroup(e.target.value); chooseService('') }}
                aria-label={t({ en: 'Service category', zh: '服务类别' })}
                className={field}
              >
                <option value="">{t({ en: 'Category…', zh: '选择类别…' })}</option>
                {serviceGroups.map((g) => <option key={g.id} value={g.id}>{t(g.name)}</option>)}
              </select>
              {/* Step 2: services in that category */}
              <select
                value={interest}
                onChange={(e) => chooseService(e.target.value)}
                disabled={!activeGroup}
                aria-label={t({ en: 'Service', zh: '服务项目' })}
                className={`${field} disabled:opacity-50`}
              >
                <option value="">{activeGroup ? t({ en: 'Service…', zh: '选择项目…' }) : t({ en: 'Pick a category first', zh: '请先选择类别' })}</option>
                {activeGroup && (activeGroup.sections.length > 1
                  ? activeGroup.sections.map((sec) => (
                    <optgroup key={sec.slug} label={t(sec.name)}>
                      {sec.items.map((x) => <option key={x.key} value={x.value}>{t(x.name)}</option>)}
                    </optgroup>
                  ))
                  : activeGroup.sections.flatMap((sec) => sec.items).map((x) => <option key={x.key} value={x.value}>{t(x.name)}</option>))}
              </select>
              <input type="hidden" name="interest" value={interest} />
              <input type="hidden" name="category" value={activeGroup ? activeGroup.name.zh : ''} />
              {/* English names for the SMS alert (carrier gateways drop Chinese characters). */}
              <input type="hidden" name="categoryEn" value={activeGroup ? activeGroup.name.en : ''} />
              <input type="hidden" name="interestEn" value={serviceItems.find((x) => x.value === interest)?.name.en || ''} />
              {bookKey && <ServiceBooking key={bookKey} serviceKey={bookKey} value={booking} onChange={setBooking} />}
              <textarea name="message" rows={5} placeholder={t({ en: 'How can we help?', zh: '请留言…' })} className={`${field} sm:col-span-2`} />
              <button disabled={sending} className="btn-primary sm:col-span-2 sm:justify-self-start disabled:opacity-60">{sending ? t({ en: 'Sending…', zh: '发送中…' }) : t({ en: 'Send message', zh: '发送' })}</button>
              {failed && <p className="text-sm text-red-700 sm:col-span-2" role="alert">{failed === 'invalid phone'
                ? t({ en: 'Please check your phone number (digits only, 7–15 digits; spaces, + - ( ) allowed).', zh: '电话格式不对，请检查（7–15 位数字，可含空格、+ - ( )）。' })
                : failed === 'invalid email'
                  ? t({ en: 'Please check your email address.', zh: '邮箱格式不对，请检查。' })
                  : /too many/i.test(String(failed))
                    ? t({ en: 'Too many attempts. Please wait a few minutes and try again, or call us.', zh: '尝试次数过多，请几分钟后再试，或直接致电我们。' })
                    : t({ en: 'Sorry, the message could not be sent. Please try again or call us.', zh: '抱歉，发送失败，请稍后重试或直接致电我们。' })}</p>}
            </form>
          )}
        </Reveal>

        <Reveal delay={100} className="space-y-6 lg:col-span-5">
          <div className="rounded-[2rem] bg-sand p-8">
            <p className="eyebrow mb-4 flex items-center gap-2"><Clock size={14} /> {t(ui.hours)}</p>
            <dl className="divide-y divide-ink/10">
              {business.hours.map((h, i) => (
                <div key={i} className="flex justify-between py-3">
                  <dt>{t(h.day)}</dt><dd className="text-muted">{t(h.time)}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-muted">{t(business.holidayNote)}</p>
            <p className="mt-1 text-sm text-muted">{t(business.urgentNote)}</p>
          </div>

          <div className="rounded-[2rem] bg-sand p-8">
            <p className="eyebrow mb-4 flex items-center gap-2"><MessageCircle size={14} /> {t({ en: 'Contact us on WeChat', zh: '微信联系' })}</p>
            <div className="flex items-center gap-6">
              <img src="/images/wechat-qr.jpg" alt={t({ en: 'WeChat QR code', zh: '微信二维码' })} loading="lazy" className="h-32 w-32 shrink-0 rounded-xl bg-white p-1.5 sm:h-36 sm:w-36" />
              <p className="leading-relaxed">
                {t({ en: 'Scan the QR code to add us on WeChat', zh: '微信二维码添加好友' })}
                <span className="block">{t({ en: 'or search for the WeChat ID:', zh: '或者微信搜索ID：' })}</span>
                <span className="mt-1 block font-display text-xl text-gold">{business.wechatId}</span>
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-ink/10">
            <iframe key={loc.id} title={t(loc.label)} src={loc.embed} className="h-56 w-full grayscale-[0.4]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            <div className="flex items-start justify-between gap-4 p-6">
              <p className="flex gap-2"><MapPin size={18} className="mt-0.5 shrink-0 text-gold" /><span>{loc.line1}<br />{loc.line2}</span></p>
              <a href={loc.maps} target="_blank" rel="noreferrer" className="shrink-0 text-sm font-medium underline decoration-gold underline-offset-4">{t(ui.directions)}</a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Careers */}
      <section className="bg-plum-deep py-20 text-ivory">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow !text-gold-light">{t({ en: 'We’re hiring', zh: '招聘' })}</p>
            <h2 className="mt-4 font-display text-4xl font-light leading-tight sm:text-5xl">
              {t({ en: 'Join our team of health & beauty professionals.', zh: '加入我们的健康与美容专业团队。' })}
            </h2>
            <p className="mt-6 max-w-md text-ivory/70">
              {t({ en: 'Interested in an open position? Send us your details and attach your resume.', zh: '有意加入？请留下信息并附上简历。' })}
            </p>
          </Reveal>
          <Reveal delay={100}>
            {applied ? (
              <div className="text-ink"><Sent text={t({ en: 'Application received — thank you!', zh: '已收到您的申请，谢谢！' })} /></div>
            ) : (
              <form onSubmit={onApply} className="grid gap-4 sm:grid-cols-2 [&_input]:border-ivory/15 [&_input]:bg-ivory/5 [&_input]:text-ivory [&_input]:placeholder:text-ivory/40">
                <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
                <input required name="name" placeholder={t({ en: 'Name', zh: '姓名' })} className={field} autoComplete="name" />
                <input name="phone" placeholder={t({ en: 'Phone', zh: '电话' })} type="tel" className={field} autoComplete="tel" />
                <input required name="email" type="email" placeholder={t({ en: 'Email', zh: '邮箱' })} className={`${field} sm:col-span-2`} autoComplete="email" />
                <label className="sm:col-span-2 cursor-pointer rounded-2xl border border-dashed border-ivory/25 px-4 py-6 text-center text-sm text-ivory/60 transition hover:border-gold-light">
                  {t({ en: 'Attach resume (PDF, DOC, up to 3MB)', zh: '上传简历（PDF、DOC，3MB 以内）' })}
                  <input type="file" name="resume" accept=".pdf,.doc,.docx" className="sr-only" />
                </label>
                <button className="btn-light sm:col-span-2 sm:justify-self-start">{t({ en: 'Submit application', zh: '提交申请' })}</button>
              </form>
            )}
          </Reveal>
        </div>
      </section>
    </>
  )
}
