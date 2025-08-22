import { supabaseAdmin } from '../api/lib/supabase.ts';

// 默认缓存配置数据
const defaultCacheConfig = {
  user: {
    maxSize: 1000,
    ttl: 3600000, // 1小时
    cleanupInterval: 300000 // 5分钟
  },
  content: {
    maxSize: 500,
    ttl: 1800000, // 30分钟
    cleanupInterval: 300000 // 5分钟
  },
  stats: {
    maxSize: 100,
    ttl: 300000, // 5分钟
    cleanupInterval: 60000 // 1分钟
  },
  config: {
    maxSize: 50,
    ttl: 7200000, // 2小时
    cleanupInterval: 600000 // 10分钟
  },
  session: {
    maxSize: 2000,
    ttl: 1800000, // 30分钟
    cleanupInterval: 300000 // 5分钟
  },
  api: {
    maxSize: 200,
    ttl: 600000, // 10分钟
    cleanupInterval: 120000 // 2分钟
  }
};

/**
 * 初始化缓存配置数据到数据库
 * 使用 UPSERT 操作，可以安全地重复运行
 */
async function initCacheConfig() {
  console.log('开始初始化缓存配置数据...');
  
  let insertCount = 0;
  let updateCount = 0;
  
  for (const [cacheType, config] of Object.entries(defaultCacheConfig)) {
    try {
      const { data, error } = await supabaseAdmin
        .from('cache_configs')
        .upsert({
          cache_type: cacheType,
          config_data: {
              maxSize: config.maxSize,
              defaultTTL: config.ttl,
              cleanupInterval: config.cleanupInterval
            },
          enabled: true
        }, {
          onConflict: 'cache_type'
        })
        .select();
      
      if (error) {
        console.error(`更新缓存类型 ${cacheType} 失败:`, error);
        continue;
      }
      
      if (data && data.length > 0) {
        // 检查是否是新插入的记录
        const record = data[0];
        const now = new Date();
        const createdAt = new Date(record.created_at);
        const timeDiff = now - createdAt;
        
        if (timeDiff < 1000) { // 1秒内创建的认为是新插入
          insertCount++;
          console.log(`✓ 新增缓存类型: ${cacheType}`);
        } else {
          updateCount++;
          console.log(`✓ 更新缓存类型: ${cacheType}`);
        }
      }
    } catch (err) {
      console.error(`处理缓存类型 ${cacheType} 时出错:`, err);
    }
  }
  
  console.log(`\n缓存配置初始化完成!`);
  console.log(`- 新插入: ${insertCount} 条记录`);
  console.log(`- 更新: ${updateCount} 条记录`);
  
  // 验证数据
  try {
    const { data: verifyData, error: verifyError } = await supabaseAdmin
      .from('cache_configs')
      .select('cache_type, config_data, enabled')
      .eq('enabled', true);
    
    if (verifyError) {
      console.error('验证数据失败:', verifyError);
    } else {
      console.log('\n当前缓存配置:');
      verifyData.forEach(config => {
        const data = config.config_data;
        console.log(`- ${config.cache_type}: maxSize=${data.maxSize}, ttl=${data.defaultTTL}ms, cleanup=${data.cleanupInterval}ms`);
      });
    }
  } catch (err) {
    console.error('验证数据时出错:', err);
  }
}

/**
 * 清空缓存配置数据（仅用于测试）
 */
async function clearCacheConfig() {
  console.log('开始清空缓存配置数据...');
  
  try {
    const { error } = await supabaseAdmin
      .from('cache_configs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 删除所有记录
    
    if (error) {
      console.error('清空缓存配置失败:', error);
      return;
    }
    
    console.log('✓ 缓存配置数据已清空');
    
    // 验证清空结果
    const { data: verifyData, error: verifyError } = await supabaseAdmin
      .from('cache_configs')
      .select('*');
    
    if (verifyError) {
      console.error('验证清空结果失败:', verifyError);
    } else {
      console.log(`当前记录数: ${verifyData ? verifyData.length : 0}`);
    }
  } catch (err) {
    console.error('清空缓存配置时出错:', err);
  }
}

// 主函数
async function main() {
  try {
    const args = process.argv.slice(2);
    
    if (args.includes('--clear')) {
      await clearCacheConfig();
    }
    
    await initCacheConfig();
    
    console.log('\n脚本执行完成!');
    process.exit(0);
  } catch (error) {
    console.error('脚本执行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { initCacheConfig, clearCacheConfig };