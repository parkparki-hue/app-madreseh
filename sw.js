const CACHE = 'edu-student-14c1jcn';
const CORE = ['./', './index.html', './manifest.webmanifest', './data/catalog.js', './data/conf.js', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png'];
const OPTIONAL = ['./fonts/Vazirmatn.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).then(() => Promise.all(OPTIONAL.map(a => c.add(a).catch(() => {})))))); });
self.addEventListener('message', e => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  if (url.pathname.indexOf('/data/book_') >= 0) return;
  const nf = req.mode === 'navigate' || url.pathname.endsWith('/data/catalog.js') || url.pathname.endsWith('/data/conf.js');
  if (nf) { e.respondWith(fetch(req).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return res; }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))); return; }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(r => r || fetch(req).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return res; })));
});