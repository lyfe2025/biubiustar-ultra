import { EventEmitter } from 'events';
import { CacheConfig, CacheConfigs, CacheInstanceType } from '../config/cache';

/**
 * 缓存事件类型
 */
export enum CacheEventType {
  CONFIG_CHANGED = 'config_changed',
  CONFIG_VALIDATED = 'config_validated',
  CONFIG_IMPORTED = 'config_imported',
  CONFIG_EXPORTED = 'config_exported',
  CONFIG_BACKUP_CREATED = 'config_backup_created',
  CONFIG_RESTORED = 'config_restored',
  CACHE_INSTANCE_CREATED = 'cache_instance_created',
  CACHE_INSTANCE_DESTROYED = 'cache_instance_destroyed',
  CACHE_INSTANCE_RELOADED = 'cache_instance_reloaded',
  PERFORMANCE_WARNING = 'performance_warning',
  PERFORMANCE_CRITICAL = 'performance_critical',
  MEMORY_WARNING = 'memory_warning',
  MEMORY_CRITICAL = 'memory_critical',
  CACHE_HIT_RATE_LOW = 'cache_hit_rate_low',
  CACHE_CLEANUP_COMPLETED = 'cache_cleanup_completed',
  CACHE_STATS_UPDATED = 'cache_stats_updated',
  ERROR_OCCURRED = 'error_occurred',
  MONITORING_STARTED = 'monitoring_started',
  MONITORING_STOPPED = 'monitoring_stopped'
}

/**
 * 事件严重级别
 */
export enum EventSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * 基础事件数据
 */
export interface BaseEventData {
  timestamp: Date;
  severity: EventSeverity;
  source: string;
  message: string;
  metadata?: Record<string, any>;
}

/**
 * 配置变更事件数据
 */
export interface ConfigChangedEventData extends BaseEventData {
  instanceType?: CacheInstanceType;
  oldConfig?: CacheConfig | CacheConfigs;
  newConfig: CacheConfig | CacheConfigs;
  changes: Array<{
    path: string;
    oldValue: any;
    newValue: any;
  }>;
}

/**
 * 性能事件数据
 */
export interface PerformanceEventData extends BaseEventData {
  instanceType: CacheInstanceType;
  metric: string;
  value: number;
  threshold: number;
  recommendation?: string;
}

/**
 * 内存事件数据
 */
export interface MemoryEventData extends BaseEventData {
  instanceType?: CacheInstanceType;
  currentUsage: number;
  maxUsage: number;
  usagePercentage: number;
}

/**
 * 缓存统计事件数据
 */
export interface CacheStatsEventData extends BaseEventData {
  instanceType: CacheInstanceType;
  stats: {
    hitRate: number;
    missRate: number;
    size: number;
    maxSize: number;
    memoryUsage: number;
  };
}

/**
 * 错误事件数据
 */
export interface ErrorEventData extends BaseEventData {
  error: Error;
  context?: Record<string, any>;
  stackTrace?: string;
}

/**
 * 事件监听器配置
 */
export interface EventListenerConfig {
  eventTypes: CacheEventType[];
  severityFilter?: EventSeverity[];
  sourceFilter?: string[];
  callback: (eventType: CacheEventType, data: BaseEventData) => void | Promise<void>;
  once?: boolean;
  enabled?: boolean;
}

/**
 * 通知渠道配置
 */
export interface NotificationChannelConfig {
  type: 'console' | 'file' | 'webhook' | 'email' | 'custom';
  enabled: boolean;
  severityFilter?: EventSeverity[];
  eventTypeFilter?: CacheEventType[];
  config: Record<string, any>;
}

/**
 * 文件通知配置
 */
export interface FileNotificationConfig {
  filePath: string;
  maxFileSize?: number;
  rotateOnSize?: boolean;
  dateFormat?: string;
}

/**
 * Webhook通知配置
 */
export interface WebhookNotificationConfig {
  url: string;
  method?: 'POST' | 'PUT';
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

/**
 * 邮件通知配置
 */
export interface EmailNotificationConfig {
  smtp: {
    host: string;
    port: number;
    secure?: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  from: string;
  to: string[];
  subject?: string;
}

/**
 * 缓存事件通知管理器
 */
export class CacheEventNotification extends EventEmitter {
  private static instance: CacheEventNotification;
  private eventListeners: Map<string, EventListenerConfig> = new Map();
  private notificationChannels: Map<string, NotificationChannelConfig> = new Map();
  private eventHistory: Array<{ eventType: CacheEventType; data: BaseEventData }> = [];
  private maxHistorySize: number = 1000;
  private isEnabled: boolean = true;

  private constructor() {
    super();
    this.setMaxListeners(100); // 增加最大监听器数量
    this.initializeDefaultChannels();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): CacheEventNotification {
    if (!CacheEventNotification.instance) {
      CacheEventNotification.instance = new CacheEventNotification();
    }
    return CacheEventNotification.instance;
  }

  /**
   * 初始化默认通知渠道
   */
  private initializeDefaultChannels(): void {
    // 控制台通知渠道
    this.addNotificationChannel('console', {
      type: 'console',
      enabled: true,
      severityFilter: [EventSeverity.WARNING, EventSeverity.ERROR, EventSeverity.CRITICAL],
      config: {
        colorize: true,
        includeTimestamp: true,
        includeMetadata: false
      }
    });

    // 文件通知渠道（仅错误和关键事件）
    this.addNotificationChannel('file', {
      type: 'file',
      enabled: false, // 默认禁用，需要手动启用
      severityFilter: [EventSeverity.ERROR, EventSeverity.CRITICAL],
      config: {
        filePath: './logs/cache-events.log',
        maxFileSize: 10 * 1024 * 1024, // 10MB
        rotateOnSize: true,
        dateFormat: 'YYYY-MM-DD HH:mm:ss'
      } as FileNotificationConfig
    });
  }

  /**
   * 启用/禁用事件通知
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * 检查是否启用
   */
  public isNotificationEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * 添加事件监听器
   */
  public addEventListener(
    id: string,
    config: EventListenerConfig
  ): void {
    this.eventListeners.set(id, config);

    // 为每个事件类型注册监听器
    for (const eventType of config.eventTypes) {
      const handler = (data: BaseEventData) => {
        if (!config.enabled && config.enabled !== undefined) {
          return;
        }

        // 严重级别过滤
        if (config.severityFilter && !config.severityFilter.includes(data.severity)) {
          return;
        }

        // 来源过滤
        if (config.sourceFilter && !config.sourceFilter.includes(data.source)) {
          return;
        }

        // 执行回调
        try {
          const result = config.callback(eventType, data);
          if (result instanceof Promise) {
            result.catch(error => {
              console.error(`Error in event listener ${id}:`, error);
            });
          }
        } catch (error) {
          console.error(`Error in event listener ${id}:`, error);
        }
      };

      if (config.once) {
        this.once(eventType, handler);
      } else {
        this.on(eventType, handler);
      }
    }
  }

  /**
   * 移除事件监听器
   */
  public removeEventListener(id: string): void {
    const config = this.eventListeners.get(id);
    if (config) {
      // 移除所有相关的事件监听器
      for (const eventType of config.eventTypes) {
        this.removeAllListeners(eventType);
      }
      this.eventListeners.delete(id);
    }
  }

  /**
   * 获取所有监听器
   */
  public getListeners(): Map<string, EventListenerConfig> {
    return new Map(this.eventListeners);
  }

  /**
   * 添加通知渠道
   */
  public addNotificationChannel(
    id: string,
    config: NotificationChannelConfig
  ): void {
    this.notificationChannels.set(id, config);
  }

  /**
   * 移除通知渠道
   */
  public removeNotificationChannel(id: string): void {
    this.notificationChannels.delete(id);
  }

  /**
   * 获取所有通知渠道
   */
  public getNotificationChannels(): Map<string, NotificationChannelConfig> {
    return new Map(this.notificationChannels);
  }

  /**
   * 发送事件通知
   */
  public async emitEvent(
    eventType: CacheEventType,
    data: BaseEventData
  ): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    // 添加到历史记录
    this.addToHistory(eventType, data);

    // 发送到EventEmitter
    this.emit(eventType, data);

    // 发送到通知渠道
    await this.sendToNotificationChannels(eventType, data);
  }

  /**
   * 发送配置变更事件
   */
  public async emitConfigChanged(
    data: Omit<ConfigChangedEventData, 'timestamp'>
  ): Promise<void> {
    await this.emitEvent(CacheEventType.CONFIG_CHANGED, {
      ...data,
      timestamp: new Date()
    });
  }

  /**
   * 发送性能警告事件
   */
  public async emitPerformanceWarning(
    data: Omit<PerformanceEventData, 'timestamp' | 'severity'>
  ): Promise<void> {
    await this.emitEvent(CacheEventType.PERFORMANCE_WARNING, {
      ...data,
      timestamp: new Date(),
      severity: EventSeverity.WARNING
    });
  }

  /**
   * 发送性能关键事件
   */
  public async emitPerformanceCritical(
    data: Omit<PerformanceEventData, 'timestamp' | 'severity'>
  ): Promise<void> {
    await this.emitEvent(CacheEventType.PERFORMANCE_CRITICAL, {
      ...data,
      timestamp: new Date(),
      severity: EventSeverity.CRITICAL
    });
  }

  /**
   * 发送内存警告事件
   */
  public async emitMemoryWarning(
    data: Omit<MemoryEventData, 'timestamp' | 'severity'>
  ): Promise<void> {
    await this.emitEvent(CacheEventType.MEMORY_WARNING, {
      ...data,
      timestamp: new Date(),
      severity: EventSeverity.WARNING
    });
  }

  /**
   * 发送缓存统计更新事件
   */
  public async emitCacheStatsUpdated(
    data: Omit<CacheStatsEventData, 'timestamp' | 'severity'>
  ): Promise<void> {
    await this.emitEvent(CacheEventType.CACHE_STATS_UPDATED, {
      ...data,
      timestamp: new Date(),
      severity: EventSeverity.INFO
    });
  }

  /**
   * 发送错误事件
   */
  public async emitError(
    data: Omit<ErrorEventData, 'timestamp' | 'severity' | 'stackTrace'>
  ): Promise<void> {
    const errorEventData: ErrorEventData = {
      ...data,
      timestamp: new Date(),
      severity: EventSeverity.ERROR,
      stackTrace: data.error?.stack
    };
    await this.emitEvent(CacheEventType.ERROR_OCCURRED, errorEventData);
  }

  /**
   * 发送到通知渠道
   */
  private async sendToNotificationChannels(
    eventType: CacheEventType,
    data: BaseEventData
  ): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const [channelId, channel] of this.notificationChannels) {
      if (!channel.enabled) {
        continue;
      }

      // 严重级别过滤
      if (channel.severityFilter && !channel.severityFilter.includes(data.severity)) {
        continue;
      }

      // 事件类型过滤
      if (channel.eventTypeFilter && !channel.eventTypeFilter.includes(eventType)) {
        continue;
      }

      promises.push(this.sendToChannel(channelId, channel, eventType, data));
    }

    await Promise.allSettled(promises);
  }

  /**
   * 发送到指定渠道
   */
  private async sendToChannel(
    channelId: string,
    channel: NotificationChannelConfig,
    eventType: CacheEventType,
    data: BaseEventData
  ): Promise<void> {
    try {
      switch (channel.type) {
        case 'console':
          this.sendToConsole(channel, eventType, data);
          break;
        case 'file':
          await this.sendToFile(channel, eventType, data);
          break;
        case 'webhook':
          await this.sendToWebhook(channel, eventType, data);
          break;
        case 'email':
          await this.sendToEmail(channel, eventType, data);
          break;
        case 'custom':
          await this.sendToCustomChannel(channel, eventType, data);
          break;
      }
    } catch (error) {
      console.error(`Failed to send notification to channel ${channelId}:`, error);
    }
  }

  /**
   * 发送到控制台
   */
  private sendToConsole(
    channel: NotificationChannelConfig,
    eventType: CacheEventType,
    data: BaseEventData
  ): void {
    const config = channel.config;
    let message = `[${eventType}] ${data.message}`;

    if (config.includeTimestamp) {
      message = `${data.timestamp.toISOString()} ${message}`;
    }

    if (config.includeMetadata && data.metadata) {
      message += ` | Metadata: ${JSON.stringify(data.metadata)}`;
    }

    // 根据严重级别选择输出方法
    switch (data.severity) {
      case EventSeverity.ERROR:
      case EventSeverity.CRITICAL:
        console.error(message);
        break;
      case EventSeverity.WARNING:
        console.warn(message);
        break;
      default:
        console.log(message);
    }
  }

  /**
   * 发送到文件
   */
  private async sendToFile(
    channel: NotificationChannelConfig,
    eventType: CacheEventType,
    data: BaseEventData
  ): Promise<void> {
    const config = channel.config as FileNotificationConfig;
    const fs = await import('fs/promises');
    const path = await import('path');

    // 确保目录存在
    const dir = path.dirname(config.filePath);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }

    // 格式化消息
    const timestamp = config.dateFormat
      ? this.formatDate(data.timestamp, config.dateFormat)
      : data.timestamp.toISOString();

    const logEntry = {
      timestamp,
      eventType,
      severity: data.severity,
      source: data.source,
      message: data.message,
      metadata: data.metadata
    };

    const logLine = JSON.stringify(logEntry) + '\n';

    // 写入文件
    await fs.appendFile(config.filePath, logLine, 'utf8');

    // 检查文件大小并轮转
    if (config.rotateOnSize && config.maxFileSize) {
      try {
        const stats = await fs.stat(config.filePath);
        if (stats.size > config.maxFileSize) {
          await this.rotateLogFile(config.filePath);
        }
      } catch (error) {
        console.warn('Failed to check log file size:', error);
      }
    }
  }

  /**
   * 发送到Webhook
   */
  private async sendToWebhook(
    channel: NotificationChannelConfig,
    eventType: CacheEventType,
    data: BaseEventData
  ): Promise<void> {
    const config = channel.config as WebhookNotificationConfig;
    
    const payload = {
      eventType,
      timestamp: data.timestamp.toISOString(),
      severity: data.severity,
      source: data.source,
      message: data.message,
      metadata: data.metadata
    };

    // 这里应该使用实际的HTTP客户端
    // 简化实现，实际项目中应该使用axios或fetch
    console.log(`Webhook notification to ${config.url}:`, payload);
  }

  /**
   * 发送到邮件
   */
  private async sendToEmail(
    channel: NotificationChannelConfig,
    eventType: CacheEventType,
    data: BaseEventData
  ): Promise<void> {
    const config = channel.config as EmailNotificationConfig;
    
    // 这里应该使用实际的邮件发送库
    // 简化实现，实际项目中应该使用nodemailer
    console.log(`Email notification to ${config.to.join(', ')}:`, {
      subject: config.subject || `Cache Event: ${eventType}`,
      body: `${data.message}\n\nTimestamp: ${data.timestamp.toISOString()}\nSeverity: ${data.severity}\nSource: ${data.source}`
    });
  }

  /**
   * 发送到自定义渠道
   */
  private async sendToCustomChannel(
    channel: NotificationChannelConfig,
    eventType: CacheEventType,
    data: BaseEventData
  ): Promise<void> {
    // 自定义渠道处理逻辑
    if (channel.config.handler && typeof channel.config.handler === 'function') {
      await channel.config.handler(eventType, data);
    }
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(eventType: CacheEventType, data: BaseEventData): void {
    this.eventHistory.push({ eventType, data });

    // 限制历史记录大小
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.splice(0, this.eventHistory.length - this.maxHistorySize);
    }
  }

  /**
   * 获取事件历史
   */
  public getEventHistory(
    limit?: number,
    eventTypeFilter?: CacheEventType[],
    severityFilter?: EventSeverity[]
  ): Array<{ eventType: CacheEventType; data: BaseEventData }> {
    let filtered = this.eventHistory;

    if (eventTypeFilter) {
      filtered = filtered.filter(event => eventTypeFilter.includes(event.eventType));
    }

    if (severityFilter) {
      filtered = filtered.filter(event => severityFilter.includes(event.data.severity));
    }

    if (limit) {
      filtered = filtered.slice(-limit);
    }

    return filtered;
  }

  /**
   * 清除事件历史
   */
  public clearEventHistory(): void {
    this.eventHistory = [];
  }

  /**
   * 设置最大历史记录大小
   */
  public setMaxHistorySize(size: number): void {
    this.maxHistorySize = Math.max(100, size);
  }

  /**
   * 格式化日期
   */
  private formatDate(date: Date, format: string): string {
    // 简化的日期格式化实现
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  /**
   * 轮转日志文件
   */
  private async rotateLogFile(filePath: string): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');

    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const name = path.basename(filePath, ext);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rotatedPath = path.join(dir, `${name}-${timestamp}${ext}`);

    try {
      await fs.rename(filePath, rotatedPath);
    } catch (error) {
      console.warn('Failed to rotate log file:', error);
    }
  }

  /**
   * 获取统计信息
   */
  public getStatistics(): {
    totalEvents: number;
    eventsByType: Record<CacheEventType, number>;
    eventsBySeverity: Record<EventSeverity, number>;
    activeListeners: number;
    activeChannels: number;
  } {
    const eventsByType: Record<CacheEventType, number> = {} as any;
    const eventsBySeverity: Record<EventSeverity, number> = {} as any;

    for (const { eventType, data } of this.eventHistory) {
      eventsByType[eventType] = (eventsByType[eventType] || 0) + 1;
      eventsBySeverity[data.severity] = (eventsBySeverity[data.severity] || 0) + 1;
    }

    return {
      totalEvents: this.eventHistory.length,
      eventsByType,
      eventsBySeverity,
      activeListeners: this.eventListeners.size,
      activeChannels: Array.from(this.notificationChannels.values()).filter(c => c.enabled).length
    };
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    this.removeAllListeners();
    this.eventListeners.clear();
    this.notificationChannels.clear();
    this.eventHistory = [];
    CacheEventNotification.instance = undefined as any;
  }
}

// 导出默认实例
export const cacheEventNotification = CacheEventNotification.getInstance();