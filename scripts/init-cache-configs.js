import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Supabase 配置
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 默认缓存配置
const defaultCacheConfigs = [
  {
    cache_type: 'user',
    config_data: {
      maxSize: 1000,
      defaultTTL: 15 * 60 * 1000, // 15分钟
      cleanupInterval: 5 * 60 * 1000 // 5分钟
    },
    enabled: true
  },
  {
    cache_type: 'content',
    config_data: {
      maxSize: 2000,
      defaultTTL: 30 * 60 * 1000, // 30分钟
      cleanupInterval: 10 * 60 * 1000 // 10分钟
    },
    enabled: true
  },
  {
    cache_type: 'stats',
    config_data: {
      maxSize: 500,
      defaultTTL: 10 * 60 * 1000, // 10分钟
      cleanupInterval: 3 * 60 * 1000 // 3分钟
    },
    enabled: true
  },
  {
    cache_type: 'config',
    config_data: {
      maxSize: 100,
      defaultTTL: 60 * 60 * 1000, // 1小时
      cleanupInterval: 15 * 60 * 1000 // 15分钟
    },
    enabled: true
  },
  {
    cache_type: 'session',
    config_data: {
      maxSize: 5000,
      defaultTTL: 24 * 60 * 60 * 1000, // 24小时
      cleanupInterval: 60 * 60 * 1000 // 1小时
    },
    enabled: true
  },
  {
    cache_type: 'api',
    config_data: {
      maxSize: 500,
      defaultTTL: 5 * 60 * 1000, // 5分钟
      cleanupInterval: 2 * 60 * 1000 // 2分钟
    },
    enabled: true
  }
];

async function initializeCacheConfigs() {
  console.log('🚀 开始初始化缓存配置数据...');
  console.log(`📊 准备插入 ${defaultCacheConfigs.length} 种缓存类型的配置`);
  
  try {
    // 检查表是否存在
    console.log('🔍 检查 cache_configs 表...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('cache_configs')
      .select('count', { count: 'exact', head: true });
    
    if (tableError) {
      console.error('❌ 无法访问 cache_configs 表:', tableError.message);
      return false;
    }
    
    console.log('✅ cache_configs 表访问正常');
    
    // 检查现有数据
    console.log('🔍 检查现有缓存配置数据...');
    const { data: existingData, error: selectError } = await supabase
      .from('cache_configs')
      .select('cache_type, enabled');
    
    if (selectError) {
      console.error('❌ 查询现有数据失败:', selectError.message);
      return false;
    }
    
    console.log(`📋 当前数据库中有 ${existingData?.length || 0} 条缓存配置记录`);
    if (existingData && existingData.length > 0) {
      console.log('现有配置类型:', existingData.map(item => `${item.cache_type}(${item.enabled ? '启用' : '禁用'})`).join(', '));
    }
    
    // 使用 upsert 插入/更新配置
    console.log('💾 开始插入/更新缓存配置...');
    
    for (const config of defaultCacheConfigs) {
      console.log(`  📝 处理 ${config.cache_type} 缓存配置...`);
      
      const { data, error } = await supabase
        .from('cache_configs')
        .upsert({
          cache_type: config.cache_type,
          config_data: config.config_data,
          enabled: config.enabled,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'cache_type'
        })
        .select();
      
      if (error) {
        console.error(`    ❌ ${config.cache_type} 配置插入失败:`, error.message);
        return false;
      }
      
      console.log(`    ✅ ${config.cache_type} 配置插入成功`);
      console.log(`       - maxSize: ${config.config_data.maxSize}`);
      console.log(`       - defaultTTL: ${config.config_data.defaultTTL}ms (${config.config_data.defaultTTL / 1000 / 60}分钟)`);
      console.log(`       - cleanupInterval: ${config.config_data.cleanupInterval}ms (${config.config_data.cleanupInterval / 1000 / 60}分钟)`);
    }
    
    // 验证插入结果
    console.log('🔍 验证插入结果...');
    const { data: finalData, error: finalError } = await supabase
      .from('cache_configs')
      .select('cache_type, config_data, enabled, created_at, updated_at')
      .order('cache_type');
    
    if (finalError) {
      console.error('❌ 验证查询失败:', finalError.message);
      return false;
    }
    
    console.log('\n📊 最终缓存配置数据:');
    finalData.forEach(item => {
      console.log(`  🔧 ${item.cache_type}:`);
      console.log(`     - 状态: ${item.enabled ? '✅ 启用' : '❌ 禁用'}`);
      console.log(`     - maxSize: ${item.config_data.maxSize}`);
      console.log(`     - defaultTTL: ${item.config_data.defaultTTL}ms`);
      console.log(`     - cleanupInterval: ${item.config_data.cleanupInterval}ms`);
      console.log(`     - 更新时间: ${item.updated_at}`);
    });
    
    console.log('\n🎉 缓存配置初始化完成!');
    console.log(`✅ 成功处理 ${finalData.length} 种缓存类型`);
    
    return true;
    
  } catch (error) {
    console.error('❌ 初始化过程中发生错误:', error.message);
    console.error('错误详情:', error);
    return false;
  }
}

// 主函数
async function main() {
  console.log('='.repeat(60));
  console.log('🔧 缓存配置初始化脚本');
  console.log('='.repeat(60));
  
  const success = await initializeCacheConfigs();
  
  if (success) {
    console.log('\n✅ 初始化成功! 现在可以测试缓存API了。');
    process.exit(0);
  } else {
    console.log('\n❌ 初始化失败! 请检查错误信息并重试。');
    process.exit(1);
  }
}

// 运行脚本
main();

export { initializeCacheConfigs };