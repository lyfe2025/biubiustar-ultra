/**
 * 临时缓存清理脚本
 * 用于清理config和api缓存中的旧数据
 */

import { configCache, apiCache } from './api/lib/cacheInstances.js';

console.log('开始清理缓存...');

// 清理配置缓存
console.log('清理配置缓存...');
configCache.clear();
console.log('配置缓存已清理');

// 清理API缓存
console.log('清理API缓存...');
apiCache.clear();
console.log('API缓存已清理');

// 显示清理后的统计信息
console.log('\n清理后的缓存统计:');
console.log('配置缓存:', configCache.getStats());
console.log('API缓存:', apiCache.getStats());

console.log('\n缓存清理完成！');