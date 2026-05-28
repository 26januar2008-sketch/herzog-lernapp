// Minimal Service Worker - nur für PWA-Install, KEIN Caching
// (Caching war zu aggressiv und hat Chat-Streams gestört)
const CACHE = 'herzog-ki-install-v2';
const INSTALL_ONLY = ['manifest.json', 'icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(INSTALL_ONLY).catch(() => {})).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// KEIN fetch-Handler → alle Requests gehen direkt ans Netz (kein Interferenz mit Chat / API)
