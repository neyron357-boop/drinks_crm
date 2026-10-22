/* QR Склад — service worker: работа без интернета и обновления */
const V = 'qrsklad-20261022-183734';
const CORE = ['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-180.png', 'vendor/zxing_reader.wasm', 'vendor/Onest-Regular.ttf', 'vendor/Onest-Bold.ttf'];
const CDN = [
  'https://cdn.jsdelivr.net/npm/zxing-wasm@3.1.3/dist/iife/reader/index.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/4.2.1/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/lean-qr@2.7.4/index.mjs',
  'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js',
];
self.addEventListener('install', e => e.waitUntil((async () => {
  const c = await caches.open(V);
  await c.addAll(CORE.map(u => new Request(u, { cache: 'reload' })));
  await Promise.all(CDN.map(u => c.add(new Request(u, { mode: 'cors', credentials: 'omit' })).catch(() => {})));
})()));
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== V) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (r.mode === 'navigate' && u.origin === location.origin) return e.respondWith(shell(e));
  if (u.origin === location.origin || /^(cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com)$/.test(u.hostname)) {
    e.respondWith((async () => {
      const c = await caches.open(V);
      const hit = await c.match(r, { ignoreVary: true, ignoreSearch: u.origin === location.origin });
      if (hit) return hit;
      const res = await fetch(r);
      if (res.ok && res.type !== 'opaque' && r.method === 'GET' && !r.headers.has('range')) c.put(r, res.clone()).catch(() => {});
      return res;
    })());
  }
});
async function shell(e) {
  const c = await caches.open(V);
  const cached = await c.match('./', { ignoreVary: true });
  const net = fetch(e.request, { cache: 'no-store' }).then(async res => {
    if (res.ok) {
      const old = cached && await cached.clone().text(), neu = await res.clone().text();
      await c.put('./', res.clone());
      if (old && old !== neu) for (const cl of await self.clients.matchAll()) cl.postMessage('update');
    }
    return res;
  });
  if (cached) { e.waitUntil(net.catch(() => {})); return cached; }
  return net;
}
