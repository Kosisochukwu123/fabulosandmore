/* ============================================================
   SERVICE WORKER REGISTRATION + IMAGE PREFETCHER
   serviceWorker.js
   ============================================================ */

let swRegistration = null;

const API_URL = process.env.REACT_APP_API_URL;


/* ---- Register the service worker ---- */
export async function registerSW() {
  if (!('serviceWorker' in navigator)) return;

  try {
    swRegistration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    console.log('[SW] Registered:', swRegistration.scope);

    /* Listen for messages from SW */
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'PREFETCH_DONE') {
        console.log(`[SW] Prefetch complete — ${event.data.count} images cached`);
      }
    });
  } catch (err) {
    console.warn('[SW] Registration failed:', err);
  }
}

/* ---- Collect all image URLs from the page + API ---- */
async function collectImageUrls() {
  const urls = new Set();

  /* 1. Images already in the DOM */
  document.querySelectorAll('img[src]').forEach(img => {
    if (img.src && !img.src.startsWith('data:')) {
      urls.add(img.src);
    }
  });

  /* 2. CSS background-images */
  document.querySelectorAll('[style*="background-image"]').forEach(el => {
    const match = el.style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
    if (match?.[1]) urls.add(match[1]);
  });

  /* 3. Known static hero images */
  [
    '/images/hero-kitchen.jpg',
    '/images/hero-teapots.jpg',
    '/images/hero-tea.jpg',
  ].forEach(p => urls.add(window.location.origin + p));

  /* 4. Fetch product images from API */
  try {
    const res  = await fetch(`${API_URL}/api/products?limit=200&fields=images`);
    const data = await res.json();
    (data.products || []).forEach(p => {
      (p.images || []).forEach(img => {
        if (img?.url) urls.add(img.url);
      });
    });
  } catch { /* silent */ }

  /* 5. Unsplash category images (used on home page) */
  const unsplashIds = [
    'photo-1556909114-f6e7ad7d3136',
    'photo-1585771724684-38269d6639fd',
    'photo-1509440159596-0249088772ff',
    'photo-1558618666-fcd25c85cd64',
    'photo-1563453392212-326f5e854473',
    'photo-1556742049-0cfed4f6a45d',
  ];
  unsplashIds.forEach(id =>
    urls.add(`https://images.unsplash.com/${id}?w=400&q=80`)
  );

  return [...urls].filter(Boolean);
}

/* ---- Trigger prefetch after cookie consent ---- */
export async function prefetchAllImages() {
  /* Make sure SW is ready */
  if (!swRegistration) {
    try {
      swRegistration = await navigator.serviceWorker.ready;
    } catch { return; }
  }

  const sw = swRegistration.active || swRegistration.installing;
  if (!sw) return;

  const urls = await collectImageUrls();
  console.log(`[SW] Sending ${urls.length} URLs to prefetch`);

  sw.postMessage({ type: 'PREFETCH_IMAGES', urls });
}

/* ---- Check if running in standalone / PWA mode ---- */
export function isPWA() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}