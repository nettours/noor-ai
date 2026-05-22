// public/sw.js
const CACHE_VERSION = 'noor-ai-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const AUDIO_CACHE = `${CACHE_VERSION}-audio`;
const API_CACHE = `${CACHE_VERSION}-api`;

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline',
  '/_next/static/css/',
];

const API_ROUTES_TO_CACHE = [
  'api.alquran.cloud/v1/surah',
  'api.aladhan.com/v1/timings',
];

// ─── INSTALL ───────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// ─── ACTIVATE ──────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('noor-ai-') && key !== STATIC_CACHE
            && key !== DYNAMIC_CACHE && key !== AUDIO_CACHE && key !== API_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ─── FETCH ─────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Audio files - Cache First with Network Fallback
  if (url.hostname === 'cdn.islamic.network' && request.url.includes('/audio/')) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      }).catch(() => new Response('Audio unavailable offline', { status: 503 }))
    );
    return;
  }

  // Quran API - Stale While Revalidate
  if (API_ROUTES_TO_CACHE.some((route) => request.url.includes(route))) {
    event.respondWith(
      caches.open(API_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Next.js pages - Network First with Cache Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/offline') || new Response('Offline', { status: 503 })
      )
    );
    return;
  }

  // Static assets - Cache First
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }
});

// ─── PUSH NOTIFICATIONS ────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/', id: data.id },
    actions: data.actions || [],
    tag: data.tag || 'noor-notification',
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    dir: 'rtl',
    lang: 'ar',
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'نور AI 🌙', options)
  );
});

// ─── NOTIFICATION CLICK ────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const client = clientList.find((c) => c.url.includes(url));
      if (client) return client.focus();
      return clients.openWindow(url);
    })
  );
});

// ─── BACKGROUND SYNC ───────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-prayer-tracker') {
    event.waitUntil(syncPrayerTracker());
  }
  if (event.tag === 'sync-reading-progress') {
    event.waitUntil(syncReadingProgress());
  }
});

async function syncPrayerTracker() {
  try {
    const db = await openDB();
    const pending = await db.getAll('pending-sync');
    for (const item of pending) {
      await fetch('/api/prayer/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
    }
  } catch {}
}

async function syncReadingProgress() {
  try {
    const progress = JSON.parse(localStorage.getItem('noor-quran-store') || '{}');
    if (progress.lastRead) {
      await fetch('/api/quran/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progress.lastRead),
      });
    }
  } catch {}
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('noor-ai-db', 1);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
