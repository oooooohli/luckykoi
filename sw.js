// 幸运鲤的工作台 - Service Worker v3
const CACHE = 'luckykoi-v3';
const CACHE_LIST = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CACHE_LIST)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  e.waitUntil(self.clients.claim());
});

// 更新检测：每24小时后台检查一次
self.addEventListener('fetch', e => {
  // 对 HTML 请求使用 Network First 策略（确保获取最新版本）
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          const cloned = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, cloned));
          return response;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  // 其他资源 Cache First
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(response => {
      const cloned = response.clone();
      caches.open(CACHE).then(cache => cache.put(e.request, cloned));
      return response;
    }))
  );
});

// 当新 SW 被激活时，通知所有打开的页面
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
