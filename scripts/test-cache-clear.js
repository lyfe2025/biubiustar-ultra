#!/usr/bin/env node

/**
 * 测试缓存清理功能
 * 验证评论成功后是否能正确清除所有相关缓存
 */

console.log('🧹 开始测试缓存清理功能...\n');

// 模拟localStorage
const mockLocalStorage = {
  data: {},
  setItem(key, value) {
    this.data[key] = value;
    console.log(`📝 设置缓存: ${key}`);
  },
  getItem(key) {
    return this.data[key] || null;
  },
  removeItem(key) {
    delete this.data[key];
    console.log(`🗑️ 删除缓存: ${key}`);
  },
  key(index) {
    return Object.keys(this.data)[index] || null;
  },
  get length() {
    return Object.keys(this.data).length;
  }
};

// 模拟缓存数据
function setupMockCache() {
  console.log('🔧 设置模拟缓存数据...');
  
  // 设置一些模拟的缓存键
  mockLocalStorage.setItem('cache_comments_count_batch_post1,post2,post3', '{"post1":5,"post2":3,"post3":8}');
  mockLocalStorage.setItem('cache_comments_count_batch_post1,post4', '{"post1":5,"post4":2}');
  mockLocalStorage.setItem('cache_post1', '{"id":"post1","title":"测试帖子1"}');
  mockLocalStorage.setItem('cache_post_comments_count_post1', '5');
  mockLocalStorage.setItem('cache_post_likes_count_post1', '12');
  mockLocalStorage.setItem('cache_other_data', '{"unrelated":"data"}');
  
  console.log(`📊 当前缓存数量: ${mockLocalStorage.length}`);
  console.log('缓存键列表:', Object.keys(mockLocalStorage.data));
  console.log('');
}

// 模拟缓存清理函数
function clearAllPostCache(postId) {
  console.log(`🧹 开始全面清除帖子 ${postId} 的所有缓存...`);
  
  try {
    // 1. 清除包含该帖子的批量缓存
    const batchCacheKeys = Object.keys(mockLocalStorage.data).filter(key => 
      key.includes('comments_count_batch') && key.includes(postId)
    );
    
    batchCacheKeys.forEach(key => {
      mockLocalStorage.removeItem(key);
      console.log(`   🗑️ 清除批量缓存: ${key}`);
    });
    
    // 2. 清除单个帖子的缓存
    const singleCacheKeys = Object.keys(mockLocalStorage.data).filter(key => 
      key.includes(`post_${postId}`) || key.includes(`post_comments_count_${postId}`) || key.includes(`post_likes_count_${postId}`)
    );
    
    singleCacheKeys.forEach(key => {
      mockLocalStorage.removeItem(key);
      console.log(`   🗑️ 清除单个缓存: ${key}`);
    });
    
    // 3. 清除所有包含该帖子的缓存
    const allRelatedKeys = Object.keys(mockLocalStorage.data).filter(key => 
      key.includes(postId)
    );
    
    allRelatedKeys.forEach(key => {
      mockLocalStorage.removeItem(key);
      console.log(`   🗑️ 清除相关缓存: ${key}`);
    });
    
    console.log(`✅ 帖子 ${postId} 的所有缓存已全面清除`);
    console.log(`📊 剩余缓存数量: ${mockLocalStorage.length}`);
    console.log('剩余缓存键:', Object.keys(mockLocalStorage.data));
    
  } catch (error) {
    console.error('❌ 缓存清理失败:', error);
  }
}

// 执行测试
console.log('🚀 开始执行缓存清理测试...\n');

// 测试1: 清理post1的缓存
console.log('🧪 测试1: 清理post1的所有缓存');
setupMockCache();
clearAllPostCache('post1');
console.log('');

// 测试2: 清理post2的缓存
console.log('🧪 测试2: 清理post2的所有缓存');
setupMockCache();
clearAllPostCache('post2');
console.log('');

// 测试3: 清理不存在的帖子
console.log('🧪 测试3: 清理不存在的帖子post999');
setupMockCache();
clearAllPostCache('post999');
console.log('');

console.log('📊 测试总结:');
console.log('1. 批量缓存应该被正确清除');
console.log('2. 单个帖子缓存应该被正确清除');
console.log('3. 不相关的缓存应该保持不变');
console.log('4. 缓存清理过程应该有详细的日志输出');

console.log('\n🎯 关键功能点:');
console.log('- 批量缓存清理: comments_count_batch_*');
console.log('- 单个缓存清理: post_*, post_comments_count_*, post_likes_count_*');
console.log('- 相关缓存清理: 所有包含帖子ID的缓存');
console.log('- 错误处理: 清理失败时应该有适当的错误处理');

console.log('\n✨ 缓存清理测试完成！');
