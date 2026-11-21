/* Service Worker: macht die App offline-fähig. Bei Änderungen VERSION erhöhen. */
const VERSION = "lernclub-v11";
const FILES = [
  "./",
  "index.html",
  "css/style.css",
  "js/app.js",
  "js/i18n.js",
  "js/i18n-es.js",
  "js/i18n-extra.js",
  "js/i18n-musik.js",
  "js/i18n-karten.js",
  "js/notation.js",
  "data/kaenguru.js",
  "data/puzzles.js",
  "data/warum.js",
  "data/club.js",
  "data/inhalte-es.js",
  "data/spanisch.js",
  "data/sprueche.js",
  "data/skins.js",
  "data/musik.js",
  "data/karten.js",
  "manifest.webmanifest",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: "reload" })))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Eigene Dateien: zuerst Netz (damit Updates ankommen), sonst Cache. Fremde Seiten (Känguru-PDFs) nicht anfassen.
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  e.respondWith(
    // cache: "no-cache" fragt beim Server nach, ob es eine neuere Datei gibt
    // (GitHub Pages lässt Browser sonst bis zu 10 Minuten die alte Version nehmen)
    fetch(e.request, { cache: "no-cache" })
      .then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("index.html")))
  );
});
