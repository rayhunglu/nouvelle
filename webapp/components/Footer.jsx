import { Link } from 'react-router-dom'
import { MapPin, Phone } from 'lucide-react'
import { useLang } from '../i18n'
import { business, categories } from '../data/site'
import { ui } from './ui'

const YEAR = new Date().getFullYear()

export default function Footer() {
  const { t } = useLang()
  const medical = categories.filter((c) => c.group === 'medical')
  const skincare = categories.filter((c) => c.group !== 'medical')

  return (
    <footer className="bg-ink text-ivory/80">
      <div className="container-x grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="font-display text-3xl text-ivory">Nouvelle</p>
          <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-gold-light">Anti-Aging Center</p>
          <p className="mt-6 max-w-xs text-sm leading-relaxed">
            {t({ en: 'Medical aesthetics and whole-body anti-aging in Bellevue, WA.', zh: '医学美容与全身抗衰老 · 贝尔维尤' })}
          </p>
          <a href={business.phoneHref} className="mt-6 inline-flex items-center gap-2 text-ivory hover:text-gold-light">
            <Phone size={16} /> {business.phone}
          </a>
          <div className="mt-6 flex gap-4 text-sm">
            <Link to="/about" className="hover:text-ivory">{t(ui.nav.about)}</Link>
            <Link to="/gallery" className="hover:text-ivory">{t(ui.nav.gallery)}</Link>
            <Link to="/faq" className="hover:text-ivory">{t(ui.nav.faq)}</Link>
            <Link to="/contact" className="hover:text-ivory">{t(ui.nav.contact)}</Link>
          </div>
        </div>

        <div className="md:col-span-2">
          <p className="eyebrow !text-gold-light">{t(ui.nav.medical)}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {medical.map((c) => (
              <li key={c.slug}><Link to={`/treatments/${c.slug}`} className="hover:text-ivory">{t(c.name)}</Link></li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="eyebrow !text-gold-light">{t(ui.nav.skincare)}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {skincare.map((c) => (
              <li key={c.slug}><Link to={`/treatments/${c.slug}`} className="hover:text-ivory">{t(c.name)}</Link></li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="eyebrow !text-gold-light">{t(ui.locations)}</p>
          <ul className="mt-4 space-y-5 text-sm">
            {business.locations.map((l) => (
              <li key={l.id}>
                <a href={l.maps} target="_blank" rel="noreferrer" className="group flex gap-2 hover:text-ivory">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-gold-light" />
                  <span><span className="block font-medium text-ivory">{t(l.label)}</span>{l.line1}<br />{l.line2}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="eyebrow !text-gold-light">{t(ui.hours)}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {business.hours.map((h, i) => (
              <li key={i}><span className="block text-ivory">{t(h.day)}</span>{t(h.time)}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-ivory/50 sm:flex-row sm:justify-between">
          <p>© {YEAR} Nouvelle Anti-Aging Center</p>
          <p>{t({ en: 'Results vary. All treatments begin with a consultation.', zh: '效果因人而异，所有疗程均需先行咨询。' })}</p>
        </div>
      </div>
    </footer>
  )
}
