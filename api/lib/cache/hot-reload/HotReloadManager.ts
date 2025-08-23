import { EventEmitter } from 'events';
import { IHotReloadManager, HotReloadOptions, ConfigFileChangeEvent } from './types';
import { CacheConfig } from '../types';
import { FileWatcher } from './FileWatcher';
import { ConfigLoader } from './ConfigLoader';
import { ConfigApplier } from './ConfigApplier';
import { BackupManager } from './BackupManager';

/**
 * 热重载管理器类
 * 整合文件监听、配置加载、配置应用和备份管理功能
 */
export class HotReloadManager extends EventEmitter implements IHotReloadManager {
  private fileWatcher: FileWatcher;
  private configLoader: ConfigLoader;
  private configApplier: ConfigApplier;
  private backupManager: BackupManager;
  private isInitialized = false;

  constructor(
    private options: HotReloadOptions,
    private configManager: any // CacheConfigManager 实例
  ) {
    super();
    
    this.initializeComponents();
    this.setupEventHandlers();
  }

  /**
   * 初始化组件
   */
  private initializeComponents(): void {
    this.fileWatcher = new FileWatcher(this.options);
    this.configLoader = new ConfigLoader(this.options);
    this.configApplier = new ConfigApplier(this.options, this.configManager);
    this.backupManager = new BackupManager(this.options, this.configManager);
    
    this.isInitialized = true;
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
    // 文件监听器事件
    this.fileWatcher.on('fileChanged', this.handleFileChange.bind(this));
    this.fileWatcher.on('fileChangeError', this.handleFileChangeError.bind(this));
    this.fileWatcher.on('watchingStarted', (event) => this.emit('watchingStarted', event));
    this.fileWatcher.on('watchingStopped', (event) => this.emit('watchingStopped', event));

    // 配置应用器事件
    this.configApplier.on('configsApplied', (event) => this.emit('configsApplied', event));
    this.configApplier.on('configsReloaded', (event) => this.emit('configsReloaded', event));
    this.configApplier.on('configSaved', (event) => this.emit('configSaved', event));

    // 备份管理器事件
    this.backupManager.on('configRestored', (event) => this.emit('configRestored', event));
    this.backupManager.on('backupCreated', (event) => this.emit('backupCreated', event));
    this.backupManager.on('backupError', (event) => this.emit('backupError', event));
    this.backupManager.on('restoreError', (event) => this.emit('restoreError', event));
  }

  /**
   * 开始监听文件变化
   */
  public async startWatching(): Promise<void> {
    if (!this.options.enabled) {
      console.log('Hot reload is disabled');
      return;
    }

    if (!this.isInitialized) {
      throw new Error('HotReloadManager is not initialized');
    }

    try {
      // 如果启用自动备份，先备份当前配置
      if (this.options.autoBackup) {
        await this.backupManager.backupCurrentConfigs();
      }

      await this.fileWatcher.startWatching();
      console.log('Hot reload started successfully');
    } catch (error) {
      console.error('Failed to start hot reload:', error);
      throw error;
    }
  }

  /**
   * 停止监听文件变化
   */
  public stopWatching(): void {
    if (this.fileWatcher) {
      this.fileWatcher.stopWatching();
    }
    console.log('Hot reload stopped');
  }

  /**
   * 处理文件变化事件
   */
  private async handleFileChange(event: ConfigFileChangeEvent): Promise<void> {
    try {
      console.log(`Processing config file change: ${event.filePath} (${event.changeType})`);
      
      if (event.changeType === 'deleted') {
        console.warn(`Config file deleted: ${event.filePath}`);
        this.emit('configFileDeleted', event);
        return;
      }

      // 加载配置
      const configs = await this.configLoader.loadConfigFromFile(event.filePath);
      
      // 如果启用自动备份，先备份当前配置
      if (this.options.autoBackup) {
        await this.backupManager.backupCurrentConfigs();
      }

      // 应用配置
      await this.configApplier.applyConfigs(configs);
      
      // 发出配置文件变化事件
      const enhancedEvent: ConfigFileChangeEvent = {
        ...event,
        configs
      };
      
      this.emit('configFileChanged', enhancedEvent);
    } catch (error) {
      console.error(`Error processing file change for ${event.filePath}:`, error);
      
      // 如果启用错误恢复，尝试从备份恢复
      if (this.options.restoreOnError) {
        try {
          await this.backupManager.restoreFromBackup();
          console.log('Successfully restored from backup after error');
        } catch (restoreError) {
          console.error('Failed to restore from backup:', restoreError);
        }
      }
      
      this.emit('configFileChangeError', {
        filePath: event.filePath,
        error,
        timestamp: Date.now()
      });
    }
  }

  /**
   * 处理文件变化错误
   */
  private handleFileChangeError(event: any): void {
    console.error('File change error:', event);
    this.emit('fileChangeError', event);
  }

  /**
   * 手动重载配置
   */
  public async reloadConfigs(filePath?: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('HotReloadManager is not initialized');
    }

    try {
      // 如果启用自动备份，先备份当前配置
      if (this.options.autoBackup) {
        await this.backupManager.backupCurrentConfigs();
      }

      await this.configApplier.reloadConfigs(filePath);
    } catch (error) {
      console.error('Failed to reload configs:', error);
      
      // 如果启用错误恢复，尝试从备份恢复
      if (this.options.restoreOnError) {
        try {
          await this.backupManager.restoreFromBackup();
          console.log('Successfully restored from backup after reload error');
        } catch (restoreError) {
          console.error('Failed to restore from backup:', restoreError);
        }
      }
      
      throw error;
    }
  }

  /**
   * 保存配置到文件
   */
  public async saveConfigToFile(configs: Record<string, CacheConfig>, fileName: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('HotReloadManager is not initialized');
    }

    await this.configApplier.saveConfigToFile(configs, fileName);
  }

  /**
   * 备份当前配置
   */
  public async backupCurrentConfigs(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('HotReloadManager is not initialized');
    }

    await this.backupManager.backupCurrentConfigs();
  }

  /**
   * 从备份恢复配置
   */
  public async restoreFromBackup(backupFile?: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('HotReloadManager is not initialized');
    }

    await this.backupManager.restoreFromBackup(backupFile);
  }

  /**
   * 获取所有备份文件
   */
  public async getAllBackupFiles(): Promise<string[]> {
    if (!this.isInitialized) {
      throw new Error('HotReloadManager is not initialized');
    }

    return this.backupManager.getAllBackupFiles();
  }

  /**
   * 检查是否正在监听
   */
  public isCurrentlyWatching(): boolean {
    return this.fileWatcher ? this.fileWatcher.isWatching() : false;
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
    const wasWatching = this.isCurrentlyWatching();
    
    // 停止监听
    if (wasWatching) {
      this.stopWatching();
    }
    
    // 更新选项
    Object.assign(this.options, newOptions);
    
    // 更新各组件的选项
    if (this.fileWatcher) {
      this.fileWatcher.updateOptions(this.options);
    }
    if (this.configLoader) {
      this.configLoader.updateOptions(this.options);
    }
    if (this.configApplier) {
      this.configApplier.updateOptions(this.options);
    }
    if (this.backupManager) {
      this.backupManager.updateOptions(this.options);
    }
    
    // 如果之前在监听，重新启动
    if (wasWatching && this.options.enabled) {
      this.startWatching().catch(error => {
        console.error('Failed to restart watching after options update:', error);
      });
    }
  }

  /**
   * 设置配置管理器
   */
  public setConfigManager(configManager: any): void {
    this.configManager = configManager;
    
    if (this.configApplier) {
      this.configApplier.setConfigManager(configManager);
    }
    if (this.backupManager) {
      this.backupManager.setConfigManager(configManager);
    }
  }

  /**
   * 获取组件状态
   */
  public getStatus(): {
    isInitialized: boolean;
    isWatching: boolean;
    options: HotReloadOptions;
  } {
    return {
      isInitialized: this.isInitialized,
      isWatching: this.isCurrentlyWatching(),
      options: this.getOptions()
    };
  }

  /**
   * 销毁热重载管理器
   */
  public destroy(): void {
    this.stopWatching();
    
    if (this.fileWatcher) {
      this.fileWatcher.destroy();
    }
    if (this.configApplier) {
      this.configApplier.destroy();
    }
    if (this.backupManager) {
      this.backupManager.destroy();
    }
    
    this.removeAllListeners();
    this.isInitialized = false;
    
    console.log('HotReloadManager destroyed');
  }
}

// 导出热重载管理器实例创建函数
export function createHotReloadManager(
  options: HotReloadOptions,
  configManager: any
): HotReloadManager {
  return new HotReloadManager(options, configManager);
}