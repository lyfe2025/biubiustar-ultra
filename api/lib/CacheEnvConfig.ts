import { CacheConfig, CacheConfigs, CacheInstanceType } from '../config/cache';

/**
 * 环境变量映射配置
 */
export interface EnvVarMapping {
  envKey: string;
  configPath: string;
  type: 'number' | 'boolean' | 'string';
  defaultValue?: any;
  validator?: (value: any) => boolean;
  transformer?: (value: string) => any;
}

/**
 * 环境变量覆盖结果
 */
export interface EnvOverrideResult {
  success: boolean;
  overrides: Array<{
    envKey: string;
    configPath: string;
    originalValue: any;
    newValue: any;
    source: 'env' | 'default';
  }>;
  errors: Array<{
    envKey: string;
    error: string;
  }>;
  warnings: string[];
}

/**
 * 环境变量配置管理器
 * 支持通过环境变量覆盖缓存配置
 */
export class CacheEnvConfig {
  private static instance: CacheEnvConfig;
  private envMappings: Map<string, EnvVarMapping> = new Map();
  private overrideHistory: EnvOverrideResult[] = [];

  private constructor() {
    this.initializeDefaultMappings();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): CacheEnvConfig {
    if (!CacheEnvConfig.instance) {
      CacheEnvConfig.instance = new CacheEnvConfig();
    }
    return CacheEnvConfig.instance;
  }

  /**
   * 初始化默认环境变量映射
   */
  private initializeDefaultMappings(): void {
    // 通用缓存配置
    this.addMapping({
      envKey: 'CACHE_ENABLED',
      configPath: 'enabled',
      type: 'boolean',
      defaultValue: true,
      transformer: (value: string) => value.toLowerCase() === 'true'
    });

    // 用户缓存配置
    this.addMapping({
      envKey: 'CACHE_USER_MAX_SIZE',
      configPath: 'user.maxSize',
      type: 'number',
      defaultValue: 1000,
      validator: (value: number) => value > 0 && value <= 100000,
      transformer: (value: string) => parseInt(value, 10)
    });

    this.addMapping({
      envKey: 'CACHE_USER_TTL',
      configPath: 'user.defaultTTL',
      type: 'number',
      defaultValue: 300000, // 5 minutes
      validator: (value: number) => value > 0 && value <= 86400000, // max 24 hours
      transformer: (value: string) => parseInt(value, 10)
    });

    this.addMapping({
      envKey: 'CACHE_USER_CLEANUP_INTERVAL',
      configPath: 'user.cleanupInterval',
      type: 'number',
      defaultValue: 60000, // 1 minute
      validator: (value: number) => value >= 10000 && value <= 3600000, // 10s to 1h
      transformer: (value: string) => parseInt(value, 10)
    });

    this.addMapping({
      envKey: 'CACHE_USER_ENABLED',
      configPath: 'user.enabled',
      type: 'boolean',
      defaultValue: true,
      transformer: (value: string) => value.toLowerCase() === 'true'
    });

    // 内容缓存配置
    this.addMapping({
      envKey: 'CACHE_CONTENT_MAX_SIZE',
      configPath: 'content.maxSize',
      type: 'number',
      defaultValue: 5000,
      validator: (value: number) => value > 0 && value <= 100000,
      transformer: (value: string) => parseInt(value, 10)
    });

    this.addMapping({
      envKey: 'CACHE_CONTENT_TTL',
      configPath: 'content.defaultTTL',
      type: 'number',
      defaultValue: 600000, // 10 minutes
      validator: (value: number) => value > 0 && value <= 86400000,
      transformer: (value: string) => parseInt(value, 10)
    });

    this.addMapping({
      envKey: 'CACHE_CONTENT_CLEANUP_INTERVAL',
      configPath: 'content.cleanupInterval',
      type: 'number',
      defaultValue: 120000, // 2 minutes
      validator: (value: number) => value >= 10000 && value <= 3600000,
      transformer: (value: string) => parseInt(value, 10)
    });

    this.addMapping({
      envKey: 'CACHE_CONTENT_ENABLED',
      configPath: 'content.enabled',
      type: 'boolean',
      defaultValue: true,
      transformer: (value: string) => value.toLowerCase() === 'true'
    });

    // 统计缓存配置
    this.addMapping({
      envKey: 'CACHE_STATS_MAX_SIZE',
      configPath: 'stats.maxSize',
      type: 'number',
      defaultValue: 2000,
      validator: (value: number) => value > 0 && value <= 50000,
      transformer: (value: string) => parseInt(value, 10)
    });

    this.addMapping({
      envKey: 'CACHE_STATS_TTL',
      configPath: 'stats.defaultTTL',
      type: 'number',
      defaultValue: 1800000, // 30 minutes
      validator: (value: number) => value > 0 && value <= 86400000,
      transformer: (value: string) => parseInt(value, 10)
    });

    this.addMapping({
      envKey: 'CACHE_STATS_CLEANUP_INTERVAL',
      configPath: 'stats.cleanupInterval',
      type: 'number',
      defaultValue: 300000, // 5 minutes
      validator: (value: number) => value >= 10000 && value <= 3600000,
      transformer: (value: string) => parseInt(value, 10)
    });

    this.addMapping({
      envKey: 'CACHE_STATS_ENABLED',
      configPath: 'stats.enabled',
      type: 'boolean',
      defaultValue: true,
      transformer: (value: string) => value.toLowerCase() === 'true'
    });

    // 配置缓存配置
    this.addMapping({
      envKey: 'CACHE_CONFIG_MAX_SIZE',
      configPath: 'config.maxSize',
      type: 'number',
      defaultValue: 500,
      validator: (value: number) => value > 0 && value <= 10000,
      transformer: (value: string) => parseInt(value, 10)
    });

    this.addMapping({
      envKey: 'CACHE_CONFIG_TTL',
      configPath: 'config.defaultTTL',
      type: 'number',
      defaultValue: 3600000, // 1 hour
      validator: (value: number) => value > 0 && value <= 86400000,
      transformer: (value: string) => parseInt(value, 10)
    });

    this.addMapping({
      envKey: 'CACHE_CONFIG_CLEANUP_INTERVAL',
      configPath: 'config.cleanupInterval',
      type: 'number',
      defaultValue: 600000, // 10 minutes
      validator: (value: number) => value >= 10000 && value <= 3600000,
      transformer: (value: string) => parseInt(value, 10)
    });

    this.addMapping({
      envKey: 'CACHE_CONFIG_ENABLED',
      configPath: 'config.enabled',
      type: 'boolean',
      defaultValue: true,
      transformer: (value: string) => value.toLowerCase() === 'true'
    });

    // 会话缓存配置
    this.addMapping({
      envKey: 'CACHE_SESSION_MAX_SIZE',
      configPath: 'session.maxSize',
      type: 'number',
      defaultValue: 10000,
      validator: (value: number) => value > 0 && value <= 100000,
      transformer: (value: string) => parseInt(value, 10)
    });

    this.addMapping({
      envKey: 'CACHE_SESSION_TTL',
      configPath: 'session.defaultTTL',
      type: 'number',
      defaultValue: 1800000, // 30 minutes
      validator: (value: number) => value > 0 && value <= 86400000,
      transformer: (value: string) => parseInt(value, 10)
    });

    this.addMapping({
      envKey: 'CACHE_SESSION_CLEANUP_INTERVAL',
      configPath: 'session.cleanupInterval',
      type: 'number',
      defaultValue: 300000, // 5 minutes
      validator: (value: number) => value >= 10000 && value <= 3600000,
      transformer: (value: string) => parseInt(value, 10)
    });

    this.addMapping({
      envKey: 'CACHE_SESSION_ENABLED',
      configPath: 'session.enabled',
      type: 'boolean',
      defaultValue: true,
      transformer: (value: string) => value.toLowerCase() === 'true'
    });

    // API缓存配置
    this.addMapping({
      envKey: 'CACHE_API_MAX_SIZE',
      configPath: 'api.maxSize',
      type: 'number',
      defaultValue: 3000,
      validator: (value: number) => value > 0 && value <= 50000,
      transformer: (value: string) => parseInt(value, 10)
    });

    this.addMapping({
      envKey: 'CACHE_API_TTL',
      configPath: 'api.defaultTTL',
      type: 'number',
      defaultValue: 300000, // 5 minutes
      validator: (value: number) => value > 0 && value <= 86400000,
      transformer: (value: string) => parseInt(value, 10)
    });

    this.addMapping({
      envKey: 'CACHE_API_CLEANUP_INTERVAL',
      configPath: 'api.cleanupInterval',
      type: 'number',
      defaultValue: 120000, // 2 minutes
      validator: (value: number) => value >= 10000 && value <= 3600000,
      transformer: (value: string) => parseInt(value, 10)
    });

    this.addMapping({
      envKey: 'CACHE_API_ENABLED',
      configPath: 'api.enabled',
      type: 'boolean',
      defaultValue: true,
      transformer: (value: string) => value.toLowerCase() === 'true'
    });

    // 全局配置
    this.addMapping({
      envKey: 'CACHE_GLOBAL_MAX_MEMORY_MB',
      configPath: 'global.maxMemoryMB',
      type: 'number',
      defaultValue: 1024, // 1GB
      validator: (value: number) => value > 0 && value <= 8192, // max 8GB
      transformer: (value: string) => parseInt(value, 10)
    });

    this.addMapping({
      envKey: 'CACHE_GLOBAL_MONITORING_ENABLED',
      configPath: 'global.monitoringEnabled',
      type: 'boolean',
      defaultValue: true,
      transformer: (value: string) => value.toLowerCase() === 'true'
    });

    this.addMapping({
      envKey: 'CACHE_GLOBAL_MONITORING_INTERVAL',
      configPath: 'global.monitoringInterval',
      type: 'number',
      defaultValue: 30000, // 30 seconds
      validator: (value: number) => value >= 5000 && value <= 300000, // 5s to 5min
      transformer: (value: string) => parseInt(value, 10)
    });
  }

  /**
   * 添加环境变量映射
   */
  public addMapping(mapping: EnvVarMapping): void {
    this.envMappings.set(mapping.envKey, mapping);
  }

  /**
   * 移除环境变量映射
   */
  public removeMapping(envKey: string): void {
    this.envMappings.delete(envKey);
  }

  /**
   * 获取所有映射
   */
  public getMappings(): EnvVarMapping[] {
    return Array.from(this.envMappings.values());
  }

  /**
   * 应用环境变量覆盖
   */
  public applyEnvOverrides(configs: CacheConfigs): EnvOverrideResult {
    const result: EnvOverrideResult = {
      success: true,
      overrides: [],
      errors: [],
      warnings: []
    };

    for (const [envKey, mapping] of this.envMappings) {
      try {
        const envValue = process.env[envKey];
        let finalValue: any;
        let source: 'env' | 'default' = 'default';

        if (envValue !== undefined && envValue !== '') {
          // 环境变量存在，进行转换和验证
          if (mapping.transformer) {
            finalValue = mapping.transformer(envValue);
          } else {
            finalValue = this.defaultTransform(envValue, mapping.type);
          }

          // 验证值
          if (mapping.validator && !mapping.validator(finalValue)) {
            result.errors.push({
              envKey,
              error: `Invalid value: ${envValue}. Validation failed.`
            });
            result.success = false;
            continue;
          }

          source = 'env';
        } else if (mapping.defaultValue !== undefined) {
          // 使用默认值
          finalValue = mapping.defaultValue;
          source = 'default';
        } else {
          // 没有环境变量也没有默认值
          result.warnings.push(`No value found for ${envKey} and no default provided`);
          continue;
        }

        // 应用配置
        const originalValue = this.getConfigValue(configs, mapping.configPath);
        this.setConfigValue(configs, mapping.configPath, finalValue);

        result.overrides.push({
          envKey,
          configPath: mapping.configPath,
          originalValue,
          newValue: finalValue,
          source
        });

      } catch (error) {
        result.errors.push({
          envKey,
          error: `Failed to apply override: ${error}`
        });
        result.success = false;
      }
    }

    // 记录覆盖历史
    this.overrideHistory.push({
      ...result,
      overrides: [...result.overrides],
      errors: [...result.errors],
      warnings: [...result.warnings]
    });

    // 限制历史记录长度
    if (this.overrideHistory.length > 10) {
      this.overrideHistory.splice(0, this.overrideHistory.length - 10);
    }

    return result;
  }

  /**
   * 默认类型转换
   */
  private defaultTransform(value: string, type: EnvVarMapping['type']): any {
    switch (type) {
      case 'number':
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error(`Cannot convert "${value}" to number`);
        }
        return num;
      case 'boolean':
        const lower = value.toLowerCase();
        if (lower === 'true' || lower === '1' || lower === 'yes') {
          return true;
        } else if (lower === 'false' || lower === '0' || lower === 'no') {
          return false;
        } else {
          throw new Error(`Cannot convert "${value}" to boolean`);
        }
      case 'string':
        return value;
      default:
        return value;
    }
  }

  /**
   * 获取配置值
   */
  private getConfigValue(configs: any, path: string): any {
    const parts = path.split('.');
    let current = configs;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  /**
   * 设置配置值
   */
  private setConfigValue(configs: any, path: string, value: any): void {
    const parts = path.split('.');
    let current = configs;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part];
    }
    
    current[parts[parts.length - 1]] = value;
  }

  /**
   * 生成环境变量模板
   */
  public generateEnvTemplate(): string {
    const lines: string[] = [];
    
    lines.push('# Cache Configuration Environment Variables');
    lines.push('# Generated automatically - modify as needed');
    lines.push('');
    
    // 按类别分组
    const categories = new Map<string, EnvVarMapping[]>();
    
    for (const mapping of this.envMappings.values()) {
      const category = this.getCategoryFromConfigPath(mapping.configPath);
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(mapping);
    }
    
    for (const [category, mappings] of categories) {
      lines.push(`# ${category.toUpperCase()} Cache Configuration`);
      
      for (const mapping of mappings) {
        lines.push(`# ${mapping.configPath} (${mapping.type})`);
        if (mapping.defaultValue !== undefined) {
          lines.push(`# Default: ${mapping.defaultValue}`);
        }
        lines.push(`${mapping.envKey}=${mapping.defaultValue || ''}`);
        lines.push('');
      }
    }
    
    return lines.join('\n');
  }

  /**
   * 从配置路径获取类别
   */
  private getCategoryFromConfigPath(configPath: string): string {
    const parts = configPath.split('.');
    return parts[0] || 'general';
  }

  /**
   * 验证环境变量
   */
  public validateEnvironmentVariables(): {
    valid: boolean;
    issues: Array<{
      envKey: string;
      issue: string;
      severity: 'error' | 'warning';
    }>;
  } {
    const issues: Array<{
      envKey: string;
      issue: string;
      severity: 'error' | 'warning';
    }> = [];
    
    for (const [envKey, mapping] of this.envMappings) {
      const envValue = process.env[envKey];
      
      if (envValue !== undefined && envValue !== '') {
        try {
          let transformedValue: any;
          
          if (mapping.transformer) {
            transformedValue = mapping.transformer(envValue);
          } else {
            transformedValue = this.defaultTransform(envValue, mapping.type);
          }
          
          if (mapping.validator && !mapping.validator(transformedValue)) {
            issues.push({
              envKey,
              issue: `Value "${envValue}" fails validation`,
              severity: 'error'
            });
          }
        } catch (error) {
          issues.push({
            envKey,
            issue: `Cannot transform value "${envValue}": ${error}`,
            severity: 'error'
          });
        }
      } else if (mapping.defaultValue === undefined) {
        issues.push({
          envKey,
          issue: 'No value provided and no default available',
          severity: 'warning'
        });
      }
    }
    
    return {
      valid: issues.filter(i => i.severity === 'error').length === 0,
      issues
    };
  }

  /**
   * 获取当前环境变量值
   */
  public getCurrentEnvValues(): Map<string, {
    envKey: string;
    currentValue: string | undefined;
    transformedValue: any;
    defaultValue: any;
    isValid: boolean;
  }> {
    const result = new Map();
    
    for (const [envKey, mapping] of this.envMappings) {
      const currentValue = process.env[envKey];
      let transformedValue: any;
      let isValid = true;
      
      try {
        if (currentValue !== undefined && currentValue !== '') {
          if (mapping.transformer) {
            transformedValue = mapping.transformer(currentValue);
          } else {
            transformedValue = this.defaultTransform(currentValue, mapping.type);
          }
          
          if (mapping.validator && !mapping.validator(transformedValue)) {
            isValid = false;
          }
        } else {
          transformedValue = mapping.defaultValue;
        }
      } catch (error) {
        isValid = false;
        transformedValue = undefined;
      }
      
      result.set(envKey, {
        envKey,
        currentValue,
        transformedValue,
        defaultValue: mapping.defaultValue,
        isValid
      });
    }
    
    return result;
  }

  /**
   * 获取覆盖历史
   */
  public getOverrideHistory(): EnvOverrideResult[] {
    return [...this.overrideHistory];
  }

  /**
   * 清除覆盖历史
   */
  public clearOverrideHistory(): void {
    this.overrideHistory = [];
  }

  /**
   * 生成配置报告
   */
  public generateConfigReport(): string {
    const lines: string[] = [];
    const currentValues = this.getCurrentEnvValues();
    const validation = this.validateEnvironmentVariables();
    
    lines.push('=== Cache Environment Configuration Report ===');
    lines.push(`Generated at: ${new Date().toISOString()}`);
    lines.push(`Total mappings: ${this.envMappings.size}`);
    lines.push(`Validation status: ${validation.valid ? 'VALID' : 'INVALID'}`);
    lines.push('');
    
    if (validation.issues.length > 0) {
      lines.push('Issues:');
      for (const issue of validation.issues) {
        lines.push(`  [${issue.severity.toUpperCase()}] ${issue.envKey}: ${issue.issue}`);
      }
      lines.push('');
    }
    
    lines.push('Environment Variables:');
    for (const [envKey, info] of currentValues) {
      lines.push(`  ${envKey}:`);
      lines.push(`    Current: ${info.currentValue || '(not set)'}`);
      lines.push(`    Transformed: ${info.transformedValue}`);
      lines.push(`    Default: ${info.defaultValue}`);
      lines.push(`    Valid: ${info.isValid}`);
      lines.push('');
    }
    
    if (this.overrideHistory.length > 0) {
      lines.push('Recent Override History:');
      const recent = this.overrideHistory[this.overrideHistory.length - 1];
      lines.push(`  Last override: ${recent.overrides.length} changes, ${recent.errors.length} errors`);
      if (recent.errors.length > 0) {
        for (const error of recent.errors) {
          lines.push(`    Error: ${error.envKey} - ${error.error}`);
        }
      }
    }
    
    return lines.join('\n');
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    this.envMappings.clear();
    this.overrideHistory = [];
    CacheEnvConfig.instance = undefined as any;
  }
}

// 导出默认实例
export const cacheEnvConfig = CacheEnvConfig.getInstance();