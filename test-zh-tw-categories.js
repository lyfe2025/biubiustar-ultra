import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Supabase配置
const supabaseUrl = 'https://powzuwgzbmpnqamchdma.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvd3p1d2d6Ym1wbnFhbWNoZG1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTI0MDgsImV4cCI6MjA3MDY2ODQwOH0.PKigFNCVQWUbz4CtyeOS2ohF876q7nUGiWsLWmijtGc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testZhTwCategories() {
  console.log('=== 测试繁体中文分类数据 ===\n');
  
  try {
    // 1. 直接查询数据库中的分类数据
    console.log('1. 查询数据库中的activity_categories表数据:');
    const { data: dbCategories, error: dbError } = await supabase
      .from('activity_categories')
      .select('*')
      .order('id');
    
    if (dbError) {
      console.error('数据库查询错误:', dbError);
      return;
    }
    
    console.log('数据库中的分类数据:');
    dbCategories.forEach(cat => {
      console.log(`ID: ${cat.id}`);
      console.log(`  name: ${cat.name}`);
      console.log(`  name_zh: ${cat.name_zh}`);
      console.log(`  name_zh_tw: ${cat.name_zh_tw}`);
      console.log(`  name_en: ${cat.name_en}`);
      console.log(`  name_vi: ${cat.name_vi}`);
      console.log('---');
    });
    
    // 2. 测试API接口 - 繁体中文
    console.log('\n2. 测试API接口 /api/categories/activity?lang=zh-tw:');
    const apiResponse = await fetch('http://localhost:5173/api/categories/activity?lang=zh-tw');
    const apiData = await apiResponse.json();
    
    console.log('API返回的繁体中文分类数据:');
    console.log(JSON.stringify(apiData, null, 2));
    
    // 3. 测试API接口 - 简体中文对比
    console.log('\n3. 测试API接口 /api/categories/activity?lang=zh-cn:');
    const apiResponseZh = await fetch('http://localhost:5173/api/categories/activity?lang=zh-cn');
    const apiDataZh = await apiResponseZh.json();
    
    console.log('API返回的简体中文分类数据:');
    console.log(JSON.stringify(apiDataZh, null, 2));
    
    // 4. 对比分析
    console.log('\n4. 数据对比分析:');
    if (apiData.success && apiDataZh.success) {
      const zhTwCategories = apiData.data.categories || apiData.data;
      const zhCnCategories = apiDataZh.data.categories || apiDataZh.data;
      
      console.log('繁体中文API返回的分类名称:');
      if (Array.isArray(zhTwCategories)) {
        zhTwCategories.forEach(cat => {
          console.log(`  ${cat.id}: ${cat.name}`);
        });
      } else {
        console.log('  繁体中文API返回的数据不是数组格式');
        console.log('  数据结构:', typeof zhTwCategories);
      }
      
      console.log('\n简体中文API返回的分类名称:');
      if (Array.isArray(zhCnCategories)) {
        zhCnCategories.forEach(cat => {
          console.log(`  ${cat.id}: ${cat.name}`);
        });
      } else {
        console.log('  简体中文API返回的数据不是数组格式');
        console.log('  数据结构:', typeof zhCnCategories);
      }
      
      // 检查是否有差异
      if (Array.isArray(zhTwCategories) && Array.isArray(zhCnCategories)) {
        const hasDifference = zhTwCategories.some((twCat) => {
          const cnCat = zhCnCategories.find(c => c.id === twCat.id);
          return twCat && cnCat && twCat.name !== cnCat.name;
        });
        
        console.log(`\n繁体和简体分类名称是否有差异: ${hasDifference ? '是' : '否'}`);
        
        if (!hasDifference) {
          console.log('⚠️  警告: 繁体和简体返回的分类名称完全相同，可能存在问题!');
        }
        
        // 特别检查ID为1ca52152的分类
        const testCatTw = zhTwCategories.find(cat => cat.id === '1ca52152-11f7-451c-9fa0-ca71a6771e51');
        const testCatCn = zhCnCategories.find(cat => cat.id === '1ca52152-11f7-451c-9fa0-ca71a6771e51');
        
        if (testCatTw && testCatCn) {
          console.log('\n特别检查测试分类 (ID: 1ca52152):');
          console.log(`  繁体中文API返回: ${testCatTw.name}`);
          console.log(`  简体中文API返回: ${testCatCn.name}`);
          console.log(`  期望繁体显示: 222`);
          console.log(`  实际是否正确: ${testCatTw.name === '222' ? '是' : '否'}`);
        }
      }
    }
    
    // 5. 检查特定的"111"和"222"数据
    console.log('\n5. 检查特定分类数据:');
    const category111 = dbCategories.find(cat => cat.name_zh === '111' || cat.name === '111');
    if (category111) {
      console.log('找到包含"111"的分类:');
      console.log(`  ID: ${category111.id}`);
      console.log(`  name: ${category111.name}`);
      console.log(`  name_zh: ${category111.name_zh}`);
      console.log(`  name_zh_tw: ${category111.name_zh_tw}`);
      console.log(`  期望繁体显示: ${category111.name_zh_tw || '未设置'}`);
    } else {
      console.log('未找到包含"111"的分类数据');
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
testZhTwCategories();