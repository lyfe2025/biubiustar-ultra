-- 检查管理员账号是否存在
SELECT 
  au.id,
  au.email,
  up.username,
  up.full_name,
  up.role,
  up.status,
  au.created_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'admin@biubiustar.com';

-- 如果管理员账号不存在，创建一个新的管理员账号
-- 注意：这个脚本只用于检查，实际创建需要通过API