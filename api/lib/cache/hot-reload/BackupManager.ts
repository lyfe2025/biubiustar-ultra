import { writeFile, readdir, unlink, stat, mkdir } from 'fs/promises';
import { join } from 'path';
import { EventEmitter } from 'events';
import { IBackupManager, HotReloadOptions, ConfigRestoredEvent } from './types';
import { CacheConfig } from '../types';
import { ConfigLoader } from './ConfigLoader';

/**
 * 备份管理器类
 * 负责配置的备份和恢复
 */
export class BackupManager extends EventEmitter implements IBackupManager {
  private configLoader: ConfigLoader;
  private configBackups = new Map<string, Record<string, CacheConfig>>();

  constructor(
    private options: HotReloadOptions,
    private configManager: any // CacheConfigManager 实例
  ) {
    super();
    this.configLoader = new ConfigLoader(options);
  }

  /**
   * 备份当前配置
   */
  public async backupCurrentConfigs(): Promise<void> {
    try {
      const currentConfigs = this.getCurrentConfigs();
      const configObject: Record<string, CacheConfig> = {};
      
      for (const [type, config] of Object.entries(currentConfigs)) {
        configObject[type] = config;
      }

      const backupContent = JSON.stringify(configObject, null, 2);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `cache-config-backup-${timestamp}.json`;
      const backupPath = join(this.options.configDir, 'backups', backupFileName);

      // 确保备份目录存在
      await mkdir(join(this.options.configDir, 'backups'), { recursive: true });

      // 写入备份文件
      await writeFile(backupPath, backupContent, 'utf-8');

      // 管理备份文件数量
      await this.manageBackupFiles();

      // 存储到内存备份
      this.configBackups.set(timestamp, configObject);

      console.log(`Config backup created: ${backupPath}`);
      this.emit('backupCreated', { backupPath, timestamp: Date.now() });
    } catch (error) {
      console.error('Failed to backup current configs:', error);
      this.emit('backupError', { error, timestamp: Date.now() });
      throw error;
    }
  }

  /**
   * 从备份恢复配置
   */
  public async restoreFromBackup(backupFile?: string): Promise<void> {
    try {
      let configs: Record<string, CacheConfig>;
      let usedBackupFile: string;

      if (backupFile) {
        // 从指定备份文件恢复
        configs = await this.configLoader.loadConfigFromFile(backupFile);
        usedBackupFile = backupFile;
      } else {
        // 从最新备份恢复
        const latestBackup = await this.getLatestBackupFile();
        if (!latestBackup) {
          throw new Error('No backup files found for restoration');
        }
        configs = await this.configLoader.loadConfigFromFile(latestBackup);
        usedBackupFile = latestBackup;
      }
      
      await this.applyConfigs(configs);
      console.log(`Restored config from backup: ${usedBackupFile}`);
      
      const event: ConfigRestoredEvent = {
        backupFile: usedBackupFile,
        timestamp: Date.now()
      };
      
      this.emit('configRestored', event);
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      this.emit('restoreError', { error, timestamp: Date.now() });
      throw error;
    }
  }

  /**
   * 管理备份文件数量
   */
  public async manageBackupFiles(): Promise<void> {
    try {
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
        
        this.emit('backupsManaged', {
          deletedCount: filesToDelete.length,
          remainingCount: this.options.maxBackups,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Failed to manage backup files:', error);
      this.emit('backupManagementError', { error, timestamp: Date.now() });
    }
  }

  /**
   * 获取最新的备份文件
   */
  private async getLatestBackupFile(): Promise<string | null> {
    try {
      const backupDir = join(this.options.configDir, 'backups');
      const files = await readdir(backupDir);
      
      const backupFiles = files
        .filter(file => file.startsWith('cache-config-backup-') && file.endsWith('.json'))
        .sort()
        .reverse(); // 最新的备份在前

      if (backupFiles.length === 0) {
        return null;
      }

      return join(backupDir, backupFiles[0]);
    } catch (error) {
      console.error('Failed to get latest backup file:', error);
      return null;
    }
  }

  /**
   * 获取所有备份文件
   */
  public async getAllBackupFiles(): Promise<string[]> {
    try {
      const backupDir = join(this.options.configDir, 'backups');
      const files = await readdir(backupDir);
      
      return files
        .filter(file => file.startsWith('cache-config-backup-') && file.endsWith('.json'))
        .map(file => join(backupDir, file))
        .sort()
        .reverse(); // 最新的备份在前
    } catch (error) {
      console.error('Failed to get backup files:', error);
      return [];
    }
  }

  /**
   * 删除指定备份文件
   */
  public async deleteBackup(backupFile: string): Promise<void> {
    try {
      await unlink(backupFile);
      console.log(`Deleted backup: ${backupFile}`);
      
      this.emit('backupDeleted', { backupFile, timestamp: Date.now() });
    } catch (error) {
      console.error(`Failed to delete backup ${backupFile}:`, error);
      throw error;
    }
  }

  /**
   * 清除所有备份文件
   */
  public async clearAllBackups(): Promise<void> {
    try {
      const backupFiles = await this.getAllBackupFiles();
      
      for (const backupFile of backupFiles) {
        await unlink(backupFile);
      }
      
      this.configBackups.clear();
      
      console.log(`Cleared ${backupFiles.length} backup files`);
      this.emit('allBackupsCleared', {
        deletedCount: backupFiles.length,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to clear all backups:', error);
      throw error;
    }
  }

  /**
   * 获取当前配置
   */
  private getCurrentConfigs(): Record<string, CacheConfig> {
    if (!this.configManager) {
      throw new Error('Config manager is not provided');
    }
    
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
   * 应用配置（通过配置管理器）
   */
  private async applyConfigs(configs: Record<string, CacheConfig>): Promise<void> {
    if (!this.configManager || typeof this.configManager.updateConfig !== 'function') {
      throw new Error('Config manager is not available or invalid');
    }

    for (const [type, config] of Object.entries(configs)) {
      try {
        await this.configManager.updateConfig(type, config);
      } catch (error) {
        console.error(`Failed to apply config for ${type}:`, error);
        throw error;
      }
    }
  }

  /**
   * 获取内存中的备份
   */
  public getMemoryBackups(): Map<string, Record<string, CacheConfig>> {
    return new Map(this.configBackups);
  }

  /**
   * 从内存备份恢复
   */
  public async restoreFromMemoryBackup(timestamp: string): Promise<void> {
    const backup = this.configBackups.get(timestamp);
    if (!backup) {
      throw new Error(`No memory backup found for timestamp: ${timestamp}`);
    }
    
    await this.applyConfigs(backup);
    console.log(`Restored config from memory backup: ${timestamp}`);
    
    this.emit('configRestored', {
      backupFile: `memory:${timestamp}`,
      timestamp: Date.now()
    });
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
   * 销毁备份管理器
   */
  public destroy(): void {
    this.configBackups.clear();
    this.removeAllListeners();
  }
}

// 导出备份管理器实例创建函数
export function createBackupManager(
  options: HotReloadOptions,
  configManager: any
): BackupManager {
  return new BackupManager(options, configManager);
}