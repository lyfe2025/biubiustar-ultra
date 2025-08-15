import { createClient } from '@supabase/supabase-js';

// 从环境变量获取Supabase配置
const supabaseUrl = process.env.SUPABASE_URL || 'https://powzuwgzbmpnqamchdma.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY 环境变量未设置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBasicSettings() {
  try {
    console.log('查询system_settings表中的basic分类记录...');
    
    // 查询所有basic分类的记录
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('category', 'basic')
      .order('setting_key');
    
    if (error) {
      console.error('查询失败:', error);
      return;
    }
    
    console.log(`找到 ${data.length} 条basic分类记录:`);
    data.forEach(record => {
      console.log(`- ${record.setting_key}: ${record.setting_value} (${record.setting_type})`);
    });
    
    // 特别检查contact_email和site_domain
    const contactEmail = data.find(r => r.setting_key === 'contact_email');
    const siteDomain = data.find(r => r.setting_key === 'site_domain');
    
    console.log('\n关键字段检查:');
    console.log('contact_email:', contactEmail ? contactEmail.setting_value : '不存在');
    console.log('site_domain:', siteDomain ? siteDomain.setting_value : '不存在');
    
    // 查询所有分类
    const { data: allCategories, error: catError } = await supabase
      .from('system_settings')
      .select('category')
      .not('category', 'is', null);
    
    if (!catError) {
      const categories = [...new Set(allCategories.map(r => r.category))];
      console.log('\n所有分类:', categories.join(', '));
    }
    
  } catch (error) {
    console.error('脚本执行失败:', error);
  }
}

checkBasicSettings();