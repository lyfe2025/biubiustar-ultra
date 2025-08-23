import { ValidationRule, RuleCategory, RuleConfig } from './types';
import { ValidationRules } from './ValidationRules';

/**
 * 规则管理器
 * 负责管理验证规则的注册、启用/禁用、分类等
 */
export class RuleManager {
  private rules: Map<string, ValidationRule> = new Map();
  private ruleConfigs: Map<string, RuleConfig> = new Map();
  private customConstraints: Map<string, (value: any) => boolean> = new Map();

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * 初始化默认规则
   */
  private initializeDefaultRules(): void {
    const defaultRules = ValidationRules.getDefaultRules();
    
    defaultRules.forEach((rule, index) => {
      this.rules.set(rule.name, rule);
      
      // 设置默认规则配置
      const category = this.categorizeRule(rule);
      this.ruleConfigs.set(rule.name, {
        enabled: true,
        category,
        priority: index
      });
    });
  }

  /**
   * 根据规则名称自动分类
   */
  private categorizeRule(rule: ValidationRule): RuleCategory {
    const name = rule.name.toLowerCase();
    
    if (name.includes('positive') || name.includes('basic')) {
      return 'basic';
    }
    if (name.includes('memory') || name.includes('efficiency')) {
      return 'memory';
    }
    if (name.includes('performance') || name.includes('cleanup')) {
      return 'performance';
    }
    if (name.includes('relationship') || name.includes('ttl')) {
      return 'relationship';
    }
    
    return 'custom';
  }

  /**
   * 添加验证规则
   */
  public addRule(rule: ValidationRule, config?: Partial<RuleConfig>): void {
    this.rules.set(rule.name, rule);
    
    const defaultConfig: RuleConfig = {
      enabled: true,
      category: 'custom',
      priority: this.rules.size
    };
    
    this.ruleConfigs.set(rule.name, { ...defaultConfig, ...config });
  }

  /**
   * 移除验证规则
   */
  public removeRule(ruleName: string): boolean {
    const removed = this.rules.delete(ruleName);
    if (removed) {
      this.ruleConfigs.delete(ruleName);
    }
    return removed;
  }

  /**
   * 启用规则
   */
  public enableRule(ruleName: string): boolean {
    const config = this.ruleConfigs.get(ruleName);
    if (config) {
      config.enabled = true;
      return true;
    }
    return false;
  }

  /**
   * 禁用规则
   */
  public disableRule(ruleName: string): boolean {
    const config = this.ruleConfigs.get(ruleName);
    if (config) {
      config.enabled = false;
      return true;
    }
    return false;
  }

  /**
   * 获取所有启用的验证规则
   */
  public getEnabledRules(): ValidationRule[] {
    const enabledRules: ValidationRule[] = [];
    
    for (const [name, rule] of this.rules.entries()) {
      const config = this.ruleConfigs.get(name);
      if (config?.enabled) {
        enabledRules.push(rule);
      }
    }
    
    // 按优先级排序
    return enabledRules.sort((a, b) => {
      const configA = this.ruleConfigs.get(a.name)!;
      const configB = this.ruleConfigs.get(b.name)!;
      return configA.priority - configB.priority;
    });
  }

  /**
   * 根据分类获取规则
   */
  public getRulesByCategory(category: RuleCategory): ValidationRule[] {
    const rules: ValidationRule[] = [];
    
    for (const [name, rule] of this.rules.entries()) {
      const config = this.ruleConfigs.get(name);
      if (config?.category === category && config.enabled) {
        rules.push(rule);
      }
    }
    
    return rules;
  }

  /**
   * 获取所有规则（包括禁用的）
   */
  public getAllRules(): ValidationRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * 获取规则配置
   */
  public getRuleConfig(ruleName: string): RuleConfig | undefined {
    return this.ruleConfigs.get(ruleName);
  }

  /**
   * 更新规则配置
   */
  public updateRuleConfig(ruleName: string, config: Partial<RuleConfig>): boolean {
    const existingConfig = this.ruleConfigs.get(ruleName);
    if (existingConfig) {
      this.ruleConfigs.set(ruleName, { ...existingConfig, ...config });
      return true;
    }
    return false;
  }

  /**
   * 批量启用/禁用分类规则
   */
  public toggleCategoryRules(category: RuleCategory, enabled: boolean): number {
    let count = 0;
    
    for (const [name, config] of this.ruleConfigs.entries()) {
      if (config.category === category) {
        config.enabled = enabled;
        count++;
      }
    }
    
    return count;
  }

  /**
   * 设置自定义约束
   */
  public setCustomConstraint(name: string, constraint: (value: any) => boolean): void {
    this.customConstraints.set(name, constraint);
  }

  /**
   * 获取自定义约束
   */
  public getCustomConstraint(name: string): ((value: any) => boolean) | undefined {
    return this.customConstraints.get(name);
  }

  /**
   * 移除自定义约束
   */
  public removeCustomConstraint(name: string): boolean {
    return this.customConstraints.delete(name);
  }

  /**
   * 获取规则统计信息
   */
  public getStatistics(): {
    total: number;
    enabled: number;
    disabled: number;
    byCategory: Record<RuleCategory, number>;
  } {
    const stats = {
      total: this.rules.size,
      enabled: 0,
      disabled: 0,
      byCategory: {
        basic: 0,
        performance: 0,
        memory: 0,
        relationship: 0,
        custom: 0
      } as Record<RuleCategory, number>
    };
    
    for (const config of this.ruleConfigs.values()) {
      if (config.enabled) {
        stats.enabled++;
      } else {
        stats.disabled++;
      }
      
      stats.byCategory[config.category]++;
    }
    
    return stats;
  }

  /**
   * 重置为默认规则
   */
  public resetToDefaults(): void {
    this.rules.clear();
    this.ruleConfigs.clear();
    this.customConstraints.clear();
    this.initializeDefaultRules();
  }

  /**
   * 导出规则配置
   */
  public exportConfig(): Record<string, RuleConfig> {
    const config: Record<string, RuleConfig> = {};
    
    for (const [name, ruleConfig] of this.ruleConfigs.entries()) {
      config[name] = { ...ruleConfig };
    }
    
    return config;
  }

  /**
   * 导入规则配置
   */
  public importConfig(config: Record<string, RuleConfig>): void {
    for (const [name, ruleConfig] of Object.entries(config)) {
      if (this.rules.has(name)) {
        this.ruleConfigs.set(name, ruleConfig);
      }
    }
  }
}