// 前端语言状态调试脚本
import fetch from 'node-fetch';

// 测试前端页面的语言状态
async function testFrontendLanguage() {
  console.log('🔍 测试前端语言状态...');
  
  try {
    // 访问前端页面并检查语言设置
    const response = await fetch('http://localhost:5173/activities');
    const html = await response.text();
    
    console.log('📄 前端页面状态:');
    console.log('- 状态码:', response.status);
    console.log('- 页面大小:', html.length, '字符');
    
    // 检查HTML中的语言设置
    const langMatch = html.match(/lang="([^"]+)"/i);
    if (langMatch) {
      console.log('- HTML lang属性:', langMatch[1]);
    }
    
    // 检查localStorage中的语言设置（这需要在浏览器中执行）
    console.log('\n💡 建议在浏览器控制台中执行以下命令检查语言状态:');
    console.log('localStorage.getItem("language")');
    console.log('document.documentElement.lang');
    
    // 测试API接口
    console.log('\n🔍 测试API接口...');
    
    const zhTwResponse = await fetch('http://localhost:5173/api/categories/activity?lang=zh-tw');
    const zhTwData = await zhTwResponse.json();
    
    const zhCnResponse = await fetch('http://localhost:5173/api/categories/activity?lang=zh-cn');
    const zhCnData = await zhCnResponse.json();
    
    console.log('\n📊 API返回对比:');
    console.log('繁体中文API (zh-tw):');
    if (zhTwData.data && zhTwData.data.categories) {
      zhTwData.data.categories.forEach(cat => {
        if (cat.id === '1ca52152-11f7-451c-9fa0-ca71a6771e51') {
          console.log(`  - ID: ${cat.id}`);
          console.log(`  - name: "${cat.name}"`);
          console.log(`  - description: "${cat.description}"`);
        }
      });
    }
    
    console.log('\n简体中文API (zh-cn):');
    if (zhCnData.data && zhCnData.data.categories) {
      zhCnData.data.categories.forEach(cat => {
        if (cat.id === '1ca52152-11f7-451c-9fa0-ca71a6771e51') {
          console.log(`  - ID: ${cat.id}`);
          console.log(`  - name: "${cat.name}"`);
          console.log(`  - description: "${cat.description}"`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testFrontendLanguage();