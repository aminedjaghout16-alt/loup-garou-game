/**
 * sw.js — Loup-Garou en Ligne Service Worker
 * Strategy:
 *   • Shell / static assets  → Cache-first (fast loads)
 *   • Google Fonts            → Stale-while-revalidate
 *   • Firebase / API calls    → Network-first (real-time game data must be fresh)
 *   • Everything else         → Network-first with cache fallback
 */

const CACHE_VERSION = 'lg-v1';
const SHELL_CACHE   = `${CACHE_VERSION}-shell`;
const FONT_CACHE    = `${CACHE_VERSION}-fonts`;

// Files to pre-cache on install (adjust paths to match your deployment)
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/site.webmanifest',
  '/offline.html',
];

// ── INSTALL ──────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_ASSETS).catch(err => {
        // Don't block install if some assets are missing (e.g. offline.html)
        console.warn('[SW] Pre-cache partial failure:', err);
      }))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith('lg-') && k !== SHELL_CACHE && k !== FONT_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept non-GET or cross-origin Firebase / WebSocket
  if (request.method !== 'GET') return;
  if (isFirebase(url))          return;  // let real-time DB go through always
  if (url.protocol === 'chrome-extension:') return;

  // Google Fonts → stale-while-revalidate
  if (isGoogleFont(url)) {
    event.respondWith(staleWhileRevalidate(FONT_CACHE, request));
    return;
  }

  // Shell assets → cache-first
  if (isShellAsset(url)) {
    event.respondWith(cacheFirst(SHELL_CACHE, request));
    return;
  }

  // Everything else → network-first with offline fallback
  event.respondWith(networkFirst(SHELL_CACHE, request));
});

// ── PUSH NOTIFICATIONS ───────────────────────────────────────────────────────
self.addEventListener('push', event => {
  let data = { title: 'Loup-Garou', body: 'Something happened in your game!' };
  try { data = { ...data, ...event.data.json() }; } catch (_) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    '/android-chrome-192x192.png',
      badge:   '/favicon-32x32.png',
      vibrate: [200, 100, 200],
      tag:     'loup-garou-notif',
      renotify: true,
      data:    { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url === target && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(target);
    })
  );
});

// ── BACKGROUND SYNC (queue failed actions) ───────────────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-game-actions') {
    event.waitUntil(replayQueuedActions());
  }
});

async function replayQueuedActions() {
  // Placeholder — wire up to IndexedDB queue in your app code if needed
  console.log('[SW] Background sync: replaying queued actions');
}

// ── HELPERS ──────────────────────────────────────────────────────────────────
function isFirebase(url) {
  return url.hostname.includes('firebaseio.com') ||
         url.hostname.includes('firebasedatabase.app') ||
         url.hostname.includes('googleapis.com') ||
         url.hostname.includes('firebaseapp.com');
}

function isGoogleFont(url) {
  return url.hostname === 'fonts.googleapis.com' ||
         url.hostname === 'fonts.gstatic.com';
}

function isShellAsset(url) {
  return url.origin === self.location.origin &&
    (url.pathname === '/' ||
     url.pathname.endsWith('.html') ||
     url.pathname.endsWith('.ico') ||
     url.pathname.endsWith('.png') ||
     url.pathname.endsWith('.webmanifest'));
}

async function cacheFirst(cacheName, request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (_) {
    return offlineFallback(request);
  }
}

async function networkFirst(cacheName, request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (_) {
    const cached = await caches.match(request);
    return cached || offlineFallback(request);
  }
}

async function staleWhileRevalidate(cacheName, request) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || fetchPromise;
}

async function offlineFallback(request) {
  if (request.destination === 'document') {
    const cached = await caches.match('/offline.html');
    if (cached) return cached;
    // Inline minimal offline page if offline.html isn't cached
    return new Response(
      `<!DOCTYPE html><html><head><meta charset="UTF-8">
       <meta name="viewport" content="width=device-width,initial-scale=1">
       <title>Loup-Garou — Hors ligne</title>
       <style>body{background:#0a0a1a;color:#e8e8e8;font-family:sans-serif;display:flex;
       flex-direction:column;align-items:center;justify-content:center;min-height:100vh;
       text-align:center;padding:2rem}h1{color:#d4a017;font-size:2rem;margin-bottom:1rem}
       p{opacity:.7;max-width:300px;line-height:1.6}
       button{margin-top:2rem;padding:.7rem 1.6rem;background:#d4a017;border:none;
       border-radius:8px;color:#0a0a1a;font-size:1rem;cursor:pointer;font-weight:700}
       </style></head><body>
       <h1>🐺 Vous êtes hors ligne</h1>
       <p>Connectez-vous à Internet pour jouer au Loup-Garou en ligne.</p>
       <button onclick="location.reload()">Réessayer</button>
       </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
  return new Response('', { status: 408 });
}
