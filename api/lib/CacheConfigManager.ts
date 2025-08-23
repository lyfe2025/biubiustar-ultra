// 重新导出新的模块化配置管理结构
// 保持向后兼容性

export * from './cache/config';

// 为了完全向后兼容，重新导出主要接口
export {
  ConfigManager as CacheConfigManager,
  cacheConfigManager,
  initializeCacheConfigManager
} from './cache/config';