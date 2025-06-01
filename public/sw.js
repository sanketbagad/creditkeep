const CACHE_NAME = "creditkeep-v1"
const STATIC_CACHE = "creditkeep-static-v1"
const DYNAMIC_CACHE = "creditkeep-dynamic-v1"

// Files to cache for offline use
const STATIC_FILES = [
  "/",
  "/login",
  "/signup",
  "/dashboard",
  "/shops",
  "/analytics",
  "/transactions/add",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
]

// API routes that should be cached
const API_CACHE_PATTERNS = [/^\/api\/shops/, /^\/api\/transactions/, /^\/api\/analytics/, /^\/api\/auth\/me/]

// Install event - cache static files
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...")
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Caching static files")
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        return self.skipWaiting()
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        return self.clients.claim()
      }),
  )
})

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle API requests
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle navigation requests
  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request))
    return
  }

  // Handle other requests (static assets)
  event.respondWith(handleStaticRequest(request))
})

// Handle API requests with cache-first strategy for GET requests
async function handleApiRequest(request) {
  const url = new URL(request.url)

  // Only cache GET requests for specific API patterns
  if (request.method === "GET" && API_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    try {
      // Try cache first
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        // Fetch in background to update cache
        fetch(request)
          .then((response) => {
            if (response.ok) {
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, response.clone())
              })
            }
          })
          .catch(() => {
            // Ignore network errors when updating cache
          })
        return cachedResponse
      }

      // If not in cache, fetch from network
      const response = await fetch(request)
      if (response.ok) {
        const cache = await caches.open(DYNAMIC_CACHE)
        cache.put(request, response.clone())
      }
      return response
    } catch (error) {
      // Return cached version if available
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        return cachedResponse
      }

      // Return offline response for API calls
      return new Response(
        JSON.stringify({
          error: "Offline - data not available",
          offline: true,
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        },
      )
    }
  }

  // For non-GET requests, always try network first
  try {
    return await fetch(request)
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Offline - cannot perform this action",
        offline: true,
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const response = await fetch(request)
    return response
  } catch (error) {
    // If offline, serve cached page or fallback
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Fallback to cached homepage
    const fallback = await caches.match("/")
    return fallback || new Response("Offline - page not available", { status: 503 })
  }
}

// Handle static requests
async function handleStaticRequest(request) {
  try {
    // Try cache first for static assets
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // If not cached, fetch from network and cache
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    // Return cached version if available
    const cachedResponse = await caches.match(request)
    return cachedResponse || new Response("Offline - resource not available", { status: 503 })
  }
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(syncOfflineData())
  }
})

// Sync offline data when connection is restored
async function syncOfflineData() {
  try {
    // Get offline data from IndexedDB and sync with server
    console.log("Syncing offline data...")
    // Implementation would depend on your offline storage strategy
  } catch (error) {
    console.error("Failed to sync offline data:", error)
  }
}
