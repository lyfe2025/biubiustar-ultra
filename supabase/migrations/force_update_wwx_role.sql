-- 强制更新wwx@biubiustar.com的role为admin

-- 首先查看当前状态
SELECT 
    'BEFORE UPDATE' as status,
    au.email,
    up.id,
    up.role,
    up.username,
    up.status
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE au.email = 'wwx@biubiustar.com';

-- 强制更新role字段
UPDATE user_profiles 
SET role = 'admin'
WHERE id = (
    SELECT id FROM auth.users WHERE email = 'wwx@biubiustar.com'
);

-- 验证更新结果
SELECT 
    'AFTER UPDATE' as status,
    au.email,
    up.id,
    up.role,
    up.username,
    up.status
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE au.email = 'wwx@biubiustar.com';

-- 检查所有admin用户
SELECT 
    'ALL ADMINS' as status,
    au.email,
    up.role,
    up.username
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE up.role = 'admin'
ORDER BY au.email;