import { useEffect, useRef } from 'react'
import { SLOT } from './timeline'

// Start time as two scroll wheels (hour | minute), like a phone's time picker: scroll or swipe a wheel and it snaps to a value.
// It is controlled by `startMin`, so dragging on the day timeline moves the wheels too.
const ITEM = 40 // px per value
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = Array.from({ length: 60 / SLOT }, (_, i) => i * SLOT)
const pad = (n) => String(n).padStart(2, '0')

function Wheel({ values, value, onChange, label }) {
  const el = useRef(null)
  const timer = useRef(null)
  const quietUntil = useRef(0) // scroll events caused by our own scrollTo are not the user turning the wheel
  const live = useRef({ value, onChange }) // the latest props, for the delayed scroll-end handler
  live.current = { value, onChange }
  const idx = Math.max(0, values.indexOf(value))
  // Move the wheel to the value (it changed from outside: the timeline, the date, or the other wheel).
  useEffect(() => {
    if (!el.current || Math.round(el.current.scrollTop / ITEM) === idx) return
    clearTimeout(timer.current)
    timer.current = null
    quietUntil.current = Date.now() + 150
    el.current.scrollTo({ top: idx * ITEM })
  }, [idx])
  useEffect(() => () => clearTimeout(timer.current), [])
  return (
    <div
      ref={el}
      role="listbox"
      aria-label={label}
      className="h-[120px] w-16 snap-y snap-mandatory overflow-y-scroll overscroll-contain text-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: 'none' }}
      onScroll={(e) => {
        // The value is taken when the wheel stops moving, not on every frame of a flick.
        if (Date.now() < quietUntil.current) return
        const box = e.currentTarget
        clearTimeout(timer.current)
        timer.current = setTimeout(() => {
          timer.current = null
          const i = Math.max(0, Math.min(values.length - 1, Math.round(box.scrollTop / ITEM)))
          if (values[i] !== live.current.value) live.current.onChange(values[i])
        }, 120)
      }}
    >
      <div style={{ height: ITEM }} aria-hidden />
      {values.map((v, i) => (
        <div
          key={v}
          role="option"
          aria-selected={i === idx}
          onClick={() => el.current.scrollTo({ top: i * ITEM, behavior: 'smooth' })}
          style={{ height: ITEM }}
          className={`flex cursor-pointer snap-center items-center justify-center text-xl tabular-nums transition ${i === idx ? 'font-semibold text-ink' : 'text-muted/60'}`}
        >
          {pad(v)}
        </div>
      ))}
      <div style={{ height: ITEM }} aria-hidden />
    </div>
  )
}

export default function TimeWheel({ startMin, onPick }) {
  const h = Math.floor(startMin / 60)
  const m = Math.floor((startMin % 60) / SLOT) * SLOT
  return (
    <div className="relative mx-auto flex w-fit items-center rounded-xl border border-ink/10 bg-white px-3">
      <div className="pointer-events-none absolute inset-x-2 top-1/2 h-10 -translate-y-1/2 rounded-lg bg-gold/10 ring-1 ring-gold/30" />
      <Wheel values={HOURS} value={h} onChange={(v) => onPick(v * 60 + m)} label="小时" />
      <span className="relative z-10 text-xl font-semibold">:</span>
      <Wheel values={MINUTES} value={m} onChange={(v) => onPick(h * 60 + v)} label="分钟" />
    </div>
  )
}
