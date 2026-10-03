// sw.js — lets 技能五子棋 open without a network once it has been opened once: 对战电脑 and 同机对战 then work offline
// (在线对战 still needs the network). Everything is fetched network-first, so a new version shows up as soon as the phone
// is online; the cached copy is used only when the network fails.
const CACHE = 'skgomoku-offline-v1';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png',
  './fonts/ma-shan-zheng-400.woff2', './fonts/noto-serif-sc-400.woff2', './fonts/noto-serif-sc-700.woff2', './fonts/zhi-mang-xing-400.woff2'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('skgomoku-offline-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  e.respondWith(fetch(r).then(res => {
    if (res.ok && res.type === 'basic') { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
    return res;
  }).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || (r.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
});
