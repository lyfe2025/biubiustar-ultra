import { CacheConfigs, CacheInstanceType, ConfigValidationResult, OptimizationSuggestion } from './types';
import { 
  ValidationEngine, 
  RuleManager, 
  PerformanceAnalyzer,
  validateConfig,
  analyzePerformance,
  generateOptimizationSuggestions
} from './validation';
import type {
  ValidationRule,
  ValidationContext,
  ValidationResult
} from './validation/types';

// 重新导出验证相关类型，保持向后兼容性
export { ValidationRule, ValidationContext, ValidationResult };

/**
 * 配置验证器 - 轻量级包装器
 * 
 * 注意：此类已重构为模块化验证系统的包装器
 * 核心验证逻辑现在位于 ./validation 模块中
 * 
 * 负责验证缓存配置的有效性和合理性
 */
export class ConfigValidator {
  private validationEngine: ValidationEngine;
  private ruleManager: RuleManager;
  private performanceAnalyzer: PerformanceAnalyzer;

  constructor() {
    this.ruleManager = new RuleManager();
    this.validationEngine = new ValidationEngine();
    this.performanceAnalyzer = new PerformanceAnalyzer();
  }

  // 注意：默认验证规则现在由 RuleManager 自动初始化

  /**
   * 添加验证规则
   */
  public addRule(rule: ValidationRule): void {
    this.ruleManager.addRule(rule);
  }

  /**
   * 移除验证规则
   */
  public removeRule(ruleName: string): boolean {
    return this.ruleManager.removeRule(ruleName);
  }

  /**
   * 获取所有验证规则
   */
  public getRules(): ValidationRule[] {
    return this.ruleManager.getAllRules();
  }

  /**
   * 验证完整配置
   */
  public validate(config: CacheConfigs): ConfigValidationResult {
    return this.validationEngine.validate(config);
  }

  // 注意：shouldApplyRule 和 validateFieldRelationships 方法现在由 ValidationEngine 内部处理

  /**
   * 批量验证多个配置
   */
  public validateBatch(configs: Array<{ name: string; config: CacheConfigs }>): Array<{ name: string; result: ConfigValidationResult }> {
    return this.validationEngine.validateBatch(configs);
  }

  /**
   * 验证配置变更
   */
  public validateChange(
    oldConfig: CacheConfigs,
    newConfig: CacheConfigs,
    instanceType?: CacheInstanceType
  ): ConfigValidationResult {
    return this.validationEngine.validateChange(oldConfig, newConfig, instanceType);
  }

  /**
   * 设置自定义约束
   */
  public setCustomConstraint(name: string, constraint: (value: any) => boolean): void {
    this.ruleManager.setCustomConstraint(name, constraint);
  }

  /**
   * 获取自定义约束
   */
  public getCustomConstraint(name: string): ((value: any) => boolean) | undefined {
    return this.ruleManager.getCustomConstraint(name);
  }

  /**
   * 生成验证报告
   */
  public generateReport(config: CacheConfigs): string {
    const result = this.validate(config);
    
    let report = '=== Cache Configuration Validation Report ===\n\n';
    
    report += `Overall Status: ${result.isValid ? '✅ VALID' : '❌ INVALID'}\n\n`;
    
    if (result.errors.length > 0) {
      report += 'Errors:\n';
      result.errors.forEach(error => {
        const icon = error.severity === 'error' ? '❌' : '⚠️';
        report += `  ${icon} ${error.path}: ${error.message}\n`;
      });
      report += '\n';
    }
    
    if (result.warnings.length > 0) {
      report += 'Warnings:\n';
      result.warnings.forEach(warning => {
        report += `  ⚠️ ${warning}\n`;
      });
      report += '\n';
    }
    
    if (result.suggestions.length > 0) {
      report += 'Suggestions:\n';
      result.suggestions.forEach(suggestion => {
        report += `  💡 ${suggestion}\n`;
      });
      report += '\n';
    }
    
    return report;
  }

  /**
   * 生成优化建议
   */
  public generateOptimizationSuggestions(config: CacheConfigs): OptimizationSuggestion[] {
    return PerformanceAnalyzer.analyzePerformance(config).recommendations;
  }
}