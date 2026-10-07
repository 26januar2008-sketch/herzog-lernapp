// Yggdrasil · Service Worker: alles für offline vorhalten
const CACHE = 'yggdrasil-v3';
const ASSETS = [
  './', 'index.html', 'app.css', 'app.js', 'data.js', 'privat.js', 'tree.js',
  'manifest.json', 'icon.svg', 'icon-192.png', 'icon-512.png', 'wach.webm',
  'fonts/barlow-condensed-500-latin.woff2', 'fonts/barlow-condensed-500-latin-ext.woff2',
  'fonts/barlow-condensed-700-latin.woff2', 'fonts/barlow-condensed-700-latin-ext.woff2',
  'fonts/source-sans-3-latin.woff2', 'fonts/source-sans-3-latin-ext.woff2',
  'fonts/noto-sans-runic-400-runic.woff2'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('yggdrasil-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => {
      const net = fetch(e.request).then(resp => {
        if (resp && resp.status === 200) { const clone = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, clone)); }
        return resp;
      }).catch(() => hit || (e.request.mode === 'navigate' ? caches.match('index.html') : undefined));
      return hit || net;
    })
  );
});
