import { EnvVarMapping, EnvOverrideResult, EnvValidationResult, EnvValueInfo, IEnvProcessor } from './types';

/**
 * 环境变量处理器
 * 负责处理环境变量的应用、验证和转换
 */
export class EnvProcessor implements IEnvProcessor {
  private overrideHistory: EnvOverrideResult[] = [];

  /**
   * 应用环境变量覆盖
   */
  public applyEnvOverrides(
    configs: any,
    envMappings: Map<string, EnvVarMapping>
  ): EnvOverrideResult {
    const result: EnvOverrideResult = {
      success: true,
      overrides: [],
      errors: [],
      warnings: []
    };

    for (const [envKey, mapping] of envMappings) {
      try {
        const envValue = process.env[envKey];
        let finalValue: any;
        let source: 'env' | 'default' = 'default';

        if (envValue !== undefined && envValue !== '') {
          // 环境变量存在，进行转换和验证
          if (mapping.transformer) {
            finalValue = mapping.transformer(envValue);
          } else {
            finalValue = this.defaultTransform(envValue, mapping.type);
          }

          // 验证值
          if (mapping.validator && !mapping.validator(finalValue)) {
            result.errors.push({
              envKey,
              error: `Invalid value: ${envValue}. Validation failed.`
            });
            result.success = false;
            continue;
          }

          source = 'env';
        } else if (mapping.defaultValue !== undefined) {
          // 使用默认值
          finalValue = mapping.defaultValue;
          source = 'default';
        } else {
          // 没有环境变量也没有默认值
          result.warnings.push(`No value found for ${envKey} and no default provided`);
          continue;
        }

        // 应用配置
        const originalValue = this.getConfigValue(configs, mapping.configPath);
        this.setConfigValue(configs, mapping.configPath, finalValue);

        result.overrides.push({
          envKey,
          configPath: mapping.configPath,
          originalValue,
          newValue: finalValue,
          source
        });

      } catch (error) {
        result.errors.push({
          envKey,
          error: `Failed to apply override: ${error}`
        });
        result.success = false;
      }
    }

    // 记录覆盖历史
    this.overrideHistory.push({
      ...result,
      overrides: [...result.overrides],
      errors: [...result.errors],
      warnings: [...result.warnings]
    });

    // 限制历史记录长度
    if (this.overrideHistory.length > 10) {
      this.overrideHistory.splice(0, this.overrideHistory.length - 10);
    }

    return result;
  }

  /**
   * 验证环境变量
   */
  public validateEnvironmentVariables(
    envMappings: Map<string, EnvVarMapping>
  ): EnvValidationResult {
    const issues: Array<{
      envKey: string;
      issue: string;
      severity: 'error' | 'warning';
    }> = [];
    
    for (const [envKey, mapping] of envMappings) {
      const envValue = process.env[envKey];
      
      if (envValue !== undefined && envValue !== '') {
        try {
          let transformedValue: any;
          
          if (mapping.transformer) {
            transformedValue = mapping.transformer(envValue);
          } else {
            transformedValue = this.defaultTransform(envValue, mapping.type);
          }
          
          if (mapping.validator && !mapping.validator(transformedValue)) {
            issues.push({
              envKey,
              issue: `Value "${envValue}" fails validation`,
              severity: 'error'
            });
          }
        } catch (error) {
          issues.push({
            envKey,
            issue: `Cannot transform value "${envValue}": ${error}`,
            severity: 'error'
          });
        }
      } else if (mapping.defaultValue === undefined) {
        issues.push({
          envKey,
          issue: 'No value provided and no default available',
          severity: 'warning'
        });
      }
    }
    
    return {
      valid: issues.filter(i => i.severity === 'error').length === 0,
      issues
    };
  }

  /**
   * 获取当前环境变量值
   */
  public getCurrentEnvValues(
    envMappings: Map<string, EnvVarMapping>
  ): Map<string, EnvValueInfo> {
    const result = new Map<string, EnvValueInfo>();
    
    for (const [envKey, mapping] of envMappings) {
      const currentValue = process.env[envKey];
      let transformedValue: any;
      let isValid = true;
      
      try {
        if (currentValue !== undefined && currentValue !== '') {
          if (mapping.transformer) {
            transformedValue = mapping.transformer(currentValue);
          } else {
            transformedValue = this.defaultTransform(currentValue, mapping.type);
          }
          
          if (mapping.validator && !mapping.validator(transformedValue)) {
            isValid = false;
          }
        } else {
          transformedValue = mapping.defaultValue;
        }
      } catch (error) {
        isValid = false;
        transformedValue = undefined;
      }
      
      result.set(envKey, {
        envKey,
        currentValue,
        transformedValue,
        defaultValue: mapping.defaultValue,
        isValid
      });
    }
    
    return result;
  }

  /**
   * 获取覆盖历史
   */
  public getOverrideHistory(): EnvOverrideResult[] {
    return [...this.overrideHistory];
  }

  /**
   * 清除覆盖历史
   */
  public clearOverrideHistory(): void {
    this.overrideHistory = [];
  }

  /**
   * 默认类型转换
   */
  private defaultTransform(value: string, type: EnvVarMapping['type']): any {
    switch (type) {
      case 'number':
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error(`Cannot convert "${value}" to number`);
        }
        return num;
      case 'boolean':
        const lower = value.toLowerCase();
        if (lower === 'true' || lower === '1' || lower === 'yes') {
          return true;
        } else if (lower === 'false' || lower === '0' || lower === 'no') {
          return false;
        } else {
          throw new Error(`Cannot convert "${value}" to boolean`);
        }
      case 'string':
        return value;
      default:
        return value;
    }
  }

  /**
   * 获取配置值
   */
  private getConfigValue(configs: any, path: string): any {
    const parts = path.split('.');
    let current = configs;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  /**
   * 设置配置值
   */
  private setConfigValue(configs: any, path: string, value: any): void {
    const parts = path.split('.');
    let current = configs;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part];
    }
    
    current[parts[parts.length - 1]] = value;
  }
}

// 导出默认实例
export const envProcessor = new EnvProcessor();