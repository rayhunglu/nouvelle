import { Link, useParams } from 'react-router-dom'
import { Check, MessageCircle, Phone } from 'lucide-react'
import { useLang } from '../i18n'
import { business } from '../data/site'
import { brands, getBrand } from '../data/shop'
import { ui } from '../components/ui'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import CtaBand from '../components/CtaBand'
import NotFound from './NotFound'

function ContactNote({ className = '' }) {
  const { t } = useLang()
  return (
    <div className={`flex flex-col gap-4 rounded-[2rem] bg-ink p-8 text-ivory sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div>
        <p className="font-display text-2xl">{t({ en: 'Interested in buying?', zh: '想购买产品？' })}</p>
        <p className="mt-1 text-ivory/70">{t({ en: 'Please contact us to order or to ask which products suit your skin.', zh: '请联系我们下单，或咨询适合您肌肤的产品。' })}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a href={business.phoneHref} className="btn-light"><Phone size={16} /> {business.phone}</a>
        <Link to="/contact" className="btn border border-ivory/30 text-ivory hover:bg-ivory hover:text-ink">
          <MessageCircle size={16} /> {t(ui.nav.contact)}
        </Link>
      </div>
    </div>
  )
}

export default function Shop() {
  const { brand: slug } = useParams()
  const { t } = useLang()
  const brand = getBrand(slug)
  if (!brand) return <NotFound />
  const products = brand.products

  return (
    <>
      <PageHeader eyebrow={t(ui.nav.shop)} title={t(brand.name)} intro={t(brand.intro)}>
        <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-ivory/70 px-4 py-2 text-sm">
          {t({ en: 'To buy, please contact us — ', zh: '如需购买，请联系我们 — ' })}
          <a href={business.phoneHref} className="font-medium underline decoration-gold underline-offset-4">{business.phone}</a>
        </p>
      </PageHeader>

      <nav className="container-x flex flex-wrap gap-2 pt-10" aria-label="Brands">
        {brands.map((b) => (
          <Link
            key={b.slug}
            to={`/shop/${b.slug}`}
            className={`rounded-full border px-5 py-2 text-sm transition ${b.slug === brand.slug ? 'border-ink bg-ink text-ivory' : 'border-ink/15 hover:border-ink'}`}
          >
            {t(b.name)}
          </Link>
        ))}
      </nav>

      <section className="container-x grid gap-5 py-10 md:grid-cols-3">
        {brand.highlights.map((h, i) => (
          <Reveal key={i} delay={i * 100} className="rounded-[2rem] bg-sand p-8">
            <h2 className="font-display text-2xl">{t(h.title)}</h2>
            <p className="mt-3 leading-relaxed text-muted">{t(h.body)}</p>
          </Reveal>
        ))}
      </section>

      <section className="container-x pb-8">
        <Reveal>
          <p className="eyebrow mb-4">{t({ en: 'Featured products', zh: '推荐产品' })}</p>
          <h2 className="max-w-xl font-display text-4xl font-light leading-tight sm:text-5xl">{t(brand.tagline)}</h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={(i % 2) * 100} as="article" id={p.id} className="flex flex-col rounded-[2rem] border border-ink/10 p-8 transition hover:border-ink/30">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold">{t(p.line)}</p>
              <h3 className="mt-3 font-display text-3xl font-light">{t(p.name)}</h3>
              <p className="mt-4 leading-relaxed text-muted">{t(p.body)}</p>
              <ul className="mt-6 space-y-2">
                {t(p.points).map((pt) => (
                  <li key={pt} className="flex items-start gap-2 text-sm"><Check size={16} className="mt-0.5 shrink-0 text-gold" />{pt}</li>
                ))}
              </ul>
              <p className="mt-auto pt-8 text-sm text-muted">{t({ en: 'To purchase, please contact us.', zh: '如需购买，请联系我们。' })}</p>
            </Reveal>
          ))}
        </div>
        <ContactNote className="mt-12" />
        <p className="mt-6 text-xs text-muted">
          {t({
            en: 'Product descriptions are general brand information. Availability and pricing are confirmed when you contact us. Results vary by individual.',
            zh: '产品说明为品牌一般性介绍，货源与价格请联系确认。效果因人而异。',
          })}
        </p>
      </section>

      <CtaBand />
    </>
  )
}
