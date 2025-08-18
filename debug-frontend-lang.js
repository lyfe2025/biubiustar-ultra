// 前端语言切换调试脚本
// 测试前端语言切换时API调用是否正确

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ixqhqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWhxanFqcWpxanFqcWpxanFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU5NzI4NCwiZXhwIjoyMDUwMTczMjg0fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 开始测试前端语言切换API调用...');

// 模拟不同语言的API调用
const testLanguages = ['zh', 'en', 'zh-tw', 'vi'];

for (const lang of testLanguages) {
  console.log(`\n🌐 测试语言: ${lang}`);
  
  try {
    console.log(`📡 模拟API调用: /api/categories/activity?lang=${lang}`);
    
    // 直接查询数据库来模拟后端逻辑
    const { data: categories, error } = await supabase
      .from('activity_categories')
      .select('id, name, name_zh, name_zh_tw, name_en, name_vi')
      .order('name');
    
    if (error) {
      console.error(`❌ 数据库查询错误:`, error);
      continue;
    }
    
    console.log(`📊 查询到 ${categories.length} 个分类`);
    
    // 模拟后端本地化逻辑
    const localizedCategories = categories.map(cat => {
      let localizedName = cat.name; // 默认名称
      
      switch (lang) {
        case 'zh':
          localizedName = cat.name_zh || cat.name;
          break;
        case 'zh-tw':
          localizedName = cat.name_zh_tw || cat.name_zh || cat.name;
          break;
        case 'en':
          localizedName = cat.name_en || cat.name;
          break;
        case 'vi':
          localizedName = cat.name_vi || cat.name;
          break;
      }
      
      return {
        id: cat.id,
        name: localizedName,
        original_name: cat.name,
        name_zh: cat.name_zh,
        name_en: cat.name_en,
        name_zh_tw: cat.name_zh_tw,
        name_vi: cat.name_vi
      };
    });
    
    // 找到测试分类 "111"
    const testCategory = localizedCategories.find(cat => 
      cat.name_zh === '111' || cat.original_name === '111'
    );
    
    if (testCategory) {
      console.log(`🎯 找到测试分类:`);
      console.log(`   - 当前语言显示名称: ${testCategory.name}`);
      console.log(`   - 原始名称: ${testCategory.original_name}`);
      console.log(`   - 中文: ${testCategory.name_zh}`);
      console.log(`   - 英文: ${testCategory.name_en}`);
      console.log(`   - 繁体中文: ${testCategory.name_zh_tw}`);
      console.log(`   - 越南语: ${testCategory.name_vi}`);
    } else {
      console.log('❌ 未找到测试分类 "111"');
    }
    
  } catch (error) {
    console.error(`❌ 测试语言 ${lang} 时出错:`, error);
  }
}

console.log('\n✅ 前端语言切换测试完成');
process.exit(0);