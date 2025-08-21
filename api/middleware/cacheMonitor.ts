import { Request, Response, NextFunction } from 'express';
import { getAllCacheStats, getCacheHealth } from '../lib/cacheInstances';
// 简单的日志记录器
const logger = {
  info: (message: string, data?: any) => console.log(`[INFO] ${message}`, data || ''),
  warn: (message: string, data?: any) => console.warn(`[WARN] ${message}`, data || ''),
  error: (message: string, data?: any) => console.error(`[ERROR] ${message}`, data || '')
};

/**
 * 缓存监控中间件配置
 */
interface CacheMonitorConfig {
  /** 是否启用监控 */
  enabled: boolean;
  /** 监控间隔（毫秒） */
  interval: number;
  /** 是否记录详细日志 */
  verbose: boolean;
  /** 性能阈值配置 */
  thresholds: {
    /** 命中率低于此值时告警 */
    hitRateWarning: number;
    /** 内存使用率高于此值时告警 */
    memoryUsageWarning: number;
    /** 响应时间高于此值时告警（毫秒） */
    responseTimeWarning: number;
  };
}

/**
 * 默认监控配置
 */
const DEFAULT_CONFIG: CacheMonitorConfig = {
  enabled: process.env.NODE_ENV !== 'test',
  interval: 60000, // 1分钟
  verbose: process.env.NODE_ENV === 'development',
  thresholds: {
    hitRateWarning: 0.7, // 命中率低于70%告警
    memoryUsageWarning: 0.8, // 内存使用率高于80%告警
    responseTimeWarning: 1000, // 响应时间高于1秒告警
  },
};

/**
 * 缓存监控服务
 */
class CacheMonitorService {
  private config: CacheMonitorConfig;
  private monitorTimer?: NodeJS.Timeout;
  private requestMetrics: Map<string, { count: number; totalTime: number; errors: number }> = new Map();

  constructor(config: Partial<CacheMonitorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 启动监控
   */
  start(): void {
    if (!this.config.enabled) {
      return;
    }

    this.monitorTimer = setInterval(() => {
      this.collectMetrics();
    }, this.config.interval);

    logger.info('Cache monitor started', {
      interval: this.config.interval,
      thresholds: this.config.thresholds,
    });
  }

  /**
   * 停止监控
   */
  stop(): void {
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
      this.monitorTimer = undefined;
      logger.info('Cache monitor stopped');
    }
  }

  /**
   * 收集缓存指标
   */
  private async collectMetrics(): Promise<void> {
    try {
      const stats = getAllCacheStats();
      const health = getCacheHealth();

      // 检查性能阈值
      this.checkThresholds(stats);

      if (this.config.verbose) {
        logger.info('Cache metrics collected', {
          stats,
          health,
          requestMetrics: Object.fromEntries(this.requestMetrics),
        });
      }

      // 重置请求指标
      this.requestMetrics.clear();
    } catch (error) {
      logger.error('Failed to collect cache metrics', { error });
    }
  }

  /**
   * 检查性能阈值
   */
  private checkThresholds(stats: any): void {
    Object.entries(stats).forEach(([cacheName, cacheStats]: [string, any]) => {
      // 检查命中率
      if (cacheStats.hitRate < this.config.thresholds.hitRateWarning) {
        logger.warn('Low cache hit rate detected', {
          cache: cacheName,
          hitRate: cacheStats.hitRate,
          threshold: this.config.thresholds.hitRateWarning,
        });
      }

      // 检查内存使用率
      const memoryUsage = cacheStats.size / cacheStats.maxSize;
      if (memoryUsage > this.config.thresholds.memoryUsageWarning) {
        logger.warn('High cache memory usage detected', {
          cache: cacheName,
          usage: memoryUsage,
          threshold: this.config.thresholds.memoryUsageWarning,
        });
      }
    });
  }

  /**
   * 记录请求指标
   */
  recordRequest(path: string, duration: number, isError: boolean = false): void {
    if (!this.config.enabled) {
      return;
    }

    const metrics = this.requestMetrics.get(path) || { count: 0, totalTime: 0, errors: 0 };
    metrics.count++;
    metrics.totalTime += duration;
    if (isError) {
      metrics.errors++;
    }
    this.requestMetrics.set(path, metrics);

    // 检查响应时间阈值
    if (duration > this.config.thresholds.responseTimeWarning) {
      logger.warn('Slow request detected', {
        path,
        duration,
        threshold: this.config.thresholds.responseTimeWarning,
      });
    }
  }

  /**
   * 获取当前指标
   */
  getMetrics() {
    return {
      cacheStats: getAllCacheStats(),
      cacheHealth: getCacheHealth(),
      requestMetrics: Object.fromEntries(this.requestMetrics),
    };
  }
}

// 全局监控服务实例
const cacheMonitor = new CacheMonitorService();

/**
 * 创建缓存监控中间件
 */
export function createCacheMonitorMiddleware(config?: Partial<CacheMonitorConfig>) {
  const monitor = config ? new CacheMonitorService(config) : cacheMonitor;

  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const originalSend = res.send;

    // 重写 res.send 以记录响应时间
    res.send = function (body: any) {
      const duration = Date.now() - startTime;
      const isError = res.statusCode >= 400;
      
      monitor.recordRequest(req.path, duration, isError);
      
      return originalSend.call(this, body);
    };

    next();
  };
}

/**
 * 缓存统计信息中间件
 */
export function cacheStatsMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.path === '/api/cache/stats' && req.method === 'GET') {
    try {
      const metrics = cacheMonitor.getMetrics();
      res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to get cache stats', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to get cache statistics',
      });
    }
    return;
  }
  next();
}

/**
 * 缓存健康检查中间件
 */
export function cacheHealthMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.path === '/api/cache/health' && req.method === 'GET') {
    try {
      const health = getCacheHealth();
      const isHealthy = Object.values(health).every(status => status === 'healthy');
      
      res.status(isHealthy ? 200 : 503).json({
        success: true,
        healthy: isHealthy,
        data: health,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to check cache health', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to check cache health',
      });
    }
    return;
  }
  next();
}

/**
 * 启动缓存监控
 */
export function startCacheMonitoring(config?: Partial<CacheMonitorConfig>): void {
  if (config) {
    const customMonitor = new CacheMonitorService(config);
    customMonitor.start();
  } else {
    cacheMonitor.start();
  }
}

/**
 * 停止缓存监控
 */
export function stopCacheMonitoring(): void {
  cacheMonitor.stop();
}

/**
 * 获取监控指标
 */
export function getCacheMetrics() {
  return cacheMonitor.getMetrics();
}

// 导出监控服务实例
export { cacheMonitor };

// 进程退出时清理
process.on('SIGTERM', () => {
  stopCacheMonitoring();
});

process.on('SIGINT', () => {
  stopCacheMonitoring();
});