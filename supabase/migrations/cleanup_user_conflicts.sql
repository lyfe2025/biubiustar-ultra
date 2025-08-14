-- 清理数据库中的用户冲突和孤立记录
-- 这个脚本用于修复添加用户API失败的根本原因

-- 开始事务
BEGIN;

-- 1. 删除user_profiles表中的孤立记录（在auth.users表中不存在的记录）
DELETE FROM user_profiles 
WHERE id NOT IN (
  SELECT id FROM auth.users
);

-- 2. 处理重复的用户名（保留最早创建的记录）
WITH duplicate_usernames AS (
  SELECT username, MIN(created_at) as earliest_created_at
  FROM user_profiles 
  WHERE username IS NOT NULL
  GROUP BY username 
  HAVING COUNT(*) > 1
),
records_to_keep AS (
  SELECT up.id
  FROM user_profiles up
  JOIN duplicate_usernames du ON up.username = du.username AND up.created_at = du.earliest_created_at
)
DELETE FROM user_profiles 
WHERE username IN (SELECT username FROM duplicate_usernames)
  AND id NOT IN (SELECT id FROM records_to_keep);

-- 3. 处理重复的ID（这种情况理论上不应该存在，但以防万一）
WITH duplicate_ids AS (
  SELECT id, MIN(created_at) as earliest_created_at
  FROM user_profiles 
  GROUP BY id 
  HAVING COUNT(*) > 1
),
records_to_keep AS (
  SELECT up.id, up.created_at
  FROM user_profiles up
  JOIN duplicate_ids di ON up.id = di.id AND up.created_at = di.earliest_created_at
)
DELETE FROM user_profiles 
WHERE id IN (SELECT id FROM duplicate_ids)
  AND (id, created_at) NOT IN (SELECT id, created_at FROM records_to_keep);

-- 4. 为auth.users表中存在但user_profiles表中不存在的用户创建基本资料
INSERT INTO user_profiles (id, username, full_name, role, status, email_verified, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', SPLIT_PART(au.email, '@', 1)) as username,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
  'user' as role,
  'active' as status,
  au.email_confirmed_at IS NOT NULL as email_verified,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 5. 确保所有用户资料都有必要的字段
UPDATE user_profiles 
SET 
  role = COALESCE(role, 'user'),
  status = COALESCE(status, 'active'),
  email_verified = COALESCE(email_verified, false),
  updated_at = NOW()
WHERE role IS NULL OR status IS NULL OR email_verified IS NULL;

-- 6. 处理用户名为空的情况
UPDATE user_profiles 
SET 
  username = SPLIT_PART(
    (SELECT email FROM auth.users WHERE auth.users.id = user_profiles.id), 
    '@', 1
  ) || '_' || EXTRACT(EPOCH FROM created_at)::bigint,
  updated_at = NOW()
WHERE username IS NULL OR username = '';

-- 7. 处理全名为空的情况
UPDATE user_profiles 
SET 
  full_name = COALESCE(
    (SELECT email FROM auth.users WHERE auth.users.id = user_profiles.id),
    username
  ),
  updated_at = NOW()
WHERE full_name IS NULL OR full_name = '';

-- 提交事务
COMMIT;

-- 验证清理结果
SELECT 
  'cleanup_summary' as result_type,
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
  ) as matched_records,
  (
    SELECT COUNT(*) 
    FROM user_profiles 
    WHERE username IS NULL OR username = ''
  ) as profiles_without_username,
  (
    SELECT COUNT(*) 
    FROM user_profiles 
    WHERE full_name IS NULL OR full_name = ''
  ) as profiles_without_fullname;

-- 检查是否还有重复的用户名
SELECT 
  'remaining_duplicates' as result_type,
  username,
  COUNT(*) as count
FROM user_profiles 
WHERE username IS NOT NULL
GROUP BY username 
HAVING COUNT(*) > 1;