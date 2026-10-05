import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useLang } from '../i18n'
import { galleryPhotos } from '../data/site'
import { ui } from '../components/ui'
import PageHeader from '../components/PageHeader'
import CtaBand from '../components/CtaBand'

function Lightbox({ index, onClose, onStep }) {
  const { t } = useLang()
  const photo = galleryPhotos[index]

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
        <figcaption className="text-sm text-ivory/70">{t(photo.caption)} · {index + 1} / {galleryPhotos.length}</figcaption>
      </figure>
    </div>
  )
}

export default function Gallery() {
  const { t } = useLang()
  const [open, setOpen] = useState(null)
  const close = useCallback(() => setOpen(null), [])
  const step = useCallback((d) => setOpen((i) => (i === null ? i : (i + d + galleryPhotos.length) % galleryPhotos.length)), [])

  return (
    <>
      <PageHeader
        eyebrow={t(ui.nav.gallery)}
        title={t({ en: 'Step inside Nouvelle.', zh: '走进 Nouvelle。' })}
        intro={t({
          en: 'A look at our clinic — reception, treatment rooms and wellness spaces. Tap any photo to view it larger.',
          zh: '一览我们的诊所环境——接待区、疗程室与养生空间。点击图片可放大查看。',
        })}
      />

      <section className="container-x py-16">
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {galleryPhotos.map((g, i) => (
            <button
              key={g.src}
              onClick={() => setOpen(i)}
              className="group relative mb-5 block w-full overflow-hidden rounded-[1.5rem] bg-sand"
            >
              <img src={g.src} alt={t(g.caption)} loading="lazy" className="w-full transition duration-700 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-4 text-left text-sm text-ivory opacity-0 transition group-hover:opacity-100">
                {t(g.caption)}
              </span>
            </button>
          ))}
        </div>
      </section>

      {open !== null && <Lightbox index={open} onClose={close} onStep={step} />}
      <CtaBand />
    </>
  )
}
