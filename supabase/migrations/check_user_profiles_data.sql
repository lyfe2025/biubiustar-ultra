-- 检查user_profiles表中的数据一致性问题
-- 查看是否存在重复的id或username

-- 1. 检查重复的id
SELECT id, COUNT(*) as count
FROM user_profiles 
GROUP BY id 
HAVING COUNT(*) > 1;

-- 2. 检查重复的username
SELECT username, COUNT(*) as count
FROM user_profiles 
WHERE username IS NOT NULL
GROUP BY username 
HAVING COUNT(*) > 1;

-- 3. 查看所有用户记录
SELECT id, username, full_name, role, status, created_at
FROM user_profiles 
ORDER BY created_at DESC;

-- 4. 检查auth.users表中是否存在对应的记录
SELECT 
    up.id,
    up.username,
    up.full_name,
    au.email,
    au.created_at as auth_created_at,
    up.created_at as profile_created_at
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
ORDER BY up.created_at DESC;

-- 5. 查找孤立的user_profiles记录（在auth.users中不存在对应记录）
SELECT up.*
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
WHERE au.id IS NULL;