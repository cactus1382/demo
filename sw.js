/* Offline cache. Bump CACHE after editing any file so visitors get the new version. */
const CACHE = "demo-v2";
const ASSETS = [
  "./", "index.html", "styles.css", "app.js", "config.js", "manifest.json", "icon.svg",
  "examples/terrace.js"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(ASSETS.map(a => c.add(a).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const isNav = req.mode === "navigate";
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(isNav ? "index.html" : req, { ignoreSearch: isNav });
    const net = fetch(req).then(r => { if (r.ok && !isNav) c.put(req, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
