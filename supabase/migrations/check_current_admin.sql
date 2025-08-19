-- 查看当前所有管理员账户
SELECT 
  up.id,
  up.username,
  up.full_name,
  up.role,
  up.status,
  au.email,
  au.created_at
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE up.role = 'admin'
ORDER BY au.created_at;

-- 查看所有用户的角色分布
SELECT 
  role,
  COUNT(*) as count
FROM user_profiles
GROUP BY role
ORDER BY count DESC;

-- 查看是否存在 admin@biubiustar.com 账户
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  up.username,
  up.role,
  up.status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'admin@biubiustar.com';