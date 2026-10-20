import { categories } from './site'

// Consent forms (同意书): one PDF per 医美 project (28), plus one for 美容护肤 and one for 美睫, kept in public/consent/<treatment key>.pdf.
// The check-in dialog (crm/CheckInDocs.jsx) offers the matching form to open / print, and asks for the signed copy to be uploaded.
// `name` is the project's Chinese name on the website; a booking is matched to a form by that name.
export const CONSENT_FORMS = {
  'injectables-1': { name: '肉毒杆菌素注射', file: '/consent/injectables-1.pdf' }, // 01
  'injectables-2': { name: '玻尿酸微调注射', file: '/consent/injectables-2.pdf' }, // 02
  'injectables-3': { name: '双下巴溶脂', file: '/consent/injectables-3.pdf' }, // 03
  'injectables-4': { name: '面部轮廓塑形', file: '/consent/injectables-4.pdf' }, // 04
  'collagen-stimulator': { name: '童颜针', file: '/consent/collagen-stimulator.pdf' }, // 05
  'skin-2': { name: '水光针', file: '/consent/skin-2.pdf' }, // 06
  'collagen-filler': { name: '胶原蛋白填充注射', file: '/consent/collagen-filler.pdf' }, // 07
  'injectables-5': { name: '铃铛童颜线面部提升', file: '/consent/injectables-5.pdf' }, // 08
  'hair-2': { name: 'PRP 生发疗程', file: '/consent/hair-2.pdf' }, // 09
  'body-3': { name: '皮下减脂塑形', file: '/consent/body-3.pdf' }, // 10
  'wellness-2': { name: '维生素 B 群注射', file: '/consent/wellness-2.pdf' }, // 11
  'hormone-stem-cell-1': { name: '荷尔蒙平衡补充治疗', file: '/consent/hormone-stem-cell-1.pdf' }, // 12
  'tirzepatide': { name: '替西帕肽体重管理', file: '/consent/tirzepatide.pdf' }, // 13
  'skin-1': { name: '第五代热玛吉', file: '/consent/skin-1.pdf' }, // 14
  'skin-3': { name: 'M22光子嫩肤', file: '/consent/skin-3.pdf' }, // 15
  'skin-4': { name: '探索皮秒', file: '/consent/skin-4.pdf' }, // 16
  'skin-5': { name: 'CO₂ 点阵激光焕肤', file: '/consent/skin-5.pdf' }, // 17
  'skin-7': { name: 'Legend Pro 黄金射频微针', file: '/consent/skin-7.pdf' }, // 18
  'acne-microneedling': { name: '祛痘焕肤微针', file: '/consent/acne-microneedling.pdf' }, // 19
  'skin-8': { name: 'Viveve 薇蜜私密射频护理', file: '/consent/skin-8.pdf' }, // 20
  'hair-3': { name: 'BTL 磁波塑肌燃脂', file: '/consent/hair-3.pdf' }, // 21
  'body-1': { name: 'Legend Pro 干细胞科技头皮焕活', file: '/consent/body-1.pdf' }, // 22
  'body-2': { name: '红蓝光 LED 光疗', file: '/consent/body-2.pdf' }, // 23
  'wellness-1': { name: 'OXYAIR 高压氧舱焕活全身抗衰', file: '/consent/wellness-1.pdf' }, // 24
  'iv-therapy-1': { name: 'NAD+ 静脉注射', file: '/consent/iv-therapy-1.pdf' }, // 25
  'iv-therapy-2': { name: '美白焕肤针', file: '/consent/iv-therapy-2.pdf' }, // 26
  'hormone-stem-cell-2': { name: '活力能量针', file: '/consent/hormone-stem-cell-2.pdf' }, // 27
  'stem-cell': { name: '干细胞治疗', file: '/consent/stem-cell.pdf' }, // 28
}

// Forms that cover groups of projects: 美容护肤 for every skincare project, 美睫 for every lash project, 头疗 for the head spa, and one for each other spa treatment (the name of the treatment, a
// package or a lash style / price row on the website, or a custom service whose 项目类别 was set to that category).
CONSENT_FORMS['beauty-skincare'] = { name: '美容护肤', file: '/consent/beauty-skincare.pdf' }
CONSENT_FORMS['lash-extensions'] = { name: '美睫', file: '/consent/lash-extensions.pdf' }
// Spa: one form per treatment (the treatment's name and its packages), the body brightening has one per package.
CONSENT_FORMS['head-spa'] = { name: '头疗', file: '/consent/head-spa.pdf' }
CONSENT_FORMS['body-spa'] = { name: '日式淋巴芳香精油排毒 SPA', file: '/consent/body-spa.pdf' }
CONSENT_FORMS['back-cupping'] = { name: '日式经络 · 背部拔罐SPA', file: '/consent/back-cupping.pdf' }
CONSENT_FORMS['lymph-gua-sha'] = { name: '日式淋巴刮痧 SPA', file: '/consent/lymph-gua-sha.pdf' }
CONSENT_FORMS['body-peel-back'] = { name: '日式身体焕白 · 背部深层焕肤 60 分钟', file: '/consent/body-peel-back.pdf' }
CONSENT_FORMS['body-peel-front'] = { name: '日式身体焕白 · 正面柔嫩焕肤 60 分钟', file: '/consent/body-peel-front.pdf' }
const SPA_FORM_OF_TREATMENT = { 'head-spa': 'head-spa', 'body-spa': 'body-spa', 'back-cupping': 'back-cupping', 'lymph-gua-sha': 'lymph-gua-sha' } // treatment key -> form key
const FORM_OF_CATEGORY = { skincare: CONSENT_FORMS['beauty-skincare'], lash: CONSENT_FORMS['lash-extensions'] } // custom services: 项目类别 -> form

const NOT_BY_NAME = new Set(['beauty-skincare', 'lash-extensions', 'head-spa', 'body-spa', 'back-cupping', 'lymph-gua-sha', 'body-peel-back', 'body-peel-front']) // the forms above are matched below, by treatment
const BY_NAME = Object.fromEntries(Object.entries(CONSENT_FORMS).filter(([k]) => !NOT_BY_NAME.has(k)).map(([, f]) => [f.name, f]))
for (const c of categories) {
  const form = c.slug === 'skincare-experts' ? CONSENT_FORMS['beauty-skincare'] : c.slug === 'lash' ? CONSENT_FORMS['lash-extensions'] : null
  const treatments = c.treatments || []
  const names = (list) => list.flatMap((t) => [t.name, ...(t.packages || []).map((pk) => pk.name)])
  if (form) {
    const all = [...names(treatments), ...(c.priceList ? c.priceList.groups.flatMap((g) => g.rows.map((r) => r.name)) : [])]
    for (const n of all) if (n && n.zh) BY_NAME[n.zh] = form
  } else if (c.slug === 'spa-care') {
    for (const t of treatments) {
      const key = SPA_FORM_OF_TREATMENT[t.key]
      if (key) for (const n of names([t])) if (n && n.zh) BY_NAME[n.zh] = CONSENT_FORMS[key]
      if (t.key === 'body-peel') for (const pk of t.packages || []) BY_NAME[pk.name.zh] = CONSENT_FORMS[/背部/.test(pk.name.zh) ? 'body-peel-back' : 'body-peel-front'] // the heading itself is not booked
    }
  }
}

// The forms a booking needs: one for each project in its service text ("A + B" when several were booked together), without repeating
// a form (two skincare services share one). `appt` is optional: it adds the forms of custom services from their 项目类别.
export const consentFormsFor = (service, appt) => {
  const seen = new Set()
  const add = (f) => f && !seen.has(f.file) && seen.add(f.file) && f
  const found = String(service || '').split(' + ').map((n) => add(BY_NAME[n.trim()])).filter(Boolean)
  const extra = appt ? [appt.category, ...(appt.items || []).map((x) => x && x.category)].map((c) => add(FORM_OF_CATEGORY[c])).filter(Boolean) : []
  return [...found, ...extra]
}
