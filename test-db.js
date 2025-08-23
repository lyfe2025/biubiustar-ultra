import { supabaseAdmin } from './api/lib/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

async function testDBConnection() {
  console.log('=== 测试数据库连接 ===');
  
  try {
    console.log('1. 测试基本连接...');
    const { data, error } = await supabaseAdmin
      .from('cache_configs')
      .select('cache_type, config_data, enabled')
      .eq('enabled', true);
    
    if (error) {
      console.error('❌ 数据库查询错误:', error);
      return;
    }
    
    console.log('2. 查询结果:', JSON.stringify(data, null, 2));
    console.log('3. 数据条数:', data ? data.length : 0);
    
    if (data && data.length > 0) {
      console.log('4. 第一条数据示例:');
      console.log('   cache_type:', data[0].cache_type);
      console.log('   config_data:', data[0].config_data);
      console.log('   enabled:', data[0].enabled);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testDBConnection();
