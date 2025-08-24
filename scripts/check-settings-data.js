#!/usr/bin/env node

/**
 * 检查数据库中的设置数据
 * 用于调试基本设置页面数据不显示的问题
 */

const { createClient } = require('@supabase/supabase-js');

// 配置信息 - 需要根据实际情况调整
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

async function checkSettingsData() {
  try {
    console.log('🔍 开始检查数据库中的设置数据...\n');
    
    // 创建 Supabase 客户端
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    console.log('📊 检查 system_settings 表结构...');
    
    // 检查表结构
    const { data: tableInfo, error: tableError } = await supabase
      .from('system_settings')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ 无法访问 system_settings 表:', tableError.message);
      return;
    }
    
    console.log('✅ system_settings 表可访问');
    
    // 获取所有设置数据
    console.log('\n📋 获取所有设置数据...');
    const { data: allSettings, error: allError } = await supabase
      .from('system_settings')
      .select('*')
      .order('category', { ascending: true })
      .order('setting_key', { ascending: true });
    
    if (allError) {
      console.error('❌ 获取所有设置失败:', allError.message);
      return;
    }
    
    console.log(`✅ 获取到 ${allSettings.length} 条设置记录\n`);
    
    // 按分类分组显示
    const settingsByCategory = {};
    allSettings.forEach(setting => {
      const { category, setting_key, setting_value, setting_type, description, is_public } = setting;
      if (!settingsByCategory[category]) {
        settingsByCategory[category] = [];
      }
      settingsByCategory[category].push({
        key: setting_key,
        value: setting_value,
        type: setting_type,
        description,
        is_public
      });
    });
    
    // 显示分类统计
    console.log('📊 按分类统计:');
    Object.keys(settingsByCategory).forEach(category => {
      const count = settingsByCategory[category].length;
      console.log(`  ${category}: ${count} 条记录`);
    });
    
    // 显示基本设置详情
    console.log('\n🏠 基本设置详情:');
    if (settingsByCategory.basic) {
      settingsByCategory.basic.forEach(setting => {
        console.log(`  ${setting.key}: ${setting.value} (${setting.type})`);
        if (setting.description) {
          console.log(`    描述: ${setting.description}`);
        }
      });
    } else {
      console.log('  ❌ 没有找到 basic 分类的设置');
    }
    
    // 检查是否有缺失的基本设置
    console.log('\n🔍 检查缺失的基本设置...');
    const expectedBasicSettings = [
      'site_name',
      'site_description',
      'site_description_zh',
      'site_description_en',
      'contact_email',
      'site_domain',
      'site_logo',
      'site_favicon',
      'default_language'
    ];
    
    const existingBasicKeys = settingsByCategory.basic ? 
      settingsByCategory.basic.map(s => s.key) : [];
    
    const missingSettings = expectedBasicSettings.filter(key => 
      !existingBasicKeys.includes(key)
    );
    
    if (missingSettings.length > 0) {
      console.log('❌ 缺失的基本设置:');
      missingSettings.forEach(key => console.log(`  - ${key}`));
    } else {
      console.log('✅ 所有基本设置都存在');
    }
    
    // 显示完整数据（可选）
    if (process.argv.includes('--verbose')) {
      console.log('\n📄 完整设置数据:');
      console.log(JSON.stringify(settingsByCategory, null, 2));
    }
    
  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error.message);
    console.error('错误详情:', error);
  }
}

// 运行检查
if (require.main === module) {
  checkSettingsData();
}

module.exports = { checkSettingsData };
