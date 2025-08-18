// 调试脚本：测试分类API数据解析
import fetch from 'node-fetch';

async function testCategoriesAPI() {
  try {
    console.log('🧪 开始测试分类API...');
    
    const response = await fetch('http://localhost:5173/api/categories/activity');
    console.log('📡 API响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📊 API原始响应数据:');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\n🔍 数据结构分析:');
    console.log('- data.success:', data.success);
    console.log('- data.data:', typeof data.data);
    console.log('- data.data.categories:', Array.isArray(data.data?.categories));
    console.log('- categories长度:', data.data?.categories?.length);
    
    const categories = data.data?.categories || [];
    console.log('\n✅ 提取的分类数据:');
    console.log('- 分类数量:', categories.length);
    if (categories.length > 0) {
      console.log('- 第一个分类:', categories[0]);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testCategoriesAPI();