import { configCache, CacheInstanceType } from '../lib/cacheInstances.js';
import { CacheKeyGenerator } from '../config/cache.js';
import { defaultInvalidationService, InvalidationResult } from './cacheInvalidation.js';

export enum SettingsCacheInvalidationType {
  UPDATE = 'UPDATE',
  BULK_UPDATE = 'BULK_UPDATE',
  IMPORT = 'IMPORT',
  RESET = 'RESET',
}

interface SettingsCacheInvalidationOptions {
  type: SettingsCacheInvalidationType;
  categories?: string[]; // 受影响的分类
  affectedKeys?: string[]; // 受影响的设置键
  invalidatePublic?: boolean; // 是否失效公开设置缓存
  invalidatePrivate?: boolean; // 是否失效私有设置缓存
}

class SettingsCacheInvalidationService {
  /**
   * 处理设置更新时的缓存失效
   */
  private async handleSettingsUpdate(options: SettingsCacheInvalidationOptions): Promise<InvalidationResult[]> {
    const results: InvalidationResult[] = [];
    
    // 1. 失效全局系统设置缓存（所有设置）
    if (options.invalidatePrivate !== false) {
      const allSettingsKey = CacheKeyGenerator.systemSettings();
      const allSettingsResult = await defaultInvalidationService.invalidateByKey(allSettingsKey, CacheInstanceType.CONFIG);
      results.push(...allSettingsResult);
      
      // 失效按分类的系统设置缓存
      if (options.categories) {
        for (const category of options.categories) {
          const categoryKey = CacheKeyGenerator.systemSettings(category);
          const categoryResult = await defaultInvalidationService.invalidateByKey(categoryKey, CacheInstanceType.CONFIG);
          results.push(...categoryResult);
        }
      }
    }

    // 2. 失效公开设置缓存
    if (options.invalidatePublic !== false) {
      const allPublicKey = CacheKeyGenerator.publicSettings();
      const allPublicResult = await defaultInvalidationService.invalidateByKey(allPublicKey, CacheInstanceType.CONFIG);
      results.push(...allPublicResult);
      
      // 失效按分类的公开设置缓存
      if (options.categories) {
        for (const category of options.categories) {
          const publicCategoryKey = CacheKeyGenerator.publicSettings(category);
          const publicCategoryResult = await defaultInvalidationService.invalidateByKey(publicCategoryKey, CacheInstanceType.CONFIG);
          results.push(...publicCategoryResult);
        }
      }
    }

    return results;
  }

  /**
   * 处理批量设置更新时的缓存失效
   */
  private async handleBulkSettingsUpdate(options: SettingsCacheInvalidationOptions): Promise<InvalidationResult[]> {
    const results: InvalidationResult[] = [];
    
    // 批量更新通常会影响多个分类，直接失效所有设置缓存
    const allInvalidationResult = await defaultInvalidationService.invalidateByPattern(
      'system:settings:*',
      [CacheInstanceType.CONFIG]
    );
    results.push(...allInvalidationResult);

    const allPublicInvalidationResult = await defaultInvalidationService.invalidateByPattern(
      'public:settings:*',
      [CacheInstanceType.CONFIG]
    );
    results.push(...allPublicInvalidationResult);

    return results;
  }

  /**
   * 处理设置导入时的缓存失效
   */
  private async handleSettingsImport(options: SettingsCacheInvalidationOptions): Promise<InvalidationResult[]> {
    // 导入设置会完全替换现有设置，需要清除所有设置相关缓存
    const results: InvalidationResult[] = [];
    
    const allConfigInvalidationResult = await defaultInvalidationService.invalidateByPattern(
      '*',
      [CacheInstanceType.CONFIG]
    );
    results.push(...allConfigInvalidationResult);

    return results;
  }

  /**
   * 处理设置重置时的缓存失效
   */
  private async handleSettingsReset(options: SettingsCacheInvalidationOptions): Promise<InvalidationResult[]> {
    // 重置设置会恢复到默认值，需要清除所有设置相关缓存
    return await this.handleSettingsImport(options);
  }

  /**
   * 主要的缓存失效方法
   */
  public async invalidate(options: SettingsCacheInvalidationOptions): Promise<InvalidationResult[]> {
    console.log('开始系统设置缓存失效:', options);
    
    let results: InvalidationResult[] = [];

    try {
      switch (options.type) {
        case SettingsCacheInvalidationType.UPDATE:
          results = await this.handleSettingsUpdate(options);
          break;
        case SettingsCacheInvalidationType.BULK_UPDATE:
          results = await this.handleBulkSettingsUpdate(options);
          break;
        case SettingsCacheInvalidationType.IMPORT:
          results = await this.handleSettingsImport(options);
          break;
        case SettingsCacheInvalidationType.RESET:
          results = await this.handleSettingsReset(options);
          break;
        default:
          console.warn('未知的设置缓存失效类型:', options.type);
      }

      console.log('系统设置缓存失效完成:', {
        type: options.type,
        invalidatedKeys: results.length,
        success: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      });

      return results;
    } catch (error) {
      console.error('系统设置缓存失效过程中发生错误:', error);
      throw error;
    }
  }
}

export const settingsCacheInvalidationService = new SettingsCacheInvalidationService();

/**
 * 便捷函数：设置更新时的缓存失效
 */
export async function invalidateOnSettingsUpdate(categories?: string[]): Promise<InvalidationResult[]> {
  return await settingsCacheInvalidationService.invalidate({
    type: SettingsCacheInvalidationType.UPDATE,
    categories,
    invalidatePublic: true,
    invalidatePrivate: true
  });
}

/**
 * 便捷函数：批量设置更新时的缓存失效
 */
export async function invalidateOnBulkSettingsUpdate(): Promise<InvalidationResult[]> {
  return await settingsCacheInvalidationService.invalidate({
    type: SettingsCacheInvalidationType.BULK_UPDATE,
    invalidatePublic: true,
    invalidatePrivate: true
  });
}

/**
 * 便捷函数：设置导入时的缓存失效
 */
export async function invalidateOnSettingsImport(): Promise<InvalidationResult[]> {
  return await settingsCacheInvalidationService.invalidate({
    type: SettingsCacheInvalidationType.IMPORT
  });
}

/**
 * 便捷函数：设置重置时的缓存失效
 */
export async function invalidateOnSettingsReset(): Promise<InvalidationResult[]> {
  return await settingsCacheInvalidationService.invalidate({
    type: SettingsCacheInvalidationType.RESET
  });
}

/**
 * 便捷函数：特定分类设置更新时的缓存失效
 */
export async function invalidateOnCategorySettingsUpdate(category: string): Promise<InvalidationResult[]> {
  return await settingsCacheInvalidationService.invalidate({
    type: SettingsCacheInvalidationType.UPDATE,
    categories: [category],
    invalidatePublic: true,
    invalidatePrivate: true
  });
}
