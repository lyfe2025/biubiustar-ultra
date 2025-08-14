-- 检查并修复管理员账号权限
-- 查找wwx@biubiustar.com对应的用户ID并更新role为admin

-- 首先查看当前用户信息
SELECT 
  up.id,
  au.email,
  up.username,
  up.role,
  up.status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'wwx@biubiustar.com';

-- 更新wwx@biubiustar.com的role为admin
UPDATE user_profiles 
SET 
  role = 'admin',
  updated_at = now()
WHERE id IN (
  SELECT au.id 
  FROM auth.users au 
  WHERE au.email = 'wwx@biubiustar.com'
);

-- 如果user_profiles中不存在该记录，则插入一条新记录
INSERT INTO user_profiles (
  id,
  username,
  full_name,
  role,
  status,
  created_at,
  updated_at
)
SELECT 
  au.id,
  'wwx',
  'WWX Admin',
  'admin',
  'active',
  now(),
  now()
FROM auth.users au
WHERE au.email = 'wwx@biubiustar.com'
  AND NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.id = au.id
  );

-- 验证更新结果
SELECT 
  up.id,
  au.email,
  up.username,
  up.role,
  up.status,
  up.updated_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'wwx@biubiustar.com';