// 幸运鲤的工作台 - Service Worker v5
// 彻底不缓存任何内容，确保每次打开都是最新版本
const CACHE = 'luckykoi-v5';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // 删除所有旧缓存
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  );
  e.waitUntil(self.clients.claim());
});

// 所有请求都走网络，不缓存
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request));
});
