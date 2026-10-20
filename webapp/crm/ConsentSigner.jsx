import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Check, PenLine } from 'lucide-react'
import { uploadCustomerFile } from './files'

// Signing a consent form on screen. The form's PDF (public/consent/<key>.pdf) is drawn page by page; the customer signs in the
// 顾客／合法代理人签字 box on the last page (a finger, a pen or the mouse), and the 姓名 and 日期 lines are filled in. 员工 can sign
// the 见证人 line too (optional). Saving writes the pictures into the PDF itself and uploads it as the customer's 同意书.
//
// The forms put each blank as a label with an underscore line below it: Patient / Responsible Party Name, Patient / Responsible Party
// Signature, Date (older versions also had Witness Name & Signature). Every label is found in the PDF's text (on whichever page it is) and
// the nearest underscore line under it is where the picture goes, so a form that is re-laid out keeps working. 

const SIG_H_MAX = 40 // the signing box above its line, in PDF points; a signature is fitted inside it (300 wide) and never leaves it

const WITNESS = 'Yingna Jiang' // the 见证人 line is filled with this name unless 员工 signs it instead

const clinicDate = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(new Date()) // YYYY-MM-DD

// Text as a picture (the PDF has no Chinese font to draw with): a transparent PNG.
function textPng(text) {
  const c = document.createElement('canvas')
  const ctx = c.getContext('2d')
  ctx.font = '48px "PingFang SC","Noto Sans SC","Microsoft YaHei",sans-serif'
  c.width = Math.ceil(ctx.measureText(text).width) + 8
  c.height = 64
  ctx.font = '48px "PingFang SC","Noto Sans SC","Microsoft YaHei",sans-serif'
  ctx.fillStyle = '#1b1b1b'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 4, 34)
  return { url: c.toDataURL('image/png'), ratio: c.width / c.height }
}

// The signing pad: draw with a finger / pen / mouse; 确认 returns a transparent PNG cropped to the ink.
function Pad({ title, onCancel, onDone }) {
  const ref = useRef(null)
  const drawing = useRef(false)
  const last = useRef(null)
  const [empty, setEmpty] = useState(true)

  useEffect(() => {
    const c = ref.current
    const dpr = window.devicePixelRatio || 1
    c.width = c.clientWidth * dpr
    c.height = c.clientHeight * dpr
    const ctx = c.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.lineWidth = 2.6
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#1b1b1b'
  }, [])

  const pos = (e) => { const r = ref.current.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top } }
  const down = (e) => { e.preventDefault(); ref.current.setPointerCapture(e.pointerId); drawing.current = true; last.current = pos(e); const ctx = ref.current.getContext('2d'); ctx.beginPath(); ctx.arc(last.current.x, last.current.y, 1.2, 0, 7); ctx.fill(); setEmpty(false) }
  const move = (e) => {
    if (!drawing.current) return
    e.preventDefault()
    const p = pos(e)
    const ctx = ref.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
  }
  const up = () => { drawing.current = false }
  const clear = () => { const c = ref.current; c.getContext('2d').clearRect(0, 0, c.width, c.height); setEmpty(true) }
  const done = () => {
    const c = ref.current
    const { width, height } = c
    const data = c.getContext('2d').getImageData(0, 0, width, height).data
    let x0 = width, y0 = height, x1 = 0, y1 = 0
    for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) if (data[(y * width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y }
    const pad = 6
    x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(width, x1 + pad); y1 = Math.min(height, y1 + pad)
    const out = document.createElement('canvas')
    out.width = x1 - x0
    out.height = y1 - y0
    out.getContext('2d').drawImage(c, x0, y0, out.width, out.height, 0, 0, out.width, out.height)
    onDone({ url: out.toDataURL('image/png'), ratio: out.width / out.height })
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/60 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-2xl rounded-2xl bg-white p-4 shadow-xl">
        <p className="mb-2 text-sm font-medium">{title}</p>
        <canvas ref={ref} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} style={{ touchAction: 'none' }}
          className="h-56 w-full cursor-crosshair rounded-xl border border-dashed border-ink/30 bg-ivory sm:h-72" />
        <p className="mt-1 text-xs text-muted">请在框内签名</p>
        <div className="mt-3 flex items-center justify-between">
          <button type="button" onClick={clear} className="text-sm text-muted hover:underline">清除重签</button>
          <div className="flex gap-2">
            <button type="button" onClick={onCancel} className="btn-ghost !px-4 !py-2 text-sm">取消</button>
            <button type="button" onClick={done} disabled={empty} className="btn-primary !px-5 !py-2 text-sm disabled:opacity-40">确认</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// The patient's name on the form: starts as the booking's customer name; this small box lets 员工 / the customer type another one.
function NameBox({ value, onCancel, onDone }) {
  const [v, setV] = useState(value)
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/60 p-4" role="dialog" aria-modal="true" aria-label="顾客姓名">
      <form className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl" onSubmit={(e) => { e.preventDefault(); onDone(v.trim()) }}>
        <p className="mb-2 text-sm font-medium">顾客 / 合法代理人姓名</p>
        <input autoFocus value={v} onChange={(e) => setV(e.target.value)} maxLength={60} placeholder="请输入姓名" className="w-full rounded-xl border border-ink/20 bg-ivory px-3 py-2.5 text-base outline-none focus:border-gold" />
        <p className="mt-1 text-xs text-muted">默认是预约的客户名，需要时可以改成本人姓名。</p>
        <div className="mt-3 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="btn-ghost !px-4 !py-2 text-sm">取消</button>
          <button type="submit" className="btn-primary !px-5 !py-2 text-sm">确认</button>
        </div>
      </form>
    </div>
  )
}

export default function ConsentSigner({ form, appt, customer, viewRow, onBack, onSaved }) {
  // viewRow: an already signed copy (a customer file row) to look at; nothing can be changed then.
  const wrap = useRef(null)
  const [pages, setPages] = useState([]) // [{ canvas data url, w, h }] in CSS px
  const [layout, setLayout] = useState(null) // PDF-point positions found on the last page
  const [err, setErr] = useState('')
  const [pad, setPad] = useState('') // 'patient' | 'witness': which signing pad is open
  const [sig, setSig] = useState({ patient: null, witness: null })
  const [busy, setBusy] = useState(false)
  const bytes = useRef(null)
  const [name, setName] = useState(customer?.name || '') // 顾客姓名 on the form: the booking's customer, editable
  const [nameOpen, setNameOpen] = useState(false)
  const today = clinicDate()

  useEffect(() => {
    let dead = false
    ;(async () => {
      try {
        const pdfjs = await import('pdfjs-dist')
        const worker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
        pdfjs.GlobalWorkerOptions.workerSrc = worker
        const res = await fetch(viewRow ? `/api/crm/customers/${appt.customerId}/files/${viewRow.id}` : form.file, { credentials: 'same-origin' })
        if (!res.ok) throw new Error('打不开这份同意书')
        bytes.current = new Uint8Array(await res.arrayBuffer())
        const doc = await pdfjs.getDocument({ data: bytes.current.slice(), useSystemFonts: true }).promise
        const cssW = Math.min(wrap.current?.clientWidth || 560, 720)
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const out = []
        let found = {}
        for (let n = 1; n <= doc.numPages; n += 1) {
          const page = await doc.getPage(n)
          const base = page.getViewport({ scale: 1 })
          const k = cssW / base.width
          const vp = page.getViewport({ scale: k * dpr })
          const c = document.createElement('canvas')
          c.width = vp.width
          c.height = vp.height
          await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise
          out.push({ url: c.toDataURL('image/jpeg', 0.9), w: cssW, h: base.height * k, k, pw: base.width, ph: base.height })
          const items = (await page.getTextContent()).items.filter((i) => i.str.trim())
          const lines = items.filter((i) => /^_+$/.test(i.str.trim()))
          // x / y of the underscore line under a label (its baseline), on the same page; a plain 33pt below when none is drawn
          const at = (re, exact) => {
            const lab = items.find((i) => (exact ? i.str.trim() === re : re.test(i.str)))
            if (!lab) return null
            const y = lab.transform[5]
            const below = lines.filter((l) => l.transform[5] < y).map((l) => l.transform[5])
            const line = below.length ? Math.max(...below) : y - 33
            return { page: n, x: lab.transform[4], y: line, gap: y - line } // gap: label baseline to its line, the blank space there
          }
          found = {
            name: found.name || at(/Responsible Party Name/),
            patient: found.patient || at(/^(?!.*Witness).*Signature\s*$/i), // "Patient / Responsible Party Signature" or just "Signature"
            witness: found.witness || at(/Witness Name/),
            date: found.date || at('Date', true),
          }
        }
        if (!viewRow && !found.patient) throw new Error('这份同意书里找不到签名位置')
        if (dead) return
        setPages(out)
        setLayout(found)
      } catch (e) {
        if (!dead) setErr(e.message || '同意书加载失败')
      }
    })()
    return () => { dead = true }
  }, [form.file, viewRow?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // The signing box fills the blank between the label and its line, with room left for the label's own text.
  const sigH = layout ? Math.max(18, Math.min(SIG_H_MAX, (layout.patient.gap || 53) - 16)) : SIG_H_MAX
  // A box on a page, from the underscore line it sits on (PDF points, origin bottom-left) to CSS px.
  const boxStyle = (pg, f, w, h) => ({ left: f.x * pg.k, top: (pg.ph - (f.y + 3 + h)) * pg.k, width: w * pg.k, height: h * pg.k })

  const save = async () => {
    setBusy(true)
    setErr('')
    try {
      const { PDFDocument } = await import('pdf-lib')
      const doc = await PDFDocument.load(bytes.current)
      const put = async ({ url, ratio }, f, maxW, h) => {
        const img = await doc.embedPng(url)
        const w = Math.min(maxW, h * ratio) // fitted inside maxW × h, keeping its proportions
        doc.getPage(f.page - 1).drawImage(img, { x: f.x + 3, y: f.y + 3, width: w, height: w / ratio })
      }
      if (name && layout.name) await put(textPng(name), layout.name, 300, 16)
      await put(sig.patient, layout.patient, 300, sigH)
      if (layout.witness) await put(sig.witness || textPng(WITNESS), layout.witness, 300, sig.witness ? sigH : 16)
      if (layout.date) await put(textPng(today), layout.date, 120, 16)
      const out = await doc.save()
      const file = new File([out], `${form.name}同意书.pdf`, { type: 'application/pdf' })
      const row = await uploadCustomerFile({ customerId: appt.customerId, appointmentId: appt.id, label: `同意书-${form.name}`, file })
      onSaved(row)
    } catch (e) {
      setErr(e.message || '保存失败')
      setBusy(false)
    }
  }

  return (
    <div ref={wrap}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <button type="button" onClick={onBack} disabled={busy} className="inline-flex items-center gap-1 text-sm text-muted hover:underline"><ArrowLeft size={15} /> 返回</button>
        <p className="truncate text-sm font-medium">{form.name}同意书{viewRow ? '（已签署）' : ''}</p>
      </div>
      {viewRow
        ? <p className="mb-3 text-xs text-muted">这是客人已签署的文件（{viewRow.name}）。<a href={`/api/crm/customers/${appt.customerId}/files/${viewRow.id}`} className="ml-1 text-gold underline underline-offset-4">下载</a></p>
        : <p className="mb-3 text-xs text-muted">请客人从头阅读全部页面，到签名处点「点击签名」签字，确认后点「确认提交」。</p>}
      {err && <p role="alert" className="mb-3 rounded-xl bg-rose-100 px-3 py-2 text-xs text-rose-800">{err}</p>}
      {!pages.length && !err && <p className="py-10 text-center text-sm text-muted">同意书加载中…</p>}
      <div className="max-h-[60vh] space-y-3 overflow-y-auto rounded-xl border border-ink/10 bg-sand p-2">
        {pages.map((pg, i) => (
          <div key={i} className="relative mx-auto bg-white shadow-sm" style={{ width: pg.w, height: pg.h }}>
            <img src={pg.url} alt={`第 ${i + 1} 页`} className="block h-full w-full" draggable={false} />
            {layout && !viewRow && (
              <>
                {layout.name?.page === i + 1 && (
                  <button type="button" onClick={() => setNameOpen(true)} aria-label="点击修改姓名"
                    className="absolute flex items-end overflow-hidden rounded border border-dashed border-transparent text-left text-[13px] leading-none text-ink hover:border-gold/60 hover:bg-gold/5"
                    style={{ ...boxStyle(pg, layout.name, 300, 16), paddingLeft: 3 * pg.k }}>
                    {name || <span className="text-xs text-gold">点击输入姓名</span>}
                  </button>
                )}
                {layout.patient.page === i + 1 && (
                  <button type="button" onClick={() => setPad('patient')} aria-label="点击签名"
                    className={`absolute grid place-items-center overflow-hidden rounded border-2 border-dashed text-xs ${sig.patient ? 'border-transparent' : 'border-gold bg-gold/10 text-gold'}`}
                    style={boxStyle(pg, layout.patient, 300, sigH)}>
                    {sig.patient ? <img src={sig.patient.url} alt="客人签名" className="absolute inset-0 h-full w-full object-contain object-left-bottom" /> : <span className="inline-flex items-center gap-1"><PenLine size={14} /> 点击签名（客人）</span>}
                  </button>
                )}
                {layout.witness?.page === i + 1 && (
                  <button type="button" onClick={() => setPad('witness')} aria-label="见证人（默认 Yingna Jiang，点击可改为手写签名）"
                    className="absolute grid place-items-center overflow-hidden rounded border border-transparent text-[11px] hover:border-ink/25"
                    style={boxStyle(pg, layout.witness, 300, sigH)}>
                    {sig.witness ? <img src={sig.witness.url} alt="见证人签名" className="absolute inset-0 h-full w-full object-contain object-left-bottom" /> : <span className="flex h-full w-full items-end px-1 pb-1 text-[13px] leading-none text-ink">{WITNESS}</span>}
                  </button>
                )}
                {layout.date?.page === i + 1 && <span className="pointer-events-none absolute flex items-end text-[13px] leading-none text-ink" style={{ ...boxStyle(pg, layout.date, 200, 16), paddingLeft: 3 * pg.k }}>{today}</span>}
              </>
            )}
          </div>
        ))}
      </div>
      {!viewRow && <div className="mt-4 flex items-center justify-between gap-3">
        <p className="flex flex-wrap items-center gap-x-3 text-xs text-muted">
          {sig.patient ? <span className="inline-flex items-center gap-1 text-emerald-700"><Check size={14} /> 客人已签名</span> : '还没有签名'}
          {sig.patient && <button type="button" onClick={() => setPad('patient')} className="text-gold underline underline-offset-4">修改签名 / 重签</button>}
          {sig.patient && <button type="button" onClick={() => setSig((cur) => ({ ...cur, patient: null }))} className="underline underline-offset-4">清除签名</button>}
        </p>
        <button type="button" onClick={save} disabled={!sig.patient || busy || !layout} className="btn-primary !py-2.5 disabled:opacity-40">{busy ? '提交中…' : '确认提交'}</button>
      </div>}
      {nameOpen && <NameBox value={name} onCancel={() => setNameOpen(false)} onDone={(v) => { setName(v); setNameOpen(false) }} />}
      {pad && <Pad title={pad === 'patient' ? (sig.patient ? '重新签名（会替换已签的签名）' : '客人签名') : '见证人签名'} onCancel={() => setPad('')} onDone={(s) => { setSig((cur) => ({ ...cur, [pad]: s })); setPad('') }} />}
    </div>
  )
}
