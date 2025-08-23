/**
 * 缓存配置验证模块
 * 提供完整的配置验证、规则管理和性能分析功能
 */

// 类型定义 - 重新导出
import type {
  ValidationRule,
  ValidationContext,
  ValidationResult,
  ValidationError,
  ConfigValidationResult,
  RuleCategory,
  RuleConfig,
  ValidationOptions,
  PerformanceAnalysis,
  BatchValidationResult
} from './types';

export type {
  ValidationRule,
  ValidationContext,
  ValidationResult,
  ValidationError,
  ConfigValidationResult,
  RuleCategory,
  RuleConfig,
  ValidationOptions,
  PerformanceAnalysis,
  BatchValidationResult
};

// 验证规则
export { ValidationRules } from './ValidationRules';

// 验证引擎
export { ValidationEngine } from './ValidationEngine';

// 规则管理器
export { RuleManager } from './RuleManager';

// 性能分析器
export { PerformanceAnalyzer } from './PerformanceAnalyzer';

// 便捷的默认实例
import { ValidationEngine } from './ValidationEngine';
import { RuleManager } from './RuleManager';
import { PerformanceAnalyzer } from './PerformanceAnalyzer';

/**
 * 默认验证引擎实例
 */
export const defaultValidationEngine = new ValidationEngine();

/**
 * 默认规则管理器实例
 */
export const defaultRuleManager = new RuleManager();

/**
 * 便捷的验证函数
 */
export const validateConfig = defaultValidationEngine.validate.bind(defaultValidationEngine);

/**
 * 便捷的性能分析函数
 */
export const analyzePerformance = PerformanceAnalyzer.analyzePerformance;

/**
 * 便捷的优化建议生成函数
 */
export const generateOptimizationSuggestions = PerformanceAnalyzer.generateOptimizationSuggestions;