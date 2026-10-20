// Consent forms (同意书) for the 28 医美 projects: one PDF per project, kept in public/consent/<treatment key>.pdf.
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

const BY_NAME = Object.fromEntries(Object.values(CONSENT_FORMS).map((f) => [f.name, f]))

// The forms a booking needs: one for each 医美 project in its service text ("A + B" when several were booked together).
export const consentFormsFor = (service) => {
  const seen = new Set()
  return String(service || '').split(' + ').map((n) => BY_NAME[n.trim()]).filter((f) => f && !seen.has(f.file) && seen.add(f.file))
}
