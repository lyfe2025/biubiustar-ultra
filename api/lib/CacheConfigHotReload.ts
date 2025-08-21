import { watch, FSWatcher } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { EventEmitter } from 'events';
import { CacheConfigManager } from './CacheConfigManager';
import { CacheConfig, CacheInstanceType } from '../config/cache';

/**
 * 配置文件变更事件
 */
export interface ConfigFileChangeEvent {
  filePath: string;
  changeType: 'created' | 'modified' | 'deleted';
  timestamp: number;
  configs?: Record<string, CacheConfig>;
}

/**
 * 热重载配置选项
 */
export interface HotReloadOptions {
  configDir: string;
  watchPatterns: string[];
  debounceMs: number;
  autoReload: boolean;
  backupEnabled: boolean;
  maxBackups: number;
}

/**
 * 缓存配置热重载服务
 * 监听配置文件变化并自动更新缓存配置
 */
export class CacheConfigHotReload extends EventEmitter {
  private static instance: CacheConfigHotReload;
  private watchers: Map<string, FSWatcher> = new Map();
  private configManager: CacheConfigManager;
  private options: HotReloadOptions;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private isWatching = false;
  private configBackups: Map<string, string[]> = new Map();

  private constructor(options: Partial<HotReloadOptions> = {}) {
    super();
    this.configManager = CacheConfigManager.getInstance();
    this.options = {
      configDir: options.configDir || join(process.cwd(), 'config', 'cache'),
      watchPatterns: options.watchPatterns || ['*.json', '*.js', '*.ts'],
      debounceMs: options.debounceMs || 1000,
      autoReload: options.autoReload !== false,
      backupEnabled: options.backupEnabled !== false,
      maxBackups: options.maxBackups || 10
    };
  }

  /**
   * 获取单例实例
   */
  public static getInstance(options?: Partial<HotReloadOptions>): CacheConfigHotReload {
    if (!CacheConfigHotReload.instance) {
      CacheConfigHotReload.instance = new CacheConfigHotReload(options);
    }
    return CacheConfigHotReload.instance;
  }

  /**
   * 开始监听配置文件变化
   */
  public async startWatching(): Promise<void> {
    if (this.isWatching) {
      return;
    }

    try {
      // 确保配置目录存在
      await this.ensureConfigDirectory();

      // 监听配置目录
      const watcher = watch(this.options.configDir, { recursive: true }, (eventType, filename) => {
        if (filename && this.shouldWatchFile(filename)) {
          this.handleFileChange(eventType, filename);
        }
      });

      this.watchers.set(this.options.configDir, watcher);
      this.isWatching = true;

      console.log(`Started watching cache config directory: ${this.options.configDir}`);
      this.emit('watchingStarted', { configDir: this.options.configDir });
    } catch (error) {
      console.error('Failed to start watching config files:', error);
      throw error;
    }
  }

  /**
   * 停止监听配置文件变化
   */
  public stopWatching(): void {
    for (const [path, watcher] of this.watchers) {
      watcher.close();
      console.log(`Stopped watching: ${path}`);
    }
    
    this.watchers.clear();
    this.clearAllDebounceTimers();
    this.isWatching = false;

    this.emit('watchingStopped');
  }

  /**
   * 确保配置目录存在
   */
  private async ensureConfigDirectory(): Promise<void> {
    const { mkdir } = await import('fs/promises');
    try {
      await mkdir(this.options.configDir, { recursive: true });
    } catch (error: any) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * 判断是否应该监听该文件
   */
  private shouldWatchFile(filename: string): boolean {
    return this.options.watchPatterns.some(pattern => {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(filename);
    });
  }

  /**
   * 处理文件变化
   */
  private handleFileChange(eventType: string, filename: string): void {
    const filePath = join(this.options.configDir, filename);
    
    // 清除之前的防抖定时器
    const existingTimer = this.debounceTimers.get(filePath);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // 设置新的防抖定时器
    const timer = setTimeout(async () => {
      try {
        await this.processFileChange(eventType, filePath);
      } catch (error) {
        console.error(`Error processing file change for ${filePath}:`, error);
        this.emit('error', { filePath, error });
      } finally {
        this.debounceTimers.delete(filePath);
      }
    }, this.options.debounceMs);

    this.debounceTimers.set(filePath, timer);
  }

  /**
   * 处理文件变化的具体逻辑
   */
  private async processFileChange(eventType: string, filePath: string): Promise<void> {
    const changeType = this.mapEventType(eventType);
    const timestamp = Date.now();

    console.log(`Config file ${changeType}: ${filePath}`);

    let configs: Record<string, CacheConfig> | undefined;

    if (changeType === 'modified' || changeType === 'created') {
      try {
        // 备份当前配置
        if (this.options.backupEnabled) {
          await this.backupCurrentConfigs();
        }

        // 读取并解析新配置
        configs = await this.loadConfigFromFile(filePath);
        
        if (configs && this.options.autoReload) {
          // 验证并应用新配置
          await this.applyConfigs(configs);
        }
      } catch (error) {
        console.error(`Failed to process config file ${filePath}:`, error);
        
        // 如果启用了备份，尝试恢复
        if (this.options.backupEnabled) {
          await this.restoreFromBackup();
        }
        
        throw error;
      }
    }

    // 发出文件变化事件
    const event: ConfigFileChangeEvent = {
      filePath,
      changeType,
      timestamp,
      configs
    };
    
    this.emit('configFileChanged', event);
  }

  /**
   * 映射文件系统事件类型
   */
  private mapEventType(eventType: string): 'created' | 'modified' | 'deleted' {
    switch (eventType) {
      case 'rename':
        return 'created'; // 可能是创建或删除，这里简化为创建
      case 'change':
        return 'modified';
      default:
        return 'modified';
    }
  }

  /**
   * 从文件加载配置
   */
  private async loadConfigFromFile(filePath: string): Promise<Record<string, CacheConfig>> {
    try {
      const content = await readFile(filePath, 'utf-8');
      
      if (filePath.endsWith('.json')) {
        return JSON.parse(content);
      } else if (filePath.endsWith('.js') || filePath.endsWith('.ts')) {
        // 对于 JS/TS 文件，需要动态导入
        // 注意：这在生产环境中可能有安全风险
        delete require.cache[require.resolve(filePath)];
        const module = require(filePath);
        return module.default || module;
      }
      
      throw new Error(`Unsupported config file format: ${filePath}`);
    } catch (error) {
      console.error(`Failed to load config from ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * 应用配置
   */
  private async applyConfigs(configs: Record<string, CacheConfig>): Promise<void> {
    const results: Array<{ type: string; success: boolean; error?: string }> = [];

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
    this.emit('configsApplied', { results, timestamp: Date.now() });
  }

  /**
   * 备份当前配置
   */
  private async backupCurrentConfigs(): Promise<void> {
    try {
      const currentConfigs = this.configManager.getAllConfigs();
      const configObject: Record<string, CacheConfig> = {};
      
      for (const [type, config] of currentConfigs) {
        configObject[type] = config;
      }

      const backupContent = JSON.stringify(configObject, null, 2);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `cache-config-backup-${timestamp}.json`;
      const backupPath = join(this.options.configDir, 'backups', backupFileName);

      // 确保备份目录存在
      const { mkdir } = await import('fs/promises');
      await mkdir(join(this.options.configDir, 'backups'), { recursive: true });

      // 写入备份文件
      await writeFile(backupPath, backupContent, 'utf-8');

      // 管理备份文件数量
      await this.manageBackupFiles();

      console.log(`Config backup created: ${backupPath}`);
    } catch (error) {
      console.error('Failed to backup current configs:', error);
    }
  }

  /**
   * 管理备份文件数量
   */
  private async manageBackupFiles(): Promise<void> {
    try {
      const { readdir, unlink, stat } = await import('fs/promises');
      const backupDir = join(this.options.configDir, 'backups');
      const files = await readdir(backupDir);
      
      const backupFiles = files
        .filter(file => file.startsWith('cache-config-backup-') && file.endsWith('.json'))
        .map(async file => {
          const filePath = join(backupDir, file);
          const stats = await stat(filePath);
          return { file, filePath, mtime: stats.mtime };
        });

      const resolvedFiles = await Promise.all(backupFiles);
      resolvedFiles.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      // 删除超出限制的备份文件
      if (resolvedFiles.length > this.options.maxBackups) {
        const filesToDelete = resolvedFiles.slice(this.options.maxBackups);
        for (const { filePath } of filesToDelete) {
          await unlink(filePath);
          console.log(`Deleted old backup: ${filePath}`);
        }
      }
    } catch (error) {
      console.error('Failed to manage backup files:', error);
    }
  }

  /**
   * 从备份恢复配置
   */
  private async restoreFromBackup(): Promise<void> {
    try {
      const { readdir } = await import('fs/promises');
      const backupDir = join(this.options.configDir, 'backups');
      const files = await readdir(backupDir);
      
      const backupFiles = files
        .filter(file => file.startsWith('cache-config-backup-') && file.endsWith('.json'))
        .sort()
        .reverse(); // 最新的备份在前

      if (backupFiles.length === 0) {
        console.warn('No backup files found for restoration');
        return;
      }

      const latestBackup = join(backupDir, backupFiles[0]);
      const configs = await this.loadConfigFromFile(latestBackup);
      
      await this.applyConfigs(configs);
      console.log(`Restored config from backup: ${latestBackup}`);
      
      this.emit('configRestored', { backupFile: latestBackup, timestamp: Date.now() });
    } catch (error) {
      console.error('Failed to restore from backup:', error);
    }
  }

  /**
   * 手动重载配置
   */
  public async reloadConfigs(filePath?: string): Promise<void> {
    try {
      if (filePath) {
        // 重载指定文件
        const configs = await this.loadConfigFromFile(filePath);
        await this.applyConfigs(configs);
      } else {
        // 重载配置目录中的所有文件
        const { readdir } = await import('fs/promises');
        const files = await readdir(this.options.configDir);
        
        for (const file of files) {
          if (this.shouldWatchFile(file)) {
            const fullPath = join(this.options.configDir, file);
            try {
              const configs = await this.loadConfigFromFile(fullPath);
              await this.applyConfigs(configs);
            } catch (error) {
              console.error(`Failed to reload config from ${fullPath}:`, error);
            }
          }
        }
      }
      
      this.emit('configsReloaded', { filePath, timestamp: Date.now() });
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
      const content = JSON.stringify(configs, null, 2);
      
      await writeFile(filePath, content, 'utf-8');
      console.log(`Config saved to: ${filePath}`);
      
      this.emit('configSaved', { filePath, timestamp: Date.now() });
    } catch (error) {
      console.error(`Failed to save config to ${fileName}:`, error);
      throw error;
    }
  }

  /**
   * 清除所有防抖定时器
   */
  private clearAllDebounceTimers(): void {
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
  }

  /**
   * 获取监听状态
   */
  public isCurrentlyWatching(): boolean {
    return this.isWatching;
  }

  /**
   * 获取配置选项
   */
  public getOptions(): HotReloadOptions {
    return { ...this.options };
  }

  /**
   * 更新配置选项
   */
  public updateOptions(newOptions: Partial<HotReloadOptions>): void {
    this.options = { ...this.options, ...newOptions };
    
    // 如果正在监听，重新启动以应用新选项
    if (this.isWatching) {
      this.stopWatching();
      this.startWatching();
    }
  }

  /**
   * 销毁热重载服务
   */
  public destroy(): void {
    this.stopWatching();
    this.removeAllListeners();
    this.configBackups.clear();
  }
}

// 导出单例实例
export const cacheConfigHotReload = CacheConfigHotReload.getInstance();