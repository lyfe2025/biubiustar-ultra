/**
 * 分类数据缓存服务
 * 解决N+1查询问题：避免每个组件都重复获取分类数据
 */

import { socialService } from '../lib/socialService';
import { ActivityService } from '../lib/activityService';
import { defaultCache } from './cacheService';

export interface ContentCategory {
  id: string;
  name: string;
  name_zh: string;
  name_en: string;
  name_zh_tw: string;
  name_vi: string;
  description?: string;
  color?: string;
  icon?: string;
  is_active: boolean;
}

export interface ActivityCategory {
  id: string;
  name: string;
  name_zh?: string;
  name_en?: string;
  name_zh_tw?: string;
  name_vi?: string;
  description?: string;
  color?: string;
  icon?: string;
}

class CategoriesCacheService {
  private static instance: CategoriesCacheService;
  private readonly CONTENT_CATEGORIES_CACHE_KEY = 'content_categories';
  private readonly ACTIVITY_CATEGORIES_CACHE_KEY = 'activity_categories';
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30分钟缓存

  private constructor() {}

  static getInstance(): CategoriesCacheService {
    if (!CategoriesCacheService.instance) {
      CategoriesCacheService.instance = new CategoriesCacheService();
    }
    return CategoriesCacheService.instance;
  }

  /**
   * 获取内容分类数据（带缓存）
   */
  async getContentCategories(language: string = 'zh'): Promise<ContentCategory[]> {
    const cacheKey = `${this.CONTENT_CATEGORIES_CACHE_KEY}_${language}`;
    
    try {
      // 尝试从缓存获取
      const cached = defaultCache.get<ContentCategory[]>(cacheKey);
      if (cached) {
        console.log('📦 使用缓存的内容分类数据', { language, count: cached.length });
        return cached;
      }

      // 缓存未命中，从API获取
      console.log('🌐 从API获取内容分类数据', { language });
      const categories = await socialService.getContentCategories(language);
      
      // 存入缓存
      defaultCache.set(cacheKey, categories, { ttl: this.CACHE_TTL });
      
      console.log('✅ 内容分类数据已缓存', { language, count: categories.length });
      return categories;
    } catch (error) {
      console.error('❌ 获取内容分类失败:', error);
      // 返回空数组而不是抛出错误，避免影响页面渲染
      return [];
    }
  }

  /**
   * 获取活动分类数据（带缓存）
   */
  async getActivityCategories(language: string = 'zh'): Promise<ActivityCategory[]> {
    const cacheKey = `${this.ACTIVITY_CATEGORIES_CACHE_KEY}_${language}`;
    
    try {
      // 尝试从缓存获取
      const cached = defaultCache.get<ActivityCategory[]>(cacheKey);
      if (cached) {
        console.log('📦 使用缓存的活动分类数据', { language, count: cached.length });
        return cached;
      }

      // 缓存未命中，从API获取
      console.log('🌐 从API获取活动分类数据', { language });
      const categories = await ActivityService.getActivityCategories(language);
      
      // 存入缓存
      defaultCache.set(cacheKey, categories, { ttl: this.CACHE_TTL });
      
      console.log('✅ 活动分类数据已缓存', { language, count: categories.length });
      return categories;
    } catch (error) {
      console.error('❌ 获取活动分类失败:', error);
      // 返回空数组而不是抛出错误，避免影响页面渲染
      return [];
    }
  }

  /**
   * 预加载所有分类数据
   * 在应用启动时调用，提前缓存常用数据
   */
  async preloadCategories(languages: string[] = ['zh', 'en', 'zh-TW', 'vi']): Promise<void> {
    console.log('🚀 开始预加载分类数据', { languages });
    
    const promises: Promise<any>[] = [];
    
    // 预加载所有语言的内容分类
    languages.forEach(language => {
      promises.push(this.getContentCategories(language));
      promises.push(this.getActivityCategories(language));
    });
    
    try {
      await Promise.allSettled(promises);
      console.log('✅ 分类数据预加载完成');
    } catch (error) {
      console.warn('⚠️ 分类数据预加载部分失败:', error);
    }
  }

  /**
   * 清除分类缓存
   */
  clearCache(): void {
    const languages = ['zh', 'en', 'zh-TW', 'vi'];
    
    languages.forEach(language => {
      defaultCache.delete(`${this.CONTENT_CATEGORIES_CACHE_KEY}_${language}`);
      defaultCache.delete(`${this.ACTIVITY_CATEGORIES_CACHE_KEY}_${language}`);
    });
    
    console.log('🗑️ 分类缓存已清除');
  }

  /**
   * 根据当前语言获取分类名称
   */
  getCategoryName(category: ContentCategory | ActivityCategory, language: string): string {
    // 对于ContentCategory，多语言字段是必需的
    if ('name_zh' in category && typeof category.name_zh === 'string') {
      switch (language) {
        case 'zh':
          return category.name_zh;
        case 'zh-TW':
          return category.name_zh_tw;
        case 'en':
          return category.name_en;
        case 'vi':
          return category.name_vi;
        default:
          return category.name_zh;
      }
    }
    
    // 对于ActivityCategory，多语言字段是可选的，需要fallback
    switch (language) {
      case 'zh':
        return (category as any).name_zh || category.name;
      case 'zh-TW':
        return (category as any).name_zh_tw || (category as any).name_zh || category.name;
      case 'en':
        return (category as any).name_en || category.name;
      case 'vi':
        return (category as any).name_vi || category.name;
      default:
        return (category as any).name_zh || category.name;
    }
  }

  /**
   * 查找分类
   */
  findCategory(categories: (ContentCategory | ActivityCategory)[], categoryId: string): ContentCategory | ActivityCategory | undefined {
    return categories.find(cat => 
      String(cat.id) === String(categoryId) ||
      cat.name === categoryId ||
      cat.name_zh === categoryId ||
      cat.name_en === categoryId ||
      cat.name_zh_tw === categoryId ||
      cat.name_vi === categoryId
    );
  }
}

// 导出单例实例
export const categoriesCache = CategoriesCacheService.getInstance();

// 导出类型和工具函数
export { CategoriesCacheService };