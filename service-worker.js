const CACHE_NAME = 'watson-recipes-shell-v2';
const APP_FILES = [
  '/',
  '/index.html',
  '/app.js',
  '/whatsapp-recipes.js',
  '/styles.css',
  '/manifest.webmanifest',
  '/assets/watson-icon.svg',
  '/assets/watson-icon-192.png',
  '/assets/watson-icon-512.png',
  '/assets/whatsapp/balanced-tofu-spinach-saag.jpg',
  '/assets/whatsapp/creamy-coconut-pork-pasta.jpg',
  '/assets/whatsapp/mushroom-spinach-stuffed-sweet-potato.jpg',
  '/assets/whatsapp/stuffed-sweet-potatoes-feta.jpg',
  '/assets/whatsapp/beef-cabbage-stir-fry.jpg',
  '/assets/whatsapp/cauliflower-broccoli-mac-cheese.jpg',
  '/assets/whatsapp/tomato-burrata-gnocchi.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(request).then(response => {
    if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
    return response;
  }).catch(() => caches.match(request).then(cached => cached || (request.mode === 'navigate' ? caches.match('/index.html') : Response.error()))));
});
