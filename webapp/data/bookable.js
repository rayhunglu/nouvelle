import { categories } from './site'

// The website treatments that can be booked online, shared by the booking form (pages/Contact.jsx) and the CRM's 服务项目管理.
//   'packages': pick a package (60 / 90 minutes); 'styles': pick a lash style; 'single': just the treatment, one fixed length.
export const BOOKABLE = {
  'japanese-face-correction': 'packages',
  'skinceuticals-cleanse-hydrate': 'packages',
  'rejuran-brightening': 'packages',
  'gua-sha': 'packages',
  'acne-clearing': 'packages',
  'classic-lashes': 'styles',
  'hybrid-lashes': 'styles',
  'lash-fills': 'styles',
  'body-spa': 'packages',
  'head-spa': 'packages',
  'back-cupping': 'packages',
  'body-peel': 'packages',
  'lymph-gua-sha': 'packages',
}

// 医美 treatments (injectables, devices, IV drips) are booked straight from their name: no package to pick. The length is fixed per
// treatment (injectables 30 minutes, except 水光针 / PRP 生发 / 童颜线 at 60; every device and IV drip 60) and the open times come from
// the people who can do it (src/controllers/availability.js keeps the same list).
export const MEDICAL_SLUGS = ['injectables', 'devices', 'iv-therapy']
const MEDICAL_ONE_HOUR = ['skin-2', 'hair-2', 'injectables-5']
export const medicalMinutes = (key) => {
  const slug = categories.find((c) => c.treatments.some((x) => x.key === key))?.slug
  return slug === 'injectables' && !MEDICAL_ONE_HOUR.includes(key) ? 30 : 60
}
Object.assign(BOOKABLE, Object.fromEntries(categories.filter((c) => MEDICAL_SLUGS.includes(c.slug)).flatMap((c) => c.treatments.map((x) => [x.key, 'single']))))

// 纹绣 is booked the same way (one treatment, a fixed length: the CRM's default), but it takes no room and has nobody fixed: the visitor
// picks any time inside the shop's opening hours, so it is not part of 服务项目管理.
export const TATTOO_MINUTES = { 'brow-shaping': 45, 'personalized-makeup': 60, 'ombre-brows': 120, 'lash-line-liner': 90, 'brow-removal': 60, 'eyeliner-removal': 60 }
Object.assign(BOOKABLE, Object.fromEntries(Object.keys(TATTOO_MINUTES).map((k) => [k, 'single'])))
export const singleMinutes = (key) => TATTOO_MINUTES[key] ?? medicalMinutes(key)

// 服务项目管理 groups: the bookable treatments by big group, each with the people who can do it (and, for some, its own bookable window)
// unless the manager changes that. The server keeps the same defaults in controllers/availability.js.
export const SERVICE_GROUPS = [
  { id: 'skincare', label: '护肤', slugs: ['skincare-experts'], staff: ['Rina'] },
  { id: 'medical', label: '医美', slugs: MEDICAL_SLUGS, staff: ['Yingna'] },
  { id: 'lash', label: '美睫', slugs: ['lash'], staff: ['Dayu'] },
  { id: 'spa', label: 'Spa', slugs: ['spa-care'], staff: [], itemStaff: { 'back-cupping': ['Rina'] } }, // nobody fixed (only the room counts), except the back cupping: Rina
]
export const serviceList = () => SERVICE_GROUPS.map((g) => ({
  ...g,
  items: categories.filter((c) => g.slugs.includes(c.slug)).flatMap((c) => c.treatments.filter((x) => BOOKABLE[x.key]).map((x) => ({ key: x.key, name: x.name, section: c.name }))),
}))
