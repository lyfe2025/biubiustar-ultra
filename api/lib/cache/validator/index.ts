/**
 * 缓存配置验证器模块
 * 提供全面的配置验证、规则管理和错误处理功能
 */

// 导出类型定义
export * from './types';

// 导入并导出验证规则管理器
import { ValidationRules } from './ValidationRules';
export { ValidationRules };

// 导入并导出核心验证器
import { Validator } from './Validator';
export { Validator };

// 创建默认验证器实例
export const cacheConfigValidator = new Validator({
  strictMode: false,
  performanceAnalysis: true,
  crossInstanceValidation: true
});

// 为了保持向后兼容性，重新导出为原始类名
export { Validator as CacheConfigValidator } from './Validator';

// 便捷方法导出
export const validateConfig = cacheConfigValidator.validate.bind(cacheConfigValidator);
export const validateBatch = cacheConfigValidator.validateBatch.bind(cacheConfigValidator);
export const validateCrossInstance = cacheConfigValidator.validateCrossInstance.bind(cacheConfigValidator);
export const generateReport = cacheConfigValidator.generateReport.bind(cacheConfigValidator);
export const setCustomConstraint = cacheConfigValidator.setCustomConstraint.bind(cacheConfigValidator);
export const getCustomConstraint = cacheConfigValidator.getCustomConstraint.bind(cacheConfigValidator);
export const getValidationStats = cacheConfigValidator.getValidationStats.bind(cacheConfigValidator);

// 规则管理便捷方法
export const addRule = ValidationRules.addRule.bind(ValidationRules);
export const removeRule = ValidationRules.removeRule.bind(ValidationRules);
export const getRule = ValidationRules.getRule.bind(ValidationRules);
export const enableRule = ValidationRules.enableRule.bind(ValidationRules);
export const disableRule = ValidationRules.disableRule.bind(ValidationRules);
export const getEnabledRules = ValidationRules.getEnabledRules.bind(ValidationRules);
export const getStats = ValidationRules.getStats.bind(ValidationRules);

/**
 * 初始化验证器配置
 * @param options 验证器选项
 */
export function initializeCacheConfigValidator(options?: ConstructorParameters<typeof Validator>[0]) {
  if (options) {
    // 创建新的验证器实例并替换默认实例的方法
    const newValidator = new Validator(options);
    Object.assign(cacheConfigValidator, newValidator);
  }
  return cacheConfigValidator;
}