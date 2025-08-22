-- 检查现有的admin用户
SELECT 
    up.id,
    up.username,
    up.role,
    au.email,
    au.created_at
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE up.role = 'admin';

-- 如果没有admin用户，我们需要通过应用程序创建
-- 这里只是查看现有数据