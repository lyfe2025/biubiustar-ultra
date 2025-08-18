-- 检查现有的管理员用户
SELECT 
  up.id,
  up.username,
  up.role,
  au.email,
  up.created_at
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE up.role = 'admin'
ORDER BY up.created_at;

-- 检查所有用户的角色分布
SELECT 
  role,
  COUNT(*) as count
FROM user_profiles 
GROUP BY role
ORDER BY role;