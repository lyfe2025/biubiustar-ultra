import { CacheConfig, CacheInstanceType } from '../types';
import {
  ValidationRule,
  ValidationIssue,
  ValidationContext,
  ValidationRuleType,
  ValidationSeverity
} from './types';

/**
 * 预定义验证规则集合
 */
export class ValidationRules {
  private static rules: Map<string, ValidationRule> = new Map();

  /**
   * 初始化默认验证规则
   */
  public static initializeDefaultRules(): void {
    // 基础验证规则
    this.addRule({
      name: 'maxSize_positive',
      type: 'required',
      severity: 'error',
      description: 'maxSize must be a positive number',
      priority: 10,
      enabled: true,
      validator: (config: CacheConfig) => {
        const issues: ValidationIssue[] = [];
        if (!config.maxSize || config.maxSize <= 0) {
          issues.push({
            path: 'maxSize',
            message: 'maxSize must be greater than 0',
            severity: 'error',
            ruleType: 'required',
            suggestion: 'Set maxSize to a positive integer (e.g., 1000)',
            code: 'INVALID_MAX_SIZE'
          });
        }
        return issues;
      }
    });

    this.addRule({
      name: 'defaultTTL_positive',
      type: 'required',
      severity: 'error',
      description: 'defaultTTL must be a positive number',
      priority: 10,
      enabled: true,
      validator: (config: CacheConfig) => {
        const issues: ValidationIssue[] = [];
        if (!config.defaultTTL || config.defaultTTL <= 0) {
          issues.push({
            path: 'defaultTTL',
            message: 'defaultTTL must be greater than 0',
            severity: 'error',
            ruleType: 'required',
            suggestion: 'Set defaultTTL to a positive number in milliseconds (e.g., 300000 for 5 minutes)',
            code: 'INVALID_DEFAULT_TTL'
          });
        }
        return issues;
      }
    });

    this.addRule({
      name: 'cleanupInterval_positive',
      type: 'required',
      severity: 'error',
      description: 'cleanupInterval must be a positive number',
      priority: 10,
      enabled: true,
      validator: (config: CacheConfig) => {
        const issues: ValidationIssue[] = [];
        if (!config.cleanupInterval || config.cleanupInterval <= 0) {
          issues.push({
            path: 'cleanupInterval',
            message: 'cleanupInterval must be greater than 0',
            severity: 'error',
            ruleType: 'required',
            suggestion: 'Set cleanupInterval to a positive number in milliseconds (e.g., 60000 for 1 minute)',
            code: 'INVALID_CLEANUP_INTERVAL'
          });
        }
        return issues;
      }
    });

    // 合理性验证规则
    this.addRule({
      name: 'maxSize_reasonable',
      type: 'range',
      severity: 'warning',
      description: 'maxSize should be within reasonable limits',
      priority: 7,
      enabled: true,
      validator: (config: CacheConfig, context?: ValidationContext) => {
        const issues: ValidationIssue[] = [];
        const maxSize = config.maxSize;
        
        if (maxSize > 100000) {
          issues.push({
            path: 'maxSize',
            message: 'maxSize is very large and may impact memory usage',
            severity: 'warning',
            ruleType: 'range',
            suggestion: 'Consider reducing maxSize or implementing memory monitoring',
            code: 'LARGE_MAX_SIZE'
          });
        } else if (maxSize < 10) {
          issues.push({
            path: 'maxSize',
            message: 'maxSize is very small and may reduce cache effectiveness',
            severity: 'warning',
            ruleType: 'range',
            suggestion: 'Consider increasing maxSize for better cache performance',
            code: 'SMALL_MAX_SIZE'
          });
        }
        
        return issues;
      }
    });

    this.addRule({
      name: 'defaultTTL_reasonable',
      type: 'range',
      severity: 'warning',
      description: 'defaultTTL should be within reasonable limits',
      priority: 7,
      enabled: true,
      validator: (config: CacheConfig, context?: ValidationContext) => {
        const issues: ValidationIssue[] = [];
        const ttl = config.defaultTTL;
        
        if (ttl > 24 * 60 * 60 * 1000) { // 24 hours
          issues.push({
            path: 'defaultTTL',
            message: 'defaultTTL is very long and may lead to stale data',
            severity: 'warning',
            ruleType: 'range',
            suggestion: 'Consider reducing TTL or implementing cache invalidation strategies',
            code: 'LONG_TTL'
          });
        } else if (ttl < 1000) { // 1 second
          issues.push({
            path: 'defaultTTL',
            message: 'defaultTTL is very short and may reduce cache effectiveness',
            severity: 'warning',
            ruleType: 'range',
            suggestion: 'Consider increasing TTL for better cache performance',
            code: 'SHORT_TTL'
          });
        }
        
        return issues;
      }
    });

    this.addRule({
      name: 'cleanupInterval_reasonable',
      type: 'range',
      severity: 'warning',
      description: 'cleanupInterval should be within reasonable limits',
      priority: 7,
      enabled: true,
      validator: (config: CacheConfig) => {
        const issues: ValidationIssue[] = [];
        const interval = config.cleanupInterval;
        
        if (interval > 10 * 60 * 1000) { // 10 minutes
          issues.push({
            path: 'cleanupInterval',
            message: 'cleanupInterval is very long and may lead to memory bloat',
            severity: 'warning',
            ruleType: 'range',
            suggestion: 'Consider reducing cleanup interval for better memory management',
            code: 'LONG_CLEANUP_INTERVAL'
          });
        } else if (interval < 5000) { // 5 seconds
          issues.push({
            path: 'cleanupInterval',
            message: 'cleanupInterval is very short and may impact performance',
            severity: 'warning',
            ruleType: 'range',
            suggestion: 'Consider increasing cleanup interval to reduce CPU overhead',
            code: 'SHORT_CLEANUP_INTERVAL'
          });
        }
        
        return issues;
      }
    });

    // 性能优化规则
    this.addRule({
      name: 'memory_efficiency',
      type: 'performance',
      severity: 'info',
      description: 'Analyze memory efficiency based on configuration',
      priority: 5,
      enabled: true,
      validator: (config: CacheConfig, context?: ValidationContext) => {
        const issues: ValidationIssue[] = [];
        const estimatedMemory = config.maxSize * 1024; // 假设每个条目1KB
        
        if (estimatedMemory > 500 * 1024 * 1024) { // 500MB
          issues.push({
            path: 'maxSize',
            message: `Estimated memory usage: ${Math.round(estimatedMemory / 1024 / 1024)}MB`,
            severity: 'info',
            ruleType: 'performance',
            suggestion: 'Monitor memory usage and consider implementing memory limits',
            code: 'HIGH_MEMORY_USAGE'
          });
        }
        
        return issues;
      }
    });

    // TTL优化规则
    this.addRule({
      name: 'ttl_optimization',
      type: 'performance',
      severity: 'info',
      description: 'Analyze TTL configuration for optimization opportunities',
      priority: 5,
      enabled: true,
      validator: (config: CacheConfig, context?: ValidationContext) => {
        const issues: ValidationIssue[] = [];
        const ttl = config.defaultTTL;
        const cleanupInterval = config.cleanupInterval;
        
        if (ttl < cleanupInterval) {
          issues.push({
            path: 'defaultTTL',
            message: 'TTL is shorter than cleanup interval, items may expire before cleanup',
            severity: 'warning',
            ruleType: 'performance',
            suggestion: 'Consider adjusting TTL or cleanup interval for better efficiency',
            code: 'TTL_CLEANUP_MISMATCH'
          });
        }
        
        if (ttl > cleanupInterval * 10) {
          issues.push({
            path: 'cleanupInterval',
            message: 'Cleanup interval is much shorter than TTL, may cause unnecessary overhead',
            severity: 'info',
            ruleType: 'performance',
            suggestion: 'Consider increasing cleanup interval to match TTL patterns',
            code: 'FREQUENT_CLEANUP'
          });
        }
        
        return issues;
      }
    });

    // 环境特定规则
    this.addRule({
      name: 'production_optimization',
      type: 'performance',
      severity: 'warning',
      description: 'Production environment specific optimizations',
      priority: 8,
      enabled: true,
      validator: (config: CacheConfig, context?: ValidationContext) => {
        const issues: ValidationIssue[] = [];
        
        if (context?.environment === 'production') {
          if (config.maxSize < 1000) {
            issues.push({
              path: 'maxSize',
              message: 'Small cache size in production may reduce performance',
              severity: 'warning',
              ruleType: 'performance',
              suggestion: 'Consider increasing cache size for production workloads',
              code: 'PROD_SMALL_CACHE'
            });
          }
          
          if (config.cleanupInterval < 30000) { // 30 seconds
            issues.push({
              path: 'cleanupInterval',
              message: 'Frequent cleanup in production may impact performance',
              severity: 'warning',
              ruleType: 'performance',
              suggestion: 'Consider increasing cleanup interval for production stability',
              code: 'PROD_FREQUENT_CLEANUP'
            });
          }
        }
        
        return issues;
      }
    });

    // 实例类型特定规则
    this.addRule({
      name: 'user_cache_optimization',
      type: 'performance',
      severity: 'info',
      description: 'User cache specific optimizations',
      priority: 6,
      enabled: true,
      applicableTypes: ['user'],
      validator: (config: CacheConfig, context?: ValidationContext) => {
        const issues: ValidationIssue[] = [];
        
        if (context?.instanceType === 'user') {
          if (config.defaultTTL < 5 * 60 * 1000) { // 5 minutes
            issues.push({
              path: 'defaultTTL',
              message: 'Short TTL for user cache may cause frequent reloads',
              severity: 'info',
              ruleType: 'performance',
              suggestion: 'Consider longer TTL for user data that changes infrequently',
              code: 'USER_CACHE_SHORT_TTL'
            });
          }
        }
        
        return issues;
      }
    });

    this.addRule({
      name: 'session_cache_optimization',
      type: 'performance',
      severity: 'info',
      description: 'Session cache specific optimizations',
      priority: 6,
      enabled: true,
      applicableTypes: ['session'],
      validator: (config: CacheConfig, context?: ValidationContext) => {
        const issues: ValidationIssue[] = [];
        
        if (context?.instanceType === 'session') {
          if (config.defaultTTL > 30 * 60 * 1000) { // 30 minutes
            issues.push({
              path: 'defaultTTL',
              message: 'Long TTL for session cache may cause security issues',
              severity: 'warning',
              ruleType: 'security',
              suggestion: 'Consider shorter TTL for session data for better security',
              code: 'SESSION_CACHE_LONG_TTL'
            });
          }
        }
        
        return issues;
      }
    });
  }

  /**
   * 添加验证规则
   */
  public static addRule(rule: ValidationRule): void {
    this.rules.set(rule.name, rule);
  }

  /**
   * 移除验证规则
   */
  public static removeRule(name: string): boolean {
    return this.rules.delete(name);
  }

  /**
   * 获取验证规则
   */
  public static getRule(name: string): ValidationRule | undefined {
    return this.rules.get(name);
  }

  /**
   * 获取所有验证规则
   */
  public static getAllRules(): ValidationRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * 获取启用的验证规则
   */
  public static getEnabledRules(): ValidationRule[] {
    return Array.from(this.rules.values()).filter(rule => rule.enabled);
  }

  /**
   * 获取特定类型的验证规则
   */
  public static getRulesByType(type: ValidationRuleType): ValidationRule[] {
    return Array.from(this.rules.values()).filter(rule => rule.type === type);
  }

  /**
   * 获取特定严重程度的验证规则
   */
  public static getRulesBySeverity(severity: ValidationSeverity): ValidationRule[] {
    return Array.from(this.rules.values()).filter(rule => rule.severity === severity);
  }

  /**
   * 获取适用于特定实例类型的验证规则
   */
  public static getRulesForInstanceType(instanceType: CacheInstanceType): ValidationRule[] {
    return Array.from(this.rules.values()).filter(rule => 
      !rule.applicableTypes || rule.applicableTypes.includes(instanceType)
    );
  }

  /**
   * 启用验证规则
   */
  public static enableRule(name: string): boolean {
    const rule = this.rules.get(name);
    if (rule) {
      rule.enabled = true;
      return true;
    }
    return false;
  }

  /**
   * 禁用验证规则
   */
  public static disableRule(name: string): boolean {
    const rule = this.rules.get(name);
    if (rule) {
      rule.enabled = false;
      return true;
    }
    return false;
  }

  /**
   * 清空所有验证规则
   */
  public static clearRules(): void {
    this.rules.clear();
  }

  /**
   * 获取验证规则统计
   */
  public static getStats(): {
    total: number;
    enabled: number;
    disabled: number;
    byType: Record<ValidationRuleType, number>;
    bySeverity: Record<ValidationSeverity, number>;
  } {
    const rules = Array.from(this.rules.values());
    const stats = {
      total: rules.length,
      enabled: rules.filter(r => r.enabled).length,
      disabled: rules.filter(r => !r.enabled).length,
      byType: {} as Record<ValidationRuleType, number>,
      bySeverity: {} as Record<ValidationSeverity, number>
    };

    // 按类型统计
    rules.forEach(rule => {
      stats.byType[rule.type] = (stats.byType[rule.type] || 0) + 1;
    });

    // 按严重程度统计
    rules.forEach(rule => {
      stats.bySeverity[rule.severity] = (stats.bySeverity[rule.severity] || 0) + 1;
    });

    return stats;
  }
}

// 初始化默认规则
ValidationRules.initializeDefaultRules();