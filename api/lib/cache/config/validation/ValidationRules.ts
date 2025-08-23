import { ValidationRule, ValidationContext, ValidationResult } from './types';

/**
 * 验证规则定义
 * 包含所有默认的缓存配置验证规则
 */
export class ValidationRules {
  /**
   * 获取所有默认验证规则
   */
  public static getDefaultRules(): ValidationRule[] {
    return [
      ...this.getBasicRules(),
      ...this.getReasonabilityRules(),
      ...this.getPerformanceRules()
    ];
  }

  /**
   * 基本数值验证规则
   */
  private static getBasicRules(): ValidationRule[] {
    return [
      {
        name: 'maxSize_positive',
        validate: (value: number): ValidationResult => ({
          isValid: typeof value === 'number' && value > 0,
          message: 'maxSize must be a positive number',
          suggestion: 'Set maxSize to a value greater than 0'
        }),
        description: 'Validates that maxSize is a positive number',
        severity: 'error'
      },
      {
        name: 'defaultTTL_positive',
        validate: (value: number): ValidationResult => ({
          isValid: typeof value === 'number' && value > 0,
          message: 'defaultTTL must be a positive number',
          suggestion: 'Set defaultTTL to a value greater than 0 (in milliseconds)'
        }),
        description: 'Validates that defaultTTL is a positive number',
        severity: 'error'
      },
      {
        name: 'cleanupInterval_positive',
        validate: (value: number): ValidationResult => ({
          isValid: typeof value === 'number' && value > 0,
          message: 'cleanupInterval must be a positive number',
          suggestion: 'Set cleanupInterval to a value greater than 0 (in milliseconds)'
        }),
        description: 'Validates that cleanupInterval is a positive number',
        severity: 'error'
      }
    ];
  }

  /**
   * 合理性验证规则
   */
  private static getReasonabilityRules(): ValidationRule[] {
    return [
      {
        name: 'maxSize_reasonable',
        validate: (value: number): ValidationResult => ({
          isValid: value <= 100000,
          message: 'maxSize is very large and may cause memory issues',
          suggestion: 'Consider reducing maxSize to a more reasonable value (< 100,000)'
        }),
        description: 'Warns about unreasonably large maxSize values',
        severity: 'warning'
      },
      {
        name: 'defaultTTL_reasonable',
        validate: (value: number): ValidationResult => ({
          isValid: value <= 86400000, // 24 hours
          message: 'defaultTTL is very long and may cause stale data issues',
          suggestion: 'Consider reducing defaultTTL to less than 24 hours'
        }),
        description: 'Warns about unreasonably long TTL values',
        severity: 'warning'
      },
      {
        name: 'cleanupInterval_reasonable',
        validate: (value: number, context: ValidationContext): ValidationResult => {
          const config = context.fullConfig[context.instanceType];
          const isReasonable = value >= 10000 && value <= config.defaultTTL / 2;
          return {
            isValid: isReasonable,
            message: isReasonable ? undefined : 'cleanupInterval should be between 10s and half of defaultTTL',
            suggestion: `Set cleanupInterval between 10000ms and ${config.defaultTTL / 2}ms`
          };
        },
        description: 'Validates that cleanupInterval is reasonable relative to TTL',
        severity: 'warning'
      }
    ];
  }

  /**
   * 性能优化规则
   */
  private static getPerformanceRules(): ValidationRule[] {
    return [
      {
        name: 'memory_efficiency',
        validate: (value: number, context: ValidationContext): ValidationResult => {
          if (context.fieldName === 'maxSize') {
            const estimatedMemory = value * 1024; // 假设每个条目1KB
            return {
              isValid: estimatedMemory <= 100 * 1024 * 1024, // 100MB
              message: estimatedMemory > 100 * 1024 * 1024 ? 'Estimated memory usage exceeds 100MB' : undefined,
              suggestion: 'Consider reducing maxSize to limit memory usage'
            };
          }
          return { isValid: true };
        },
        description: 'Estimates memory usage and warns about high consumption',
        severity: 'warning'
      }
    ];
  }

  /**
   * 字段关系验证规则
   */
  public static getRelationshipRules(): Array<{
    name: string;
    validate: (config: any, instanceType: string) => { isValid: boolean; message?: string; severity: 'error' | 'warning' }[];
    description: string;
  }> {
    return [
      {
        name: 'cleanup_ttl_relationship',
        validate: (config: any, instanceType: string) => {
          const results = [];
          
          if (config.cleanupInterval >= config.defaultTTL) {
            results.push({
              isValid: false,
              message: 'cleanupInterval should be less than defaultTTL',
              severity: 'warning' as const
            });
          }
          
          if (config.cleanupInterval < 10000) {
            results.push({
              isValid: false,
              message: 'Very frequent cleanup may impact performance',
              severity: 'warning' as const
            });
          }
          
          return results;
        },
        description: 'Validates relationship between cleanup interval and TTL'
      },
      {
        name: 'memory_ttl_relationship',
        validate: (config: any, instanceType: string) => {
          const results = [];
          
          if (config.maxSize > 10000 && config.defaultTTL > 3600000) {
            results.push({
              isValid: false,
              message: 'Large cache with long TTL may consume significant memory',
              severity: 'warning' as const
            });
          }
          
          return results;
        },
        description: 'Validates memory usage implications of size and TTL combination'
      }
    ];
  }

  /**
   * 根据字段名称获取适用的规则
   */
  public static getRulesForField(fieldName: string): ValidationRule[] {
    const allRules = this.getDefaultRules();
    return allRules.filter(rule => this.shouldApplyRule(rule, fieldName));
  }

  /**
   * 判断规则是否适用于指定字段
   */
  private static shouldApplyRule(rule: ValidationRule, fieldName: string): boolean {
    const ruleName = rule.name;
    
    if (ruleName.includes('maxSize') && fieldName === 'maxSize') return true;
    if (ruleName.includes('defaultTTL') && fieldName === 'defaultTTL') return true;
    if (ruleName.includes('cleanupInterval') && fieldName === 'cleanupInterval') return true;
    if (ruleName.includes('memory') && fieldName === 'maxSize') return true;
    
    return false;
  }
}