// 幸运鲤的工作台 - Service Worker v4
// 不对 HTML 做缓存，确保每次打开都是最新版本
const CACHE = 'luckykoi-v4';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  );
  e.waitUntil(self.clients.claim());
});

// 只缓存静态资源，HTML 永远走网络
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // HTML 页面：永远走网络，不缓存
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(fetch(e.request));
    return;
  }
  // 图标等静态资源：缓存优先
  if (url.pathname.match(/\.(png|jpg|svg|ico)$/) || url.pathname === '/manifest.json') {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(response => {
        const cloned = response.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, cloned));
        return response;
      }))
    );
    return;
  }
  // 其他：直接走网络
  e.respondWith(fetch(e.request));
});
