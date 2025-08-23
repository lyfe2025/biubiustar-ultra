import { CacheConfigs, CacheInstanceType } from './types';
import { ConfigLoadOptions, ConfigValidationResult } from './types';
import { EnvConfigManager } from '../env/EnvConfigManager';
import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * 配置加载器
 * 负责从各种来源加载缓存配置
 */
export class ConfigLoader {
  private envConfig: EnvConfigManager;
  private defaultConfigPath: string;
  private configCache: Map<string, { config: CacheConfigs; timestamp: Date }> = new Map();
  private cacheTimeout: number = 30000; // 30秒缓存

  constructor() {
    this.envConfig = EnvConfigManager.getInstance();
    this.defaultConfigPath = path.join(process.cwd(), 'config', 'cache.json');
  }

  /**
   * 加载配置
   */
  public async loadConfig(options: ConfigLoadOptions = {}): Promise<CacheConfigs> {
    const {
      validateOnLoad = true,
      applyEnvironmentOverrides = true,
      createBackup = false,
      source = 'file'
    } = options;

    let config: CacheConfigs;

    try {
      // 根据来源加载配置
      switch (source) {
        case 'file':
          config = await this.loadFromFile();
          break;
        case 'env':
          config = await this.loadFromEnvironment();
          break;
        case 'default':
          config = this.getDefaultConfig();
          break;
        default:
          throw new Error(`Unsupported config source: ${source}`);
      }

      // 应用环境变量覆盖
      if (applyEnvironmentOverrides && source !== 'env') {
        config = await this.applyEnvironmentOverrides(config);
      }

      // 验证配置
      if (validateOnLoad) {
        const validation = await this.validateConfig(config);
        if (!validation.isValid) {
          throw new Error(`Configuration validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
        }
      }

      // 创建备份
      if (createBackup) {
        await this.createConfigBackup(config);
      }

      return config;
    } catch (error) {
      console.error('Failed to load configuration:', error);
      // 返回默认配置作为后备
      return this.getDefaultConfig();
    }
  }

  /**
   * 从文件加载配置
   */
  private async loadFromFile(): Promise<CacheConfigs> {
    try {
      // 检查缓存
      const cached = this.configCache.get('file');
      if (cached && Date.now() - cached.timestamp.getTime() < this.cacheTimeout) {
        return cached.config;
      }

      const configContent = await fs.readFile(this.defaultConfigPath, 'utf8');
      const config = JSON.parse(configContent) as CacheConfigs;
      
      // 更新缓存
      this.configCache.set('file', { config, timestamp: new Date() });
      
      return config;
    } catch (error) {
      console.warn('Failed to load config from file, using default:', error);
      return this.getDefaultConfig();
    }
  }

  /**
   * 从环境变量加载配置
   */
  private async loadFromEnvironment(): Promise<CacheConfigs> {
    const defaultConfig = this.getDefaultConfig();
    return await this.applyEnvironmentOverrides(defaultConfig);
  }

  /**
   * 应用环境变量覆盖
   */
  private async applyEnvironmentOverrides(config: CacheConfigs): Promise<CacheConfigs> {
    try {
      const result = this.envConfig.applyEnvOverrides(config);
      if (result.success) {
        // 应用覆盖到配置对象
        const updatedConfig = { ...config };
        result.overrides.forEach(override => {
          const keys = override.configPath.split('.');
          let current: any = updatedConfig;
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
          }
          current[keys[keys.length - 1]] = override.newValue;
        });
        return updatedConfig;
      } else {
        console.warn('Failed to apply environment overrides:', result.errors);
        return config;
      }
    } catch (error) {
      console.warn('Error applying environment overrides:', error);
      return config;
    }
  }

  /**
   * 获取默认配置
   */
  public getDefaultConfig(): CacheConfigs {
    return {
      user: {
        maxSize: 1000,
        defaultTTL: 300000, // 5 minutes
        cleanupInterval: 60000, // 1 minute
        enabled: true
      },
      content: {
        maxSize: 5000,
        defaultTTL: 600000, // 10 minutes
        cleanupInterval: 120000, // 2 minutes
        enabled: true
      },
      stats: {
        maxSize: 2000,
        defaultTTL: 1800000, // 30 minutes
        cleanupInterval: 300000, // 5 minutes
        enabled: true
      },
      config: {
        maxSize: 500,
        defaultTTL: 3600000, // 1 hour
        cleanupInterval: 600000, // 10 minutes
        enabled: true
      },
      session: {
        maxSize: 1500,
        defaultTTL: 1800000, // 30 minutes
        cleanupInterval: 300000, // 5 minutes
        enabled: true
      },
      api: {
        maxSize: 3000,
        defaultTTL: 900000, // 15 minutes
        cleanupInterval: 180000, // 3 minutes
        enabled: true
      }
    };
  }

  /**
   * 验证配置
   */
  private async validateConfig(config: CacheConfigs): Promise<ConfigValidationResult> {
    const errors: Array<{ path: string; message: string; severity: 'error' | 'warning' }> = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 验证每个缓存实例配置
    for (const [instanceType, instanceConfig] of Object.entries(config)) {
      const basePath = instanceType;

      // 验证必需字段
      if (typeof instanceConfig.maxSize !== 'number' || instanceConfig.maxSize <= 0) {
        errors.push({
          path: `${basePath}.maxSize`,
          message: 'maxSize must be a positive number',
          severity: 'error'
        });
      }

      if (typeof instanceConfig.defaultTTL !== 'number' || instanceConfig.defaultTTL <= 0) {
        errors.push({
          path: `${basePath}.defaultTTL`,
          message: 'defaultTTL must be a positive number',
          severity: 'error'
        });
      }

      if (typeof instanceConfig.cleanupInterval !== 'number' || instanceConfig.cleanupInterval <= 0) {
        errors.push({
          path: `${basePath}.cleanupInterval`,
          message: 'cleanupInterval must be a positive number',
          severity: 'error'
        });
      }

      // 性能建议
      if (instanceConfig.maxSize > 10000) {
        warnings.push(`${basePath}: Large maxSize (${instanceConfig.maxSize}) may impact memory usage`);
      }

      if (instanceConfig.defaultTTL > 3600000) { // 1 hour
        suggestions.push(`${basePath}: Consider shorter TTL for better cache freshness`);
      }
    }

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * 创建配置备份
   */
  private async createConfigBackup(config: CacheConfigs): Promise<void> {
    try {
      const backupDir = path.join(process.cwd(), 'backups', 'config');
      await fs.mkdir(backupDir, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `cache-config-${timestamp}.json`);
      
      await fs.writeFile(backupPath, JSON.stringify(config, null, 2), 'utf8');
      console.log(`Configuration backup created: ${backupPath}`);
    } catch (error) {
      console.warn('Failed to create configuration backup:', error);
    }
  }

  /**
   * 保存配置到文件
   */
  public async saveConfig(config: CacheConfigs, filePath?: string): Promise<void> {
    const targetPath = filePath || this.defaultConfigPath;
    
    try {
      // 确保目录存在
      const dir = path.dirname(targetPath);
      await fs.mkdir(dir, { recursive: true });
      
      // 写入配置
      await fs.writeFile(targetPath, JSON.stringify(config, null, 2), 'utf8');
      
      // 清除缓存
      this.configCache.delete('file');
      
      console.log(`Configuration saved to: ${targetPath}`);
    } catch (error) {
      console.error('Failed to save configuration:', error);
      throw error;
    }
  }

  /**
   * 清除配置缓存
   */
  public clearCache(): void {
    this.configCache.clear();
  }

  /**
   * 获取配置文件路径
   */
  public getConfigPath(): string {
    return this.defaultConfigPath;
  }

  /**
   * 设置配置文件路径
   */
  public setConfigPath(path: string): void {
    this.defaultConfigPath = path;
    this.clearCache();
  }
}