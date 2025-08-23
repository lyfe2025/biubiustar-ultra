import { CacheConfig, CacheConfigs, CacheInstanceType } from '../types';
import {
  ValidationResult,
  BatchValidationResult,
  ValidationReport,
  ValidationContext,
  ValidationIssue,
  CustomConstraint,
  ValidatorOptions,
  ValidationRule
} from './types';
import { ValidationRules } from './ValidationRules';

/**
 * 缓存配置验证器
 * 提供全面的配置验证和错误处理机制
 */
export class Validator {
  private customConstraints: Map<string, CustomConstraint> = new Map();
  private options: ValidatorOptions;
  private validationStats = {
    totalValidations: 0,
    successfulValidations: 0,
    failedValidations: 0,
    totalValidationTime: 0
  };

  constructor(options: ValidatorOptions = {}) {
    this.options = {
      strictMode: false,
      performanceAnalysis: true,
      crossInstanceValidation: true,
      ...options
    };
  }

  /**
   * 验证单个缓存配置
   */
  public validate(
    config: CacheConfig,
    context: ValidationContext = {}
  ): ValidationResult {
    const startTime = Date.now();
    this.validationStats.totalValidations++;

    try {
      const issues: ValidationIssue[] = [];
      const rules = this.getApplicableRules(context.instanceType);

      // 执行规则验证
      for (const rule of rules) {
        if (this.shouldApplyRule(rule)) {
          try {
            const ruleIssues = rule.validator(config, context);
            issues.push(...ruleIssues);
          } catch (error) {
            console.warn(`Validation rule '${rule.name}' failed:`, error);
            if (this.options.strictMode) {
              issues.push({
                path: 'validation',
                message: `Validation rule '${rule.name}' failed: ${error}`,
                severity: 'error',
                ruleType: 'custom',
                code: 'RULE_EXECUTION_ERROR'
              });
            }
          }
        }
      }

      // 执行自定义约束验证
      for (const [name, constraint] of this.customConstraints) {
        try {
          if (!constraint.validator(config, context)) {
            issues.push({
              path: 'custom',
              message: constraint.errorMessage,
              severity: constraint.severity,
              ruleType: 'custom',
              code: `CUSTOM_CONSTRAINT_${name.toUpperCase()}`
            });
          }
        } catch (error) {
          console.warn(`Custom constraint '${name}' failed:`, error);
        }
      }

      // 分类问题
      const errors = issues.filter(issue => issue.severity === 'error');
      const warnings = issues.filter(issue => issue.severity === 'warning');
      const info = issues.filter(issue => issue.severity === 'info');

      // 计算分数
      const score = this.calculateScore(errors, warnings, info);

      // 性能影响分析
      const performanceImpact = this.options.performanceAnalysis
        ? this.analyzePerformanceImpact(config, context)
        : undefined;

      const result: ValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings,
        info,
        score,
        performanceImpact
      };

      if (result.isValid) {
        this.validationStats.successfulValidations++;
      } else {
        this.validationStats.failedValidations++;
      }

      return result;
    } finally {
      const validationTime = Date.now() - startTime;
      this.validationStats.totalValidationTime += validationTime;
    }
  }

  /**
   * 批量验证多个缓存配置
   */
  public validateBatch(configs: CacheConfigs): BatchValidationResult {
    const individual: Record<CacheInstanceType, ValidationResult> = {} as any;
    const allIssues: ValidationIssue[] = [];
    let totalScore = 0;
    let worstScore = 100;
    let bestScore = 0;
    let worstPerformer: CacheInstanceType = 'user';
    let bestPerformer: CacheInstanceType = 'user';

    // 验证每个实例
    for (const [instanceType, config] of Object.entries(configs)) {
      const context: ValidationContext = {
        instanceType: instanceType as CacheInstanceType,
        allConfigs: configs
      };

      const result = this.validate(config, context);
      individual[instanceType as CacheInstanceType] = result;
      
      allIssues.push(...result.errors, ...result.warnings, ...result.info);
      totalScore += result.score;

      if (result.score < worstScore) {
        worstScore = result.score;
        worstPerformer = instanceType as CacheInstanceType;
      }

      if (result.score > bestScore) {
        bestScore = result.score;
        bestPerformer = instanceType as CacheInstanceType;
      }
    }

    // 跨实例验证
    const crossValidation = this.options.crossInstanceValidation
      ? this.validateCrossInstance(configs)
      : {
          isValid: true,
          errors: [],
          warnings: [],
          info: [],
          score: 100
        };

    // 整体结果
    const overallErrors = allIssues.filter(issue => issue.severity === 'error');
    const overallWarnings = allIssues.filter(issue => issue.severity === 'warning');
    const overallInfo = allIssues.filter(issue => issue.severity === 'info');

    const overall: ValidationResult = {
      isValid: overallErrors.length === 0 && crossValidation.isValid,
      errors: [...overallErrors, ...crossValidation.errors],
      warnings: [...overallWarnings, ...crossValidation.warnings],
      info: [...overallInfo, ...crossValidation.info],
      score: Math.round((totalScore + crossValidation.score) / (Object.keys(configs).length + 1))
    };

    return {
      overall,
      individual,
      crossValidation,
      summary: {
        totalIssues: allIssues.length + crossValidation.errors.length + crossValidation.warnings.length,
        criticalIssues: overallErrors.length + crossValidation.errors.length,
        averageScore: Math.round(totalScore / Object.keys(configs).length),
        worstPerformer,
        bestPerformer
      }
    };
  }

  /**
   * 跨实例验证
   */
  public validateCrossInstance(configs: CacheConfigs): ValidationResult {
    const issues: ValidationIssue[] = [];

    // 检查内存使用总量
    const totalEstimatedMemory = Object.values(configs).reduce(
      (total, config) => total + (config.maxSize * 1024), // 假设每个条目1KB
      0
    );

    if (totalEstimatedMemory > 1024 * 1024 * 1024) { // 1GB
      issues.push({
        path: 'global.memory',
        message: `Total estimated memory usage: ${Math.round(totalEstimatedMemory / 1024 / 1024)}MB exceeds 1GB`,
        severity: 'warning',
        ruleType: 'performance',
        suggestion: 'Consider reducing cache sizes or implementing memory monitoring',
        code: 'HIGH_TOTAL_MEMORY'
      });
    }

    // 检查清理间隔一致性
    const cleanupIntervals = Object.values(configs).map(config => config.cleanupInterval);
    const uniqueIntervals = [...new Set(cleanupIntervals)];
    
    if (uniqueIntervals.length > 3) {
      issues.push({
        path: 'global.cleanupInterval',
        message: 'Too many different cleanup intervals may cause scheduling conflicts',
        severity: 'info',
        ruleType: 'performance',
        suggestion: 'Consider standardizing cleanup intervals across cache instances',
        code: 'INCONSISTENT_CLEANUP_INTERVALS'
      });
    }

    // 检查TTL配置合理性
    const ttlValues = Object.entries(configs).map(([type, config]) => ({
      type,
      ttl: config.defaultTTL
    }));

    // 会话缓存应该有较短的TTL
    const sessionConfig = ttlValues.find(item => item.type === 'session');
    const userConfig = ttlValues.find(item => item.type === 'user');
    
    if (sessionConfig && userConfig && sessionConfig.ttl > userConfig.ttl) {
      issues.push({
        path: 'session.defaultTTL',
        message: 'Session cache TTL should typically be shorter than user cache TTL',
        severity: 'warning',
        ruleType: 'security',
        suggestion: 'Consider reducing session cache TTL for better security',
        code: 'SESSION_TTL_TOO_LONG'
      });
    }

    const errors = issues.filter(issue => issue.severity === 'error');
    const warnings = issues.filter(issue => issue.severity === 'warning');
    const info = issues.filter(issue => issue.severity === 'info');

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      info,
      score: this.calculateScore(errors, warnings, info)
    };
  }

  /**
   * 生成验证报告
   */
  public generateReport(
    result: ValidationResult | BatchValidationResult,
    configVersion: string = '1.0.0'
  ): ValidationReport {
    const recommendations = this.generateRecommendations(result);
    const rulesApplied = ValidationRules.getEnabledRules().map(rule => rule.name);

    return {
      timestamp: new Date(),
      configVersion,
      validationVersion: '1.0.0',
      result,
      recommendations,
      metadata: {
        rulesApplied,
        validationDuration: this.getAverageValidationTime(),
        environment: process.env.NODE_ENV || 'development'
      }
    };
  }

  /**
   * 设置自定义约束
   */
  public setCustomConstraint(name: string, constraint: CustomConstraint): void {
    this.customConstraints.set(name, constraint);
  }

  /**
   * 获取自定义约束
   */
  public getCustomConstraint(name: string): CustomConstraint | undefined {
    return this.customConstraints.get(name);
  }

  /**
   * 移除自定义约束
   */
  public removeCustomConstraint(name: string): boolean {
    return this.customConstraints.delete(name);
  }

  /**
   * 获取验证统计
   */
  public getValidationStats() {
    return {
      ...this.validationStats,
      averageValidationTime: this.getAverageValidationTime(),
      successRate: this.validationStats.totalValidations > 0
        ? this.validationStats.successfulValidations / this.validationStats.totalValidations
        : 0
    };
  }

  /**
   * 重置验证统计
   */
  public resetStats(): void {
    this.validationStats = {
      totalValidations: 0,
      successfulValidations: 0,
      failedValidations: 0,
      totalValidationTime: 0
    };
  }

  /**
   * 获取适用的验证规则
   */
  private getApplicableRules(instanceType?: CacheInstanceType): ValidationRule[] {
    let rules = ValidationRules.getEnabledRules();

    // 过滤启用/禁用的规则
    if (this.options.enabledRules) {
      rules = rules.filter(rule => this.options.enabledRules!.includes(rule.name));
    }

    if (this.options.disabledRules) {
      rules = rules.filter(rule => !this.options.disabledRules!.includes(rule.name));
    }

    // 过滤实例类型特定的规则
    if (instanceType) {
      rules = rules.filter(rule => 
        !rule.applicableTypes || rule.applicableTypes.includes(instanceType)
      );
    }

    // 按优先级排序
    return rules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 判断是否应该应用规则
   */
  private shouldApplyRule(rule: ValidationRule): boolean {
    return rule.enabled;
  }

  /**
   * 计算验证分数
   */
  private calculateScore(
    errors: ValidationIssue[],
    warnings: ValidationIssue[],
    info: ValidationIssue[]
  ): number {
    let score = 100;
    
    // 错误扣分更多
    score -= errors.length * 20;
    score -= warnings.length * 5;
    score -= info.length * 1;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * 分析性能影响
   */
  private analyzePerformanceImpact(
    config: CacheConfig,
    context: ValidationContext
  ) {
    const memoryUsage = config.maxSize * 1024; // 假设每个条目1KB
    const cleanupFrequency = config.cleanupInterval;
    
    return {
      memory: memoryUsage > 100 * 1024 * 1024 ? 'high' : 
              memoryUsage > 10 * 1024 * 1024 ? 'medium' : 'low',
      cpu: cleanupFrequency < 30000 ? 'high' : 
           cleanupFrequency < 120000 ? 'medium' : 'low',
      network: 'low' // 缓存通常减少网络使用
    } as const;
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(
    result: ValidationResult | BatchValidationResult
  ) {
    const recommendations = [];
    const issues = 'overall' in result ? result.overall.errors.concat(result.overall.warnings) : result.errors.concat(result.warnings);

    // 基于问题生成建议
    const memoryIssues = issues.filter(issue => issue.code?.includes('MEMORY'));
    if (memoryIssues.length > 0) {
      recommendations.push({
        priority: 'high' as const,
        category: 'performance' as const,
        description: 'Optimize memory usage across cache instances',
        implementation: 'Review and adjust maxSize values, implement memory monitoring',
        estimatedImpact: 'Reduced memory footprint and improved system stability'
      });
    }

    const ttlIssues = issues.filter(issue => issue.code?.includes('TTL'));
    if (ttlIssues.length > 0) {
      recommendations.push({
        priority: 'medium' as const,
        category: 'performance' as const,
        description: 'Optimize TTL configuration for better cache effectiveness',
        implementation: 'Adjust TTL values based on data access patterns',
        estimatedImpact: 'Improved cache hit rates and reduced data staleness'
      });
    }

    const securityIssues = issues.filter(issue => issue.ruleType === 'security');
    if (securityIssues.length > 0) {
      recommendations.push({
        priority: 'high' as const,
        category: 'security' as const,
        description: 'Address security-related configuration issues',
        implementation: 'Review and adjust security-sensitive cache settings',
        estimatedImpact: 'Enhanced security posture and reduced risk exposure'
      });
    }

    return recommendations;
  }

  /**
   * 获取平均验证时间
   */
  private getAverageValidationTime(): number {
    return this.validationStats.totalValidations > 0
      ? this.validationStats.totalValidationTime / this.validationStats.totalValidations
      : 0;
  }
}