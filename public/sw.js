/* ════════ Service Worker — مولد روتین Weekly OS ════════
   استراتژی‌ها:
   • ناوبری‌ها (HTML): شبکه‌اول با فالت‌بک به کش؛ آفلاین ← صفحهٔ offline.html
   • /_next/static (هاش‌شده، تغییرناپذیر): کش‌اول
   • فونت/CDN و تصاویر: stale-while-revalidate
   • بقیهٔ GET هم‌مبدأ: شبکه‌اول + کش
   کش‌ها نسخه‌بندی‌شده‌اند و در activate پاک می‌شوند. */

const VERSION = "v1";
const SHELL_CACHE = `rg-shell-${VERSION}`;
const PAGE_CACHE = `rg-pages-${VERSION}`;
const ASSET_CACHE = `rg-assets-${VERSION}`;
const FONT_CACHE = `rg-fonts-${VERSION}`;
const MAX_PAGES = 30;
const MAX_FONTS = 25;

const OFFLINE_URL = "/offline.html";
const PRECACHE = ["/", OFFLINE_URL, "/manifest.webmanifest", "/favicon.svg", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // تک‌تک اضافه می‌کنیم تا شکستِ یک آیتم کل نصب را خراب نکند
      await Promise.allSettled(PRECACHE.map((u) => cache.add(new Request(u, { cache: "reload" }))));
      // منتظر دستور SKIP_WAITING می‌مانیم تا به‌روزرسانی بی‌صدا و کنترل‌شده باشد
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL_CACHE, PAGE_CACHE, ASSET_CACHE, FONT_CACHE]);
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

/* ─────────── راهبردها ─────────── */

async function networkFirstPage(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const res = await fetch(request);
    if (res && res.ok && res.type === "basic") cache.put(request, res.clone());
    return res;
  } catch {
    const cached = (await cache.match(request)) || (await caches.match(request));
    if (cached) return cached;
    const shell = await caches.open(SHELL_CACHE);
    return (await shell.match(OFFLINE_URL)) || Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  if (cached) {
    // به‌روزرسانی در پس‌زمینه
    fetch(request)
      .then((res) => {
        if (res && res.ok) cache.put(request, res.clone());
      })
      .catch(() => {});
    return cached;
  }
  const res = await fetch(request);
  if (res && res.ok) cache.put(request, res.clone());
  return res;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(FONT_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then(async (res) => {
      if (res && (res.ok || res.type === "opaque")) {
        const keys = await cache.keys();
        if (keys.length >= MAX_FONTS) await cache.delete(keys[0]);
        await cache.put(request, res.clone());
      }
      return res;
    })
    .catch(() => cached);
  return cached || (await network) || Response.error();
}

async function trimPages() {
  const cache = await caches.open(PAGE_CACHE);
  const keys = await cache.keys();
  if (keys.length > MAX_PAGES)
    await Promise.all(keys.slice(0, keys.length - MAX_PAGES).map((k) => cache.delete(k)));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // ناوبری سند (HTML)
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirstPage(request).then((r) => (trimPages(), r)));
    return;
  }

  // فونت‌ها و CSS/JS خارجی (CDN) — پاسخ‌های opaque هم قبول‌اند
  if (url.origin !== self.location.origin) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // فایل‌های هاش‌شدهٔ Next.js و آیکن‌ها — تغییرناپذیرند
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/favicon.svg"
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // بقیهٔ منابع هم‌مبدأ: شبکه‌اول با فالت‌بک کش
  event.respondWith(
    (async () => {
      try {
        const res = await fetch(request);
        if (res && res.ok) {
          const cache = await caches.open(ASSET_CACHE);
          cache.put(request, res.clone());
        }
        return res;
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        return Response.error();
      }
    })(),
  );
});
