import { CacheConfigs } from '../../../config/cache';
import { IFormatter, ImportExportOptions } from './types';

/**
 * YAML格式化器
 * 负责YAML格式的导入导出功能
 */
export class YamlFormatter implements IFormatter {
  /**
   * 导出配置为YAML格式
   */
  export(config: CacheConfigs, options: ImportExportOptions): string {
    const lines: string[] = [];
    
    if (options.includeComments) {
      lines.push('# Cache Configuration Export');
      lines.push(`# Exported at: ${new Date().toISOString()}`);
      lines.push('# Format: YAML');
      lines.push('');
    }
    
    lines.push('metadata:');
    lines.push(`  exportedAt: "${new Date().toISOString()}"`);
    lines.push('  version: "1.0.0"');
    lines.push('  format: "yaml"');
    lines.push('');
    lines.push('config:');
    
    this.configToYaml(config, lines, 1);
    
    return lines.join('\n');
  }

  /**
   * 从YAML格式导入配置
   * 注意：这是一个简化的实现，实际项目中应该使用专门的YAML解析库
   */
  import(content: string, currentConfig?: CacheConfigs): CacheConfigs {
    // 简化的YAML解析实现
    // 在实际项目中应该使用专门的YAML解析库如 js-yaml
    throw new Error('YAML import not implemented. Please use JSON format or install a YAML parsing library.');
  }

  /**
   * 验证YAML内容
   */
  validate(content: string): boolean {
    try {
      // 简化的验证，实际应该使用YAML解析库
      return content.includes('config:') && content.includes('metadata:');
    } catch {
      return false;
    }
  }

  /**
   * 获取文件扩展名
   */
  getFileExtension(): string {
    return '.yaml';
  }

  /**
   * 配置转YAML辅助方法
   */
  private configToYaml(obj: any, lines: string[], indent: number): void {
    const spaces = '  '.repeat(indent);
    
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        lines.push(`${spaces}${key}:`);
        this.configToYaml(value, lines, indent + 1);
      } else {
        lines.push(`${spaces}${key}: ${JSON.stringify(value)}`);
      }
    }
  }
}

// 导出默认实例
export const yamlFormatter = new YamlFormatter();