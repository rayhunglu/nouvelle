// Service worker for the installable app (PWA). It only speeds up the static files and shows an offline page when there is no
// network. It never touches /api (login, appointments, payments...): that data is always fetched live.
const VERSION = 'nouvelle-v1'
const STATIC = `${VERSION}-static`
const PRECACHE = ['/offline.html', '/icons/icon-192.png', '/icons/icon-512.png', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== self.location.origin) return // other sites, and anything that is not a plain read
  if (url.pathname.startsWith('/api/')) return // data is never cached

  // Pages: always try the network, show the offline page when it is not reachable.
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('/offline.html')))
    return
  }

  // Build files have a hash in their name, so a cached copy is always the right one.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(STATIC).then((c) => c.put(req, copy)) }
        return res
      })),
    )
    return
  }

  // Images and icons: show the cached one at once and refresh it in the background.
  if (url.pathname.startsWith('/images/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.open(STATIC).then((c) => c.match(req).then((hit) => {
        const fresh = fetch(req).then((res) => { if (res.ok) c.put(req, res.clone()); return res }).catch(() => hit)
        return hit || fresh
      })),
    )
  }
})
