-- 检查auth.users表的状态
-- 查看是否存在孤立的用户记录导致ID冲突

-- 显示auth.users表中的所有用户
SELECT 'Auth users in database:' as message;
SELECT id, email, created_at, email_confirmed_at, deleted_at FROM auth.users ORDER BY created_at DESC;

-- 显示user_profiles表中的所有用户
SELECT 'User profiles in database:' as message;
SELECT id, username, full_name, created_at FROM user_profiles ORDER BY created_at DESC;

-- 查找在auth.users中存在但在user_profiles中不存在的记录
SELECT 'Orphaned auth users (exist in auth.users but not in user_profiles):' as message;
SELECT au.id, au.email, au.created_at 
FROM auth.users au 
LEFT JOIN user_profiles up ON au.id = up.id 
WHERE up.id IS NULL;

-- 统计数量
SELECT 
  'Summary:' as message,
  (SELECT COUNT(*) FROM auth.users) as auth_users_count,
  (SELECT COUNT(*) FROM user_profiles) as user_profiles_count,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN user_profiles up ON au.id = up.id WHERE up.id IS NULL) as orphaned_auth_users_count;