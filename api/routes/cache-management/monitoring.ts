import { Router, Request, Response } from 'express';
import { cacheAnalytics } from '../../lib/cache/analytics';
import { cacheMonitor } from '../../lib/cache/monitoring';
import { CacheInstanceType } from '../../config/cache';
import { TimeRange, MetricType } from '../../lib/cache/analytics/types';
import { handleError, validateInstanceType } from './middleware';

const router = Router();

// ==================== 监控和统计 API ====================

/**
 * 获取性能报告
 */
router.get('/monitoring/performance', async (req: Request, res: Response) => {
  try {
    const { instanceType, timeRange } = req.query;
    
    const report = await cacheMonitor.generatePerformanceReport();
    
    res.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 获取统计摘要
 */
router.get('/analytics/summary/:instanceType', validateInstanceType, async (req: Request, res: Response) => {
  try {
    const { instanceType } = req.params;
    const { timeRange = TimeRange.LAST_DAY } = req.query;
    
    const summary = cacheAnalytics.getStatisticsSummary(
      instanceType as CacheInstanceType,
      timeRange as TimeRange
    );
    
    res.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 获取时间序列数据
 */
router.get('/analytics/timeseries/:instanceType/:metric', validateInstanceType, async (req: Request, res: Response) => {
  try {
    const { instanceType, metric } = req.params;
    const { timeRange = TimeRange.LAST_DAY } = req.query;
    
    if (!Object.values(MetricType).includes(metric as MetricType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid metric type',
        message: `Metric must be one of: ${Object.values(MetricType).join(', ')}`
      });
    }
    
    const timeSeries = cacheAnalytics.getTimeSeries(
      metric as MetricType,
      instanceType as CacheInstanceType,
      timeRange as TimeRange
    );
    
    if (!timeSeries) {
      return res.status(404).json({
        success: false,
        error: 'Time series not found',
        message: `No time series data found for ${metric} on ${instanceType}`
      });
    }
    
    res.json({
      success: true,
      data: timeSeries,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 获取性能趋势
 */
router.get('/analytics/trends/:instanceType/:metric', validateInstanceType, async (req: Request, res: Response) => {
  try {
    const { instanceType, metric } = req.params;
    const { timeRange = TimeRange.LAST_DAY } = req.query;
    
    if (!Object.values(MetricType).includes(metric as MetricType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid metric type',
        message: `Metric must be one of: ${Object.values(MetricType).join(', ')}`
      });
    }
    
    const trend = cacheAnalytics.getPerformanceTrend(
      instanceType as CacheInstanceType,
      metric as MetricType,
      timeRange as TimeRange
    );
    
    res.json({
      success: true,
      data: trend,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 获取异常检测结果
 */
router.get('/analytics/anomalies', async (req: Request, res: Response) => {
  try {
    const { instanceType, timeRange = TimeRange.LAST_DAY } = req.query;
    
    const anomalies = cacheAnalytics.getAnomalies(
      instanceType as CacheInstanceType,
      timeRange as TimeRange
    );
    
    res.json({
      success: true,
      data: anomalies,
      count: anomalies.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 开始/停止分析数据收集
 */
router.post('/analytics/collection/:action', async (req: Request, res: Response) => {
  try {
    const { action } = req.params;
    const { intervalMs = 60000 } = req.body;
    
    if (action === 'start') {
      cacheAnalytics.startCollection(intervalMs);
      res.json({
        success: true,
        message: 'Analytics collection started',
        intervalMs,
        timestamp: new Date().toISOString()
      });
    } else if (action === 'stop') {
      cacheAnalytics.stopCollection();
      res.json({
        success: true,
        message: 'Analytics collection stopped',
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid action',
        message: 'Action must be "start" or "stop"'
      });
    }
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 获取分析统计信息
 */
router.get('/analytics/statistics', async (req: Request, res: Response) => {
  try {
    const statistics = cacheAnalytics.getAnalyticsStatistics();
    
    res.json({
      success: true,
      data: statistics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
