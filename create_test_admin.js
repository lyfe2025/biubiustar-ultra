import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('缺少必要的环境变量');
  process.exit(1);
}

// 创建客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function createTestAdmin() {
  try {
    console.log('开始创建测试管理员账号...');
    
    const testAdmin = {
      email: `testadmin${Date.now()}@example.com`,
      password: 'TestAdmin123!',
      username: `testadmin${Date.now()}`
    };
    
    console.log('1. 注册新用户...');
    
    // 使用前台注册API
    const registerResponse = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testAdmin)
    });
    
    if (!registerResponse.ok) {
      const errorText = await registerResponse.text();
      console.error('注册失败:', errorText);
      return;
    }
    
    const registerResult = await registerResponse.json();
    console.log('注册成功:', registerResult);
    
    const userId = registerResult.data.user.id;
    
    console.log('2. 将用户设置为管理员...');
    
    // 更新用户角色为管理员
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({ role: 'admin' })
      .eq('id', userId)
      .select();
    
    if (updateError) {
      console.error('设置管理员角色失败:', updateError.message);
      return;
    }
    
    console.log('✅ 测试管理员账号创建成功!');
    console.log('邮箱:', testAdmin.email);
    console.log('密码:', testAdmin.password);
    console.log('用户ID:', userId);
    console.log('角色已设置为: admin');
    
  } catch (error) {
    console.error('创建测试管理员失败:', error.message);
  }
}

// 运行创建
createTestAdmin();