-- 检查数据库中的用户冲突和孤立记录问题
-- 这个查询用于诊断添加用户API失败的根本原因

-- 1. 检查user_profiles表中是否有重复的username
SELECT 
  'duplicate_usernames' as issue_type,
  username,
  COUNT(*) as count
FROM user_profiles 
WHERE username IS NOT NULL
GROUP BY username 
HAVING COUNT(*) > 1;

-- 2. 检查user_profiles表中是否有重复的id
SELECT 
  'duplicate_ids' as issue_type,
  id,
  COUNT(*) as count
FROM user_profiles 
GROUP BY id 
HAVING COUNT(*) > 1;

-- 3. 检查user_profiles表中存在但auth.users表中不存在的记录（孤立记录）
SELECT 
  'orphaned_profiles' as issue_type,
  up.id,
  up.username,
  up.created_at
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
WHERE au.id IS NULL;

-- 4. 检查auth.users表中存在但user_profiles表中不存在的记录
SELECT 
  'missing_profiles' as issue_type,
  au.id,
  au.email,
  au.created_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- 5. 检查最近尝试创建的用户记录（可能导致冲突的记录）
SELECT 
  'recent_users' as issue_type,
  up.id,
  up.username,
  up.full_name,
  up.role,
  up.status,
  up.created_at,
  au.email as auth_email,
  au.created_at as auth_created_at
FROM user_profiles up
FULL OUTER JOIN auth.users au ON up.id = au.id
WHERE up.created_at > NOW() - INTERVAL '1 day'
   OR au.created_at > NOW() - INTERVAL '1 day'
ORDER BY COALESCE(up.created_at, au.created_at) DESC;

-- 6. 检查可能的用户名冲突（包括大小写不敏感的重复）
SELECT 
  'case_insensitive_username_conflicts' as issue_type,
  LOWER(username) as lowercase_username,
  array_agg(username) as usernames,
  array_agg(id) as user_ids,
  COUNT(*) as count
FROM user_profiles 
WHERE username IS NOT NULL
GROUP BY LOWER(username)
HAVING COUNT(*) > 1;

-- 7. 检查用户资料完整性（确保所有必要字段都存在）
SELECT 
  'incomplete_profiles' as issue_type,
  up.id,
  up.username,
  up.full_name,
  up.role,
  up.status,
  au.email as auth_email
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE up.username IS NULL OR up.full_name IS NULL OR up.role IS NULL;

-- 8. 统计总体数据一致性
SELECT 
  'data_summary' as issue_type,
  (
    SELECT COUNT(*) FROM auth.users
  ) as total_auth_users,
  (
    SELECT COUNT(*) FROM user_profiles
  ) as total_user_profiles,
  (
    SELECT COUNT(*) 
    FROM auth.users au 
    JOIN user_profiles up ON au.id = up.id
  ) as matched_records;