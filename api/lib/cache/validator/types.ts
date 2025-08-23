import { CacheConfig, CacheConfigs, CacheInstanceType } from '../types';

/**
 * 验证规则类型
 */
export type ValidationRuleType = 
  | 'required' 
  | 'range' 
  | 'format' 
  | 'dependency' 
  | 'performance' 
  | 'security' 
  | 'custom';

/**
 * 验证严重程度
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * 验证上下文
 */
export interface ValidationContext {
  instanceType?: CacheInstanceType;
  environment?: string;
  currentConfig?: CacheConfig;
  allConfigs?: CacheConfigs;
  customConstraints?: Record<string, any>;
}

/**
 * 验证问题
 */
export interface ValidationIssue {
  path: string;
  message: string;
  severity: ValidationSeverity;
  ruleType: ValidationRuleType;
  suggestion?: string;
  code?: string;
}

/**
 * 验证结果
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  info: ValidationIssue[];
  score: number; // 0-100
  performanceImpact?: {
    memory: 'low' | 'medium' | 'high';
    cpu: 'low' | 'medium' | 'high';
    network: 'low' | 'medium' | 'high';
  };
}

/**
 * 验证规则定义
 */
export interface ValidationRule {
  name: string;
  type: ValidationRuleType;
  severity: ValidationSeverity;
  description: string;
  validator: (config: CacheConfig, context?: ValidationContext) => ValidationIssue[];
  enabled: boolean;
  priority: number; // 1-10, 10 is highest
  applicableTypes?: CacheInstanceType[];
  dependencies?: string[]; // 依赖的其他规则
}

/**
 * 批量验证结果
 */
export interface BatchValidationResult {
  overall: ValidationResult;
  individual: Record<CacheInstanceType, ValidationResult>;
  crossValidation: ValidationResult;
  summary: {
    totalIssues: number;
    criticalIssues: number;
    averageScore: number;
    worstPerformer: CacheInstanceType;
    bestPerformer: CacheInstanceType;
  };
}

/**
 * 验证报告
 */
export interface ValidationReport {
  timestamp: Date;
  configVersion: string;
  validationVersion: string;
  result: ValidationResult | BatchValidationResult;
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: 'performance' | 'security' | 'reliability' | 'maintainability';
    description: string;
    implementation: string;
    estimatedImpact: string;
  }>;
  metadata: {
    rulesApplied: string[];
    validationDuration: number;
    environment: string;
  };
}

/**
 * 自定义约束
 */
export interface CustomConstraint {
  name: string;
  description: string;
  validator: (config: CacheConfig, context?: ValidationContext) => boolean;
  errorMessage: string;
  severity: ValidationSeverity;
}

/**
 * 验证器选项
 */
export interface ValidatorOptions {
  enabledRules?: string[];
  disabledRules?: string[];
  customConstraints?: CustomConstraint[];
  strictMode?: boolean;
  performanceAnalysis?: boolean;
  crossInstanceValidation?: boolean;
}

/**
 * 规则组
 */
export interface RuleGroup {
  name: string;
  description: string;
  rules: string[];
  enabled: boolean;
  priority: number;
}

/**
 * 验证统计
 */
export interface ValidationStats {
  totalValidations: number;
  successfulValidations: number;
  failedValidations: number;
  averageValidationTime: number;
  mostCommonIssues: Array<{
    issue: string;
    count: number;
    percentage: number;
  }>;
  ruleEffectiveness: Record<string, {
    triggered: number;
    falsePositives: number;
    effectiveness: number;
  }>;
}