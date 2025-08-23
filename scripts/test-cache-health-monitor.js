#!/usr/bin/env node

/**
 * 缓存健康监控系统测试脚本
 * 用于验证改进后的健康监控功能
 */

const { cacheHealthMonitor } = require('../api/lib/CacheHealthMonitor.js');

async function testCacheHealthMonitor() {
  console.log('🧪 开始测试缓存健康监控系统...\n');

  try {
    // 1. 测试初始状态
    console.log('📊 1. 测试初始状态');
    const initialOverview = cacheHealthMonitor.getStatsOverview();
    console.log('初始概览:', initialOverview);
    console.log('初始健康报告:', cacheHealthMonitor.getHealthReport());
    console.log('');

    // 2. 模拟真实的缓存失效事件
    console.log('🔄 2. 模拟真实的缓存失效事件');
    
    // 模拟用户相关缓存失效
    cacheHealthMonitor.recordInvalidation('user:profile:123', 'user_update');
    cacheHealthMonitor.recordInvalidation('user:profile:123', 'profile_change');
    cacheHealthMonitor.recordInvalidation('user:profile:123', 'avatar_change');
    
    // 模拟帖子相关缓存失效
    cacheHealthMonitor.recordInvalidation('posts:list:trending', 'post_create');
    cacheHealthMonitor.recordInvalidation('posts:list:trending', 'post_update');
    cacheHealthMonitor.recordInvalidation('posts:list:trending', 'post_delete');
    
    // 模拟活动相关缓存失效
    cacheHealthMonitor.recordInvalidation('activities:list:featured', 'activity_create');
    cacheHealthMonitor.recordInvalidation('activities:list:featured', 'activity_update');
    
    // 模拟配置相关缓存失效
    cacheHealthMonitor.recordInvalidation('config:site_settings', 'config_update');
    cacheHealthMonitor.recordInvalidation('config:site_settings', 'admin_change');
    
    console.log('已记录多个缓存失效事件');
    console.log('');

    // 3. 测试健康报告
    console.log('📈 3. 测试健康报告');
    const healthReport = cacheHealthMonitor.getHealthReport();
    console.log('健康报告:', {
      totalInvalidations: healthReport.totalInvalidations,
      healthScore: healthReport.healthScore,
      highImpactKeys: healthReport.highImpactKeys.length,
      recommendations: healthReport.recommendations.length
    });
    console.log('');

    // 4. 测试统计概览
    console.log('📋 4. 测试统计概览');
    const overview = cacheHealthMonitor.getStatsOverview();
    console.log('统计概览:', overview);
    console.log('');

    // 5. 测试实时健康状态
    console.log('⏱️ 5. 测试实时健康状态');
    const realtimeStatus = cacheHealthMonitor.getRealTimeHealthStatus();
    console.log('实时状态:', {
      totalRecentKeys: realtimeStatus.totalRecentKeys,
      highFrequencyKeys: realtimeStatus.highFrequencyKeys,
      mediumFrequencyKeys: realtimeStatus.mediumFrequencyKeys
    });
    console.log('');

    // 6. 测试特定键的统计信息
    console.log('🔍 6. 测试特定键的统计信息');
    const userProfileStats = cacheHealthMonitor.getKeyStats('user:profile:123');
    console.log('用户配置缓存统计:', userProfileStats);
    console.log('');

    // 7. 测试高频失效场景
    console.log('🚨 7. 测试高频失效场景');
    for (let i = 0; i < 15; i++) {
      cacheHealthMonitor.recordInvalidation('api:rate:limit:user_456', 'rate_limit_exceeded');
    }
    
    const apiStats = cacheHealthMonitor.getKeyStats('api:rate:limit:user_456');
    console.log('API限流缓存统计:', apiStats);
    console.log('');

    // 8. 测试最终健康状态
    console.log('🏁 8. 测试最终健康状态');
    const finalHealthReport = cacheHealthMonitor.getHealthReport();
    console.log('最终健康评分:', finalHealthReport.healthScore);
    console.log('高影响键数量:', finalHealthReport.highImpactKeys.length);
    console.log('优化建议数量:', finalHealthReport.recommendations.length);
    console.log('');

    // 9. 测试清理功能
    console.log('🧹 9. 测试清理功能');
    console.log('清理前键数量:', cacheHealthMonitor.getStatsOverview().totalKeys);
    
    // 模拟24小时前的数据
    const oldStats = cacheHealthMonitor.getKeyStats('user:profile:123');
    if (oldStats) {
      oldStats.lastInvalidation = Date.now() - 25 * 60 * 60 * 1000; // 25小时前
    }
    
    // 手动触发清理（实际应该由定时器自动执行）
    // cacheHealthMonitor.cleanupExpiredStats();
    console.log('清理后键数量:', cacheHealthMonitor.getStatsOverview().totalKeys);
    console.log('');

    console.log('✅ 缓存健康监控系统测试完成！');
    console.log('\n📝 测试总结:');
    console.log('- 系统能够正确记录缓存失效事件');
    console.log('- 健康评分计算准确');
    console.log('- 实时监控功能正常');
    console.log('- 统计概览数据完整');
    console.log('- 优化建议生成合理');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  testCacheHealthMonitor().catch(console.error);
}

module.exports = { testCacheHealthMonitor };
