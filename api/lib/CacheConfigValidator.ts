import { CacheConfig, CacheInstanceType } from '../config/cache';

/**
 * 验证规则类型
 */
export type ValidationRule = {
  name: string;
  description: string;
  validate: (config: CacheConfig, context?: ValidationContext) => ValidationResult;
  severity: 'error' | 'warning' | 'info';
  category: 'performance' | 'memory' | 'security' | 'compatibility' | 'business';
};

/**
 * 验证上下文
 */
export interface ValidationContext {
  instanceType: CacheInstanceType;
  environment: string;
  systemMemory?: number;
  existingConfigs?: Map<CacheInstanceType, CacheConfig>;
  customConstraints?: Record<string, any>;
}

/**
 * 验证结果
 */
export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100 分数
  issues: ValidationIssue[];
  suggestions: string[];
  estimatedImpact?: PerformanceImpact;
}

/**
 * 验证问题
 */
export interface ValidationIssue {
  rule: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  field: keyof CacheConfig;
  currentValue: any;
  suggestedValue?: any;
  category: string;
}

/**
 * 性能影响评估
 */
export interface PerformanceImpact {
  memoryUsage: 'low' | 'medium' | 'high';
  cpuUsage: 'low' | 'medium' | 'high';
  networkImpact: 'low' | 'medium' | 'high';
  scalability: 'poor' | 'fair' | 'good' | 'excellent';
}

/**
 * 批量验证结果
 */
export interface BatchValidationResult {
  overallScore: number;
  totalIssues: number;
  results: Map<CacheInstanceType, ValidationResult>;
  crossInstanceIssues: ValidationIssue[];
  recommendations: string[];
}

/**
 * 缓存配置验证器
 * 提供全面的配置验证和错误处理机制
 */
export class CacheConfigValidator {
  private rules: Map<string, ValidationRule> = new Map();
  private customConstraints: Map<string, any> = new Map();

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * 初始化默认验证规则
   */
  private initializeDefaultRules(): void {
    // 基础配置验证规则
    this.addRule({
      name: 'maxSize_positive',
      description: 'maxSize must be a positive integer',
      severity: 'error',
      category: 'compatibility',
      validate: (config) => {
        const isValid = Number.isInteger(config.maxSize) && config.maxSize > 0;
        return {
          isValid,
          score: isValid ? 100 : 0,
          issues: isValid ? [] : [{
            rule: 'maxSize_positive',
            severity: 'error',
            message: 'maxSize must be a positive integer',
            field: 'maxSize',
            currentValue: config.maxSize,
            suggestedValue: 1000,
            category: 'compatibility'
          }],
          suggestions: isValid ? [] : ['Set maxSize to a positive integer value']
        };
      }
    });

    this.addRule({
      name: 'defaultTTL_positive',
      description: 'defaultTTL must be a positive number',
      severity: 'error',
      category: 'compatibility',
      validate: (config) => {
        const isValid = typeof config.defaultTTL === 'number' && config.defaultTTL > 0;
        return {
          isValid,
          score: isValid ? 100 : 0,
          issues: isValid ? [] : [{
            rule: 'defaultTTL_positive',
            severity: 'error',
            message: 'defaultTTL must be a positive number',
            field: 'defaultTTL',
            currentValue: config.defaultTTL,
            suggestedValue: 300000, // 5 minutes
            category: 'compatibility'
          }],
          suggestions: isValid ? [] : ['Set defaultTTL to a positive number in milliseconds']
        };
      }
    });

    this.addRule({
      name: 'cleanupInterval_positive',
      description: 'cleanupInterval must be a positive number',
      severity: 'error',
      category: 'compatibility',
      validate: (config) => {
        const isValid = typeof config.cleanupInterval === 'number' && config.cleanupInterval > 0;
        return {
          isValid,
          score: isValid ? 100 : 0,
          issues: isValid ? [] : [{
            rule: 'cleanupInterval_positive',
            severity: 'error',
            message: 'cleanupInterval must be a positive number',
            field: 'cleanupInterval',
            currentValue: config.cleanupInterval,
            suggestedValue: 60000, // 1 minute
            category: 'compatibility'
          }],
          suggestions: isValid ? [] : ['Set cleanupInterval to a positive number in milliseconds']
        };
      }
    });

    // 性能相关验证规则
    this.addRule({
      name: 'maxSize_performance',
      description: 'Check maxSize for performance implications',
      severity: 'warning',
      category: 'performance',
      validate: (config, context) => {
        const issues: ValidationIssue[] = [];
        const suggestions: string[] = [];
        let score = 100;

        if (config.maxSize > 50000) {
          score -= 30;
          issues.push({
            rule: 'maxSize_performance',
            severity: 'warning',
            message: 'Very large maxSize may impact performance',
            field: 'maxSize',
            currentValue: config.maxSize,
            suggestedValue: 10000,
            category: 'performance'
          });
          suggestions.push('Consider reducing maxSize or implementing cache partitioning');
        } else if (config.maxSize > 10000) {
          score -= 10;
          issues.push({
            rule: 'maxSize_performance',
            severity: 'info',
            message: 'Large maxSize detected, monitor memory usage',
            field: 'maxSize',
            currentValue: config.maxSize,
            category: 'performance'
          });
          suggestions.push('Monitor memory usage and consider cache partitioning if needed');
        }

        return {
          isValid: true,
          score,
          issues,
          suggestions,
          estimatedImpact: this.estimatePerformanceImpact(config)
        };
      }
    });

    this.addRule({
      name: 'ttl_optimization',
      description: 'Check TTL for optimization opportunities',
      severity: 'info',
      category: 'performance',
      validate: (config, context) => {
        const issues: ValidationIssue[] = [];
        const suggestions: string[] = [];
        let score = 100;

        // TTL 太短可能导致频繁的缓存失效
        if (config.defaultTTL < 60000) { // 1 minute
          score -= 20;
          issues.push({
            rule: 'ttl_optimization',
            severity: 'warning',
            message: 'Very short TTL may cause frequent cache misses',
            field: 'defaultTTL',
            currentValue: config.defaultTTL,
            suggestedValue: 300000, // 5 minutes
            category: 'performance'
          });
          suggestions.push('Consider increasing TTL to reduce cache misses');
        }

        // TTL 太长可能导致数据过时
        if (config.defaultTTL > 3600000) { // 1 hour
          score -= 10;
          issues.push({
            rule: 'ttl_optimization',
            severity: 'info',
            message: 'Long TTL may lead to stale data',
            field: 'defaultTTL',
            currentValue: config.defaultTTL,
            category: 'performance'
          });
          suggestions.push('Ensure data freshness requirements are met with current TTL');
        }

        return { isValid: true, score, issues, suggestions };
      }
    });

    // 内存使用验证规则
    this.addRule({
      name: 'memory_estimation',
      description: 'Estimate memory usage and provide recommendations',
      severity: 'info',
      category: 'memory',
      validate: (config, context) => {
        const issues: ValidationIssue[] = [];
        const suggestions: string[] = [];
        let score = 100;

        // 估算内存使用（假设每个条目平均 1KB）
        const estimatedMemoryMB = (config.maxSize * 1024) / (1024 * 1024);
        
        if (estimatedMemoryMB > 500) { // 500MB
          score -= 40;
          issues.push({
            rule: 'memory_estimation',
            severity: 'warning',
            message: `Estimated memory usage: ${estimatedMemoryMB.toFixed(1)}MB`,
            field: 'maxSize',
            currentValue: config.maxSize,
            category: 'memory'
          });
          suggestions.push('Consider implementing memory monitoring and alerts');
        } else if (estimatedMemoryMB > 100) { // 100MB
          score -= 10;
          issues.push({
            rule: 'memory_estimation',
            severity: 'info',
            message: `Estimated memory usage: ${estimatedMemoryMB.toFixed(1)}MB`,
            field: 'maxSize',
            currentValue: config.maxSize,
            category: 'memory'
          });
        }

        return { isValid: true, score, issues, suggestions };
      }
    });

    // 清理间隔验证规则
    this.addRule({
      name: 'cleanup_efficiency',
      description: 'Check cleanup interval efficiency',
      severity: 'info',
      category: 'performance',
      validate: (config) => {
        const issues: ValidationIssue[] = [];
        const suggestions: string[] = [];
        let score = 100;

        // 清理间隔太频繁可能影响性能
        if (config.cleanupInterval < 30000) { // 30 seconds
          score -= 20;
          issues.push({
            rule: 'cleanup_efficiency',
            severity: 'warning',
            message: 'Frequent cleanup may impact performance',
            field: 'cleanupInterval',
            currentValue: config.cleanupInterval,
            suggestedValue: 60000, // 1 minute
            category: 'performance'
          });
          suggestions.push('Consider increasing cleanup interval to reduce CPU overhead');
        }

        // 清理间隔太长可能导致内存浪费
        if (config.cleanupInterval > 600000) { // 10 minutes
          score -= 10;
          issues.push({
            rule: 'cleanup_efficiency',
            severity: 'info',
            message: 'Long cleanup interval may waste memory',
            field: 'cleanupInterval',
            currentValue: config.cleanupInterval,
            category: 'performance'
          });
          suggestions.push('Consider reducing cleanup interval to free memory sooner');
        }

        return { isValid: true, score, issues, suggestions };
      }
    });

    // 环境特定验证规则
    this.addRule({
      name: 'environment_specific',
      description: 'Environment-specific configuration checks',
      severity: 'info',
      category: 'business',
      validate: (config, context) => {
        const issues: ValidationIssue[] = [];
        const suggestions: string[] = [];
        let score = 100;

        if (context?.environment === 'production') {
          // 生产环境建议
          if (config.maxSize < 1000) {
            score -= 10;
            issues.push({
              rule: 'environment_specific',
              severity: 'info',
              message: 'Small cache size in production may limit performance',
              field: 'maxSize',
              currentValue: config.maxSize,
              category: 'business'
            });
            suggestions.push('Consider increasing cache size for production workloads');
          }
        } else if (context?.environment === 'development') {
          // 开发环境建议
          if (config.maxSize > 5000) {
            issues.push({
              rule: 'environment_specific',
              severity: 'info',
              message: 'Large cache size in development may be unnecessary',
              field: 'maxSize',
              currentValue: config.maxSize,
              category: 'business'
            });
            suggestions.push('Consider reducing cache size for development to save resources');
          }
        }

        return { isValid: true, score, issues, suggestions };
      }
    });
  }

  /**
   * 估算性能影响
   */
  private estimatePerformanceImpact(config: CacheConfig): PerformanceImpact {
    const memoryUsage = config.maxSize > 10000 ? 'high' : config.maxSize > 1000 ? 'medium' : 'low';
    const cpuUsage = config.cleanupInterval < 60000 ? 'high' : config.cleanupInterval < 300000 ? 'medium' : 'low';
    const networkImpact = config.defaultTTL < 60000 ? 'high' : config.defaultTTL < 300000 ? 'medium' : 'low';
    
    let scalability: PerformanceImpact['scalability'] = 'good';
    if (config.maxSize > 50000 || config.cleanupInterval < 30000) {
      scalability = 'poor';
    } else if (config.maxSize > 10000 || config.cleanupInterval < 60000) {
      scalability = 'fair';
    } else if (config.maxSize < 10000 && config.cleanupInterval >= 60000) {
      scalability = 'excellent';
    }

    return { memoryUsage, cpuUsage, networkImpact, scalability };
  }

  /**
   * 添加验证规则
   */
  public addRule(rule: ValidationRule): void {
    this.rules.set(rule.name, rule);
  }

  /**
   * 移除验证规则
   */
  public removeRule(ruleName: string): void {
    this.rules.delete(ruleName);
  }

  /**
   * 获取所有规则
   */
  public getRules(): ValidationRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * 验证单个配置
   */
  public validate(
    config: CacheConfig,
    context?: ValidationContext,
    ruleNames?: string[]
  ): ValidationResult {
    const rulesToApply = ruleNames 
      ? ruleNames.map(name => this.rules.get(name)).filter(Boolean) as ValidationRule[]
      : Array.from(this.rules.values());

    const allIssues: ValidationIssue[] = [];
    const allSuggestions: string[] = [];
    let totalScore = 0;
    let hasErrors = false;
    let estimatedImpact: PerformanceImpact | undefined;

    for (const rule of rulesToApply) {
      try {
        const result = rule.validate(config, context);
        
        if (!result.isValid && rule.severity === 'error') {
          hasErrors = true;
        }
        
        allIssues.push(...result.issues);
        allSuggestions.push(...result.suggestions);
        totalScore += result.score;
        
        if (result.estimatedImpact) {
          estimatedImpact = result.estimatedImpact;
        }
      } catch (error) {
        console.error(`Error applying validation rule ${rule.name}:`, error);
        allIssues.push({
          rule: rule.name,
          severity: 'error',
          message: `Validation rule failed: ${error}`,
          field: 'maxSize', // 默认字段
          currentValue: 'unknown',
          category: 'compatibility'
        });
        hasErrors = true;
      }
    }

    const averageScore = rulesToApply.length > 0 ? totalScore / rulesToApply.length : 100;
    
    return {
      isValid: !hasErrors,
      score: Math.round(averageScore),
      issues: allIssues,
      suggestions: [...new Set(allSuggestions)], // 去重
      estimatedImpact
    };
  }

  /**
   * 批量验证多个配置
   */
  public validateBatch(
    configs: Map<CacheInstanceType, CacheConfig>,
    environment: string = 'development'
  ): BatchValidationResult {
    const results = new Map<CacheInstanceType, ValidationResult>();
    const crossInstanceIssues: ValidationIssue[] = [];
    const recommendations: string[] = [];
    let totalScore = 0;
    let totalIssues = 0;

    // 验证每个配置
    for (const [type, config] of configs) {
      const context: ValidationContext = {
        instanceType: type,
        environment,
        existingConfigs: configs
      };
      
      const result = this.validate(config, context);
      results.set(type, result);
      totalScore += result.score;
      totalIssues += result.issues.length;
    }

    // 跨实例验证
    this.validateCrossInstance(configs, crossInstanceIssues, recommendations);
    
    const overallScore = configs.size > 0 ? Math.round(totalScore / configs.size) : 100;
    
    return {
      overallScore,
      totalIssues: totalIssues + crossInstanceIssues.length,
      results,
      crossInstanceIssues,
      recommendations
    };
  }

  /**
   * 跨实例配置验证
   */
  private validateCrossInstance(
    configs: Map<CacheInstanceType, CacheConfig>,
    issues: ValidationIssue[],
    recommendations: string[]
  ): void {
    const configArray = Array.from(configs.entries());
    
    // 检查总内存使用
    const totalEstimatedMemory = configArray.reduce((total, [, config]) => {
      return total + (config.maxSize * 1024) / (1024 * 1024); // MB
    }, 0);
    
    if (totalEstimatedMemory > 1000) { // 1GB
      issues.push({
        rule: 'cross_instance_memory',
        severity: 'warning',
        message: `Total estimated memory usage: ${totalEstimatedMemory.toFixed(1)}MB`,
        field: 'maxSize',
        currentValue: totalEstimatedMemory,
        category: 'memory'
      });
      recommendations.push('Consider implementing global memory limits and monitoring');
    }

    // 检查清理间隔的一致性
    const cleanupIntervals = configArray.map(([, config]) => config.cleanupInterval);
    const uniqueIntervals = new Set(cleanupIntervals);
    
    if (uniqueIntervals.size > 3) {
      issues.push({
        rule: 'cross_instance_cleanup',
        severity: 'info',
        message: 'Many different cleanup intervals may complicate monitoring',
        field: 'cleanupInterval',
        currentValue: Array.from(uniqueIntervals),
        category: 'performance'
      });
      recommendations.push('Consider standardizing cleanup intervals for easier management');
    }
  }

  /**
   * 设置自定义约束
   */
  public setCustomConstraint(key: string, value: any): void {
    this.customConstraints.set(key, value);
  }

  /**
   * 获取自定义约束
   */
  public getCustomConstraint(key: string): any {
    return this.customConstraints.get(key);
  }

  /**
   * 生成配置报告
   */
  public generateReport(result: ValidationResult | BatchValidationResult): string {
    if ('overallScore' in result) {
      return this.generateBatchReport(result);
    } else {
      return this.generateSingleReport(result);
    }
  }

  /**
   * 生成单个配置报告
   */
  private generateSingleReport(result: ValidationResult): string {
    const lines: string[] = [];
    
    lines.push('=== Cache Configuration Validation Report ===');
    lines.push(`Overall Score: ${result.score}/100`);
    lines.push(`Status: ${result.isValid ? 'VALID' : 'INVALID'}`);
    lines.push('');
    
    if (result.issues.length > 0) {
      lines.push('Issues Found:');
      for (const issue of result.issues) {
        lines.push(`  [${issue.severity.toUpperCase()}] ${issue.message}`);
        lines.push(`    Field: ${issue.field}, Current: ${issue.currentValue}`);
        if (issue.suggestedValue !== undefined) {
          lines.push(`    Suggested: ${issue.suggestedValue}`);
        }
        lines.push('');
      }
    }
    
    if (result.suggestions.length > 0) {
      lines.push('Suggestions:');
      for (const suggestion of result.suggestions) {
        lines.push(`  • ${suggestion}`);
      }
      lines.push('');
    }
    
    if (result.estimatedImpact) {
      lines.push('Performance Impact:');
      lines.push(`  Memory Usage: ${result.estimatedImpact.memoryUsage}`);
      lines.push(`  CPU Usage: ${result.estimatedImpact.cpuUsage}`);
      lines.push(`  Network Impact: ${result.estimatedImpact.networkImpact}`);
      lines.push(`  Scalability: ${result.estimatedImpact.scalability}`);
    }
    
    return lines.join('\n');
  }

  /**
   * 生成批量配置报告
   */
  private generateBatchReport(result: BatchValidationResult): string {
    const lines: string[] = [];
    
    lines.push('=== Batch Cache Configuration Validation Report ===');
    lines.push(`Overall Score: ${result.overallScore}/100`);
    lines.push(`Total Issues: ${result.totalIssues}`);
    lines.push('');
    
    // 各实例结果
    lines.push('Individual Results:');
    for (const [type, instanceResult] of result.results) {
      lines.push(`  ${type}: ${instanceResult.score}/100 (${instanceResult.issues.length} issues)`);
    }
    lines.push('');
    
    // 跨实例问题
    if (result.crossInstanceIssues.length > 0) {
      lines.push('Cross-Instance Issues:');
      for (const issue of result.crossInstanceIssues) {
        lines.push(`  [${issue.severity.toUpperCase()}] ${issue.message}`);
      }
      lines.push('');
    }
    
    // 建议
    if (result.recommendations.length > 0) {
      lines.push('Recommendations:');
      for (const recommendation of result.recommendations) {
        lines.push(`  • ${recommendation}`);
      }
    }
    
    return lines.join('\n');
  }
}

// 导出默认实例
export const cacheConfigValidator = new CacheConfigValidator();