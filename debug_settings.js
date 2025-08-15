import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://powzuwgzbmpnqamchdma.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvd3p1d2d6Ym1wbnFhbWNoZG1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA5MjQwOCwiZXhwIjoyMDcwNjY4NDA4fQ.CJiTdPp8Afrv9C0eewo4YIwik54i75SEpSgZEp09o38';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSettings() {
  console.log('=== 检查数据库中的设置记录 ===');
  
  // 查询所有设置记录
  const { data: allSettings, error: allError } = await supabase
    .from('system_settings')
    .select('*')
    .order('setting_key');
    
  if (allError) {
    console.error('查询所有设置失败:', allError);
    return;
  }
  
  console.log('\n所有设置记录:');
  allSettings.forEach(setting => {
    console.log(`- ${setting.setting_key}: ${setting.setting_value}`);
  });
  
  // 专门查询联系邮箱和站点域名
  const targetKeys = ['basic.contactEmail', 'basic.siteDomain'];
  const { data: targetSettings, error: targetError } = await supabase
    .from('system_settings')
    .select('*')
    .in('setting_key', targetKeys);
    
  if (targetError) {
    console.error('查询目标设置失败:', targetError);
    return;
  }
  
  console.log('\n=== 目标设置记录 ===');
  targetKeys.forEach(key => {
    const setting = targetSettings.find(s => s.setting_key === key);
    if (setting) {
      console.log(`✓ ${key}: "${setting.setting_value}"`);
    } else {
      console.log(`✗ ${key}: 记录不存在`);
    }
  });
  
  // 如果记录不存在，创建默认记录
  const missingKeys = targetKeys.filter(key => 
    !targetSettings.find(s => s.setting_key === key)
  );
  
  if (missingKeys.length > 0) {
    console.log('\n=== 创建缺失的记录 ===');
    for (const key of missingKeys) {
      const { data, error } = await supabase
        .from('system_settings')
        .insert({
          setting_key: key,
          setting_value: '',
          setting_type: 'string',
          category: 'basic',
          description: key === 'basic.contactEmail' ? '联系邮箱' : '站点域名',
          is_public: true
        });
        
      if (error) {
        console.error(`创建 ${key} 失败:`, error);
      } else {
        console.log(`✓ 已创建 ${key} 记录`);
      }
    }
  }
}

checkSettings().catch(console.error);