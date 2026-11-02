/*
 * Offline support. Projects already live on the device (IndexedDB); this keeps the app itself
 * available without a connection.
 *   - install: download every file of this build (listed in precache.json by vite.config.ts)
 *   - pages: try the network first so updates arrive, fall back to the saved copy when offline
 *   - other files: served from the saved copy (their names change with every build)
 *   - Google Fonts: saved the first time they load, refreshed in the background
 * main.tsx registers this file as sw.js?build=<entry file name>, so each deploy installs a new
 * copy and the old one is deleted.
 */
const BUILD = new URL(self.location.href).searchParams.get('build') || 'dev';
const SHELL = `stitchbook-shell-${BUILD}`;
const FONTS = 'stitchbook-fonts';
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
// On a weak signal, show the saved app instead of waiting for the network.
const NETWORK_TIMEOUT_MS = 3000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const res = await fetch('precache.json', { cache: 'no-store' });
      const files = await res.json();
      const cache = await caches.open(SHELL);
      await cache.addAll(files.map((f) => new Request(f, { cache: 'reload' })));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith('stitchbook-shell-') && k !== SHELL).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    event.respondWith(req.mode === 'navigate' ? page(req) : saved(req));
  } else if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(font(req));
  }
});

async function page(req) {
  const cached = await caches.match(new URL('./', self.registration.scope), { ignoreSearch: true });
  const network = fetch(req);
  if (!cached) return network;
  const timeout = new Promise((resolve) => setTimeout(() => resolve(cached), NETWORK_TIMEOUT_MS));
  return Promise.race([network.catch(() => cached), timeout]);
}

async function saved(req) {
  return (await caches.match(req, { ignoreSearch: true })) ?? fetch(req);
}

async function font(req) {
  const cache = await caches.open(FONTS);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached ?? network;
}
