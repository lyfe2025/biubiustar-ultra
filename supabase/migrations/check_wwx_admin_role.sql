-- 检查wwx@biubiustar.com账号的role字段值
SELECT 
    up.id,
    au.email,
    up.username,
    up.full_name,
    up.role,
    up.status,
    up.created_at,
    up.updated_at
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE au.email = 'wwx@biubiustar.com';

-- 同时检查所有admin角色的用户
SELECT 
    up.id,
    au.email,
    up.username,
    up.full_name,
    up.role,
    up.status
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE up.role = 'admin';