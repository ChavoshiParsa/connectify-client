const CACHE_NAME = 'connectify-pwa-v3';
const BASE_PATH = new URL(self.registration.scope).pathname.replace(/\/$/, '');
const API_BASE_PATH = (new URL(self.location.href).searchParams.get('apiBasePath') || `${BASE_PATH}/api`).replace(
  /\/+$/,
  '',
);
const withBasePath = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return normalizedPath === BASE_PATH || normalizedPath.startsWith(`${BASE_PATH}/`)
    ? normalizedPath
    : `${BASE_PATH}${normalizedPath}`;
};
const toAppUrl = (value, fallback) => {
  const url = new URL(value || fallback, self.location.origin);
  if (url.origin === self.location.origin) url.pathname = withBasePath(url.pathname);
  return url.toString();
};
const toScopedAssetUrl = (value, fallback) => {
  const url = new URL(value || fallback, self.location.origin);
  if (url.origin === self.location.origin) {
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      url.pathname = `${API_BASE_PATH}${url.pathname.slice('/api'.length)}`;
    } else if (url.pathname !== BASE_PATH && !url.pathname.startsWith(`${BASE_PATH}/`)) {
      url.pathname = withBasePath(url.pathname);
    }
  }
  return url.toString();
};
const PRECACHE_URLS = [
  withBasePath('/offline.html'),
  withBasePath('/icons/icon-192x192.png'),
  withBasePath('/icons/icon-512x512.png'),
  withBasePath('/icons/badge-72x72.png'),
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(withBasePath('/offline.html'))));
    return;
  }

  if (
    ![withBasePath('/icons/'), withBasePath('/images/'), withBasePath('/fonts/')].some((prefix) =>
      url.pathname.startsWith(prefix),
    )
  )
    return;

  event.respondWith(
    caches.match(request).then(async (cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    }),
  );
});

self.addEventListener('push', (event) => {
  event.waitUntil(
    (async () => {
      let payload = {
        title: 'Connectify',
        body: 'You have a new message',
        icon: withBasePath('/icons/icon-192x192.png'),
        badge: withBasePath('/icons/badge-72x72.png'),
        tag: 'connectify-message',
        data: { url: withBasePath('/home') },
      };

      if (event.data) {
        try {
          payload = { ...payload, ...event.data.json() };
        } catch {
          payload.body = event.data.text() || payload.body;
        }
      }

      payload.icon = toScopedAssetUrl(payload.icon, '/icons/icon-192x192.png');
      payload.badge = toScopedAssetUrl(payload.badge, '/icons/badge-72x72.png');
      payload.data = {
        ...payload.data,
        url: toAppUrl(payload.data?.url, '/home'),
      };

      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });
      const visibleClient = windowClients.find((client) => client.visibilityState === 'visible');

      if (visibleClient && !payload.forceDisplay) {
        visibleClient.postMessage({ type: 'PUSH_MESSAGE', payload });
        return;
      }

      await self.registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon,
        badge: payload.badge,
        tag: payload.tag,
        renotify: true,
        silent: false,
        vibrate: [120, 60, 120],
        data: payload.data,
      });
    })(),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    (async () => {
      const requestedUrl = new URL(event.notification.data?.url || withBasePath('/home'), self.location.origin);
      const targetUrl =
        requestedUrl.origin === self.location.origin
          ? requestedUrl.href
          : `${self.location.origin}${withBasePath('/home')}`;
      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      for (const client of windowClients) {
        if (new URL(client.url).origin === self.location.origin) {
          await client.navigate(targetUrl);
          return client.focus();
        }
      }

      return self.clients.openWindow(targetUrl);
    })(),
  );
});
