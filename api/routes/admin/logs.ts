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

export default router;