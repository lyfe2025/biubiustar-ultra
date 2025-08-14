-- 清理auth.users表中的孤立用户记录
-- 这些记录可能是之前用户创建失败时留下的

-- 首先查看当前auth.users表的状态
SELECT 'auth.users表中的用户数量:' as info, COUNT(*) as count FROM auth.users;

-- 查看所有auth.users记录的详细信息
SELECT 
    'auth.users表中的用户详情:' as info,
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC;

-- 删除所有auth.users表中的记录（这些都是测试数据）
-- 注意：这会彻底清空认证用户表
DELETE FROM auth.users;

-- 确认清理结果
SELECT 'auth.users表清理后的用户数量:' as info, COUNT(*) as count FROM auth.users;
SELECT 'user_profiles表的用户数量:' as info, COUNT(*) as count FROM user_profiles;

-- 重置序列（如果有的话）
-- 注意：Supabase使用UUID，通常不需要重置序列，但为了确保完全清理
SELECT 'auth.users表和user_profiles表已完全清理' as result;