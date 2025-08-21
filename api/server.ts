/**
 * local server entry file, for local development
 */
import app from './app.js';
import { CacheWarmupService } from './services/cacheWarmup.js';
import { getAllCacheStats, clearAllCaches } from './lib/cacheInstances.js';

/**
 * start server with port
 */
const PORT = process.env.PORT || 3001;
console.log(`Attempting to start server on port ${PORT}...`);

const server = app.listen(PORT, async () => {
  console.log(`Server ready on port ${PORT}`);
  
  // 启动缓存预热
  try {
    console.log('Starting cache warmup...');
    const warmupService = new CacheWarmupService();
    await warmupService.warmupAll();
    console.log('Cache warmup completed');
  } catch (error) {
    console.error('Cache warmup failed:', error);
  }
  
  // 启动缓存监控
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      const stats = getAllCacheStats();
      const totalKeys = Object.values(stats).reduce((sum, cache) => sum + cache.size, 0);
      const totalHits = Object.values(stats).reduce((sum, cache) => sum + cache.totalHits, 0);
      const totalMisses = Object.values(stats).reduce((sum, cache) => sum + cache.totalMisses, 0);
      const totalRequests = totalHits + totalMisses;
      const hitRate = totalRequests > 0 ? (totalHits / totalRequests * 100).toFixed(2) : '0.00';
      const totalMemory = Object.values(stats).reduce((sum, cache) => sum + cache.memoryUsage, 0);
      
      console.log(`[Cache Stats] Keys: ${totalKeys}, Hit Rate: ${hitRate}%, Memory: ${(totalMemory / 1024 / 1024).toFixed(2)}MB, Caches: ${JSON.stringify(stats, null, 2)}`);
    }, 5 * 60 * 1000); // 每5分钟输出一次
  }
});

/**
 * close server
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    // 清理缓存资源
    clearAllCaches();
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    // 清理缓存资源
    clearAllCaches();
    console.log('Server closed');
    process.exit(0);
  });
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // 清理缓存资源
  clearAllCaches();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // 清理缓存资源
  clearAllCaches();
  process.exit(1);
});

export default app;