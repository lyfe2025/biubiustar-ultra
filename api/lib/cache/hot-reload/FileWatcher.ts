import { EventEmitter } from 'events';
import { watch, FSWatcher } from 'fs';
import { join } from 'path';
import { IFileWatcher, HotReloadOptions, ConfigFileChangeEvent } from './types';

/**
 * 文件监听器类
 * 负责监听配置文件的变化
 */
export class FileWatcher extends EventEmitter implements IFileWatcher {
  private watcher: FSWatcher | null = null;
  private debounceTimers = new Map<string, NodeJS.Timeout>();
  private isWatchingFlag = false;

  constructor(private options: HotReloadOptions) {
    super();
  }

  /**
   * 开始监听文件变化
   */
  public async startWatching(): Promise<void> {
    if (this.isWatchingFlag) {
      console.warn('File watcher is already running');
      return;
    }

    try {
      await this.ensureConfigDirectory();
      
      this.watcher = watch(this.options.configDir, { recursive: false }, (eventType, filename) => {
        if (filename && this.shouldWatchFile(filename)) {
          this.handleFileChange(eventType, filename);
        }
      });

      this.isWatchingFlag = true;
      console.log(`Started watching config directory: ${this.options.configDir}`);
      
      this.emit('watchingStarted', { configDir: this.options.configDir, timestamp: Date.now() });
    } catch (error) {
      console.error('Failed to start file watching:', error);
      throw error;
    }
  }

  /**
   * 停止监听文件变化
   */
  public stopWatching(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }

    this.clearAllDebounceTimers();
    this.isWatchingFlag = false;
    
    console.log('Stopped watching config files');
    this.emit('watchingStopped', { timestamp: Date.now() });
  }

  /**
   * 检查是否正在监听
   */
  public isWatching(): boolean {
    return this.isWatchingFlag;
  }

  /**
   * 确保配置目录存在
   */
  private async ensureConfigDirectory(): Promise<void> {
    try {
      const { mkdir, access } = await import('fs/promises');
      
      try {
        await access(this.options.configDir);
      } catch {
        await mkdir(this.options.configDir, { recursive: true });
        console.log(`Created config directory: ${this.options.configDir}`);
      }
    } catch (error) {
      console.error(`Failed to ensure config directory: ${this.options.configDir}`, error);
      throw error;
    }
  }

  /**
   * 判断是否应该监听该文件
   */
  private shouldWatchFile(fileName: string): boolean {
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
   * 处理文件变化事件
   */
  private handleFileChange(eventType: string, filename: string): void {
    const filePath = join(this.options.configDir, filename);
    
    // 清除之前的防抖定时器
    const existingTimer = this.debounceTimers.get(filePath);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // 设置新的防抖定时器
    const timer = setTimeout(() => {
      this.processFileChange(eventType, filePath);
      this.debounceTimers.delete(filePath);
    }, this.options.debounceDelay);

    this.debounceTimers.set(filePath, timer);
  }

  /**
   * 处理文件变化（防抖后）
   */
  private async processFileChange(eventType: string, filePath: string): Promise<void> {
    try {
      console.log(`Config file ${this.mapEventType(eventType)}: ${filePath}`);
      
      const changeType = this.mapEventType(eventType);
      const timestamp = Date.now();
      
      // 发出文件变化事件
      const event: ConfigFileChangeEvent = {
        filePath,
        changeType,
        timestamp
      };
      
      this.emit('fileChanged', event);
    } catch (error) {
      console.error(`Error processing file change for ${filePath}:`, error);
      this.emit('fileChangeError', { filePath, error, timestamp: Date.now() });
    }
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
   * 清除所有防抖定时器
   */
  private clearAllDebounceTimers(): void {
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
  }

  /**
   * 更新选项
   */
  public updateOptions(newOptions: Partial<HotReloadOptions>): void {
    Object.assign(this.options, newOptions);
  }

  /**
   * 销毁文件监听器
   */
  public destroy(): void {
    this.stopWatching();
    this.removeAllListeners();
  }
}

// 导出文件监听器实例创建函数
export function createFileWatcher(options: HotReloadOptions): FileWatcher {
  return new FileWatcher(options);
}