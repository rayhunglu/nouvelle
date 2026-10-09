import { Link } from 'react-router-dom'
import { ArrowRight, Phone } from 'lucide-react'
import { useLang } from '../i18n'
import { business } from '../data/site'
import { ui } from './ui'
import Reveal from './Reveal'

export default function CtaBand() {
  const { t } = useLang()
  return (
    <section className="container-x py-20 sm:py-28">
      <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-ink px-6 py-16 text-center text-ivory sm:px-16 sm:py-20">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gold/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-rose/20 blur-3xl" />
        <p className="eyebrow relative !text-gold-light">{t({ en: 'Your plan starts here', zh: '从这里开始' })}</p>
        <h2 className="relative mx-auto mt-4 max-w-2xl font-display text-3xl font-light leading-tight sm:text-5xl">
          {t({ en: 'A personalized anti-aging plan, designed around you', zh: '为您量身定制的抗衰老方案' })}
        </h2>
        <div className="relative mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={business.phoneHref} className="btn-light"><Phone size={16} /> {business.phone}</a>
          <Link to="/contact" className="btn border border-ivory/30 text-ivory hover:bg-ivory hover:text-ink">
            {t(ui.book)} <ArrowRight size={16} />
          </Link>
        </div>
      </Reveal>
    </section>
  )
}
