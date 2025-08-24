/**
 * 测试 ActivityService 的修复是否有效
 */

console.log('🧪 开始测试 ActivityService 修复...');

try {
  // 测试 ActivityService 导入
  console.log('📦 测试 ActivityService 导入...');
  const { ActivityService } = require('./src/lib/activityService.ts');
  
  if (ActivityService) {
    console.log('✅ ActivityService 导入成功');
    
    // 测试服务可用性检查
    if (typeof ActivityService.isAvailable === 'function') {
      console.log('✅ ActivityService.isAvailable 方法可用');
      const isAvailable = ActivityService.isAvailable();
      console.log(`📊 服务可用性状态: ${isAvailable}`);
    } else {
      console.log('❌ ActivityService.isAvailable 方法不可用');
    }
    
    // 测试静态方法
    if (typeof ActivityService.getActivityCategories === 'function') {
      console.log('✅ ActivityService.getActivityCategories 方法可用');
    } else {
      console.log('❌ ActivityService.getActivityCategories 方法不可用');
    }
    
    if (typeof ActivityService.getUpcomingActivities === 'function') {
      console.log('✅ ActivityService.getUpcomingActivities 方法可用');
    } else {
      console.log('❌ ActivityService.getUpcomingActivities 方法不可用');
    }
    
    // 测试实例方法
    if (typeof ActivityService.prototype.getActivities === 'function') {
      console.log('✅ ActivityService.prototype.getActivities 方法可用');
    } else {
      console.log('❌ ActivityService.prototype.getActivities 方法不可用');
    }
    
  } else {
    console.log('❌ ActivityService 导入失败');
  }
  
} catch (error) {
  console.error('❌ 测试过程中发生错误:', error.message);
  console.error('错误堆栈:', error.stack);
}

console.log('🏁 测试完成');
