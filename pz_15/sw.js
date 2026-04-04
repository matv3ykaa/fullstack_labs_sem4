// Кэш для App Shell
const CACHE_NAME = 'flow-shell-v1';
// Кэш для динамического контента
const DYNAMIC_CACHE_NAME = 'flow-content-v1';

// Статические ресурсы (кэшируются при установке)
const ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css',
  '/manifest.json',
  '/icons/favicon.ico',
  '/icons/favicon-16x16.png',
  '/icons/favicon-32x32.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Кэшируем App Shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Удаляем старые кэши
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
            .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Разные стратегии для статики и динамического контента
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Пропускаем внешние запросы
  if (url.origin !== location.origin) return;
  
  // Динамический контент (Network First)
  if (url.pathname.startsWith('/content/')) {
    event.respondWith(
      fetch(event.request)
        .then(networkRes => {
          // Кэшируем свежий ответ
          const resClone = networkRes.clone();
          caches.open(DYNAMIC_CACHE_NAME).then(cache => {
            cache.put(event.request, resClone);
          });
          return networkRes;
        })
        .catch(() => {
          // Если сети нет — берём из кэша
          return caches.match(event.request)
            .then(cached => cached || caches.match('/content/home.html'));
        })
    );
    return;
  }
  
  // Статика (Cache First)
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});