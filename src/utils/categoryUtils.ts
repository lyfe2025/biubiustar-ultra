import { ActivityCategory } from '../lib/activityService';
import { Language } from '../contexts/language/types';

/**
 * 根据当前语言获取分类的本地化名称
 * @param category 分类对象
 * @param language 当前语言
 * @returns 本地化的分类名称
 */
export function getCategoryName(category: ActivityCategory, language: Language): string {
  // 根据语言选择对应的字段
  switch (language) {
    case 'zh':
      return category.name_zh || category.name || '';
    case 'en':
      return category.name_en || category.name || '';
    case 'zh-tw':
      return category.name_zh_tw || category.name || '';
    case 'vi':
      return category.name_vi || category.name || '';
    default:
      return category.name || '';
  }
}

/**
 * 根据当前语言获取分类的本地化描述
 * @param category 分类对象
 * @param language 当前语言
 * @returns 本地化的分类描述
 */
export function getCategoryDescription(category: ActivityCategory, language: Language): string {
  // 根据语言选择对应的字段
  switch (language) {
    case 'zh':
      return category.description_zh || category.description || '';
    case 'en':
      return category.description_en || category.description || '';
    case 'zh-tw':
      return category.description_zh_tw || category.description || '';
    case 'vi':
      return category.description_vi || category.description || '';
    default:
      return category.description || '';
  }
}