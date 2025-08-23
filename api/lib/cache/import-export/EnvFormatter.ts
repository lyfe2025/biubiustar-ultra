import { CacheConfigs } from '../../../config/cache';
import { IFormatter, ImportExportOptions } from './types';

/**
 * 环境变量格式化器
 * 负责环境变量格式的导入导出功能
 */
export class EnvFormatter implements IFormatter {
  /**
   * 导出配置为环境变量格式
   */
  export(config: CacheConfigs, options: ImportExportOptions): string {
    const lines: string[] = [];
    
    if (options.includeComments) {
      lines.push('# Cache Configuration Environment Variables');
      lines.push(`# Exported at: ${new Date().toISOString()}`);
      lines.push('# Format: Environment Variables');
      lines.push('');
    }
    
    this.configToEnv(config, lines, '');
    
    return lines.join('\n');
  }

  /**
   * 从环境变量格式导入配置
   */
  import(content: string, currentConfig?: CacheConfigs): CacheConfigs {
    if (!currentConfig) {
      throw new Error('Current config is required for environment variable import');
    }

    const lines = content.split('\n');
    const envVars: Record<string, string> = {};
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key] = valueParts.join('=');
        }
      }
    }
    
    // 应用环境变量到配置
    const newConfig = JSON.parse(JSON.stringify(currentConfig));
    this.applyEnvVarsToConfig(envVars, newConfig);
    
    return newConfig;
  }

  /**
   * 验证环境变量内容
   */
  validate(content: string): boolean {
    try {
      const lines = content.split('\n');
      let hasValidVar = false;
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0 && key.startsWith('CACHE_')) {
            hasValidVar = true;
            break;
          }
        }
      }
      
      return hasValidVar;
    } catch {
      return false;
    }
  }

  /**
   * 获取文件扩展名
   */
  getFileExtension(): string {
    return '.env';
  }

  /**
   * 配置转环境变量辅助方法
   */
  private configToEnv(obj: any, lines: string[], prefix: string): void {
    for (const [key, value] of Object.entries(obj)) {
      const envKey = prefix ? `${prefix}_${key.toUpperCase()}` : `CACHE_${key.toUpperCase()}`;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        this.configToEnv(value, lines, envKey);
      } else {
        lines.push(`${envKey}=${value}`);
      }
    }
  }

  /**
   * 应用环境变量到配置
   */
  private applyEnvVarsToConfig(envVars: Record<string, string>, config: any): void {
    for (const [key, value] of Object.entries(envVars)) {
      if (key.startsWith('CACHE_')) {
        const configPath = this.envKeyToConfigPath(key);
        this.setConfigValue(config, configPath, this.parseEnvValue(value));
      }
    }
  }

  /**
   * 环境变量键转配置路径
   */
  private envKeyToConfigPath(envKey: string): string {
    return envKey
      .replace(/^CACHE_/, '')
      .toLowerCase()
      .replace(/_/g, '.');
  }

  /**
   * 解析环境变量值
   */
  private parseEnvValue(value: string): any {
    // 尝试解析为数字
    const num = Number(value);
    if (!isNaN(num)) {
      return num;
    }
    
    // 尝试解析为布尔值
    const lower = value.toLowerCase();
    if (lower === 'true') return true;
    if (lower === 'false') return false;
    
    // 返回字符串
    return value;
  }

  /**
   * 设置配置值
   */
  private setConfigValue(config: any, path: string, value: any): void {
    const parts = path.split('.');
    let current = config;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    current[parts[parts.length - 1]] = value;
  }
}

// 导出默认实例
export const envFormatter = new EnvFormatter();