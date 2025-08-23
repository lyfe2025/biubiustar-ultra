import { writeFile, readdir } from 'fs/promises';
import { join } from 'path';
import { EventEmitter } from 'events';
import { IConfigApplier, HotReloadOptions, ConfigApplyResult, ConfigsAppliedEvent, ConfigsReloadedEvent, ConfigSavedEvent } from './types';
import { CacheConfig, CacheInstanceType } from '../types';
import { ConfigLoader } from './ConfigLoader';

/**
 * 配置应用器类
 * 负责应用配置到缓存管理器
 */
export class ConfigApplier extends EventEmitter implements IConfigApplier {
  private configLoader: ConfigLoader;

  constructor(
    private options: HotReloadOptions,
    private configManager: any // CacheConfigManager 实例
  ) {
    super();
    this.configLoader = new ConfigLoader(options);
  }

  /**
   * 应用配置
   */
  public async applyConfigs(configs: Record<string, CacheConfig>): Promise<void> {
    const results: ConfigApplyResult[] = [];

    for (const [type, config] of Object.entries(configs)) {
      try {
        const success = await this.configManager.updateConfig(type as CacheInstanceType, config);
        results.push({ type, success });
        
        if (success) {
          console.log(`Successfully updated config for ${type}`);
        } else {
          console.warn(`Failed to update config for ${type}`);
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Unknown error';
        results.push({ type, success: false, error: errorMessage });
        console.error(`Error updating config for ${type}:`, error);
      }
    }

    // 发出配置应用结果事件
    const event: ConfigsAppliedEvent = {
      results,
      timestamp: Date.now()
    };
    
    this.emit('configsApplied', event);
  }

  /**
   * 手动重载配置
   */
  public async reloadConfigs(filePath?: string): Promise<void> {
    try {
      if (filePath) {
        // 重载指定文件
        const configs = await this.configLoader.loadConfigFromFile(filePath);
        await this.applyConfigs(configs);
      } else {
        // 重载配置目录中的所有文件
        const files = await readdir(this.options.configDir);
        
        for (const file of files) {
          if (this.configLoader.shouldWatchFile(file)) {
            const fullPath = join(this.options.configDir, file);
            try {
              const configs = await this.configLoader.loadConfigFromFile(fullPath);
              await this.applyConfigs(configs);
            } catch (error) {
              console.error(`Failed to reload config from ${fullPath}:`, error);
            }
          }
        }
      }
      
      const event: ConfigsReloadedEvent = {
        filePath,
        timestamp: Date.now()
      };
      
      this.emit('configsReloaded', event);
    } catch (error) {
      console.error('Failed to reload configs:', error);
      throw error;
    }
  }

  /**
   * 保存配置到文件
   */
  public async saveConfigToFile(configs: Record<string, CacheConfig>, fileName: string): Promise<void> {
    try {
      const filePath = join(this.options.configDir, fileName);
      const content = this.formatConfigContent(configs, fileName);
      
      await writeFile(filePath, content, 'utf-8');
      console.log(`Config saved to: ${filePath}`);
      
      const event: ConfigSavedEvent = {
        filePath,
        timestamp: Date.now()
      };
      
      this.emit('configSaved', event);
    } catch (error) {
      console.error(`Failed to save config to ${fileName}:`, error);
      throw error;
    }
  }

  /**
   * 格式化配置内容
   */
  private formatConfigContent(configs: Record<string, CacheConfig>, fileName: string): string {
    const extension = fileName.toLowerCase();
    
    if (extension.endsWith('.json')) {
      return JSON.stringify(configs, null, 2);
    } else if (extension.endsWith('.yaml') || extension.endsWith('.yml')) {
      return this.configToYaml(configs);
    } else if (extension.endsWith('.js')) {
      return this.configToJs(configs);
    } else if (extension.endsWith('.ts')) {
      return this.configToTs(configs);
    }
    
    // 默认使用JSON格式
    return JSON.stringify(configs, null, 2);
  }

  /**
   * 将配置转换为YAML格式
   */
  private configToYaml(configs: Record<string, CacheConfig>): string {
    let yaml = '# Cache Configuration\n';
    yaml += `# Generated at: ${new Date().toISOString()}\n\n`;
    
    for (const [type, config] of Object.entries(configs)) {
      yaml += `${type}:\n`;
      for (const [key, value] of Object.entries(config)) {
        yaml += `  ${key}: ${this.formatYamlValue(value)}\n`;
      }
      yaml += '\n';
    }
    
    return yaml;
  }

  /**
   * 格式化YAML值
   */
  private formatYamlValue(value: any): string {
    if (typeof value === 'string') {
      return `"${value}"`;
    }
    if (typeof value === 'boolean' || typeof value === 'number') {
      return String(value);
    }
    if (value === null || value === undefined) {
      return 'null';
    }
    return JSON.stringify(value);
  }

  /**
   * 将配置转换为JavaScript格式
   */
  private configToJs(configs: Record<string, CacheConfig>): string {
    let js = '// Cache Configuration\n';
    js += `// Generated at: ${new Date().toISOString()}\n\n`;
    js += 'module.exports = ';
    js += JSON.stringify(configs, null, 2);
    js += ';\n';
    return js;
  }

  /**
   * 将配置转换为TypeScript格式
   */
  private configToTs(configs: Record<string, CacheConfig>): string {
    let ts = '// Cache Configuration\n';
    ts += `// Generated at: ${new Date().toISOString()}\n\n`;
    ts += 'import { CacheConfig } from \'../types\';\n\n';
    ts += 'const configs: Record<string, CacheConfig> = ';
    ts += JSON.stringify(configs, null, 2);
    ts += ';\n\n';
    ts += 'export default configs;\n';
    return ts;
  }

  /**
   * 验证配置管理器
   */
  private validateConfigManager(): void {
    if (!this.configManager) {
      throw new Error('Config manager is not provided');
    }
    
    if (typeof this.configManager.updateConfig !== 'function') {
      throw new Error('Config manager must have updateConfig method');
    }
  }

  /**
   * 获取当前所有配置
   */
  public getCurrentConfigs(): Record<string, CacheConfig> {
    this.validateConfigManager();
    
    if (typeof this.configManager.getAllConfigs === 'function') {
      const configMap = this.configManager.getAllConfigs();
      const configs: Record<string, CacheConfig> = {};
      
      for (const [type, config] of configMap) {
        configs[type] = config;
      }
      
      return configs;
    }
    
    return {};
  }

  /**
   * 更新选项
   */
  public updateOptions(newOptions: Partial<HotReloadOptions>): void {
    Object.assign(this.options, newOptions);
    this.configLoader.updateOptions(newOptions);
  }

  /**
   * 设置配置管理器
   */
  public setConfigManager(configManager: any): void {
    this.configManager = configManager;
  }

  /**
   * 销毁配置应用器
   */
  public destroy(): void {
    this.removeAllListeners();
  }
}

// 导出配置应用器实例创建函数
export function createConfigApplier(
  options: HotReloadOptions,
  configManager: any
): ConfigApplier {
  return new ConfigApplier(options, configManager);
}