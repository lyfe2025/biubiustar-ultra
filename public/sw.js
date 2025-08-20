// Service Worker for BiuBiuStar Ultra
// 实现静态资源缓存、API响应缓存和离线支持

const CACHE_NAME = 'biubiustar-v1.0.0';
const API_CACHE_NAME = 'biubiustar-api-v1.0.0';
const STATIC_CACHE_NAME = 'biubiustar-static-v1.0.0';
const FONT_CACHE_NAME = 'biubiustar-fonts-v1.0.0';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/images/placeholder-activity.svg',
  '/images/logo.png'
];

// API 路径模式
const API_PATTERNS = [
  /\/api\//,
  /\/uploads\//
];

// 静态资源模式
const STATIC_PATTERNS = [
  /\.(js|css|png|jpg|jpeg|gif|svg|ico|webp)$/,
  /\/assets\//
];

// 字体文件模式
const FONT_PATTERNS = [
  /\.(woff|woff2|ttf|eot)$/,
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/
];

// 安装事件 - 预缓存静态资源
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // 删除不匹配当前版本的缓存
            if (cacheName !== CACHE_NAME && 
                cacheName !== API_CACHE_NAME && 
                cacheName !== STATIC_CACHE_NAME && 
                cacheName !== FONT_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activated');
        return self.clients.claim();
      })
  );
});

// 获取事件 - 实现缓存策略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 只处理 GET 请求
  if (request.method !== 'GET') {
    return;
  }
  
  // 跳过 chrome-extension 和其他非 http(s) 请求
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // API 请求 - Network First 策略
  if (API_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // 字体文件 - Stale While Revalidate 策略
  if (FONT_PATTERNS.some(pattern => pattern.test(url.href))) {
    event.respondWith(handleFontRequest(request));
    return;
  }
  
  // 静态资源 - Cache First 策略
  if (STATIC_PATTERNS.some(pattern => pattern.test(url.pathname)) || 
      url.origin === self.location.origin) {
    event.respondWith(handleStaticRequest(request));
    return;
  }
});

// API 请求处理 - Network First
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // 尝试网络请求
    const networkResponse = await fetch(request);
    
    // 只缓存成功的响应
    if (networkResponse.ok) {
      // 克隆响应用于缓存
      const responseClone = networkResponse.clone();
      
      // 异步缓存，不阻塞响应
      cache.put(request, responseClone).catch(error => {
        console.warn('[SW] Failed to cache API response:', error);
      });
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for API request, trying cache:', request.url);
    
    // 网络失败，尝试从缓存获取
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Serving API request from cache:', request.url);
      return cachedResponse;
    }
    
    // 如果是关键 API 请求，返回离线页面或错误信息
    if (request.url.includes('/api/')) {
      return new Response(
        JSON.stringify({ 
          error: 'Network unavailable', 
          message: '网络不可用，请检查网络连接' 
        }),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    throw error;
  }
}

// 静态资源处理 - Cache First
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  // 先尝试从缓存获取
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log('[SW] Serving static asset from cache:', request.url);
    return cachedResponse;
  }
  
  try {
    // 缓存中没有，从网络获取
    const networkResponse = await fetch(request);
    
    // 只缓存成功的响应
    if (networkResponse.ok) {
      // 克隆响应用于缓存
      const responseClone = networkResponse.clone();
      
      // 异步缓存
      cache.put(request, responseClone).catch(error => {
        console.warn('[SW] Failed to cache static asset:', error);
      });
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Failed to fetch static asset:', request.url, error);
    
    // 如果是 HTML 页面请求失败，返回离线页面
    if (request.destination === 'document') {
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>离线模式 - BiuBiuStar</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                   text-align: center; padding: 50px; background: #f5f5f5; }
            .container { max-width: 400px; margin: 0 auto; background: white; 
                        padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; margin-bottom: 20px; }
            p { color: #666; line-height: 1.6; }
            .retry-btn { background: #6366f1; color: white; border: none; 
                        padding: 12px 24px; border-radius: 6px; cursor: pointer; 
                        font-size: 16px; margin-top: 20px; }
            .retry-btn:hover { background: #5856eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🌐 离线模式</h1>
            <p>当前网络不可用，您正在浏览离线版本。</p>
            <p>请检查网络连接后重试。</p>
            <button class="retry-btn" onclick="window.location.reload()">重新加载</button>
          </div>
        </body>
        </html>`,
        {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }
      );
    }
    
    throw error;
  }
}

// 字体文件处理 - Stale While Revalidate
async function handleFontRequest(request) {
  const cache = await caches.open(FONT_CACHE_NAME);
  
  // 先从缓存获取
  const cachedResponse = await cache.match(request);
  
  // 异步更新缓存
  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(error => {
      console.warn('[SW] Failed to update font cache:', error);
    });
  
  // 如果有缓存，立即返回缓存，同时在后台更新
  if (cachedResponse) {
    console.log('[SW] Serving font from cache (stale while revalidate):', request.url);
    return cachedResponse;
  }
  
  // 如果没有缓存，等待网络请求
  return fetchPromise;
}

// 消息处理 - 支持手动缓存清理
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[SW] Clearing cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log('[SW] All caches cleared');
        event.ports[0].postMessage({ success: true });
      })
    );
  }
  
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    event.waitUntil(
      getCacheSize().then((size) => {
        event.ports[0].postMessage({ cacheSize: size });
      })
    );
  }
});

// 获取缓存大小
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }
  
  return totalSize;
}

// 错误处理
self.addEventListener('error', (event) => {
  console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});