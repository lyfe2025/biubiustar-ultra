/**
 * 降级机制服务
 * 提供统一的降级策略和错误处理
 */

export interface FallbackConfig {
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  enableFallback: boolean;
}

export interface FallbackResult<T> {
  data: T | null;
  success: boolean;
  usedFallback: boolean;
  error?: Error;
  attempts: number;
}

class FallbackService {
  private defaultConfig: FallbackConfig = {
    maxRetries: 2,
    retryDelay: 1000,
    timeout: 10000,
    enableFallback: true
  };

  /**
   * 执行带降级机制的操作
   */
  async executeWithFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    config: Partial<FallbackConfig> = {}
  ): Promise<FallbackResult<T>> {
    const finalConfig = { ...this.defaultConfig, ...config };
    let lastError: Error | undefined;
    let attempts = 0;

    // 尝试主要操作
    for (let i = 0; i <= finalConfig.maxRetries; i++) {
      attempts++;
      try {
        console.log(`🔄 尝试主要操作 (第${i + 1}次)`);
        const data = await this.withTimeout(
          primaryOperation(),
          finalConfig.timeout
        );
        
        console.log('✅ 主要操作成功');
        return {
          data,
          success: true,
          usedFallback: false,
          attempts
        };
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ 主要操作失败 (第${i + 1}次):`, error);
        
        if (i < finalConfig.maxRetries) {
          await this.delay(finalConfig.retryDelay * (i + 1)); // 指数退避
        }
      }
    }

    // 如果启用降级且主要操作失败，尝试降级操作
    if (finalConfig.enableFallback) {
      try {
        console.log('🔄 尝试降级操作');
        attempts++;
        const data = await this.withTimeout(
          fallbackOperation(),
          finalConfig.timeout
        );
        
        console.log('✅ 降级操作成功');
        return {
          data,
          success: true,
          usedFallback: true,
          attempts
        };
      } catch (fallbackError) {
        console.error('❌ 降级操作也失败:', fallbackError);
        lastError = fallbackError as Error;
      }
    }

    // 所有操作都失败
    console.error('❌ 所有操作都失败');
    return {
      data: null,
      success: false,
      usedFallback: finalConfig.enableFallback,
      error: lastError,
      attempts
    };
  }

  /**
   * 为Promise添加超时机制
   */
  private withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`操作超时 (${timeout}ms)`));
        }, timeout);
      })
    ]);
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 检查错误是否为网络错误
   */
  isNetworkError(error: Error): boolean {
    const networkErrorMessages = [
      'fetch',
      'network',
      'timeout',
      'connection',
      'ECONNREFUSED',
      'ENOTFOUND'
    ];
    
    return networkErrorMessages.some(msg => 
      error.message.toLowerCase().includes(msg.toLowerCase())
    );
  }

  /**
   * 检查错误是否为服务器错误
   */
  isServerError(error: Error): boolean {
    const serverErrorMessages = [
      '500',
      '502',
      '503',
      '504',
      'internal server error',
      'bad gateway',
      'service unavailable'
    ];
    
    return serverErrorMessages.some(msg => 
      error.message.toLowerCase().includes(msg.toLowerCase())
    );
  }

  /**
   * 获取错误的严重程度
   */
  getErrorSeverity(error: Error): 'low' | 'medium' | 'high' {
    if (this.isNetworkError(error)) {
      return 'high'; // 网络错误优先级高，需要降级
    }
    
    if (this.isServerError(error)) {
      return 'high'; // 服务器错误优先级高，需要降级
    }
    
    if (error.message.includes('timeout')) {
      return 'medium'; // 超时错误中等优先级
    }
    
    return 'low'; // 其他错误低优先级
  }

  /**
   * 记录降级事件
   */
  logFallbackEvent(operation: string, result: FallbackResult<any>): void {
    const logData = {
      operation,
      success: result.success,
      usedFallback: result.usedFallback,
      attempts: result.attempts,
      timestamp: new Date().toISOString(),
      error: result.error?.message
    };

    if (result.usedFallback) {
      console.warn('📊 降级事件记录:', logData);
    } else {
      console.log('📊 操作记录:', logData);
    }

    // 可以在这里添加发送到监控系统的逻辑
    this.sendToMonitoring(logData);
  }

  /**
   * 发送监控数据（占位符）
   */
  private sendToMonitoring(data: any): void {
    // 这里可以集成实际的监控系统
    // 例如：发送到 Sentry、DataDog、自定义监控端点等
    if (process.env.NODE_ENV === 'development') {
      console.log('📈 监控数据:', data);
    }
  }
}

export const fallbackService = new FallbackService();
export default fallbackService;