/**
 * 缓存配置验证器模块 - 向后兼容性导出
 * 重新导出新的模块化验证器结构
 */

// 重新导出新的验证器模块
export * from './cache/validator';

// 为了保持完全的向后兼容性，重新导出主要的类和实例
export {
  Validator as CacheConfigValidator,
  cacheConfigValidator
} from './cache/validator';