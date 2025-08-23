import { CacheConfigs, CacheInstanceType, OptimizationSuggestion } from '../types';

/**
 * 验证规则接口
 * 定义单个验证规则的结构和行为
 */
export interface ValidationRule {
  name: string;
  validate: (value: any, context: ValidationContext) => ValidationResult;
  description: string;
  severity: 'error' | 'warning';
}

/**
 * 验证上下文
 * 提供验证过程中需要的上下文信息
 */
export interface ValidationContext {
  instanceType: CacheInstanceType;
  configPath: string;
  fullConfig: CacheConfigs;
  fieldName: string;
}

/**
 * 验证结果
 * 单个验证规则的执行结果
 */
export interface ValidationResult {
  isValid: boolean;
  message?: string;
  suggestion?: string;
}

/**
 * 验证错误信息
 */
export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * 配置验证结果
 * 完整配置验证的最终结果
 */
export interface ConfigValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
  suggestions: string[];
}

/**
 * 规则类别
 */
export type RuleCategory = 'basic' | 'performance' | 'memory' | 'relationship' | 'custom';

/**
 * 规则配置
 */
export interface RuleConfig {
  enabled: boolean;
  category: RuleCategory;
  priority: number;
}

/**
 * 验证选项
 */
export interface ValidationOptions {
  skipWarnings?: boolean;
  enabledCategories?: RuleCategory[];
  customRules?: ValidationRule[];
}

/**
 * 性能分析结果
 */
export interface PerformanceAnalysis {
  memoryEstimate: number;
  performanceScore: number;
  bottlenecks: string[];
  recommendations: OptimizationSuggestion[];
}

/**
 * 批量验证结果
 */
export interface BatchValidationResult {
  name: string;
  result: ConfigValidationResult;
}