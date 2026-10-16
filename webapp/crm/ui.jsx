import { useEffect, useRef } from 'react'
import { Loader2, X } from 'lucide-react'
import { STATUS } from './format'

export const inputCls =
  'w-full rounded-xl border border-ink/10 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20'

export function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  )
}

export function Card({ className = '', children }) {
  return <div className={`rounded-2xl border border-ink/10 bg-white ${className}`}>{children}</div>
}

export function StatCard({ icon: Icon, label, value, tone = 'text-ink', hint, compact = false }) {
  if (compact) {
    return (
      <Card className="px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs text-muted">{label}</p>
          {Icon && <Icon size={14} className="shrink-0 text-gold" />}
        </div>
        <p className={`font-display text-xl leading-tight ${tone}`}>{value}{hint && <span className="ml-1.5 font-sans text-[0.65rem] text-muted">{hint}</span>}</p>
      </Card>
    )
  }
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        {Icon && <span className="grid h-9 w-9 place-items-center rounded-xl bg-sand text-gold"><Icon size={18} /></span>}
      </div>
      <p className={`mt-3 font-display text-3xl ${tone}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </Card>
  )
}

export function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.scheduled
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>{s.label}</span>
}

export function Empty({ children }) {
  return <p className="px-6 py-8 text-center text-sm text-muted">{children}</p>
}

export function PageTitle({ title, sub, children, compact = false }) {
  return (
    <div className={`flex flex-wrap items-end justify-between ${compact ? 'mb-3 gap-2' : 'mb-6 gap-4'}`}>
      <div>
        <h1 className={`font-display ${compact ? 'text-2xl' : 'text-3xl'}`}>{title}</h1>
        {sub && <p className={`mt-1 text-sm text-muted ${compact ? 'hidden sm:block' : ''}`}>{sub}</p>}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

// loading: while a save is in progress the whole screen dims and a small white box with a spinner shows on top of the dialog;
// both go away together with the dialog when the save finishes (or when it fails and the dialog stays open).
export function Modal({ title, onClose, children, wide = false, loading = false, loadingText = '保存中…' }) {
  // The dialog closes when the grey backdrop is tapped (press and release both on it). It closes on the click, not on the press: closing
  // on the press removed the backdrop first, and on a phone the same tap then landed on whatever button was underneath.
  const pressedBackdrop = useRef(false)
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onPointerDown={(e) => { pressedBackdrop.current = e.target === e.currentTarget }} onClick={(e) => { if (e.target === e.currentTarget && pressedBackdrop.current) onClose() }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-ivory p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'}`}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl">{title}</h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-sand" aria-label="关闭"><X size={18} /></button>
        </div>
        {children}
      </div>
      {loading && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/40" role="status" aria-live="polite">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm shadow-xl">
            <Loader2 size={18} className="animate-spin text-gold" />{loadingText}
          </div>
        </div>
      )}
    </div>
  )
}
