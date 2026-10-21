// Prepares the consent forms (public/consent/*.pdf) for on-screen signing, so the iPad / phone does not have to draw the PDFs itself:
//   - each page becomes a JPEG:        public/consent/pages/<form key>-<page>.jpg
//   - where the blanks are (name line, signature line, date line, and the witness line on older forms) goes into
//                                      webapp/data/consentLayout.json
// Run it again whenever a PDF in public/consent is added or replaced:   npm run consents   (add  -- --layout-only  to skip the pictures)
// (The signed copy is still made from the original PDF: the signature, name and date pictures are written into it at these positions.)
import fs from 'fs'
import path from 'path'
import { createCanvas } from '@napi-rs/canvas'
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..')
const PDF_DIR = path.join(ROOT, 'public', 'consent')
const OUT_DIR = path.join(PDF_DIR, 'pages')
const LAYOUT = path.join(ROOT, 'webapp', 'data', 'consentLayout.json')
const LAYOUT_ONLY = process.argv.includes('--layout-only') // only the positions (webapp/data/consentLayout.json), leave the page pictures as they are
const WIDTH_PX = 1100 // width of a page picture: sharp on a retina tablet at about 720 CSS px, still light to load
const QUALITY = 0.78

fs.mkdirSync(OUT_DIR, { recursive: true })
const standardFontDataUrl = path.join(ROOT, 'node_modules', 'pdfjs-dist', 'standard_fonts') + '/'
const layout = {}
let bytes = 0

for (const file of fs.readdirSync(PDF_DIR).filter((f) => f.endsWith('.pdf')).sort()) {
  const key = file.replace(/\.pdf$/, '')
  const data = new Uint8Array(fs.readFileSync(path.join(PDF_DIR, file)))
  const task = pdfjs.getDocument({ data, useSystemFonts: true, standardFontDataUrl, verbosity: 0 })
  const doc = await task.promise
  const entry = { pages: doc.numPages, w: 0, h: 0, name: null, patient: null, witness: null, date: null }
  for (let n = 1; n <= doc.numPages; n += 1) {
    const page = await doc.getPage(n)
    const base = page.getViewport({ scale: 1 })
    entry.w = base.width
    entry.h = base.height
    // the picture of the page
    if (!LAYOUT_ONLY) {
      const vp = page.getViewport({ scale: WIDTH_PX / base.width })
      const canvas = createCanvas(Math.ceil(vp.width), Math.ceil(vp.height))
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise
      const jpg = canvas.toBuffer('image/jpeg', Math.round(QUALITY * 100))
      fs.writeFileSync(path.join(OUT_DIR, `${key}-${n}.jpg`), jpg)
      bytes += jpg.length
    }
    // where the blanks are: each is a label with an underscore line under it (see webapp/crm/ConsentSigner.jsx)
    const items = (await page.getTextContent()).items.filter((i) => i.str.trim())
    const lines = items.filter((i) => /^_+$/.test(i.str.trim()))
    const at = (re, exact) => {
      const lab = items.find((i) => (exact ? i.str.trim() === re : re.test(i.str)))
      if (!lab) return null
      const y = lab.transform[5]
      const under = lines.filter((l) => l.transform[5] < y)
      const own = under.length ? under.reduce((a, b) => (b.transform[5] > a.transform[5] ? b : a)) : null // the line right under the label
      const line = own ? own.transform[5] : y - 33
      const r2 = (v) => Math.round(v * 100) / 100
      return { page: n, x: r2(lab.transform[4]), y: r2(line), gap: r2(y - line), lw: own ? r2(own.width) : 260 } // lw: how long the line is
    }
    entry.name = entry.name || at(/Responsible Party Name/)
    entry.patient = entry.patient || at(/^(?!.*Witness).*Signature\s*$/i) // "Patient / Responsible Party Signature" or just "Signature"
    entry.witness = entry.witness || at(/Witness Name/)
    entry.date = entry.date || at('Date', true)
    page.cleanup()
  }
  if (!entry.patient) console.warn(`  !! ${file}: no signature line found`)
  layout[key] = entry
  await task.destroy()
  console.log(key.padEnd(22), `${entry.pages} page(s)`)
}

fs.writeFileSync(LAYOUT, JSON.stringify(layout, null, 1) + '\n')
console.log(`\n${Object.keys(layout).length} forms, ${LAYOUT_ONLY ? 'no' : (bytes / 1e6).toFixed(1) + ' MB of'} page pictures${LAYOUT_ONLY ? ' written' : ' -> ' + path.relative(ROOT, OUT_DIR)}; layout -> ${path.relative(ROOT, LAYOUT)}`)
