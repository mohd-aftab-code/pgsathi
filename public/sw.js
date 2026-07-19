// This is a minimal Service Worker required for PWA installability.
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

const OFFLINE_PAGE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>You're offline — PGSathi</title>
<style>
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
    font-family:system-ui,-apple-system,sans-serif; background:#f8fafc; color:#0f172a; text-align:center; padding:24px; }
  h1 { font-size:1.25rem; margin:0 0 8px; }
  p { color:#64748b; margin:0 0 20px; font-size:.9rem; }
  button { background:#6d28d9; color:#fff; border:none; padding:10px 20px; border-radius:10px;
    font-weight:600; font-size:.875rem; cursor:pointer; }
</style></head>
<body>
  <div>
    <h1>You're offline</h1>
    <p>Check your internet connection and try again.</p>
    <button onclick="location.reload()">Retry</button>
  </div>
</body></html>`;

self.addEventListener('fetch', (event) => {
  // Having a fetch listener is enough to pass Chrome's PWA installability
  // criteria — we deliberately do not cache or rewrite normal responses.
  // Only page navigations get an offline fallback; every other request
  // (JS/CSS chunks, RSC/API fetches) must fail normally on error, otherwise
  // callers that expect JSON/JS end up parsing this placeholder and break.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(OFFLINE_PAGE, { headers: { 'Content-Type': 'text/html' } })
      )
    );
  }
});
