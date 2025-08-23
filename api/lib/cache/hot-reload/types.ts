import { CacheConfig, CacheInstanceType } from '../../../config/cache';
import { EventEmitter } from 'events';

/**
 * 配置文件变化事件
 */
export interface ConfigFileChangeEvent {
  filePath: string;
  changeType: 'created' | 'modified' | 'deleted';
  timestamp: number;
  configs?: Record<string, CacheConfig>;
}

/**
 * 热重载选项
 */
export interface HotReloadOptions {
  /** 配置文件目录 */
  configDir: string;
  /** 是否启用热重载 */
  enabled: boolean;
  /** 防抖延迟时间（毫秒） */
  debounceDelay: number;
  /** 监听的文件扩展名 */
  watchExtensions: string[];
  /** 忽略的文件模式 */
  ignorePatterns: string[];
  /** 最大备份文件数量 */
  maxBackups: number;
  /** 是否自动备份 */
  autoBackup: boolean;
  /** 是否在错误时恢复 */
  restoreOnError: boolean;
}

/**
 * 配置应用结果
 */
export interface ConfigApplyResult {
  type: string;
  success: boolean;
  error?: string;
}

/**
 * 配置应用事件
 */
export interface ConfigsAppliedEvent {
  results: ConfigApplyResult[];
  timestamp: number;
}

/**
 * 配置恢复事件
 */
export interface ConfigRestoredEvent {
  backupFile: string;
  timestamp: number;
}

/**
 * 配置重载事件
 */
export interface ConfigsReloadedEvent {
  filePath?: string;
  timestamp: number;
}

/**
 * 配置保存事件
 */
export interface ConfigSavedEvent {
  filePath: string;
  timestamp: number;
}

/**
 * 文件监听器接口
 */
export interface IFileWatcher {
  startWatching(): Promise<void>;
  stopWatching(): void;
  isWatching(): boolean;
  on(event: string, listener: (...args: any[]) => void): this;
  emit(event: string, ...args: any[]): boolean;
}

/**
 * 配置加载器接口
 */
export interface IConfigLoader {
  loadConfigFromFile(filePath: string): Promise<Record<string, CacheConfig>>;
  shouldWatchFile(fileName: string): boolean;
}

/**
 * 配置应用器接口
 */
export interface IConfigApplier {
  applyConfigs(configs: Record<string, CacheConfig>): Promise<void>;
  reloadConfigs(filePath?: string): Promise<void>;
  saveConfigToFile(configs: Record<string, CacheConfig>, fileName: string): Promise<void>;
}

/**
 * 备份管理器接口
 */
export interface IBackupManager {
  backupCurrentConfigs(): Promise<void>;
  restoreFromBackup(): Promise<void>;
  manageBackupFiles(): Promise<void>;
}

/**
 * 热重载管理器接口
 */
export interface IHotReloadManager extends EventEmitter {
  startWatching(): Promise<void>;
  stopWatching(): void;
  reloadConfigs(filePath?: string): Promise<void>;
  saveConfigToFile(configs: Record<string, CacheConfig>, fileName: string): Promise<void>;
  isCurrentlyWatching(): boolean;
  getOptions(): HotReloadOptions;
  updateOptions(newOptions: Partial<HotReloadOptions>): void;
  destroy(): void;
}