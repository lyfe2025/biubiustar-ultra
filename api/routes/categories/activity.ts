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

    // 根据语言返回对应的名称和描述
    const processedCategories = (categories || []).map(category => {
      let localizedName = category.name;
      let localizedDescription = category.description;

      // 根据语言选择对应的字段
      switch (lang) {
        case 'zh':
          localizedName = category.name_zh || category.name;
          localizedDescription = category.description_zh || category.description;
          break;
        case 'zh-tw':
          localizedName = category.name_zh_tw || category.name;
          localizedDescription = category.description_zh_tw || category.description;
          break;
        case 'en':
          localizedName = category.name_en || category.name;
          localizedDescription = category.description_en || category.description;
          break;
        case 'vi':
          localizedName = category.name_vi || category.name;
          localizedDescription = category.description_vi || category.description;
          break;
        default:
          // 默认使用中文
          localizedName = category.name_zh || category.name;
          localizedDescription = category.description_zh || category.description;
      }

      return {
        id: category.id,
        name: localizedName,
        description: localizedDescription,
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