-- 检查是否存在管理员账号
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created_at,
  up.username,
  up.full_name,
  up.role,
  up.created_at as profile_created_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'admin@biubiustar.com'
OR up.role = 'admin';

-- 如果没有管理员账号，显示所有用户
SELECT 
  'All users:' as info,
  au.id,
  au.email,
  up.username,
  up.role
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
ORDER BY au.created_at DESC
LIMIT 10;