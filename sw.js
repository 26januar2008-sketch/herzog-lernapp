const CACHE = 'lernapp-v7';
const ASSETS = [
  '.', 'index.html', 'liam.html', 'raik.html',
  'style.css', 'data.js', 'engine.js', 'sync.js', 'sounds.js', 'trace.js', 'ui.js',
  'manifest.json', 'manifest-liam.json', 'manifest-raik.json',
  'img/icons/icon-192.png', 'img/icons/icon-512.png',
  'img/icons/liam-192.png', 'img/icons/liam-512.png',
  'img/icons/raik-192.png', 'img/icons/raik-512.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
    if (e.request.method === 'GET' && resp.status === 200) {
      const clone = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
    }
    return resp;
  }).catch(()=>caches.match('index.html'))));
});
