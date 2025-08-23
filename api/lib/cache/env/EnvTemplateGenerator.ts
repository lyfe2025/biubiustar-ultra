import { EnvVarMapping, IEnvTemplateGenerator } from './types';

/**
 * 环境变量模板生成器
 * 负责生成环境变量模板和配置报告
 */
export class EnvTemplateGenerator implements IEnvTemplateGenerator {
  /**
   * 生成环境变量模板
   */
  public generateEnvTemplate(
    envMappings: Map<string, EnvVarMapping>,
    includeComments: boolean = true
  ): string {
    const lines: string[] = [];
    
    if (includeComments) {
      lines.push('# Cache Configuration Environment Variables');
      lines.push('# Generated automatically - modify as needed');
      lines.push('');
    }
    
    // 按类别分组
    const categories = this.groupMappingsByCategory(envMappings);
    
    for (const [category, mappings] of categories) {
      if (includeComments) {
        lines.push(`# ${category.toUpperCase()} CACHE CONFIGURATION`);
        lines.push('');
      }
      
      for (const [envKey, mapping] of mappings) {
        if (includeComments) {
          lines.push(`# ${mapping.configPath}`);
          lines.push(`# Type: ${mapping.type}`);
          if (mapping.defaultValue !== undefined) {
            lines.push(`# Default: ${mapping.defaultValue}`);
          }
        }
        
        const value = mapping.defaultValue !== undefined ? 
          String(mapping.defaultValue) : '';
        lines.push(`${envKey}=${value}`);
        
        if (includeComments) {
          lines.push('');
        }
      }
      
      if (includeComments) {
        lines.push('');
      }
    }
    
    return lines.join('\n');
  }

  /**
   * 生成配置报告
   */
  public generateConfigReport(
    envMappings: Map<string, EnvVarMapping>,
    currentValues: Map<string, any>
  ): string {
    const lines: string[] = [];
    
    lines.push('# Cache Configuration Report');
    lines.push(`# Generated at: ${new Date().toISOString()}`);
    lines.push('');
    
    // 统计信息
    const stats = this.generateStats(envMappings, currentValues);
    lines.push('## Statistics');
    lines.push(`- Total mappings: ${stats.totalMappings}`);
    lines.push(`- Configured from environment: ${stats.configuredFromEnv}`);
    lines.push(`- Using defaults: ${stats.usingDefaults}`);
    lines.push(`- Missing values: ${stats.missingValues}`);
    lines.push('');
    
    // 按类别分组详细信息
    const categories = this.groupMappingsByCategory(envMappings);
    
    for (const [category, mappings] of categories) {
      lines.push(`## ${category.toUpperCase()} Cache`);
      lines.push('');
      
      for (const [envKey, mapping] of mappings) {
        const currentValue = process.env[envKey];
        const hasValue = currentValue !== undefined && currentValue !== '';
        const status = hasValue ? '✓' : (mapping.defaultValue !== undefined ? '○' : '✗');
        
        lines.push(`${status} **${envKey}**`);
        lines.push(`  - Path: \`${mapping.configPath}\``);
        lines.push(`  - Type: ${mapping.type}`);
        
        if (hasValue) {
          lines.push(`  - Current: \`${currentValue}\``);
        } else if (mapping.defaultValue !== undefined) {
          lines.push(`  - Default: \`${mapping.defaultValue}\``);
        } else {
          lines.push(`  - Status: No value provided`);
        }
        
        lines.push('');
      }
    }
    
    return lines.join('\n');
  }

  /**
   * 按类别分组映射
   */
  private groupMappingsByCategory(
    envMappings: Map<string, EnvVarMapping>
  ): Map<string, Map<string, EnvVarMapping>> {
    const categories = new Map<string, Map<string, EnvVarMapping>>();
    
    for (const [envKey, mapping] of envMappings) {
      const category = this.getCategoryFromConfigPath(mapping.configPath);
      
      if (!categories.has(category)) {
        categories.set(category, new Map());
      }
      
      categories.get(category)!.set(envKey, mapping);
    }
    
    return categories;
  }

  /**
   * 从配置路径获取类别
   */
  private getCategoryFromConfigPath(configPath: string): string {
    const parts = configPath.split('.');
    
    // 查找包含 'cache' 的部分
    for (const part of parts) {
      if (part.toLowerCase().includes('cache')) {
        return part.replace(/cache$/i, '').toLowerCase() || 'general';
      }
    }
    
    // 如果没找到，使用第一个部分
    return parts[0]?.toLowerCase() || 'general';
  }

  /**
   * 生成统计信息
   */
  private generateStats(
    envMappings: Map<string, EnvVarMapping>,
    currentValues: Map<string, any>
  ): {
    totalMappings: number;
    configuredFromEnv: number;
    usingDefaults: number;
    missingValues: number;
  } {
    let configuredFromEnv = 0;
    let usingDefaults = 0;
    let missingValues = 0;
    
    for (const [envKey, mapping] of envMappings) {
      const currentValue = process.env[envKey];
      
      if (currentValue !== undefined && currentValue !== '') {
        configuredFromEnv++;
      } else if (mapping.defaultValue !== undefined) {
        usingDefaults++;
      } else {
        missingValues++;
      }
    }
    
    return {
      totalMappings: envMappings.size,
      configuredFromEnv,
      usingDefaults,
      missingValues
    };
  }
}

// 导出默认实例
export const envTemplateGenerator = new EnvTemplateGenerator();