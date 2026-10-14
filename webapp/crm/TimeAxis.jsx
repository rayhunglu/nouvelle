import { useEffect, useRef, useState } from 'react'
import { dayKey } from './format'
import { roomOf } from './rooms'
import { dayAppointments, hhmm, minutesOfDay, SLOT, ROW } from './timeline'

// Day timeline for the appointment form: one row per 15 minutes. Press and drag with the mouse and the start time follows
// the pointer (grab the chosen block itself to slide it); a tap or click on a row sets the start time;
// existing appointments are drawn as blocks and the chosen slot turns red when it clashes in the same room.

export default function TimeAxis({ date, startMin, durationMin, room, appointments, customerById, selfId, clash, onPick }) {
  const scroller = useRef(null)
  const track = useRef(null)
  const lastType = useRef('mouse')
  const grab = useRef(0) // minutes from the block's start to where it was grabbed (0 when starting on an empty row)
  const [dragging, setDragging] = useState(false)
  const list = dayAppointments(appointments, date, selfId)

  // The whole day, 00:00-24:00, on a 24-hour clock.
  const from = 0
  const to = 24 * 60
  const rows = Math.max(1, (to - from) / SLOT)
  const todayNow = new Date()
  const nowMin = date === dayKey(todayNow.toISOString()) ? todayNow.getHours() * 60 + todayNow.getMinutes() : null
  const top = (min) => ((min - from) / SLOT) * ROW

  // Row under the pointer, snapped to 15 minutes and kept inside the day.
  const cellAt = (e) => {
    const y = e.clientY - track.current.getBoundingClientRect().top
    return from + Math.max(0, Math.min(rows - 1, Math.floor(y / ROW))) * SLOT
  }
  const clampStart = (m) => Math.max(from, Math.min(to - Math.max(durationMin, SLOT), m))
  const follow = (e) => {
    const m = clampStart(cellAt(e) - grab.current)
    if (m !== startMin) onPick(m)
    // Keep the frame scrolling when the pointer is dragged past its top or bottom edge.
    const fr = scroller.current?.getBoundingClientRect()
    if (fr && e.clientY > fr.bottom - 28) scroller.current.scrollTop += 14
    else if (fr && e.clientY < fr.top + 28) scroller.current.scrollTop -= 14
  }
  const endDrag = (e) => {
    setDragging(false)
    try { track.current.releasePointerCapture(e.pointerId) } catch { /* already released */ }
  }
  // Safety net: a release outside the frame (or a lost window focus) must not leave the drag stuck.
  useEffect(() => {
    if (!dragging) return undefined
    const end = () => setDragging(false)
    window.addEventListener('pointerup', end)
    window.addEventListener('blur', end)
    return () => { window.removeEventListener('pointerup', end); window.removeEventListener('blur', end) }
  }, [dragging])

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = Math.max(0, top(startMin) - ROW * 2)
    // Only on first show: later picks must not make the list jump under the finger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={scroller} className="max-h-72 overflow-y-auto overscroll-contain rounded-xl border border-ink/10 bg-white">
      <div
        ref={track}
        className={`relative select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ height: rows * ROW }}
        onPointerDown={(e) => {
          lastType.current = e.pointerType
          if (e.pointerType === 'touch' || e.button !== 0) return // fingers keep scrolling the frame; a tap still picks a row
          const m = cellAt(e)
          grab.current = m >= startMin && m < startMin + durationMin ? m - startMin : 0
          try { track.current.setPointerCapture(e.pointerId) } catch { /* capture is only a convenience */ }
          setDragging(true)
          const next = clampStart(m - grab.current)
          if (next !== startMin) onPick(next)
        }}
        onPointerMove={(e) => { if (dragging) follow(e) }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {Array.from({ length: rows }, (_, i) => {
          const m = from + i * SLOT
          const hour = m % 60 === 0
          return (
            <button
              key={m}
              type="button"
              onClick={(e) => { if (e.detail === 0 || lastType.current === 'touch') onPick(m) }}
              aria-label={`开始时间 ${hhmm(m)}`}
              style={{ height: ROW }}
              className={`flex w-full items-start text-left transition hover:bg-sand/70 focus-visible:bg-sand ${hour ? 'border-t border-ink/15' : 'border-t border-dashed border-ink/5'}`}
            >
              <span className={`w-14 shrink-0 pl-3 tabular-nums ${hour ? 'pt-1 text-[0.7rem] font-medium text-ink' : 'pt-1.5 text-[0.6rem] text-muted/70'}`}>{hhmm(m)}</span>
            </button>
          )
        })}

        {/* 00:00-09:00 and 20:00-24:00 are shaded: outside the working day. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 bg-ink/[0.07]" style={{ height: top(9 * 60) }} />
        <div className="pointer-events-none absolute inset-x-0 bg-ink/[0.07]" style={{ top: top(20 * 60), height: top(24 * 60) - top(20 * 60) }} />

        {/* Existing bookings: solid in the chosen room (or when no room is chosen), faint for other rooms. */}
        {list.map((a) => {
          const s = minutesOfDay(a.start)
          const dur = a.durationMin || 60
          const same = !room || a.room === room
          const r = roomOf(a.room)
          return (
            <div
              key={a.id}
              style={{ top: top(s), height: Math.max(ROW, (dur / SLOT) * ROW) - 2 }}
              className={`pointer-events-none absolute left-14 right-2 overflow-hidden rounded-lg px-2 py-1 text-[0.7rem] leading-tight ${same ? `${r.chip.split(' ').slice(0, 2).join(' ')} ring-1 ring-ink/10` : 'bg-stone-100 text-stone-500 ring-1 ring-dashed ring-ink/10'}`}
            >
              <p className="truncate font-medium">{hhmm(s)} {a.service}</p>
              <p className="truncate opacity-80">{customerById[a.customerId]?.name || ''}{a.room ? ` · ${r.name}` : ''}</p>
            </div>
          )
        })}

        {/* Red pointer at the current time when the chosen day is today. */}
        {nowMin !== null && (
          <div className="pointer-events-none absolute inset-x-0 z-20 flex items-center" style={{ top: top(nowMin) }}>
            <span className="w-14 shrink-0 pr-1 text-right text-[0.65rem] font-semibold tabular-nums text-rose-600">{hhmm(nowMin)}</span>
            <i className="-ml-1 h-2 w-2 shrink-0 rounded-full bg-rose-600 ring-2 ring-white" /><i className="h-0.5 flex-1 bg-rose-600" />
          </div>
        )}

        {/* The slot being chosen. */}
        <div
          style={{ top: top(startMin), height: Math.max(ROW, (durationMin / SLOT) * ROW) - 2 }}
          className={`pointer-events-none absolute left-14 right-2 z-10 rounded-lg px-2 py-1 text-[0.72rem] font-medium leading-tight text-white shadow-md ${clash ? 'bg-rose-600/90' : 'bg-gold/90'}`}
        >
          {hhmm(startMin)} – {hhmm(startMin + durationMin)}
        </div>
      </div>
    </div>
  )
}
