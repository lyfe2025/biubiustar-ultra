/**
 * 缓存测试API端点
 * 提供全面的缓存测试和调试功能
 */

import { Router, Request, Response } from 'express';
import { userCache, contentCache, statsCache, configCache } from '../lib/cacheInstances.js';
import { EnhancedCacheService } from '../lib/enhancedCache.js';

const router = Router();

// 缓存性能测试
router.post('/performance', async (req: Request, res: Response) => {
  try {
    const { cacheType = 'user', itemCount = 1000, testType = 'write-read' } = req.body;
    
    const cache = getCacheInstance(cacheType);
    if (!cache) {
      return res.status(400).json({ error: 'Invalid cache type' });
    }

    const results: any = {
      cacheType,
      itemCount,
      testType,
      timestamp: new Date().toISOString()
    };

    if (testType === 'write' || testType === 'write-read') {
      // 写入性能测试
      const writeStart = Date.now();
      for (let i = 0; i < itemCount; i++) {
        await cache.set(`test-key-${i}`, {
          id: i,
          data: `test-data-${i}`,
          timestamp: Date.now()
        }, 300000); // 5分钟TTL
      }
      const writeEnd = Date.now();
      
      results.writeTime = writeEnd - writeStart;
      results.writeOpsPerSecond = Math.round(itemCount / (results.writeTime / 1000));
    }

    if (testType === 'read' || testType === 'write-read') {
      // 读取性能测试
      const readStart = Date.now();
      let hitCount = 0;
      for (let i = 0; i < itemCount; i++) {
        const result = await cache.get(`test-key-${i}`);
        if (result) hitCount++;
      }
      const readEnd = Date.now();
      
      results.readTime = readEnd - readStart;
      results.readOpsPerSecond = Math.round(itemCount / (results.readTime / 1000));
      results.hitRate = (hitCount / itemCount) * 100;
    }

    // 获取缓存统计信息
    results.cacheStats = cache.getStats();
    
    res.json(results);
  } catch (error) {
    console.error('Cache performance test error:', error);
    res.status(500).json({ error: 'Performance test failed' });
  }
});

// 缓存并发测试
router.post('/concurrency', async (req: Request, res: Response) => {
  try {
    const { cacheType = 'user', concurrentUsers = 10, operationsPerUser = 100 } = req.body;
    
    const cache = getCacheInstance(cacheType);
    if (!cache) {
      return res.status(400).json({ error: 'Invalid cache type' });
    }

    const startTime = Date.now();
    const promises = [];
    
    // 创建并发操作
    for (let user = 0; user < concurrentUsers; user++) {
      const userPromise = async () => {
        const results = { writes: 0, reads: 0, errors: 0 };
        
        for (let op = 0; op < operationsPerUser; op++) {
          try {
            const key = `concurrent-${user}-${op}`;
            
            // 写入操作
            await cache.set(key, {
              user,
              operation: op,
              timestamp: Date.now()
            }, 60000);
            results.writes++;
            
            // 读取操作
            const data = await cache.get(key);
            if (data) results.reads++;
            
          } catch (error) {
            results.errors++;
          }
        }
        
        return results;
      };
      
      promises.push(userPromise());
    }
    
    const userResults = await Promise.all(promises);
    const endTime = Date.now();
    
    const totalResults = userResults.reduce((acc, result) => ({
      writes: acc.writes + result.writes,
      reads: acc.reads + result.reads,
      errors: acc.errors + result.errors
    }), { writes: 0, reads: 0, errors: 0 });
    
    res.json({
      cacheType,
      concurrentUsers,
      operationsPerUser,
      totalTime: endTime - startTime,
      totalOperations: concurrentUsers * operationsPerUser * 2, // 写入+读取
      results: totalResults,
      opsPerSecond: Math.round((totalResults.writes + totalResults.reads) / ((endTime - startTime) / 1000)),
      errorRate: (totalResults.errors / (concurrentUsers * operationsPerUser * 2)) * 100,
      cacheStats: cache.getStats(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache concurrency test error:', error);
    res.status(500).json({ error: 'Concurrency test failed' });
  }
});

// 缓存数据一致性测试
router.post('/consistency', async (req: Request, res: Response) => {
  try {
    const { cacheType = 'user', testDuration = 30000 } = req.body; // 30秒测试
    
    const cache = getCacheInstance(cacheType);
    if (!cache) {
      return res.status(400).json({ error: 'Invalid cache type' });
    }

    const testKey = 'consistency-test-key';
    const startTime = Date.now();
    const results = {
      writes: 0,
      reads: 0,
      inconsistencies: 0,
      lastValue: null as any,
      timeline: [] as any[]
    };
    
    // 持续写入和读取测试
    while (Date.now() - startTime < testDuration) {
      const timestamp = Date.now();
      const value = {
        counter: results.writes,
        timestamp,
        random: Math.random()
      };
      
      // 写入
      await cache.set(testKey, value, 60000);
      results.writes++;
      
      // 立即读取验证
      const readValue = await cache.get(testKey);
      results.reads++;
      
      if (readValue) {
        const typedValue = readValue as { counter: number; timestamp: number };
        if (results.lastValue && typedValue.counter < results.lastValue.counter) {
          results.inconsistencies++;
          results.timeline.push({
            type: 'inconsistency',
            expected: results.lastValue.counter,
            actual: typedValue.counter,
            timestamp
          });
        }
        results.lastValue = typedValue;
      } else {
        results.inconsistencies++;
        results.timeline.push({
          type: 'missing_data',
          timestamp
        });
      }
      
      // 短暂延迟
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    res.json({
      cacheType,
      testDuration,
      results,
      consistencyRate: ((results.reads - results.inconsistencies) / results.reads) * 100,
      cacheStats: cache.getStats(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache consistency test error:', error);
    res.status(500).json({ error: 'Consistency test failed' });
  }
});

// 缓存内存压力测试
router.post('/memory-stress', async (req: Request, res: Response) => {
  try {
    const { cacheType = 'user', targetMemoryMB = 50, dataSize = 1024 } = req.body;
    
    const cache = getCacheInstance(cacheType);
    if (!cache) {
      return res.status(400).json({ error: 'Invalid cache type' });
    }

    const targetBytes = targetMemoryMB * 1024 * 1024;
    const itemSize = dataSize; // 每个数据项的大小（字节）
    const estimatedItems = Math.floor(targetBytes / itemSize);
    
    const startTime = Date.now();
    const initialMemory = process.memoryUsage();
    let itemsAdded = 0;
    let memoryExceeded = false;
    
    // 生成测试数据
    const generateTestData = (size: number) => {
      return {
        id: itemsAdded,
        data: 'x'.repeat(size - 100), // 减去其他字段的大概大小
        timestamp: Date.now(),
        metadata: {
          test: true,
          size: size
        }
      };
    };
    
    // 持续添加数据直到达到目标内存或缓存满
    while (itemsAdded < estimatedItems && !memoryExceeded) {
      try {
        const data = generateTestData(itemSize);
        await cache.set(`stress-test-${itemsAdded}`, data, 300000);
        itemsAdded++;
        
        // 每1000项检查一次内存使用
        if (itemsAdded % 1000 === 0) {
          const currentMemory = process.memoryUsage();
          const memoryIncrease = currentMemory.heapUsed - initialMemory.heapUsed;
          
          if (memoryIncrease > targetBytes * 1.2) { // 允许20%的误差
            memoryExceeded = true;
          }
        }
      } catch (error) {
        console.log('Cache full or error:', error);
        break;
      }
    }
    
    const endTime = Date.now();
    const finalMemory = process.memoryUsage();
    const stats = cache.getStats();
    
    res.json({
      cacheType,
      targetMemoryMB,
      dataSize,
      estimatedItems,
      actualItemsAdded: itemsAdded,
      testDuration: endTime - startTime,
      memoryUsage: {
        initial: initialMemory,
        final: finalMemory,
        increase: finalMemory.heapUsed - initialMemory.heapUsed,
        increaseMB: Math.round((finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024)
      },
      cacheStats: stats,
      efficiency: {
        itemsPerSecond: Math.round(itemsAdded / ((endTime - startTime) / 1000)),
        bytesPerItem: Math.round((finalMemory.heapUsed - initialMemory.heapUsed) / itemsAdded),
        cacheUtilization: (stats.size / stats.maxSize) * 100
      },
      memoryExceeded,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache memory stress test error:', error);
    res.status(500).json({ error: 'Memory stress test failed' });
  }
});

// 缓存TTL测试
router.post('/ttl', async (req: Request, res: Response) => {
  try {
    const { cacheType = 'user', ttlSeconds = 5, checkIntervalMs = 500 } = req.body;
    
    const cache = getCacheInstance(cacheType);
    if (!cache) {
      return res.status(400).json({ error: 'Invalid cache type' });
    }

    const testKey = 'ttl-test-key';
    const testValue = {
      message: 'TTL test data',
      created: Date.now()
    };
    
    // 设置带TTL的数据
    await cache.set(testKey, testValue, ttlSeconds * 1000);
    
    const timeline = [];
    const startTime = Date.now();
    let dataExists = true;
    
    // 定期检查数据是否还存在
    while (dataExists && (Date.now() - startTime) < (ttlSeconds * 1000 + 5000)) {
      const data = await cache.get(testKey);
      const currentTime = Date.now();
      
      timeline.push({
        timestamp: currentTime,
        elapsedMs: currentTime - startTime,
        dataExists: !!data,
        data: data
      });
      
      if (!data) {
        dataExists = false;
      }
      
      await new Promise(resolve => setTimeout(resolve, checkIntervalMs));
    }
    
    const actualTTL = timeline.find(entry => !entry.dataExists)?.elapsedMs || null;
    const expectedTTL = ttlSeconds * 1000;
    
    res.json({
      cacheType,
      expectedTTLMs: expectedTTL,
      actualTTLMs: actualTTL,
      accuracy: actualTTL ? Math.abs(actualTTL - expectedTTL) : null,
      timeline,
      cacheStats: cache.getStats(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache TTL test error:', error);
    res.status(500).json({ error: 'TTL test failed' });
  }
});

// 清理测试数据
router.delete('/cleanup', async (req: Request, res: Response) => {
  try {
    const { cacheType } = req.query;
    
    if (cacheType && typeof cacheType === 'string') {
      const cache = getCacheInstance(cacheType);
      if (!cache) {
        return res.status(400).json({ error: 'Invalid cache type' });
      }
      
      // 清理特定缓存的测试数据
      const stats = cache.getStats();
      const keys = Object.keys((cache as any).cache || {});
      const testKeys = keys.filter(key => 
        key.startsWith('test-') || 
        key.startsWith('concurrent-') || 
        key.startsWith('consistency-') || 
        key.startsWith('stress-test-') || 
        key.startsWith('ttl-test-')
      );
      
      for (const key of testKeys) {
        await cache.delete(key);
      }
      
      res.json({
        message: `Cleaned up ${testKeys.length} test keys from ${cacheType} cache`,
        cleanedKeys: testKeys.length,
        remainingKeys: stats.size - testKeys.length
      });
    } else {
      // 清理所有缓存的测试数据
      const caches = { userCache, contentCache, statsCache, configCache };
      const results: any = {};
      
      for (const [name, cache] of Object.entries(caches)) {
        const stats = cache.getStats();
        const keys = Object.keys((cache as any).cache || {});
        const testKeys = keys.filter(key => 
          key.startsWith('test-') || 
          key.startsWith('concurrent-') || 
          key.startsWith('consistency-') || 
          key.startsWith('stress-test-') || 
          key.startsWith('ttl-test-')
        );
        
        for (const key of testKeys) {
          await cache.delete(key);
        }
        
        results[name] = {
          cleanedKeys: testKeys.length,
          remainingKeys: stats.size - testKeys.length
        };
      }
      
      res.json({
        message: 'Cleaned up test data from all caches',
        results
      });
    }
  } catch (error) {
    console.error('Cache cleanup error:', error);
    res.status(500).json({ error: 'Cleanup failed' });
  }
});

// 获取缓存实例的辅助函数
function getCacheInstance(cacheType: string): EnhancedCacheService | null {
  switch (cacheType) {
    case 'user':
      return userCache;
    case 'content':
      return contentCache;
    case 'stats':
      return statsCache;
    case 'config':
      return configCache;
    default:
      return null;
  }
}

export default router;