import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MessageCircle, Phone } from 'lucide-react'
import { useLang } from '../i18n'
import { setConsultService } from '../consult'
import { business } from '../data/site'
import { brands } from '../data/shop'
import { ui } from '../components/ui'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import CtaBand from '../components/CtaBand'

// Landing page of the "Products" menu: brand partnerships and retail, then the brands we carry.
export default function ShopHome() {
  const { t } = useLang()
  return (
    <>
      <PageHeader
        eyebrow="PREMIUM BEAUTY & SKINCARE COLLECTION"
        title={t({ en: 'Select Brands · Quality Living', zh: '精选品牌 · 品质生活' })}
        introNoWrap
        intro={t({
          en: 'Nouvelle Anti-Aging selects quality skincare, hair-care and professional beauty brands for a high-quality everyday care experience.',
          zh: 'Nouvelle Anti-Aging 精选优质护肤、洗护及专业美容品牌，为您带来高品质的日常护理体验。',
        })}
      />

      <section className="container-x py-14 sm:py-20">
        <Reveal className="max-w-3xl">
          <p className="font-display text-2xl font-light sm:text-3xl">
            {t({
              en: 'Contact us for more product information and how to buy.',
              zh: '联系我们，了解更多产品信息及购买方式。',
            })}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/contact" onClick={() => setConsultService('group:shop')} className="btn-primary"><MessageCircle size={16} /> {t({ en: 'Product enquiry', zh: '产品咨询' })} ｜ CONTACT US</Link>
            <a href={business.phoneHref} className="btn-ghost"><Phone size={16} /> {business.phone}</a>
          </div>
        </Reveal>
      </section>

      <section className="bg-sand py-14 sm:py-20">
        <div className="container-x">
          <Reveal className="text-center">
            <p className="eyebrow mb-4">{t({ en: 'Our brands', zh: '合作品牌' })}</p>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map((x, i) => (
              <Reveal key={x.slug} delay={(i % 3) * 80}>
                <Link to={`/shop/${x.slug}`} className="group flex h-full flex-col rounded-[2rem] bg-ivory p-8 transition hover:shadow-xl hover:shadow-ink/5">
                  <div className="mb-6 flex h-16 items-center">
                    <img
                      src={`/images/shop/logos/${x.slug}.${x.slug === 'olaplex' ? 'svg' : 'png'}`}
                      alt={t(x.name)}
                      loading="lazy"
                      className="max-h-full max-w-[75%] object-contain object-left"
                      style={x.slug === 'skinceuticals' ? { maxHeight: '1.75rem' } : undefined}
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  </div>
                  <h2 className="font-display text-2xl">{t(x.name)}</h2>
                  <p className="mt-2 text-muted">{t(x.short)}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-medium">
                    {t({ en: `${x.products.length} products`, zh: `${x.products.length} 款产品` })}
                    <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x grid gap-5 py-12 md:grid-cols-2">
        <Link to="/gallery" className="group flex items-center justify-start gap-5 rounded-[2rem] border border-ink/10 p-8 transition hover:border-ink">
          <ArrowLeft className="shrink-0 transition group-hover:-translate-x-2" />
          <div className="text-left">
            <p className="text-sm text-muted">{t({ en: 'Previous', zh: '上一项' })}</p>
            <p className="font-display text-2xl sm:text-3xl">{t(ui.nav.gallery)}</p>
          </div>
        </Link>
        <Link to="/faq" className="group flex items-center justify-end gap-5 rounded-[2rem] border border-ink/10 p-8 transition hover:border-ink">
          <div className="text-right">
            <p className="text-sm text-muted">{t({ en: 'Next', zh: '下一项' })}</p>
            <p className="font-display text-2xl sm:text-3xl">{t(ui.nav.faq)}</p>
          </div>
          <ArrowRight className="shrink-0 transition group-hover:translate-x-2" />
        </Link>
      </section>

      <CtaBand />
    </>
  )
}
