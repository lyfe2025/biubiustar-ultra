/**
 * 测试 BatchRequestProcessor 的导入和 ActivityService 的可用性
 */

console.log('🧪 开始测试 BatchRequestProcessor 导入...');

try {
  // 测试 ActivityService 导入
  console.log('📦 测试 ActivityService 导入...');
  const { ActivityService } = require('./src/lib/activityService.ts');
  
  if (ActivityService) {
    console.log('✅ ActivityService 导入成功');
    
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
  } else {
    console.log('❌ ActivityService 导入失败');
  }
  
  // 测试 socialService 导入
  console.log('📦 测试 socialService 导入...');
  const { socialService } = require('./src/lib/socialService/index.ts');
  
  if (socialService) {
    console.log('✅ socialService 导入成功');
  } else {
    console.log('❌ socialService 导入失败');
  }
  
} catch (error) {
  console.error('❌ 测试过程中发生错误:', error.message);
}

console.log('🏁 测试完成');
