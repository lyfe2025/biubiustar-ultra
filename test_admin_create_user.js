import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('缺少必要的环境变量');
  process.exit(1);
}

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 测试管理员凭据
const adminCredentials = {
  email: 'testadmin1755189970883@example.com',
  password: 'TestAdmin123!'
};

async function testAdminCreateUser() {
  try {
    console.log('开始测试管理后台添加用户功能...');
    
    // 生成测试用户数据
    const timestamp = Date.now();
    const testUser = {
      email: `testuser${timestamp}@example.com`,
      password: 'TestUser123!',
      username: `testuser${timestamp}`,
      full_name: `Test User ${timestamp}`,
      role: 'user'
    };
    
    console.log('1. 管理员登录...');
    
    // 管理员登录获取token
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword(adminCredentials);
    
    if (authError) {
      console.error('管理员登录失败:', authError.message);
      return;
    }
    
    console.log('管理员登录成功:', authData.user.email);
    const adminToken = authData.session.access_token;
    
    console.log('2. 测试用户数据:', testUser);
    
    // 调用管理后台添加用户API
    console.log('3. 调用管理后台添加用户API...');
    const response = await fetch('http://localhost:3001/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(testUser)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 添加用户成功:', result);
    } else {
      const errorText = await response.text();
      console.error('❌ 添加用户失败:', response.status, errorText);
    }
    
    // 登出管理员
    await supabase.auth.signOut();
    console.log('管理员已登出');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
  }
}

// 运行测试
testAdminCreateUser();