/**
 * 环境变量映射配置
 */
export interface EnvVarMapping {
  envKey: string;
  configPath: string;
  type: 'number' | 'boolean' | 'string';
  defaultValue?: any;
  validator?: (value: any) => boolean;
  transformer?: (value: string) => any;
}

/**
 * 环境变量覆盖结果
 */
export interface EnvOverrideResult {
  success: boolean;
  overrides: Array<{
    envKey: string;
    configPath: string;
    originalValue: any;
    newValue: any;
    source: 'env' | 'default';
  }>;
  errors: Array<{
    envKey: string;
    error: string;
  }>;
  warnings: string[];
}

/**
 * 环境变量验证结果
 */
export interface EnvValidationResult {
  valid: boolean;
  issues: Array<{
    envKey: string;
    issue: string;
    severity: 'error' | 'warning';
  }>;
}

/**
 * 当前环境变量值信息
 */
export interface EnvValueInfo {
  envKey: string;
  currentValue: string | undefined;
  transformedValue: any;
  defaultValue: any;
  isValid: boolean;
}

/**
 * 环境变量映射管理器接口
 */
export interface IEnvMappingManager {
  addMapping(
    envKey: string,
    configPath: string,
    type?: 'number' | 'boolean' | 'string',
    defaultValue?: any,
    validator?: (value: any) => boolean,
    transformer?: (value: string) => any
  ): void;
  removeMapping(envKey: string): boolean;
  getMappings(): EnvVarMapping[];
  initializeDefaultMappings(): void;
}

/**
 * 环境变量处理器接口
 */
export interface IEnvProcessor {
  applyEnvOverrides(configs: any, envMappings: Map<string, EnvVarMapping>): EnvOverrideResult;
  validateEnvironmentVariables(envMappings: Map<string, EnvVarMapping>): EnvValidationResult;
  getCurrentEnvValues(envMappings: Map<string, EnvVarMapping>): Map<string, EnvValueInfo>;
}

/**
 * 环境变量模板生成器接口
 */
export interface IEnvTemplateGenerator {
  generateEnvTemplate(envMappings: Map<string, EnvVarMapping>, includeComments?: boolean): string;
  generateConfigReport(envMappings: Map<string, EnvVarMapping>, currentValues: Map<string, EnvValueInfo>): string;
}

/**
 * 环境变量配置管理器接口
 */
export interface IEnvConfigManager extends IEnvMappingManager, IEnvProcessor, IEnvTemplateGenerator {
  getOverrideHistory(): EnvOverrideResult[];
  clearOverrideHistory(): void;
  destroy(): void;
}