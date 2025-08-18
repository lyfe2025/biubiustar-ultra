import { Router } from 'express';
import { supabaseAdmin } from '../../lib/supabase';
import { sendSuccess, sendError } from '../../utils/response';

const router = Router();

/**
 * @route GET /api/categories/activity
 * @desc 获取所有活跃的活动分类（公开接口）
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('activity_categories')
      .select('id, name, description, color, icon')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching activity categories:', error);
      return sendError(res, '获取活动分类失败', 500);
    }

    return sendSuccess(res, {
      categories: categories || [],
      total: categories?.length || 0
    });
  } catch (error) {
    console.error('Error in GET /api/categories/activity:', error);
    return sendError(res, '服务器内部错误', 500);
  }
});

export default router;