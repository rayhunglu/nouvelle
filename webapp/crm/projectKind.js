import { categories } from '../data/site'

// Which kind of project a service is, from the website's catalogue: 'medical' (医美: injectables, IV therapy, devices) or 'lash' (美睫).
// Anything else (skincare, spa...) is null. A service is found by its Chinese name, a package name, or a lash style.
const KIND_OF_CATEGORY = { injectables: 'medical', 'iv-therapy': 'medical', devices: 'medical', lash: 'lash' }

const byName = new Map()
for (const c of categories) {
  const kind = KIND_OF_CATEGORY[c.slug]
  if (!kind) continue
  const names = [
    ...(c.treatments || []).flatMap((t) => [t.name, ...(t.packages || []).map((pk) => pk.name)]),
    ...(c.priceList ? c.priceList.groups.flatMap((g) => g.rows.map((r) => r.name)) : []),
  ]
  for (const n of names) if (n && n.zh) byName.set(n.zh, kind)
}

export const projectKind = (serviceName) => {
  const name = String(serviceName || '')
  if (name.includes(' + ')) return name.split(' + ').map(projectKind).find(Boolean) || null // several services booked together: the first one that has a kind
  if (byName.has(name)) return byName.get(name)
  if (/睫/.test(name)) return 'lash'
  return null
}

// The kind recorded on a booking for a service typed by hand (项目类别): 医美 and 美睫 count like the website's own, the rest is null.
export const kindOfCategory = (category) => (category === 'medical' || category === 'lash' ? category : null)
