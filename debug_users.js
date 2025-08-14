// 调试脚本：检查用户名冲突问题
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function debugUsers() {
  try {
    console.log('=== 检查 user_profiles 表中的用户名 ===');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, username, full_name, role, status, created_at')
      .order('created_at', { ascending: false });
    
    if (profilesError) {
      console.error('查询 user_profiles 失败:', profilesError);
    } else {
      console.log('user_profiles 数据:');
      profiles.forEach(profile => {
        console.log(`- ID: ${profile.id}, Username: ${profile.username}, Full Name: ${profile.full_name}, Role: ${profile.role}`);
      });
    }

    console.log('\n=== 检查 auth.users 表中的用户元数据 ===');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('查询 auth.users 失败:', authError);
    } else {
      console.log('auth.users 数据:');
      authUsers.users.forEach(user => {
        console.log(`- ID: ${user.id}, Email: ${user.email}, Metadata Username: ${user.user_metadata?.username}, Metadata Full Name: ${user.user_metadata?.full_name}`);
      });
    }

    console.log('\n=== 检查用户名重复情况 ===');
    const usernames = profiles.filter(p => p.username).map(p => p.username);
    const duplicates = usernames.filter((username, index) => usernames.indexOf(username) !== index);
    
    if (duplicates.length > 0) {
      console.log('发现重复用户名:', duplicates);
    } else {
      console.log('未发现重复用户名');
    }

  } catch (error) {
    console.error('调试脚本执行失败:', error);
  }
}

debugUsers();