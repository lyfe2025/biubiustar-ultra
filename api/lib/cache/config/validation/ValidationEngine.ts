import { CacheConfigs, CacheInstanceType } from '../types';
import { 
  ValidationRule, 
  ValidationContext, 
  ConfigValidationResult, 
  ValidationError, 
  ValidationOptions 
} from './types';
import { ValidationRules } from './ValidationRules';

/**
 * 验证引擎
 * 负责执行配置验证的核心逻辑
 */
export class ValidationEngine {
  private rules: Map<string, ValidationRule> = new Map();
  private options: ValidationOptions;

  constructor(options: ValidationOptions = {}) {
    this.options = options;
    this.initializeRules();
  }

  /**
   * 初始化验证规则
   */
  private initializeRules(): void {
    // 加载默认规则
    const defaultRules = ValidationRules.getDefaultRules();
    defaultRules.forEach(rule => {
      this.rules.set(rule.name, rule);
    });

    // 加载自定义规则
    if (this.options.customRules) {
      this.options.customRules.forEach(rule => {
        this.rules.set(rule.name, rule);
      });
    }
  }

  /**
   * 验证完整配置
   */
  public validate(config: CacheConfigs): ConfigValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 验证每个缓存实例配置
    for (const [instanceType, instanceConfig] of Object.entries(config)) {
      const context: ValidationContext = {
        instanceType: instanceType as CacheInstanceType,
        configPath: instanceType,
        fullConfig: config,
        fieldName: ''
      };

      // 验证字段级别的规则
      this.validateFields(instanceConfig, context, errors, suggestions);

      // 验证字段间的关系
      this.validateRelationships(instanceType as CacheInstanceType, instanceConfig, errors, warnings);
    }

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * 验证字段级别的规则
   */
  private validateFields(
    instanceConfig: any,
    context: ValidationContext,
    errors: ValidationError[],
    suggestions: string[]
  ): void {
    for (const [fieldName, fieldValue] of Object.entries(instanceConfig)) {
      context.fieldName = fieldName;
      context.configPath = `${context.instanceType}.${fieldName}`;

      // 应用相关的验证规则
      for (const rule of this.rules.values()) {
        if (this.shouldApplyRule(rule, fieldName)) {
          try {
            const result = rule.validate(fieldValue, context);
            
            if (!result.isValid && result.message) {
              // 跳过警告（如果配置了）
              if (this.options.skipWarnings && rule.severity === 'warning') {
                continue;
              }

              errors.push({
                path: context.configPath,
                message: result.message,
                severity: rule.severity
              });
              
              if (result.suggestion) {
                suggestions.push(`${context.configPath}: ${result.suggestion}`);
              }
            }
          } catch (error) {
            // 验证规则执行出错
            errors.push({
              path: context.configPath,
              message: `Validation rule '${rule.name}' failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
              severity: 'error'
            });
          }
        }
      }
    }
  }

  /**
   * 验证字段间的关系
   */
  private validateRelationships(
    instanceType: CacheInstanceType,
    config: any,
    errors: ValidationError[],
    warnings: string[]
  ): void {
    const basePath = instanceType;
    const relationshipRules = ValidationRules.getRelationshipRules();

    for (const rule of relationshipRules) {
      try {
        const results = rule.validate(config, instanceType);
        
        for (const result of results) {
          if (!result.isValid && result.message) {
            if (result.severity === 'warning') {
              warnings.push(`${basePath}: ${result.message}`);
            } else {
              errors.push({
                path: basePath,
                message: result.message,
                severity: result.severity
              });
            }
          }
        }
      } catch (error) {
        errors.push({
          path: basePath,
          message: `Relationship validation '${rule.name}' failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'error'
        });
      }
    }
  }

  /**
   * 判断是否应该应用规则
   */
  private shouldApplyRule(rule: ValidationRule, fieldName: string): boolean {
    const ruleName = rule.name;
    
    // 基于规则名称和字段名称的匹配逻辑
    if (ruleName.includes('maxSize') && fieldName === 'maxSize') return true;
    if (ruleName.includes('defaultTTL') && fieldName === 'defaultTTL') return true;
    if (ruleName.includes('cleanupInterval') && fieldName === 'cleanupInterval') return true;
    if (ruleName.includes('memory') && fieldName === 'maxSize') return true;
    
    return false;
  }

  /**
   * 验证配置变更
   */
  public validateChange(
    oldConfig: CacheConfigs,
    newConfig: CacheConfigs,
    instanceType?: CacheInstanceType
  ): ConfigValidationResult {
    // 如果指定了实例类型，只验证该实例的变更
    if (instanceType) {
      const partialNewConfig = { [instanceType]: newConfig[instanceType] } as Partial<CacheConfigs>;
      return this.validate(partialNewConfig as CacheConfigs);
    }

    // 验证整个新配置
    return this.validate(newConfig);
  }

  /**
   * 批量验证多个配置
   */
  public validateBatch(configs: Array<{ name: string; config: CacheConfigs }>): Array<{ name: string; result: ConfigValidationResult }> {
    return configs.map(({ name, config }) => ({
      name,
      result: this.validate(config)
    }));
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
  public removeRule(ruleName: string): boolean {
    return this.rules.delete(ruleName);
  }

  /**
   * 获取所有验证规则
   */
  public getRules(): ValidationRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * 更新验证选项
   */
  public updateOptions(options: Partial<ValidationOptions>): void {
    this.options = { ...this.options, ...options };
    
    // 重新初始化规则（如果自定义规则发生变化）
    if (options.customRules) {
      this.initializeRules();
    }
  }
}