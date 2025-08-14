-- 检查user_profiles表中的用户名数据
SELECT 
  id,
  username,
  full_name,
  role,
  status,
  created_at
FROM user_profiles
ORDER BY created_at DESC;

-- 检查是否有重复的用户名
SELECT 
  username,
  COUNT(*) as count
FROM user_profiles
WHERE username IS NOT NULL
GROUP BY username
HAVING COUNT(*) > 1;

-- 检查auth.users表中的用户元数据
SELECT 
  id,
  email,
  raw_user_meta_data->>'username' as metadata_username,
  raw_user_meta_data->>'full_name' as metadata_full_name,
  created_at
FROM auth.users
ORDER BY created_at DESC;