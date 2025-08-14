-- 检查admin@biubiustar.com账号的配置
-- 查询auth.users表中的管理员账号
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at
FROM auth.users 
WHERE email = 'admin@biubiustar.com';

-- 查询user_profiles表中的管理员角色配置
SELECT 
  up.id,
  up.username,
  up.role,
  up.status,
  up.created_at,
  au.email
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE au.email = 'admin@biubiustar.com';

-- 如果user_profiles中没有对应记录，插入管理员角色
INSERT INTO user_profiles (id, username, role, status)
SELECT 
  au.id,
  'admin',
  'admin',
  'active'
FROM auth.users au
WHERE au.email = 'admin@biubiustar.com'
  AND NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.id = au.id
  );

-- 如果user_profiles中已有记录但角色不是admin，更新为admin
UPDATE user_profiles 
SET role = 'admin', status = 'active'
WHERE id IN (
  SELECT au.id 
  FROM auth.users au 
  WHERE au.email = 'admin@biubiustar.com'
) AND role != 'admin';