import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { setConsultService } from '../consult'
import { useLang } from '../i18n'
import { beforeAfterPhotos } from '../data/site'
import { ui } from '../components/ui'
import PageHeader from '../components/PageHeader'
import CtaBand from '../components/CtaBand'
import Lightbox from '../components/Lightbox'

// Each case: the full case card on the left, a side panel with title and calls to action on the right.
function CaseRow({ photo, onOpen }) {
  const { t, lang } = useLang()
  const [label, ...rest] = t(photo.caption).split(/[　·]\s*/)
  const title = rest.join(lang === 'zh' ? ' ' : ' · ')
  return (
    <article className="grid items-center gap-5 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-8">
      <button onClick={onOpen} className="group relative block w-full overflow-hidden rounded-[1.5rem] bg-sand">
        <img src={photo.src} alt={t(photo.caption)} loading="lazy" className="w-full transition duration-700 group-hover:scale-[1.02]" />
      </button>
      <div className="flex flex-col gap-4 rounded-[1.5rem] bg-sand p-6">
        <div>
          <p className="eyebrow mb-2">{label}</p>
          <h2 className="font-display text-xl leading-snug sm:text-2xl">{title}</h2>
        </div>
        <Link to={photo.to} className="btn-ghost w-full">{t({ en: 'Treatment details', zh: '项目详情' })} <ArrowRight size={16} /></Link>
        <Link to="/contact" onClick={() => photo.service && setConsultService(photo.service)} className="btn-primary w-full">{t({ en: 'Book a free consultation', zh: '免费面诊预约' })} <ArrowRight size={16} /></Link>
      </div>
    </article>
  )
}

export default function Gallery() {
  const { t } = useLang()
  const [openIndex, setOpenIndex] = useState(null)
  const photos = beforeAfterPhotos
  const close = useCallback(() => setOpenIndex(null), [])
  const step = useCallback((d) => setOpenIndex((i) => (i === null ? i : (i + d + beforeAfterPhotos.length) % beforeAfterPhotos.length)), [])

  return (
    <>
      <PageHeader
        eyebrow={t(ui.nav.gallery)}
        title={t({ en: 'Client case studies', zh: '真实客户案例' })}
        intro={t({ en: 'Real before & after results from our clients. Results vary by individual.', zh: '真实客户的前后对比，效果因人而异。' })}
      />

      <section className="container-x py-12">
        {photos.length ? (
          <div className="mx-auto grid max-w-6xl gap-10">
            {photos.map((g, i) => <CaseRow key={g.src} photo={g} onOpen={() => setOpenIndex(i)} />)}
          </div>
        ) : (
          <p className="py-24 text-center text-muted">{t({ en: 'New cases are coming soon', zh: '新案例整理中，敬请期待' })}</p>
        )}
      </section>

      {openIndex !== null && <Lightbox photos={photos} index={openIndex} onClose={close} onStep={step} />}
      <section className="container-x grid gap-5 py-12 md:grid-cols-2">
        <Link to="/treatments/spa-care" className="group flex items-center justify-start gap-5 rounded-[2rem] border border-ink/10 p-8 transition hover:border-ink">
          <ArrowLeft className="shrink-0 transition group-hover:-translate-x-2" />
          <div className="text-left">
            <p className="text-sm text-muted">{t({ en: 'Previous', zh: '上一项' })}</p>
            <p className="font-display text-2xl sm:text-3xl">{t(ui.nav.spa)}</p>
          </div>
        </Link>
        <Link to="/shop" className="group flex items-center justify-end gap-5 rounded-[2rem] border border-ink/10 p-8 transition hover:border-ink">
          <div className="text-right">
            <p className="text-sm text-muted">{t({ en: 'Next', zh: '下一项' })}</p>
            <p className="font-display text-2xl sm:text-3xl">{t(ui.nav.shop)}</p>
          </div>
          <ArrowRight className="shrink-0 transition group-hover:translate-x-2" />
        </Link>
      </section>

      <CtaBand />
    </>
  )
}
