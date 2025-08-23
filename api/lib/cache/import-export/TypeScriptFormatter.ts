import { CacheConfigs } from '../../../config/cache';
import { IFormatter, ImportExportOptions } from './types';

/**
 * TypeScript格式化器
 * 负责TypeScript格式的导入导出功能
 */
export class TypeScriptFormatter implements IFormatter {
  /**
   * 导出配置为TypeScript格式
   */
  export(config: CacheConfigs, options: ImportExportOptions): string {
    const lines: string[] = [];
    
    if (options.includeComments) {
      lines.push('/**');
      lines.push(' * Cache Configuration Export');
      lines.push(` * Exported at: ${new Date().toISOString()}`);
      lines.push(' * Format: TypeScript');
      lines.push(' */');
      lines.push('');
    }
    
    lines.push('import { CacheConfigs } from \'../config/cache\';');
    lines.push('');
    lines.push('export const cacheConfig: CacheConfigs = {');
    
    this.configToTypeScript(config, lines, 1);
    
    lines.push('};');
    lines.push('');
    lines.push('export default cacheConfig;');
    
    return lines.join('\n');
  }

  /**
   * 从TypeScript格式导入配置
   * 注意：这是一个简化的实现，实际项目中应该使用专门的TypeScript解析器
   */
  import(content: string, currentConfig?: CacheConfigs): CacheConfigs {
    // 简化的TypeScript解析实现
    // 在实际项目中应该使用专门的TypeScript解析器或AST工具
    throw new Error('TypeScript import not implemented. Please use JSON format or implement TypeScript parsing.');
  }

  /**
   * 验证TypeScript内容
   */
  validate(content: string): boolean {
    try {
      // 简化的验证，检查是否包含必要的TypeScript结构
      return content.includes('CacheConfigs') && 
             content.includes('export') && 
             (content.includes('cacheConfig') || content.includes('default'));
    } catch {
      return false;
    }
  }

  /**
   * 获取文件扩展名
   */
  getFileExtension(): string {
    return '.ts';
  }

  /**
   * 配置转TypeScript辅助方法
   */
  private configToTypeScript(obj: any, lines: string[], indent: number): void {
    const spaces = '  '.repeat(indent);
    const entries = Object.entries(obj);
    
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      const isLast = i === entries.length - 1;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        lines.push(`${spaces}${key}: {`);
        this.configToTypeScript(value, lines, indent + 1);
        lines.push(`${spaces}}${isLast ? '' : ','}`);
      } else {
        lines.push(`${spaces}${key}: ${JSON.stringify(value)}${isLast ? '' : ','}`);
      }
    }
  }
}

// 导出默认实例
export const typeScriptFormatter = new TypeScriptFormatter();