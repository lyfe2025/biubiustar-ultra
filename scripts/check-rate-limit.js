#!/usr/bin/env node

/**
 * 检查当前被频率限制的IP地址
 * 这个脚本可以帮助你查看哪些IP被内存中的频率限制器限制了
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

async function checkRateLimitStatus() {
  console.log('🔍 正在检查频率限制状态...\n');
  
  try {
    // 1. 检查IP黑名单（数据库中的）
    console.log('📊 检查数据库中的IP黑名单...');
    const { data: blacklistData, error: blacklistError } = await supabase
      .from('ip_blacklist')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (blacklistError) {
      console.error('❌ 查询IP黑名单失败:', blacklistError.message);
    } else {
      const currentTime = new Date();
      const activeBlacklist = (blacklistData || []).filter(item => {
        if (item.is_permanent) return true;
        if (!item.blocked_until) return true;
        return new Date(item.blocked_until) > currentTime;
      });
      
      if (activeBlacklist.length > 0) {
        console.log(`✅ 发现 ${activeBlacklist.length} 个被限制的IP地址:`);
        activeBlacklist.forEach((item, index) => {
          console.log(`   ${index + 1}. IP: ${item.ip_address}`);
          console.log(`      原因: ${item.reason || '未知'}`);
          console.log(`      封禁时间: ${new Date(item.created_at).toLocaleString('zh-CN')}`);
          if (item.blocked_until) {
            console.log(`      解封时间: ${new Date(item.blocked_until).toLocaleString('zh-CN')}`);
          } else {
            console.log(`      状态: 永久封禁`);
          }
          console.log(`      失败尝试次数: ${item.failed_attempts_count || 0}`);
          console.log('');
        });
      } else {
        console.log('✅ 数据库中没有被限制的IP地址');
      }
    }
    
    // 2. 检查登录尝试记录
    console.log('📊 检查最近的登录尝试记录...');
    const { data: loginAttempts, error: loginError } = await supabase
      .from('login_attempts')
      .select('*')
      .gte('attempt_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // 最近24小时
      .order('attempt_time', { ascending: false })
      .limit(20);
    
    if (loginError) {
      console.error('❌ 查询登录尝试记录失败:', loginError.message);
    } else if (loginAttempts && loginAttempts.length > 0) {
      console.log(`✅ 发现 ${loginAttempts.length} 条最近的登录尝试记录:`);
      
      // 按IP分组统计
      const ipStats = {};
      loginAttempts.forEach(attempt => {
        const ip = attempt.ip_address;
        if (!ipStats[ip]) {
          ipStats[ip] = { total: 0, failed: 0, success: 0, lastAttempt: null };
        }
        ipStats[ip].total++;
        if (attempt.success) {
          ipStats[ip].success++;
        } else {
          ipStats[ip].failed++;
        }
        if (!ipStats[ip].lastAttempt || new Date(attempt.attempt_time) > new Date(ipStats[ip].lastAttempt)) {
          ipStats[ip].lastAttempt = attempt.attempt_time;
        }
      });
      
      Object.entries(ipStats).forEach(([ip, stats]) => {
        console.log(`   IP: ${ip}`);
        console.log(`      总尝试次数: ${stats.total}`);
        console.log(`      成功次数: ${stats.success}`);
        console.log(`      失败次数: ${stats.failed}`);
        console.log(`      最后尝试: ${new Date(stats.lastAttempt).toLocaleString('zh-CN')}`);
        console.log('');
      });
    } else {
      console.log('✅ 没有找到最近的登录尝试记录');
    }
    
    // 3. 检查安全日志
    console.log('📊 检查最近的安全事件...');
    const { data: securityLogs, error: securityError } = await supabase
      .from('security_logs')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // 最近24小时
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (securityError) {
      console.error('❌ 查询安全日志失败:', securityError.message);
    } else if (securityLogs && securityLogs.length > 0) {
      console.log(`✅ 发现 ${securityLogs.length} 条最近的安全事件:`);
      
      const ipEvents = securityLogs.filter(log => log.ip_address);
      if (ipEvents.length > 0) {
        ipEvents.forEach((log, index) => {
          console.log(`   ${index + 1}. 事件类型: ${log.event_type}`);
          console.log(`      IP地址: ${log.ip_address}`);
          console.log(`      时间: ${new Date(log.created_at).toLocaleString('zh-CN')}`);
          console.log(`      严重程度: ${log.severity}`);
          if (log.details) {
            console.log(`      详情: ${JSON.stringify(log.details)}`);
          }
          console.log('');
        });
      } else {
        console.log('✅ 没有找到涉及IP地址的安全事件');
      }
    } else {
      console.log('✅ 没有找到最近的安全事件');
    }
    
    console.log('🔍 频率限制检查完成！');
    console.log('\n💡 提示:');
    console.log('   - 如果数据库中没有IP黑名单记录，但你的IP仍然被限制，');
    console.log('     可能是被内存中的频率限制器限制了');
    console.log('   - 频率限制器会在服务器重启后自动清除');
    console.log('   - 你可以尝试重启服务器来清除频率限制');
    
  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 运行检查
checkRateLimitStatus();
