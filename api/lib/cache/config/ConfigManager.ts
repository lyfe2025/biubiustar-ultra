import { EventEmitter } from 'events';
import {
  CacheConfig,
  CacheConfigs,
  CacheInstanceType,
  ConfigChangeEvent,
  ConfigChangeListener,
  ConfigUpdateOptions,
  ConfigManagerState,
  PerformanceMonitorOptions
} from './types';
import { ConfigLoader } from './ConfigLoader';
import { ConfigValidator } from './ConfigValidator';
import { PerformanceMonitor } from './PerformanceMonitor';

/**
 * 缓存配置管理器
 * 负责管理缓存实例的配置、监控和优化
 */
export class ConfigManager extends EventEmitter {
  private static instance: ConfigManager;
  private currentConfig: CacheConfigs;
  private configLoader: ConfigLoader;
  private configValidator: ConfigValidator;
  private performanceMonitor: PerformanceMonitor;
  private changeListeners: Set<ConfigChangeListener> = new Set();
  private state: ConfigManagerState;
  private configVersion: string = '1.0.0';

  private constructor() {
    super();
    this.configLoader = new ConfigLoader();
    this.configValidator = new ConfigValidator();
    this.performanceMonitor = new PerformanceMonitor({
      enabled: true,
      reportInterval: 60000,
      collectDetailedStats: true,
      alertThresholds: {
        hitRate: 0.8,
        memoryUsage: 0.9,
        responseTime: 100
      }
    });
    
    this.currentConfig = this.configLoader.getDefaultConfig();
    this.state = {
      isInitialized: false,
      lastUpdate: new Date(),
      configVersion: this.configVersion,
      activeListeners: 0,
      performanceMonitoring: false,
      hotReloadEnabled: false
    };

    this.setupEventHandlers();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * 初始化配置管理器
   */
  public async initialize(): Promise<void> {
    try {
      // 加载配置
      this.currentConfig = await this.configLoader.loadConfig({
        validateOnLoad: true,
        applyEnvironmentOverrides: true,
        createBackup: true
      });

      // 启动性能监控
      this.startPerformanceMonitoring();

      this.state.isInitialized = true;
      this.state.lastUpdate = new Date();

      console.log('Cache configuration manager initialized successfully');
      this.emit('initialized', this.currentConfig);
    } catch (error) {
      console.error('Failed to initialize configuration manager:', error);
      throw error;
    }
  }

  /**
   * 获取当前配置
   */
  public getConfig(): CacheConfigs;
  public getConfig(instanceType: CacheInstanceType): CacheConfig;
  public getConfig(instanceType?: CacheInstanceType): CacheConfigs | CacheConfig {
    if (instanceType) {
      return { ...this.currentConfig[instanceType] };
    }
    return { ...this.currentConfig };
  }

  /**
   * 获取所有配置（Map格式）
   * 为了兼容性，返回Map格式的配置
   */
  public getAllConfigs(): Map<string, any> {
    const configMap = new Map();
    for (const [key, value] of Object.entries(this.currentConfig)) {
      configMap.set(key, value);
    }
    return configMap;
  }

  /**
   * 获取特定实例的配置
   */
  public getInstanceConfig(instanceType: CacheInstanceType) {
    return { ...this.currentConfig[instanceType] };
  }

  /**
   * 更新配置
   */
  public async updateConfig(
    newConfig: Partial<CacheConfigs>,
    options?: ConfigUpdateOptions
  ): Promise<void>;
  public async updateConfig(
    instanceType: CacheInstanceType,
    newConfig: Partial<any>,
    options?: ConfigUpdateOptions
  ): Promise<void>;
  public async updateConfig(
    newConfigOrInstanceType: Partial<CacheConfigs> | CacheInstanceType,
    optionsOrNewConfig?: ConfigUpdateOptions | Partial<any>,
    options: ConfigUpdateOptions = {}
  ): Promise<void> {
    // 处理重载
    if (typeof newConfigOrInstanceType === 'string') {
      // 第二种重载：updateConfig(instanceType, newConfig, options)
      const instanceType = newConfigOrInstanceType as CacheInstanceType;
      const newConfig = optionsOrNewConfig as Partial<any>;
      const partialUpdate = {
        [instanceType]: {
          ...this.currentConfig[instanceType],
          ...newConfig
        }
      };
      return this.updateConfig(partialUpdate, options);
    }
    
    // 第一种重载：updateConfig(newConfig, options)
     const configUpdate = newConfigOrInstanceType as Partial<CacheConfigs>;
     const updateOptions = (optionsOrNewConfig as ConfigUpdateOptions) || {};
     const {
       validate = true,
       backup = true,
       notifyListeners = true,
       source = 'manual'
     } = updateOptions;

    try {
       // 合并配置
       const mergedConfig = this.mergeConfigs(this.currentConfig, configUpdate);

       // 验证配置
       if (validate) {
         const validationResult = this.configValidator.validate(mergedConfig);
         if (!validationResult.isValid) {
           const errors = validationResult.errors.filter(e => e.severity === 'error');
           throw new Error(`Configuration validation failed: ${errors.map(e => e.message).join(', ')}`);
         }
       }

      // 创建备份
      if (backup) {
        await this.createConfigBackup();
      }

      // 准备变更事件
      const changeEvent: ConfigChangeEvent = {
        type: 'update',
        oldConfig: undefined, // 将在下面设置
        newConfig: undefined, // 将在下面设置
        timestamp: new Date(),
        source,
        changes: this.calculateChanges(this.currentConfig, mergedConfig)
      };

      // 更新配置
      const oldConfig = { ...this.currentConfig };
      this.currentConfig = mergedConfig;
      this.state.lastUpdate = new Date();

      // 设置变更事件的配置
      changeEvent.oldConfig = oldConfig;
      changeEvent.newConfig = mergedConfig;

      // 保存配置到文件
      await this.configLoader.saveConfig(this.currentConfig);

      // 通知监听器
      if (notifyListeners) {
        await this.notifyConfigChange(changeEvent);
      }

      console.log('Configuration updated successfully');
      this.emit('configUpdated', changeEvent);
    } catch (error) {
      console.error('Failed to update configuration:', error);
      throw error;
    }
  }

  /**
   * 更新特定实例的配置
   */
  public async updateInstanceConfig(
    instanceType: CacheInstanceType,
    newConfig: Partial<any>,
    options: ConfigUpdateOptions = {}
  ): Promise<void> {
    const partialUpdate = {
      [instanceType]: {
        ...this.currentConfig[instanceType],
        ...newConfig
      }
    };

    await this.updateConfig(partialUpdate, options);
  }

  /**
   * 重新加载配置
   */
  public async reloadConfig(): Promise<void> {
    try {
      const newConfig = await this.configLoader.loadConfig({
        validateOnLoad: true,
        applyEnvironmentOverrides: true
      });

      const changeEvent: ConfigChangeEvent = {
        type: 'reload',
        oldConfig: { ...this.currentConfig },
        newConfig,
        timestamp: new Date(),
        source: 'manual',
        changes: this.calculateChanges(this.currentConfig, newConfig)
      };

      this.currentConfig = newConfig;
      this.state.lastUpdate = new Date();

      await this.notifyConfigChange(changeEvent);
      
      console.log('Configuration reloaded successfully');
      this.emit('configReloaded', changeEvent);
    } catch (error) {
      console.error('Failed to reload configuration:', error);
      throw error;
    }
  }

  /**
   * 重置为默认配置
   */
  public async resetToDefault(): Promise<void> {
    const defaultConfig = this.configLoader.getDefaultConfig();
    
    const changeEvent: ConfigChangeEvent = {
      type: 'reset',
      oldConfig: { ...this.currentConfig },
      newConfig: defaultConfig,
      timestamp: new Date(),
      source: 'manual',
      changes: this.calculateChanges(this.currentConfig, defaultConfig)
    };

    this.currentConfig = defaultConfig;
    this.state.lastUpdate = new Date();

    await this.configLoader.saveConfig(this.currentConfig);
    await this.notifyConfigChange(changeEvent);
    
    console.log('Configuration reset to default');
    this.emit('configReset', changeEvent);
  }

  /**
   * 添加配置变更监听器
   */
  public addChangeListener(listener: ConfigChangeListener): void {
    this.changeListeners.add(listener);
    this.state.activeListeners = this.changeListeners.size;
  }

  /**
   * 移除配置变更监听器
   */
  public removeChangeListener(listener: ConfigChangeListener): boolean {
    const removed = this.changeListeners.delete(listener);
    this.state.activeListeners = this.changeListeners.size;
    return removed;
  }

  /**
   * 获取性能报告
   */
  public async getPerformanceReport(instanceType: CacheInstanceType) {
    return await this.performanceMonitor.generatePerformanceReport(instanceType);
  }

  /**
   * 获取优化建议
   */
  public getOptimizationSuggestions(instanceType?: CacheInstanceType) {
    if (instanceType) {
      return this.performanceMonitor.generateOptimizationSuggestions(instanceType);
    }
    
    // 返回所有实例的优化建议
    const allSuggestions = [];
    for (const type of Object.keys(this.currentConfig) as CacheInstanceType[]) {
      allSuggestions.push(...this.performanceMonitor.generateOptimizationSuggestions(type));
    }
    return allSuggestions;
  }

  /**
   * 验证当前配置
   */
  public validateCurrentConfig() {
    return this.configValidator.validate(this.currentConfig);
  }

  /**
   * 验证指定配置
   */
  public validateConfig(config: CacheConfigs) {
    return this.configValidator.validate(config);
  }

  /**
   * 获取管理器状态
   */
  public getState(): ConfigManagerState {
    return { ...this.state };
  }

  /**
   * 启动性能监控
   */
  public startPerformanceMonitoring(): void {
    const instanceTypes = Object.keys(this.currentConfig) as CacheInstanceType[];
    this.performanceMonitor.startMonitoring(instanceTypes);
    this.state.performanceMonitoring = true;
  }

  /**
   * 停止性能监控
   */
  public stopPerformanceMonitoring(): void {
    this.performanceMonitor.stopMonitoring();
    this.state.performanceMonitoring = false;
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
    // 监听性能报告
    this.performanceMonitor.on('performanceReport', (report) => {
      this.emit('performanceReport', report);
    });

    // 监听性能警报
    this.performanceMonitor.on('alert', (alert) => {
      this.emit('performanceAlert', alert);
    });
  }

  /**
   * 合并配置
   */
  private mergeConfigs(current: CacheConfigs, update: Partial<CacheConfigs>): CacheConfigs {
    const merged = { ...current };
    
    for (const [instanceType, instanceConfig] of Object.entries(update)) {
      if (instanceConfig) {
        merged[instanceType as CacheInstanceType] = {
          ...current[instanceType as CacheInstanceType],
          ...instanceConfig
        };
      }
    }
    
    return merged;
  }

  /**
   * 计算配置变更
   */
  private calculateChanges(oldConfig: CacheConfigs, newConfig: CacheConfigs) {
    const changes: Array<{ path: string; oldValue: any; newValue: any }> = [];
    
    for (const [instanceType, instanceConfig] of Object.entries(newConfig)) {
      const oldInstanceConfig = oldConfig[instanceType as CacheInstanceType];
      
      for (const [field, newValue] of Object.entries(instanceConfig)) {
        const oldValue = oldInstanceConfig[field as keyof typeof oldInstanceConfig];
        if (oldValue !== newValue) {
          changes.push({
            path: `${instanceType}.${field}`,
            oldValue,
            newValue
          });
        }
      }
    }
    
    return changes;
  }

  /**
   * 通知配置变更
   */
  private async notifyConfigChange(event: ConfigChangeEvent): Promise<void> {
    const promises = Array.from(this.changeListeners).map(async (listener) => {
      try {
        await listener(event);
      } catch (error) {
        console.error('Error in config change listener:', error);
      }
    });
    
    await Promise.all(promises);
  }

  /**
   * 创建配置备份
   */
  private async createConfigBackup(): Promise<void> {
    try {
      await this.configLoader.saveConfig(
        this.currentConfig,
        `${this.configLoader.getConfigPath()}.backup.${Date.now()}`
      );
    } catch (error) {
      console.warn('Failed to create configuration backup:', error);
    }
  }

  /**
   * 销毁管理器
   */
  public destroy(): void {
    this.stopPerformanceMonitoring();
    this.changeListeners.clear();
    this.removeAllListeners();
    this.state.isInitialized = false;
    console.log('Configuration manager destroyed');
  }
}