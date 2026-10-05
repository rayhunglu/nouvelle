import { useState } from 'react'
import { CheckCircle2, Clock, MapPin, Phone } from 'lucide-react'
import { useLang } from '../i18n'
import { business, categories } from '../data/site'
import { ui } from '../components/ui'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'

const field = 'w-full rounded-2xl border border-ink/10 bg-ivory px-4 py-3.5 outline-none transition focus:border-gold'

function useApiSubmit(endpoint) {
  const [sent, setSent] = useState(false)
  const onSubmit = async (e) => {
    e.preventDefault()
    const data = Object.fromEntries(
      [...new FormData(e.target).entries()].filter(([, v]) => typeof v === 'string')
    )
    try {
      const res = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) setSent(true)
    } catch {
      // network/API error — form stays visible so the visitor can retry
    }
  }
  return [sent, onSubmit]
}

function Sent({ text }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[2rem] bg-sand p-12 text-center">
      <CheckCircle2 size={40} className="text-gold" />
      <p className="font-display text-2xl">{text}</p>
    </div>
  )
}

export default function Contact() {
  const { t } = useLang()
  const [sent, onSubmit] = useApiSubmit('contact')
  const [applied, onApply] = useApiSubmit('careers')
  const loc = business.locations[0]

  return (
    <>
      <PageHeader
        eyebrow={t(ui.nav.contact)}
        title={t({ en: 'Let’s plan your visit.', zh: '预约您的到访。' })}
        intro={t({ en: 'Reach out with questions, comments or scheduling requests. Treatments are by appointment — calling is the fastest way to book.', zh: '欢迎咨询、留言或预约。所有疗程需预约，电话预约最快捷。' })}
      >
        <a href={business.phoneHref} className="btn-primary mt-8"><Phone size={16} /> {business.phone}</a>
      </PageHeader>

      <section className="container-x grid gap-12 py-16 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <h2 className="font-display text-3xl">{t({ en: 'Send a message', zh: '在线留言' })}</h2>
          {sent ? (
            <div className="mt-8"><Sent text={t({ en: 'Thank you — we’ll be in touch soon.', zh: '感谢留言，我们会尽快联系您。' })} /></div>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
              <input required name="name" placeholder={t({ en: 'Name', zh: '姓名' })} className={field} autoComplete="name" />
              <input required name="phone" type="tel" placeholder={t({ en: 'Phone', zh: '电话' })} className={field} autoComplete="tel" />
              <input required name="email" type="email" placeholder={t({ en: 'Email', zh: '邮箱' })} className={`${field} sm:col-span-2`} autoComplete="email" />
              <select name="interest" defaultValue="" className={`${field} sm:col-span-2`}>
                <option value="" disabled>{t({ en: 'I’m interested in…', zh: '感兴趣的项目…' })}</option>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{t(c.name)}</option>)}
              </select>
              <textarea name="message" rows={5} placeholder={t({ en: 'How can we help?', zh: '请留言…' })} className={`${field} sm:col-span-2`} />
              <button className="btn-primary sm:col-span-2 sm:justify-self-start">{t({ en: 'Send message', zh: '发送' })}</button>
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
      <section className="bg-ink py-20 text-ivory">
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
                <input required name="name" placeholder={t({ en: 'Name', zh: '姓名' })} className={field} autoComplete="name" />
                <input name="phone" placeholder={t({ en: 'Phone', zh: '电话' })} type="tel" className={field} autoComplete="tel" />
                <input required name="email" type="email" placeholder={t({ en: 'Email', zh: '邮箱' })} className={`${field} sm:col-span-2`} autoComplete="email" />
                <label className="sm:col-span-2 cursor-pointer rounded-2xl border border-dashed border-ivory/25 px-4 py-6 text-center text-sm text-ivory/60 transition hover:border-gold-light">
                  {t({ en: 'Attach resume (PDF, DOC)', zh: '上传简历（PDF、DOC）' })}
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
