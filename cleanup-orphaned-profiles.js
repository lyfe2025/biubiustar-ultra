import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupOrphanedProfiles() {
  try {
    console.log('开始清理孤立的用户资料记录...');
    
    // 获取所有用户资料
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id');
    
    if (profilesError) {
      console.error('获取用户资料失败:', profilesError);
      return;
    }
    
    console.log(`找到 ${profiles.length} 个用户资料记录`);
    
    // 检查每个资料对应的认证用户是否存在
    const orphanedIds = [];
    
    for (const profile of profiles) {
      const { data: authUser, error } = await supabase.auth.admin.getUserById(profile.id);
      
      if (error || !authUser.user) {
        console.log(`发现孤立的用户资料: ${profile.id}`);
        orphanedIds.push(profile.id);
      }
    }
    
    console.log(`发现 ${orphanedIds.length} 个孤立的用户资料记录`);
    
    // 删除孤立的用户资料
    if (orphanedIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('user_profiles')
        .delete()
        .in('id', orphanedIds);
      
      if (deleteError) {
        console.error('删除孤立用户资料失败:', deleteError);
      } else {
        console.log(`成功删除 ${orphanedIds.length} 个孤立的用户资料记录`);
      }
    }
    
    console.log('清理完成');
  } catch (error) {
    console.error('清理过程中发生错误:', error);
  }
}

cleanupOrphanedProfiles();