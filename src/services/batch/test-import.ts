/**
 * 测试DataFetchers导入是否正常工作
 */

import { DataFetchers } from './fetchers';

console.log('✅ DataFetchers import successful');
console.log('DataFetchers class:', typeof DataFetchers);

// 测试是否可以创建实例（不需要实际运行）
try {
  // 模拟依赖
  const mockCacheManager = {} as any;
  const mockPerformanceMonitor = {} as any;
  const mockFallbackHandler = {} as any;
  
  const dataFetchers = new DataFetchers(
    mockCacheManager,
    mockPerformanceMonitor,
    mockFallbackHandler
  );
  
  console.log('✅ DataFetchers instance created successfully');
  console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(dataFetchers)));
  
} catch (error) {
  console.error('❌ Failed to create instance:', error);
}
