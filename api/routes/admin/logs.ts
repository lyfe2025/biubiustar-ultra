import { Router, Request, Response } from 'express';
import { requireAdmin } from './auth';
import { supabaseAdmin } from '../../lib/supabase';
import asyncHandler from '../../middleware/asyncHandler.js';

const router = Router();



// 获取活动日志列表
router.get('/', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      type = ''
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // 构建查询条件
    let query = supabaseAdmin
      .from('activity_logs')
      .select(`
        id,
        type,
        action,
        details,
        user_id,
        user_email,
        ip_address,
        created_at
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // 添加搜索条件
    if (search) {
      query = query.or(`action.ilike.%${search}%,details.ilike.%${search}%,user_email.ilike.%${search}%`);
    }

    // 添加类型筛选
    if (type) {
      query = query.eq('type', type);
    }

    // 添加分页
    query = query.range(offset, offset + limitNum - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('获取活动日志失败:', error);
      return res.status(500).json({ error: 'FETCH_LOGS_FAILED' });
    }

    // 计算分页信息
    const totalPages = Math.ceil((count || 0) / limitNum);
    // const hasNextPage = pageNum < totalPages;
    // const hasPrevPage = pageNum > 1;

    res.json({
      data: data || [],
      pagination: {
        page: pageNum,
        totalPages,
        total: count || 0,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('获取活动日志异常:', error);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
  }
}));

// 获取活动日志统计
router.get('/stats', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { range = '24h' } = req.query;
    
    let timeFilter = '';
    const now = new Date();
    
    switch (range) {
      case '1h':
        timeFilter = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
        break;
      case '24h':
        timeFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        break;
      case '7d':
        timeFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case '30d':
        timeFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      default:
        timeFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    }

    // 获取统计数据
    const [totalResult, recentResult, typeStatsResult] = await Promise.all([
      // 总数
      supabaseAdmin
        .from('activity_logs')
        .select('*', { count: 'exact', head: true }),
      // 指定时间范围内的数量
      supabaseAdmin
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', timeFilter),
      // 按类型分组统计
      supabaseAdmin
        .from('activity_logs')
        .select('type')
        .gte('created_at', timeFilter)
    ]);

    if (totalResult.error || recentResult.error || typeStatsResult.error) {
      console.error('获取活动日志统计失败:', totalResult.error || recentResult.error || typeStatsResult.error);
      return res.status(500).json({ error: 'FETCH_STATS_FAILED' });
    }

    // 统计各类型数量
    const typeStats: Record<string, number> = {};
    typeStatsResult.data?.forEach((log: any) => {
      typeStats[log.type] = (typeStats[log.type] || 0) + 1;
    });

    res.json({
      total: totalResult.count || 0,
      recent: recentResult.count || 0,
      timeRange: range,
      typeStats
    });
  } catch (error) {
    console.error('获取活动日志统计异常:', error);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
  }
}));

// 清除活动日志
router.post('/clear', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { olderThanDays = 30 } = req.body;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const { error, count } = await supabaseAdmin
      .from('activity_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      console.error('清除活动日志失败:', error);
      return res.status(500).json({ error: 'CLEAR_LOGS_FAILED' });
    }

    res.json({
      success: true,
      deletedCount: count || 0
    });
  } catch (error) {
    console.error('清除活动日志异常:', error);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
  }
}));

// 导出活动日志
router.get('/export', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  try {
    const {
      format = 'csv',
      search = '',
      type = '',
      startDate,
      endDate
    } = req.query;

    // 构建查询条件
    let query = supabaseAdmin
      .from('activity_logs')
      .select(`
        id,
        type,
        action,
        details,
        user_id,
        user_email,
        ip_address,
        created_at
      `)
      .order('created_at', { ascending: false });

    // 添加搜索条件
    if (search) {
      query = query.or(`action.ilike.%${search}%,details.ilike.%${search}%,user_email.ilike.%${search}%`);
    }

    // 添加类型筛选
    if (type) {
      query = query.eq('type', type);
    }

    // 添加日期范围筛选
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('导出活动日志失败:', error);
      return res.status(500).json({ error: 'EXPORT_LOGS_FAILED' });
    }

    const logs = data || [];

    if (format === 'csv') {
      // 生成CSV格式
      const csvHeader = 'ID,类型,操作,详情,用户ID,用户邮箱,IP地址,创建时间\n';
      const csvContent = logs.map(log => {
        const details = typeof log.details === 'object' ? JSON.stringify(log.details) : log.details;
        return `"${log.id}","${log.type}","${log.action}","${details}","${log.user_id || ''}","${log.user_email || ''}","${log.ip_address}","${log.created_at}"`;
      }).join('\n');
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="activity-logs-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send('\uFEFF' + csvHeader + csvContent); // 添加BOM以支持中文
    } else if (format === 'json') {
      // 生成JSON格式
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="activity-logs-${new Date().toISOString().split('T')[0]}.json"`);
      res.json({
        exportTime: new Date().toISOString(),
        totalRecords: logs.length,
        data: logs
      });
    } else {
      return res.status(400).json({ error: 'UNSUPPORTED_FORMAT' });
    }
  } catch (error) {
    console.error('导出活动日志异常:', error);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
  }
}));

export default router;