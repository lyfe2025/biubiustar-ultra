#!/usr/bin/env node

/**
 * 测试管理后台设置API
 * 用于调试基本设置页面数据不显示的问题
 */

const fetch = require('node-fetch');

async function testAdminSettings() {
  try {
    console.log('🧪 开始测试管理后台设置API...\n');
    
    // 测试1: 获取系统设置
    console.log('📋 测试1: 获取系统设置');
    console.log('GET /api/admin/settings');
    
    const response = await fetch('http://localhost:3000/api/admin/settings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // 这里需要有效的token
      }
    });
    
    console.log('响应状态:', response.status);
    console.log('响应头:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('响应数据:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data && data.data) {
        console.log('\n✅ 数据获取成功');
        console.log('数据键数量:', Object.keys(data.data).length);
        console.log('数据键列表:', Object.keys(data.data));
        
        // 检查基本设置
        const basicSettings = Object.keys(data.data).filter(key => key.startsWith('basic.'));
        console.log('基本设置数量:', basicSettings.length);
        console.log('基本设置列表:', basicSettings);
        
        if (basicSettings.length > 0) {
          console.log('\n📊 基本设置详情:');
          basicSettings.forEach(key => {
            const setting = data.data[key];
            console.log(`  ${key}:`, setting);
          });
        } else {
          console.log('❌ 没有找到基本设置数据');
        }
      } else {
        console.log('❌ 响应数据格式不正确');
      }
    } else {
      console.log('❌ 请求失败');
      const errorText = await response.text();
      console.log('错误详情:', errorText);
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
if (require.main === module) {
  testAdminSettings();
}

module.exports = { testAdminSettings };
