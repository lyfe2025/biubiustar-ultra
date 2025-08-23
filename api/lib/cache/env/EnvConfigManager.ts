import {
  EnvVarMapping,
  EnvOverrideResult,
  EnvValidationResult,
  EnvValueInfo,
  IEnvConfigManager
} from './types';
import { EnvMappingManager, envMappingManager } from './EnvMappingManager';
import { EnvProcessor, envProcessor } from './EnvProcessor';
import { EnvTemplateGenerator, envTemplateGenerator } from './EnvTemplateGenerator';

/**
 * 环境变量配置管理器
 * 整合环境变量映射管理、处理和模板生成功能
 */
export class EnvConfigManager implements IEnvConfigManager {
  private static instance: EnvConfigManager | null = null;
  private mappingManager: EnvMappingManager;
  private processor: EnvProcessor;
  private templateGenerator: EnvTemplateGenerator;
  private initialized: boolean = false;

  constructor(
    mappingManager?: EnvMappingManager,
    processor?: EnvProcessor,
    templateGenerator?: EnvTemplateGenerator
  ) {
    this.mappingManager = mappingManager || envMappingManager;
    this.processor = processor || envProcessor;
    this.templateGenerator = templateGenerator || envTemplateGenerator;
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): EnvConfigManager {
    if (!EnvConfigManager.instance) {
      EnvConfigManager.instance = new EnvConfigManager();
    }
    return EnvConfigManager.instance;
  }

  /**
   * 初始化环境变量配置
   */
  public initialize(): void {
    if (!this.initialized) {
      this.mappingManager.initializeDefaultMappings();
      this.initialized = true;
    }
  }

  /**
   * 添加环境变量映射
   */
  public addMapping(
    envKey: string,
    configPath: string,
    type: EnvVarMapping['type'] = 'string',
    defaultValue?: any,
    validator?: (value: any) => boolean,
    transformer?: (value: string) => any
  ): void {
    this.mappingManager.addMapping(
      envKey,
      configPath,
      type,
      defaultValue,
      validator,
      transformer
    );
  }

  /**
   * 移除环境变量映射
   */
  public removeMapping(envKey: string): boolean {
    return this.mappingManager.removeMapping(envKey);
  }

  /**
   * 获取所有映射
   */
  public getMappings(): EnvVarMapping[] {
    return this.mappingManager.getMappings();
  }

  /**
   * 获取特定映射
   */
  public getMapping(envKey: string): EnvVarMapping | undefined {
    return this.mappingManager.getMapping(envKey);
  }

  /**
   * 检查映射是否存在
   */
  public hasMapping(envKey: string): boolean {
    return this.mappingManager.hasMapping(envKey);
  }

  /**
   * 清除所有映射
   */
  public clearMappings(): void {
    this.mappingManager.clearMappings();
  }

  /**
   * 初始化默认映射
   */
  public initializeDefaultMappings(): void {
    this.mappingManager.initializeDefaultMappings();
  }

  /**
   * 应用环境变量覆盖
   */
  public applyEnvOverrides(configs: any): EnvOverrideResult {
    this.initialize();
    const mappingMap = this.mappingManager.getMappingMap();
    return this.processor.applyEnvOverrides(configs, mappingMap);
  }

  /**
   * 验证环境变量
   */
  public validateEnvironmentVariables(): EnvValidationResult {
    this.initialize();
    const mappingMap = this.mappingManager.getMappingMap();
    return this.processor.validateEnvironmentVariables(mappingMap);
  }

  /**
   * 获取当前环境变量值
   */
  public getCurrentEnvValues(): Map<string, EnvValueInfo> {
    this.initialize();
    const mappingMap = this.mappingManager.getMappingMap();
    return this.processor.getCurrentEnvValues(mappingMap);
  }

  /**
   * 获取覆盖历史
   */
  public getOverrideHistory(): EnvOverrideResult[] {
    return this.processor.getOverrideHistory();
  }

  /**
   * 清除覆盖历史
   */
  public clearOverrideHistory(): void {
    this.processor.clearOverrideHistory();
  }

  /**
   * 生成环境变量模板
   */
  public generateEnvTemplate(envMappings: Map<string, EnvVarMapping>, includeComments: boolean = true): string {
    return this.templateGenerator.generateEnvTemplate(envMappings, includeComments);
  }

  /**
   * 生成配置报告
   */
  public generateConfigReport(envMappings: Map<string, EnvVarMapping>, currentValues: Map<string, EnvValueInfo>): string {
    return this.templateGenerator.generateConfigReport(envMappings, currentValues);
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    this.clearMappings();
    this.clearOverrideHistory();
    this.initialized = false;
    
    if (EnvConfigManager.instance === this) {
      EnvConfigManager.instance = null;
    }
  }

  /**
   * 重置为默认配置
   */
  public reset(): void {
    this.clearMappings();
    this.clearOverrideHistory();
    this.initialized = false;
    this.initialize();
  }

  /**
   * 获取映射管理器（用于高级操作）
   */
  public getMappingManager(): EnvMappingManager {
    return this.mappingManager;
  }

  /**
   * 获取处理器（用于高级操作）
   */
  public getProcessor(): EnvProcessor {
    return this.processor;
  }

  /**
   * 获取模板生成器（用于高级操作）
   */
  public getTemplateGenerator(): EnvTemplateGenerator {
    return this.templateGenerator;
  }
}

// 导出默认实例
export const envConfigManager = EnvConfigManager.getInstance();