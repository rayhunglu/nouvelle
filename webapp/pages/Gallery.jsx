import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useLang } from '../i18n'
import { beforeAfterPhotos, galleryPhotos } from '../data/site'
import { ui } from '../components/ui'
import PageHeader from '../components/PageHeader'
import CtaBand from '../components/CtaBand'

function Lightbox({ photos, index, onClose, onStep }) {
  const { t } = useLang()
  const photo = photos[index]

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onStep(-1)
      if (e.key === 'ArrowRight') onStep(1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, onStep])

  const btn = 'absolute z-10 grid h-12 w-12 place-items-center rounded-full bg-ivory/10 text-ivory backdrop-blur transition hover:bg-ivory/25'

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/95 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <button className={`${btn} right-4 top-4`} onClick={onClose} aria-label="Close"><X /></button>
      <button className={`${btn} left-4 top-1/2 -translate-y-1/2`} onClick={(e) => { e.stopPropagation(); onStep(-1) }} aria-label="Previous"><ChevronLeft /></button>
      <button className={`${btn} right-4 top-1/2 -translate-y-1/2`} onClick={(e) => { e.stopPropagation(); onStep(1) }} aria-label="Next"><ChevronRight /></button>
      <figure className="flex max-h-full flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <img src={photo.src} alt={t(photo.caption)} className="max-h-[80vh] max-w-full rounded-2xl object-contain" />
        <figcaption className="text-sm text-ivory/70">{t(photo.caption)} · {index + 1} / {photos.length}</figcaption>
      </figure>
    </div>
  )
}

function PhotoGrid({ photos, onOpen }) {
  const { t } = useLang()
  return (
    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
      {photos.map((g, i) => (
        <button
          key={g.src}
          onClick={() => onOpen(i)}
          className="group relative mb-5 block w-full overflow-hidden rounded-[1.5rem] bg-sand"
        >
          <img src={g.src} alt={t(g.caption)} loading="lazy" className="w-full transition duration-700 group-hover:scale-105" />
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-4 text-left text-sm text-ivory opacity-0 transition group-hover:opacity-100">
            {t(g.caption)}
          </span>
        </button>
      ))}
    </div>
  )
}

const TABS = [
  { id: 'ba', label: { en: 'Before & After', zh: '前后对比' }, note: { en: 'Individual results; outcomes vary.', zh: '个案效果，结果因人而异。' } },
  { id: 'clinic', label: { en: 'Our Clinic', zh: '诊所环境' }, note: { en: 'Reception, treatment rooms and wellness spaces.', zh: '接待区、疗程室与养生空间。' } },
]
const SETS = { ba: beforeAfterPhotos, clinic: galleryPhotos }

export default function Gallery() {
  const { t } = useLang()
  // /gallery#clinic opens the clinic photos directly; otherwise start with before & after.
  const [tab, setTab] = useState(() => (window.location.hash === '#clinic' ? 'clinic' : 'ba'))
  const [openIndex, setOpenIndex] = useState(null)
  const photos = SETS[tab]
  const close = useCallback(() => setOpenIndex(null), [])
  const step = useCallback((d) => setOpenIndex((i) => (i === null ? i : (i + d + SETS[tab].length) % SETS[tab].length)), [tab])
  const active = TABS.find((x) => x.id === tab)

  return (
    <>
      <PageHeader
        eyebrow={t(ui.nav.gallery)}
        title={t({ en: 'Results & our clinic.', zh: '效果见证与诊所环境。' })}
        intro={t({
          en: 'Choose what you’d like to see: real before & after results, or a look inside our clinic. Results vary by individual.',
          zh: '请选择要查看的内容：真实的前后对比，或我们的诊间环境。效果因人而异。',
        })}
      />

      <section className="container-x py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex rounded-full bg-sand p-1" role="tablist" aria-label={t({ en: 'Gallery', zh: '画廊' })}>
            {TABS.map((x) => (
              <button
                key={x.id}
                role="tab"
                aria-selected={tab === x.id}
                onClick={() => { setTab(x.id); setOpenIndex(null) }}
                className={`rounded-full px-6 py-2.5 text-sm font-medium transition ${tab === x.id ? 'bg-ink text-ivory shadow-sm' : 'text-muted hover:text-ink'}`}
              >
                {t(x.label)} <span className="ml-1 text-xs opacity-60">{SETS[x.id].length}</span>
              </button>
            ))}
          </div>
          <p className="text-sm text-muted">{t(active.note)}</p>
        </div>

        <PhotoGrid key={tab} photos={photos} onOpen={setOpenIndex} />
      </section>

      {openIndex !== null && <Lightbox photos={photos} index={openIndex} onClose={close} onStep={step} />}
      <CtaBand />
    </>
  )
}
