// 重新导出新的模块化环境变量配置功能
// 保持向后兼容性

// 导出所有类型
export * from './cache/env/types';

// 导出主要类和实例
export {
  EnvConfigManager,
  envConfigManager,
  EnvMappingManager,
  envMappingManager,
  EnvProcessor,
  envProcessor,
  EnvTemplateGenerator,
  envTemplateGenerator
} from './cache/env';

// 为了向后兼容性，重新导出主要类
export { EnvConfigManager as CacheEnvConfig } from './cache/env';
export { envConfigManager as cacheEnvConfig } from './cache/env';