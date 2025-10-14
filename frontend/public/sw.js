/**
 * Service Worker for offline video caching and background sync
 */

const CACHE_NAME = 'kampala-kids-skills-v1';
const FEATURED_VIDEOS_CACHE = 'featured-videos-v1';

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/placeholder.svg'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('✅ Static resources cached');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Failed to cache static resources:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== FEATURED_VIDEOS_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        // Claim all clients to start controlling them immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle API requests for featured videos
  if (url.pathname.includes('/api/gallery/media') && url.searchParams.get('featured') === 'true') {
    event.respondWith(handleFeaturedVideosRequest(event.request));
    return;
  }
  
  // Handle video file requests
  if (url.pathname.includes('/uploads/videos/') || url.pathname.includes('/uploads/thumbnails/')) {
    event.respondWith(handleMediaRequest(event.request));
    return;
  }
  
  // Handle other requests with cache-first strategy
  event.respondWith(handleStaticRequest(event.request));
});

// Handle featured videos API requests
async function handleFeaturedVideosRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(FEATURED_VIDEOS_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('📥 Cached featured videos API response');
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('📴 Network failed, trying cache for featured videos API');
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📦 Serving featured videos from cache');
      return cachedResponse;
    }
    
    // Return empty response if no cache available
    return new Response(JSON.stringify({
      success: true,
      data: [],
      message: 'Offline mode - no cached data available'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle media file requests (videos/thumbnails)
async function handleMediaRequest(request) {
  try {
    // Check cache first for media files
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📦 Serving media from cache:', request.url);
      return cachedResponse;
    }
    
    // Try network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache media files
      const cache = await caches.open(FEATURED_VIDEOS_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('📥 Cached media file:', request.url);
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('❌ Failed to load media file:', request.url);
    
    // Return placeholder for failed media requests
    if (request.url.includes('thumbnails')) {
      return fetch('/placeholder.svg');
    }
    
    // For video files, return a 404
    return new Response('Video not available offline', { status: 404 });
  }
}

// Handle static resource requests
async function handleStaticRequest(request) {
  try {
    // Network first for HTML documents
    if (request.destination === 'document') {
      const networkResponse = await fetch(request);
      
      if (networkResponse.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone());
        return networkResponse;
      }
      
      throw new Error('Network response not ok');
    }
    
    // Cache first for other static resources
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return cached version if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match('/index.html');
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Background sync for video downloads
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-featured-videos') {
    event.waitUntil(syncFeaturedVideos());
  }
});

// Sync featured videos in background
async function syncFeaturedVideos() {
  try {
    console.log('🔄 Background syncing featured videos...');
    
    // Notify all clients about sync start
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_START',
        message: 'Starting background video sync...'
      });
    });
    
    // Fetch latest featured videos
    const response = await fetch('/api/gallery/media?featured=true&type=videos');
    
    if (response.ok) {
      const data = await response.json();
      console.log(`📥 Found ${data.data?.length || 0} featured videos to sync`);
      
      // Notify clients about successful sync
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_SUCCESS',
          data: data.data || [],
          message: 'Video sync completed successfully'
        });
      });
    } else {
      throw new Error(`Sync failed: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Background sync failed:', error);
    
    // Notify clients about sync failure
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_ERROR',
        error: error.message,
        message: 'Video sync failed'
      });
    });
  }
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('📨 Service Worker received message:', event.data);
  
  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_VIDEO':
      // Handle video caching request
      handleVideoCacheRequest(event.data.videoUrl, event.data.videoId);
      break;
      
    case 'CLEAR_CACHE':
      // Clear all caches
      clearAllCaches();
      break;
  }
});

// Cache a specific video
async function handleVideoCacheRequest(videoUrl, videoId) {
  try {
    console.log('📥 Caching video:', videoUrl);
    
    const response = await fetch(videoUrl);
    
    if (response.ok) {
      const cache = await caches.open(FEATURED_VIDEOS_CACHE);
      await cache.put(videoUrl, response);
      console.log('✅ Video cached successfully:', videoId);
    } else {
      throw new Error(`Failed to cache video: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Failed to cache video:', error);
  }
}

// Clear all caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    
    console.log('🧹 All caches cleared');
    
    // Notify clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'CACHE_CLEARED',
        message: 'All caches have been cleared'
      });
    });
  } catch (error) {
    console.error('❌ Failed to clear caches:', error);
  }
}