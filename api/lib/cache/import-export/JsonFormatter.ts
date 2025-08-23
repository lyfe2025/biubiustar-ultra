import { CacheConfigs } from '../../../config/cache';
import { IFormatter, ImportExportOptions } from './types';

/**
 * JSON格式化器
 * 负责JSON格式的导入导出功能
 */
export class JsonFormatter implements IFormatter {
  /**
   * 导出配置为JSON格式
   */
  export(config: CacheConfigs, options: ImportExportOptions): string {
    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        format: 'json'
      },
      config
    };

    if (options.minify) {
      return JSON.stringify(exportData);
    } else {
      return JSON.stringify(exportData, null, 2);
    }
  }

  /**
   * 从JSON格式导入配置
   */
  import(content: string, currentConfig?: CacheConfigs): CacheConfigs {
    const data = JSON.parse(content);
    
    if (data.config) {
      return data.config;
    } else if (this.isValidCacheConfig(data)) {
      return data;
    } else {
      throw new Error('Invalid JSON format: missing config property');
    }
  }

  /**
   * 验证JSON内容
   */
  validate(content: string): boolean {
    try {
      const data = JSON.parse(content);
      return data.config ? this.isValidCacheConfig(data.config) : this.isValidCacheConfig(data);
    } catch {
      return false;
    }
  }

  /**
   * 获取文件扩展名
   */
  getFileExtension(): string {
    return '.json';
  }

  /**
   * 检查是否为有效的缓存配置
   */
  private isValidCacheConfig(obj: any): obj is CacheConfigs {
    return obj && typeof obj === 'object' && (
      obj.user || obj.content || obj.stats || obj.config || obj.session || obj.api
    );
  }
}

// 导出默认实例
export const jsonFormatter = new JsonFormatter();