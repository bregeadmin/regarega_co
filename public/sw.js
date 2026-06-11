/* Rega Rega service worker — ONLINE-FIRST.
   Пока без кэша (офлайн = отдельная фаза). Существует, чтобы гид был «устанавливаемым» PWA
   и как задел под будущее офлайн-кэширование. Сеть проходит насквозь. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (event) { event.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function () { /* passthrough — ничего не перехватываем */ });
