import { readFile } from 'fs/promises';
import { IConfigLoader, HotReloadOptions } from './types';
import { CacheConfig } from '../types';

/**
 * 配置加载器类
 * 负责从文件加载配置
 */
export class ConfigLoader implements IConfigLoader {
  constructor(private options: HotReloadOptions) {}

  /**
   * 从文件加载配置
   */
  public async loadConfigFromFile(filePath: string): Promise<Record<string, CacheConfig>> {
    try {
      const content = await readFile(filePath, 'utf-8');
      
      if (filePath.endsWith('.json')) {
        return this.parseJsonConfig(content);
      } else if (filePath.endsWith('.js') || filePath.endsWith('.ts')) {
        return this.parseJsConfig(filePath);
      } else if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
        return this.parseYamlConfig(content);
      }
      
      throw new Error(`Unsupported config file format: ${filePath}`);
    } catch (error) {
      console.error(`Failed to load config from ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * 判断是否应该监听该文件
   */
  public shouldWatchFile(fileName: string): boolean {
    // 检查文件扩展名
    const hasValidExtension = this.options.watchExtensions.some(ext => 
      fileName.toLowerCase().endsWith(ext.toLowerCase())
    );
    
    if (!hasValidExtension) {
      return false;
    }

    // 检查忽略模式
    const shouldIgnore = this.options.ignorePatterns.some(pattern => {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(fileName);
    });

    return !shouldIgnore;
  }

  /**
   * 解析JSON配置
   */
  private parseJsonConfig(content: string): Record<string, CacheConfig> {
    try {
      const parsed = JSON.parse(content);
      return this.validateConfigStructure(parsed);
    } catch (error) {
      throw new Error(`Invalid JSON format: ${error}`);
    }
  }

  /**
   * 解析JavaScript/TypeScript配置
   */
  private parseJsConfig(filePath: string): Record<string, CacheConfig> {
    try {
      // 对于 JS/TS 文件，需要动态导入
      // 注意：这在生产环境中可能有安全风险
      delete require.cache[require.resolve(filePath)];
      const module = require(filePath);
      const config = module.default || module;
      return this.validateConfigStructure(config);
    } catch (error) {
      throw new Error(`Failed to load JS/TS config: ${error}`);
    }
  }

  /**
   * 解析YAML配置
   */
  private parseYamlConfig(content: string): Record<string, CacheConfig> {
    try {
      // 简单的YAML解析，实际项目中可能需要使用yaml库
      // 这里提供基本实现
      const lines = content.split('\n');
      const config: Record<string, any> = {};
      let currentKey = '';
      let currentObject: any = {};
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        
        if (trimmed.endsWith(':')) {
          if (currentKey && Object.keys(currentObject).length > 0) {
            config[currentKey] = currentObject;
          }
          currentKey = trimmed.slice(0, -1);
          currentObject = {};
        } else if (trimmed.includes(':')) {
          const [key, value] = trimmed.split(':').map(s => s.trim());
          currentObject[key] = this.parseYamlValue(value);
        }
      }
      
      if (currentKey && Object.keys(currentObject).length > 0) {
        config[currentKey] = currentObject;
      }
      
      return this.validateConfigStructure(config);
    } catch (error) {
      throw new Error(`Invalid YAML format: ${error}`);
    }
  }

  /**
   * 解析YAML值
   */
  private parseYamlValue(value: string): any {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (/^\d+$/.test(value)) return parseInt(value, 10);
    if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1);
    }
    if (value.startsWith("'") && value.endsWith("'")) {
      return value.slice(1, -1);
    }
    return value;
  }

  /**
   * 验证配置结构
   */
  private validateConfigStructure(config: any): Record<string, CacheConfig> {
    if (!config || typeof config !== 'object') {
      throw new Error('Config must be an object');
    }

    const validatedConfig: Record<string, CacheConfig> = {};
    
    for (const [key, value] of Object.entries(config)) {
      if (!this.isValidCacheConfig(value)) {
        console.warn(`Invalid cache config for ${key}, skipping`);
        continue;
      }
      validatedConfig[key] = value as CacheConfig;
    }

    return validatedConfig;
  }

  /**
   * 验证是否为有效的缓存配置
   */
  private isValidCacheConfig(config: any): boolean {
    if (!config || typeof config !== 'object') {
      return false;
    }

    // 基本的缓存配置验证
    const requiredFields = ['enabled'];
    const optionalFields = [
      'maxSize', 'ttl', 'maxAge', 'checkPeriod', 'deleteOnExpire',
      'useClones', 'errorOnMissing', 'stdTTL', 'forceString'
    ];

    // 检查是否至少有enabled字段
    if (!requiredFields.every(field => field in config)) {
      return false;
    }

    // 检查所有字段都是预期的
    const allValidFields = [...requiredFields, ...optionalFields];
    const configKeys = Object.keys(config);
    
    return configKeys.every(key => allValidFields.includes(key));
  }

  /**
   * 获取支持的文件扩展名
   */
  public getSupportedExtensions(): string[] {
    return ['.json', '.js', '.ts', '.yaml', '.yml'];
  }

  /**
   * 更新选项
   */
  public updateOptions(newOptions: Partial<HotReloadOptions>): void {
    Object.assign(this.options, newOptions);
  }
}

// 导出配置加载器实例创建函数
export function createConfigLoader(options: HotReloadOptions): ConfigLoader {
  return new ConfigLoader(options);
}