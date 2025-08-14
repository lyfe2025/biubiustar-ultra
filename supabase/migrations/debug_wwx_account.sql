-- 详细检查wwx@biubiustar.com账号的所有相关信息

-- 1. 检查auth.users表中的记录
SELECT 
    'auth.users' as table_name,
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at
FROM auth.users 
WHERE email = 'wwx@biubiustar.com';

-- 2. 检查user_profiles表中的记录
SELECT 
    'user_profiles' as table_name,
    id,
    username,
    full_name,
    role,
    status,
    created_at,
    updated_at
FROM user_profiles 
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'wwx@biubiustar.com'
);

-- 3. 检查是否存在重复记录
SELECT 
    'duplicate_check' as check_type,
    COUNT(*) as count
FROM user_profiles 
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'wwx@biubiustar.com'
);

-- 4. 强制更新role字段（如果记录存在）
UPDATE user_profiles 
SET 
    role = 'admin',
    updated_at = now()
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'wwx@biubiustar.com'
)
RETURNING id, role, updated_at;

-- 5. 最终验证
SELECT 
    'final_verification' as check_type,
    au.email,
    up.role,
    up.status,
    up.updated_at
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE au.email = 'wwx@biubiustar.com';