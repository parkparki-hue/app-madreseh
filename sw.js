const CACHE = 'edu-student-1a6wxd8';
const CORE = ['./', './index.html', './manifest.webmanifest', './data/catalog.js', './data/conf.js', './data/home.js', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png'];
const OPTIONAL = ['./fonts/Vazirmatn.woff2'];
const IMG = 'edu-img';
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).then(() => Promise.all(OPTIONAL.map(a => c.add(a).catch(() => {})))))); });
self.addEventListener('message', e => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== IMG).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) {
    if (req.destination === 'image' && /^https?:$/.test(url.protocol)) {
      e.respondWith(caches.open(IMG).then(c => c.match(req).then(hit => {
        const net = fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) { c.put(req, res.clone()); c.keys().then(ks => { if (ks.length > 40) c.delete(ks[0]); }); } return res; }).catch(() => hit);
        if (hit) { e.waitUntil(net); return hit; } return net;
      })));
    }
    return;
  }
  if (url.pathname.indexOf('/data/book_') >= 0) return;
  const nf = req.mode === 'navigate' || url.pathname.endsWith('/data/catalog.js') || url.pathname.endsWith('/data/conf.js') || url.pathname.endsWith('/data/home.js');
  if (nf) { e.respondWith(fetch(req).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return res; }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))); return; }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(r => r || fetch(req).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return res; })));
});