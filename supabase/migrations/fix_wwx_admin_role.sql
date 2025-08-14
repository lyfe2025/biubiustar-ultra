-- 首先查看wwx@biubiustar.com账号的当前状态
SELECT 
    up.id,
    au.email,
    up.username,
    up.full_name,
    up.role,
    up.status,
    up.created_at
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE au.email = 'wwx@biubiustar.com';

-- 如果role不是admin，则更新为admin
UPDATE user_profiles 
SET role = 'admin', updated_at = now()
WHERE id IN (
    SELECT up.id 
    FROM user_profiles up
    JOIN auth.users au ON up.id = au.id
    WHERE au.email = 'wwx@biubiustar.com'
);

-- 验证更新结果
SELECT 
    up.id,
    au.email,
    up.username,
    up.role,
    up.status,
    up.updated_at
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE au.email = 'wwx@biubiustar.com';