import { useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useLang } from '../i18n'

// Full-screen photo viewer: Esc closes, arrow keys step, backdrop click closes.
export default function Lightbox({ photos, index, onClose, onStep }) {
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
