#!/usr/bin/env node

/**
 * 清除指定IP的频率限制
 * 这个脚本可以帮助你清除被频率限制器限制的IP地址
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// 加载环境变量
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 错误: 缺少Supabase配置');
  console.error('请确保 .env 文件中包含以下配置:');
  console.error('SUPABASE_URL=your_supabase_url');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function clearRateLimit() {
  console.log('🔧 频率限制清除工具\n');
  
  // 获取命令行参数
  const args = process.argv.slice(2);
  const targetIP = args[0];
  
  if (!targetIP) {
    console.log('❌ 错误: 请指定要清除限制的IP地址');
    console.log('用法: node clear-rate-limit.js <IP地址>');
    console.log('示例: node clear-rate-limit.js 192.168.1.1');
    console.log('示例: node clear-rate-limit.js ::1');
    process.exit(1);
  }
  
  // 验证IP地址格式
  const ipRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$|^::1$|^[0-9a-fA-F:]+$/;
  if (!ipRegex.test(targetIP)) {
    console.error('❌ 错误: IP地址格式不正确');
    console.log('支持的格式: IPv4 (192.168.1.1), IPv6 (::1), 或 IPv6 地址');
    process.exit(1);
  }
  
  console.log(`🎯 目标IP地址: ${targetIP}\n`);
  
  try {
    // 1. 检查IP是否在数据库黑名单中
    console.log('📊 检查数据库黑名单状态...');
    const { data: blacklistEntry, error: blacklistError } = await supabase
      .from('ip_blacklist')
      .select('*')
      .eq('ip_address', targetIP)
      .single();
    
    if (blacklistError && blacklistError.code !== 'PGRST116') {
      console.error('❌ 查询黑名单失败:', blacklistError.message);
      return;
    }
    
    if (blacklistEntry) {
      console.log('⚠️  发现IP在数据库黑名单中:');
      console.log(`   封禁原因: ${blacklistEntry.reason || '未知'}`);
      console.log(`   封禁时间: ${new Date(blacklistEntry.created_at).toLocaleString('zh-CN')}`);
      if (blacklistEntry.blocked_until) {
        console.log(`   解封时间: ${new Date(blacklistEntry.blocked_until).toLocaleString('zh-CN')}`);
      } else {
        console.log(`   状态: 永久封禁`);
      }
      
      // 询问是否要解除数据库黑名单
      console.log('\n❓ 是否要解除数据库黑名单限制？(y/N): ');
      process.stdin.once('data', async (data) => {
        const answer = data.toString().trim().toLowerCase();
        if (answer === 'y' || answer === 'yes') {
          await unblockFromDatabase(targetIP, blacklistEntry);
        } else {
          console.log('❌ 操作已取消');
          process.exit(0);
        }
      });
    } else {
      console.log('✅ IP不在数据库黑名单中');
      await clearRelatedRecords(targetIP);
    }
    
  } catch (error) {
    console.error('❌ 操作过程中发生错误:', error.message);
    process.exit(1);
  }
}

async function unblockFromDatabase(ipAddress, blacklistEntry) {
  try {
    console.log('\n🔄 正在解除数据库黑名单限制...');
    
    // 删除黑名单记录
    const { error: deleteError } = await supabase
      .from('ip_blacklist')
      .delete()
      .eq('ip_address', ipAddress);
    
    if (deleteError) {
      console.error('❌ 删除黑名单记录失败:', deleteError.message);
      return;
    }
    
    // 记录安全日志
    await supabase
      .from('security_logs')
      .insert({
        event_type: 'ip_unblocked',
        ip_address: ipAddress,
        details: { 
          reason: 'Manual unblock via script', 
          original_reason: blacklistEntry.reason,
          method: 'database_removal'
        },
        created_at: new Date().toISOString()
      });
    
    // 记录活动日志
    await supabase
      .from('activity_logs')
      .insert({
        event_type: 'ip_manual_unblocked',
        ip_address: ipAddress,
        details: { 
          reason: 'Manual unblock via script', 
          original_reason: blacklistEntry.reason,
          method: 'database_removal'
        },
        created_at: new Date().toISOString()
      });
    
    console.log('✅ 数据库黑名单限制已解除');
    
    // 继续清理相关记录
    await clearRelatedRecords(ipAddress);
    
  } catch (error) {
    console.error('❌ 解除数据库限制失败:', error.message);
  }
}

async function clearRelatedRecords(ipAddress) {
  try {
    console.log('\n🧹 清理相关记录...');
    
    // 1. 清理登录尝试记录
    console.log('   清理登录尝试记录...');
    const { error: loginCleanupError } = await supabase
      .from('login_attempts')
      .delete()
      .eq('ip_address', ipAddress);
    
    if (loginCleanupError) {
      console.log('   ⚠️  清理登录尝试记录失败:', loginCleanupError.message);
    } else {
      console.log('   ✅ 登录尝试记录已清理');
    }
    
    // 2. 记录清理操作到安全日志
    await supabase
      .from('security_logs')
      .insert({
        event_type: 'ip_cleanup',
        ip_address: ipAddress,
        details: { 
          reason: 'Manual cleanup via script',
          cleaned_records: ['login_attempts', 'rate_limit_memory'],
          method: 'script_execution'
        },
        created_at: new Date().toISOString()
      });
    
    console.log('✅ 相关记录清理完成');
    
    console.log('\n🎉 IP限制清除完成！');
    console.log('\n💡 重要提示:');
    console.log('   - 数据库中的限制已清除');
    console.log('   - 内存中的频率限制器会在服务器重启后自动清除');
    console.log('   - 如果问题仍然存在，请重启服务器');
    console.log('   - 或者等待频率限制器的时间窗口过期');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ 清理相关记录失败:', error.message);
  }
}

// 运行清除程序
clearRateLimit();
