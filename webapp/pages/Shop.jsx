import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MessageCircle, Phone } from 'lucide-react'
import { useLang } from '../i18n'
import { setConsultService } from '../consult'
import { business } from '../data/site'
import { brands, getBrand } from '../data/shop'
import { ui } from '../components/ui'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import CtaBand from '../components/CtaBand'
import NotFound from './NotFound'

function ContactNote({ className = '', brand }) {
  const { t } = useLang()
  return (
    <div className={`flex flex-col gap-4 rounded-[2rem] bg-plum-deep p-8 text-ivory sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div>
        <p className="font-display text-2xl">{t({ en: 'Interested in buying?', zh: '想购买产品？' })}</p>
        <p className="mt-1 text-ivory/70">{t({ en: 'Please contact us to order or to ask which products suit your skin.', zh: '请联系我们下单，或咨询适合您肌肤的产品。' })}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a href={business.phoneHref} className="btn-light"><Phone size={16} /> {business.phone}</a>
        <Link to="/contact" onClick={() => setConsultService(brand ? `brand-${brand}` : 'group:shop')} className="btn border border-ivory/30 text-ivory hover:bg-ivory hover:text-ink">
          <MessageCircle size={16} /> {t(ui.nav.contact)}
        </Link>
      </div>
    </div>
  )
}

// Groups a brand's products by category (explicit `category`, else guessed from the name) so they can be browsed by section.
const GUESS = [
  [/shampoo|soap/i, { en: 'Shampoo', zh: '洗发' }],
  [/conditioner/i, { en: 'Conditioner', zh: '护发素' }],
  [/mask/i, { en: 'Masks', zh: '发膜' }],
  [/oil|treatment|gloss|leave-in|density|moisturi[sz]er|essence|serum/i, { en: 'Treatments', zh: '护理' }],
  [/gel|cream|styler|mousse|spray|hairspray|wax/i, { en: 'Styling', zh: '造型' }],
]
function groupProducts(brand) {
  const map = new Map()
  for (const p of brand.products) {
    let cat = p.category
    if (!cat && brand.groupByName) cat = (GUESS.find(([re]) => re.test(p.name.en)) || [])[1]
    if (!cat && p.line && brand.groupByLine) cat = p.line
    cat = cat || { en: 'All products', zh: '全部产品' }
    const id = 'cat-' + cat.en.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    if (!map.has(id)) map.set(id, { id, name: cat, items: [] })
    map.get(id).items.push(p)
  }
  return [...map.values()]
}

// Product photo: public/images/shop/<brand>/<product id>.jpg (square works best). Hidden until the file exists.
function ProductImage({ brand, product, alt }) {
  const [missing, setMissing] = useState(false)
  if (missing) return null
  return (
    <div className="mb-3 overflow-hidden rounded-xl bg-white">
      <img
        src={product.image || `/images/shop/${brand}/${product.id}.jpg`}
        alt={alt}
        loading="lazy"
        onError={() => setMissing(true)}
        className="aspect-square w-full object-contain p-2"
      />
    </div>
  )
}

export default function Shop() {
  const { brand: slug } = useParams()
  const { t } = useLang()
  const brand = getBrand(slug)
  if (!brand) return <NotFound />
  const at = brands.indexOf(brand)
  const prev = brands[(at - 1 + brands.length) % brands.length]
  const next = brands[(at + 1) % brands.length]
  const groups = groupProducts(brand)

  return (
    <>
      <PageHeader eyebrow={t(ui.nav.shop)} title={t(brand.name)} intro={t(brand.intro)}>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <p className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-ivory/70 px-4 py-2 text-sm">
            {t({ en: 'To buy, please contact us — ', zh: '如需购买，请联系我们 — ' })}
            <a href={business.phoneHref} className="font-medium underline decoration-gold underline-offset-4">{business.phone}</a>
          </p>
          <Link to="/contact" onClick={() => setConsultService(`brand-${brand.slug}`)} className="btn-primary !px-5 !py-2 !text-sm">
            {t({ en: 'Product enquiry', zh: '产品咨询' })}
          </Link>
        </div>
      </PageHeader>

      <nav className="container-x flex flex-wrap gap-2 pt-10" aria-label="Brands">
        {brands.map((b) => (
          <Link
            key={b.slug}
            to={`/shop/${b.slug}`}
            className={`rounded-full border px-5 py-2 text-sm transition ${b.slug === brand.slug ? 'border-gold bg-gold text-ivory' : 'border-ink/15 hover:border-ink'}`}
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
          <h2 className="max-w-xl font-display text-4xl font-light leading-tight sm:text-5xl md:max-w-none md:whitespace-nowrap">{t(brand.tagline)}</h2>
        </Reveal>
        {groups.length > 1 && (
        <nav aria-label={t({ en: 'Categories', zh: '产品分类' })} className="sticky top-20 z-10 -mx-4 mt-10 flex gap-2 overflow-x-auto bg-ivory/90 px-4 py-3 backdrop-blur sm:mx-0 sm:flex-wrap sm:px-0">
            {groups.map((g) => (
              <a
                key={g.id}
                href={`#${g.id}`}
                className="shrink-0 rounded-full border border-ink/10 bg-ivory px-4 py-1.5 text-sm transition hover:border-gold hover:bg-gold hover:text-ivory"
              >
                {t(g.name)} <span className="ml-1 text-xs opacity-60">{g.items.length}</span>
              </a>
            ))}
          </nav>
        )}
        {groups.map((g) => (
          <div key={g.id} id={g.id} className="scroll-mt-40 pt-10">
            {groups.length > 1 && <h3 className="mb-5 font-display text-2xl font-light sm:text-3xl">{t(g.name)}</h3>}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {g.items.map((p) => (
                <article key={p.id} id={p.id} className="flex scroll-mt-40 flex-col rounded-2xl border border-ink/10 p-3 transition hover:border-ink/30 sm:p-4">
                  <ProductImage brand={brand.slug} product={p} alt={t(p.name)} />
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-gold">{t(p.line)}</p>
                  <h4 className="mt-1.5 font-display text-base leading-snug sm:text-lg">{t(p.name)}</h4>
                  {p.sizes && <p className="mt-1 text-xs text-muted">{t({ en: 'Sizes', zh: '规格' })} · {t(p.sizes)}</p>}
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted" title={t(p.body)}>{t(p.body)}</p>
                  <div className="mt-auto">
                    <Link to="/contact" onClick={() => setConsultService(`product-${brand.slug}-${p.id}`)} className="mt-3 inline-block self-start text-xs font-medium text-gold underline underline-offset-4 hover:text-gold-light">
                      {t({ en: 'Enquire to buy', zh: '购买咨询' })} &gt;
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
        <nav aria-label={t({ en: 'More brands', zh: '更多品牌' })} className="mt-10 grid gap-4 sm:grid-cols-2">
          {[{ b: prev, dir: 'prev' }, { b: next, dir: 'next' }].map(({ b, dir }) => (
            <Link
              key={dir}
              to={`/shop/${b.slug}`}
              className={`group flex items-center gap-4 rounded-2xl border border-ink/10 px-5 py-4 transition hover:border-gold ${dir === 'next' ? 'sm:flex-row-reverse sm:text-right' : ''}`}
            >
              {dir === 'prev' ? <ArrowLeft size={18} className="shrink-0 transition group-hover:-translate-x-1" /> : <ArrowRight size={18} className="shrink-0 transition group-hover:translate-x-1" />}
              <span>
                <span className="block text-xs text-muted">{dir === 'prev' ? t({ en: 'Previous brand', zh: '上一个品牌' }) : t({ en: 'Next brand', zh: '下一个品牌' })}</span>
                <span className="mt-0.5 block font-display text-lg">{t(b.name)}</span>
              </span>
            </Link>
          ))}
        </nav>
        <ContactNote className="mt-8" brand={brand.slug} />
      </section>

      <CtaBand />
    </>
  )
}
