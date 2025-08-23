import { promises as fs } from 'fs';
import * as path from 'path';
import { CacheConfigs } from '../../../config/cache';
import {
  IBackupManager,
  ConfigBackup,
  BackupResult,
  RestoreResult,
  DeleteResult
} from './types';

/**
 * 备份管理器
 * 负责配置文件的备份、恢复和管理功能
 */
export class BackupManager implements IBackupManager {
  private static instance: BackupManager;
  private backups: Map<string, ConfigBackup> = new Map();
  private backupDirectory: string;
  private maxBackups: number = 10;

  private constructor() {
    this.backupDirectory = path.join(process.cwd(), 'cache-config-backups');
    this.ensureBackupDirectory();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): BackupManager {
    if (!BackupManager.instance) {
      BackupManager.instance = new BackupManager();
    }
    return BackupManager.instance;
  }

  /**
   * 确保备份目录存在
   */
  private async ensureBackupDirectory(): Promise<void> {
    try {
      await fs.access(this.backupDirectory);
    } catch {
      await fs.mkdir(this.backupDirectory, { recursive: true });
    }
  }

  /**
   * 创建配置备份
   */
  public async createBackup(
    config: CacheConfigs,
    description?: string
  ): Promise<BackupResult> {
    try {
      await this.ensureBackupDirectory();
      
      const id = this.generateBackupId();
      const timestamp = new Date();
      const fileName = `cache-config-backup-${id}.json`;
      const filePath = path.join(this.backupDirectory, fileName);
      
      const backupData = {
        metadata: {
          id,
          timestamp: timestamp.toISOString(),
          description: description || 'Manual backup',
          version: '1.0.0'
        },
        config
      };
      
      const content = JSON.stringify(backupData, null, 2);
      await fs.writeFile(filePath, content, 'utf8');
      
      const stats = await fs.stat(filePath);
      
      const backup: ConfigBackup = {
        id,
        timestamp,
        filePath,
        originalConfig: config,
        description,
        size: stats.size
      };
      
      this.backups.set(id, backup);
      
      // 清理旧备份
      await this.cleanupOldBackups();
      
      return {
        success: true,
        backup
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 恢复配置备份
   */
  public async restoreBackup(backupId: string): Promise<RestoreResult> {
    try {
      const backup = this.backups.get(backupId);
      if (!backup) {
        throw new Error(`Backup with ID ${backupId} not found`);
      }
      
      // 从文件读取备份
      const content = await fs.readFile(backup.filePath, 'utf8');
      const backupData = JSON.parse(content);
      
      if (!backupData.config) {
        throw new Error('Invalid backup file: missing config');
      }
      
      return {
        success: true,
        config: backupData.config
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 获取所有备份
   */
  public getBackups(): ConfigBackup[] {
    return Array.from(this.backups.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * 获取所有备份文件路径
   */
  public getAllBackupFiles(): string[] {
    return this.getBackups().map(backup => backup.filePath);
  }

  /**
   * 删除备份
   */
  public async deleteBackup(backupId: string): Promise<DeleteResult> {
    try {
      const backup = this.backups.get(backupId);
      if (!backup) {
        throw new Error(`Backup with ID ${backupId} not found`);
      }
      
      await fs.unlink(backup.filePath);
      this.backups.delete(backupId);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 清理旧备份
   */
  public async cleanupOldBackups(): Promise<void> {
    const backups = this.getBackups();
    
    if (backups.length > this.maxBackups) {
      const toDelete = backups.slice(this.maxBackups);
      
      for (const backup of toDelete) {
        try {
          await fs.unlink(backup.filePath);
          this.backups.delete(backup.id);
        } catch (error) {
          console.warn(`Failed to delete backup ${backup.id}:`, error);
        }
      }
    }
  }

  /**
   * 设置最大备份数量
   */
  public setMaxBackups(max: number): void {
    this.maxBackups = Math.max(1, max);
  }

  /**
   * 获取备份目录
   */
  public getBackupDirectory(): string {
    return this.backupDirectory;
  }

  /**
   * 设置备份目录
   */
  public async setBackupDirectory(directory: string): Promise<void> {
    this.backupDirectory = directory;
    await this.ensureBackupDirectory();
  }

  /**
   * 生成备份ID
   */
  private generateBackupId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`;
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    this.backups.clear();
    BackupManager.instance = undefined as any;
  }
}

// 导出默认实例
export const backupManager = BackupManager.getInstance();