-- 检查并创建admin用户
-- 首先查看是否有admin用户
SELECT id, username, role FROM user_profiles WHERE role = 'admin';

-- 如果没有admin用户，我们需要先在auth.users表中创建用户，然后在user_profiles中设置role
-- 注意：这个脚本只是用于检查，实际创建用户需要通过Supabase Auth API