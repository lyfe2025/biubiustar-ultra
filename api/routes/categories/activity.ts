import { Router } from 'express';
import { supabaseAdmin } from '../../lib/supabase';
import { sendSuccess, sendError } from '../../utils/response';

const router = Router();

/**
 * @route GET /api/categories/activity
 * @desc 获取所有活跃的活动分类（公开接口）
 * @access Public
 * @query lang - 语言代码 (zh, zh-tw, en, vi)，默认为 zh
 */
router.get('/', async (req, res) => {
  try {
    const lang = req.query.lang as string || 'zh';
    
    // 获取所有分类数据（包括多语言字段）
    const { data: categories, error } = await supabaseAdmin
      .from('activity_categories')
      .select(`
        id, 
        name, description, 
        name_zh, name_zh_tw, name_en, name_vi,
        description_zh, description_zh_tw, description_en, description_vi,
        color, icon
      `)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching activity categories:', error);
      return sendError(res, '获取活动分类失败', 500);
    }

    // 返回完整的分类数据（包含所有多语言字段），让前端根据当前语言动态选择显示的分类名称
    const processedCategories = (categories || []).map(category => {
      return {
        id: category.id,
        name: category.name,
        description: category.description,
        name_zh: category.name_zh,
        name_zh_tw: category.name_zh_tw,
        name_en: category.name_en,
        name_vi: category.name_vi,
        description_zh: category.description_zh,
        description_zh_tw: category.description_zh_tw,
        description_en: category.description_en,
        description_vi: category.description_vi,
        color: category.color,
        icon: category.icon
      };
    });

    return sendSuccess(res, {
      categories: processedCategories,
      total: processedCategories.length
    });
  } catch (error) {
    console.error('Error in GET /api/categories/activity:', error);
    return sendError(res, '服务器内部错误', 500);
  }
});

export default router;