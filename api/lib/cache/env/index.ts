// 类型定义
export * from './types';

// 映射管理
export { EnvMappingManager, envMappingManager } from './EnvMappingManager';

// 环境变量处理
export { EnvProcessor, envProcessor } from './EnvProcessor';

// 模板生成
export { EnvTemplateGenerator, envTemplateGenerator } from './EnvTemplateGenerator';

// 主配置管理器
export { EnvConfigManager, envConfigManager } from './EnvConfigManager';

// 为了向后兼容性，重新导出主要类
export { EnvConfigManager as CacheEnvConfig } from './EnvConfigManager';
export { envConfigManager as cacheEnvConfig } from './EnvConfigManager';