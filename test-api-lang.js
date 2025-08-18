import fetch from 'node-fetch';

// 测试不同语言下的分类API响应
async function testCategoryAPI() {
  const languages = ['zh', 'en', 'zh-tw', 'vi'];
  const baseUrl = 'http://localhost:3001/api/categories/activity';
  
  console.log('=== 测试分类API多语言响应 ===\n');
  
  for (const lang of languages) {
    try {
      console.log(`🌐 测试语言: ${lang}`);
      const url = `${baseUrl}?lang=${lang}`;
      console.log(`📡 请求URL: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.log(`❌ HTTP错误: ${response.status} ${response.statusText}`);
        continue;
      }
      
      const response_data = await response.json();
      console.log(`✅ 响应状态: ${response.status}`);
      
      // 提取实际的分类数据数组
      const categories = response_data.data?.categories || response_data.data || response_data;
      
      if (!Array.isArray(categories)) {
        console.log(`⚠️  无法找到分类数组数据`);
        console.log(`📋 响应结构:`, JSON.stringify(response_data, null, 2));
        continue;
      }
      
      console.log(`📊 分类数量: ${categories.length}`);
      console.log(`📊 总数: ${response_data.total || '未知'}`);
      
      // 查找用户提到的测试分类 (ID: 1ca52152-11f7-451c-9fa0-ca71a6771e51)
      const testCategory = categories.find(cat => cat.id === '1ca52152-11f7-451c-9fa0-ca71a6771e51');
      if (testCategory) {
        console.log(`🎯 找到测试分类:`);
        console.log(`   - ID: ${testCategory.id}`);
        console.log(`   - 名称: ${testCategory.name}`);
        console.log(`   - 中文: ${testCategory.name_zh || '未设置'}`);
        console.log(`   - 英文: ${testCategory.name_en || '未设置'}`);
        console.log(`   - 繁体中文: ${testCategory.name_zh_tw || '未设置'}`);
        console.log(`   - 越南语: ${testCategory.name_vi || '未设置'}`);
      } else {
        console.log(`⚠️  未找到测试分类 (ID: 1ca52152-11f7-451c-9fa0-ca71a6771e51)`);
      }
      
      // 显示前3个分类的名称
      console.log(`📝 前3个分类名称:`);
      categories.slice(0, 3).forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.name} (ID: ${cat.id})`);
      });
      
    } catch (error) {
      console.log(`❌ 请求失败: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
  }
}

// 运行测试
testCategoryAPI().catch(console.error);