#!/usr/bin/env node

/**
 * 调试脚本：检查ActivityCard组件中分类匹配的问题
 * 用于排查"健身运动"等分类显示问题
 */

const fs = require('fs');
const path = require('path');

// 模拟获取活动数据的函数
function getMockActivities() {
  return [
    {
      id: '1',
      title: '晨跑活动',
      category: '健身运动',
      category_id: 1,
      description: '每日晨跑锻炼'
    },
    {
      id: '2', 
      title: '瑜伽课程',
      category: 'Fitness & Sports',
      category_id: 1,
      description: '放松身心的瑜伽练习'
    },
    {
      id: '3',
      title: '读书分享会',
      category: '学习交流',
      category_id: 2,
      description: '分享读书心得'
    },
    {
      id: '4',
      title: 'JavaScript Workshop',
      category: 'Learning & Exchange',
      category_id: 2,
      description: 'Learn modern JavaScript'
    }
  ];
}

// 模拟获取分类数据的函数
function getMockCategories() {
  return [
    {
      id: 1,
      name: 'Fitness & Sports',
      name_zh: '健身运动',
      name_zh_tw: '健身運動',
      name_en: 'Fitness & Sports',
      name_vi: 'Thể dục & Thể thao',
      description: 'Physical activities and sports',
      description_zh: '体育活动和运动',
      color: '#10B981',
      icon: 'dumbbell'
    },
    {
      id: 2,
      name: 'Learning & Exchange',
      name_zh: '学习交流',
      name_zh_tw: '學習交流',
      name_en: 'Learning & Exchange', 
      name_vi: 'Học tập & Trao đổi',
      description: 'Educational and knowledge sharing activities',
      description_zh: '教育和知识分享活动',
      color: '#3B82F6',
      icon: 'book'
    },
    {
      id: 3,
      name: 'Social & Entertainment',
      name_zh: '社交娱乐',
      name_zh_tw: '社交娛樂',
      name_en: 'Social & Entertainment',
      name_vi: 'Xã hội & Giải trí',
      description: 'Social gatherings and entertainment',
      description_zh: '社交聚会和娱乐活动',
      color: '#F59E0B',
      icon: 'users'
    }
  ];
}

// 获取分类显示名称的函数（模拟ActivityCard中的逻辑）
function getCategoryDisplayName(activity, categories, language = 'zh') {
  console.log(`\n🔍 检查活动: "${activity.title}"`);
  console.log(`   - category字段: "${activity.category}"`);
  console.log(`   - category_id字段: ${activity.category_id}`);
  
  // 方法1: 通过category_id匹配（推荐方式）
  if (activity.category_id) {
    const categoryById = categories.find(cat => cat.id === activity.category_id);
    if (categoryById) {
      const displayName = getLocalizedCategoryName(categoryById, language);
      console.log(`   ✅ 通过category_id匹配成功: ${displayName}`);
      return displayName;
    } else {
      console.log(`   ❌ 通过category_id匹配失败: 找不到ID为${activity.category_id}的分类`);
    }
  }
  
  // 方法2: 通过category字符串匹配（备用方式）
  const categoryByName = categories.find(cat => {
    const names = [
      cat.name,
      cat.name_zh,
      cat.name_zh_tw, 
      cat.name_en,
      cat.name_vi
    ].filter(Boolean);
    
    return names.some(name => 
      name.toLowerCase() === activity.category.toLowerCase() ||
      name === activity.category
    );
  });
  
  if (categoryByName) {
    const displayName = getLocalizedCategoryName(categoryByName, language);
    console.log(`   ✅ 通过category字符串匹配成功: ${displayName}`);
    return displayName;
  } else {
    console.log(`   ❌ 通过category字符串匹配失败`);
    console.log(`   📝 尝试匹配的字符串: "${activity.category}"`);
    console.log(`   📝 可用的分类名称:`);
    categories.forEach(cat => {
      console.log(`      - ID ${cat.id}: ${cat.name} | ${cat.name_zh} | ${cat.name_en}`);
    });
  }
  
  // 方法3: 直接返回原始category字段
  console.log(`   ⚠️  使用原始category字段: "${activity.category}"`);
  return activity.category;
}

// 获取本地化分类名称
function getLocalizedCategoryName(category, language) {
  switch (language) {
    case 'zh':
      return category.name_zh || category.name;
    case 'zh-tw':
      return category.name_zh_tw || category.name_zh || category.name;
    case 'en':
      return category.name_en || category.name;
    case 'vi':
      return category.name_vi || category.name;
    default:
      return category.name;
  }
}

// 主要调试函数
function debugCategoryMatching() {
  console.log('🚀 开始调试ActivityCard分类匹配问题\n');
  console.log('=' .repeat(60));
  
  const activities = getMockActivities();
  const categories = getMockCategories();
  
  console.log('📊 活动数据:');
  activities.forEach(activity => {
    console.log(`   - ${activity.title}: category="${activity.category}", category_id=${activity.category_id}`);
  });
  
  console.log('\n📋 分类数据:');
  categories.forEach(category => {
    console.log(`   - ID ${category.id}: ${category.name} (中文: ${category.name_zh})`);
  });
  
  console.log('\n' + '=' .repeat(60));
  console.log('🔍 开始匹配测试\n');
  
  // 测试不同语言环境
  const languages = ['zh', 'en', 'zh-tw', 'vi'];
  
  languages.forEach(lang => {
    console.log(`\n🌐 语言环境: ${lang}`);
    console.log('-' .repeat(40));
    
    activities.forEach(activity => {
      const displayName = getCategoryDisplayName(activity, categories, lang);
      console.log(`   最终显示: "${displayName}"`);
    });
  });
  
  console.log('\n' + '=' .repeat(60));
  console.log('🎯 特别关注"健身运动"分类的匹配情况\n');
  
  const fitnessActivities = activities.filter(activity => 
    activity.category.includes('健身') || 
    activity.category.includes('Fitness') ||
    activity.category_id === 1
  );
  
  fitnessActivities.forEach(activity => {
    console.log(`\n🏃 健身相关活动: "${activity.title}"`);
    ['zh', 'en'].forEach(lang => {
      const result = getCategoryDisplayName(activity, categories, lang);
      console.log(`   ${lang === 'zh' ? '中文' : '英文'}显示: "${result}"`);
    });
  });
  
  console.log('\n' + '=' .repeat(60));
  console.log('💡 问题分析和建议\n');
  
  console.log('🔍 发现的问题:');
  console.log('   1. 活动数据中category字段存储的值不一致');
  console.log('   2. 有些用中文("健身运动")，有些用英文("Fitness & Sports")');
  console.log('   3. 这导致字符串匹配时可能失败');
  
  console.log('\n✅ 建议的解决方案:');
  console.log('   1. 优先使用category_id进行匹配（数字ID更可靠）');
  console.log('   2. 确保所有活动都有正确的category_id');
  console.log('   3. category字段作为备用，支持多语言匹配');
  console.log('   4. 在ActivityCard组件中实现容错匹配逻辑');
  
  console.log('\n🛠️  代码修复建议:');
  console.log('   - 在ActivityCard中优先检查category_id');
  console.log('   - 如果category_id匹配失败，再尝试多语言字符串匹配');
  console.log('   - 添加调试日志以便排查问题');
  
  console.log('\n✨ 调试完成!');
}

// 运行调试
if (require.main === module) {
  debugCategoryMatching();
}

module.exports = {
  debugCategoryMatching,
  getCategoryDisplayName,
  getLocalizedCategoryName
};