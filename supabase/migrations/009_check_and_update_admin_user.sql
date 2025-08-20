-- 检查并更新用户 a8a51720-6aa1-49a1-8d9f-9dd5db111094 的管理员角色
-- 首先检查用户是否在 auth.users 表中存在
DO $$
BEGIN
    -- 检查用户是否在 auth.users 表中存在
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = 'a8a51720-6aa1-49a1-8d9f-9dd5db111094') THEN
        RAISE NOTICE '用户 a8a51720-6aa1-49a1-8d9f-9dd5db111094 在 auth.users 表中存在';
        
        -- 检查用户是否在 user_profiles 表中存在
        IF EXISTS (SELECT 1 FROM user_profiles WHERE id = 'a8a51720-6aa1-49a1-8d9f-9dd5db111094') THEN
            -- 用户存在，检查角色
            IF (SELECT role FROM user_profiles WHERE id = 'a8a51720-6aa1-49a1-8d9f-9dd5db111094') = 'admin' THEN
                RAISE NOTICE '用户已经是管理员角色';
            ELSE
                -- 更新为管理员角色
                UPDATE user_profiles 
                SET role = 'admin', updated_at = now() 
                WHERE id = 'a8a51720-6aa1-49a1-8d9f-9dd5db111094';
                RAISE NOTICE '用户角色已更新为管理员';
            END IF;
        ELSE
            -- 用户不存在于 user_profiles 表中，创建记录
            INSERT INTO user_profiles (id, role, status, created_at, updated_at)
            VALUES ('a8a51720-6aa1-49a1-8d9f-9dd5db111094', 'admin', 'active', now(), now());
            RAISE NOTICE '已为用户创建管理员档案';
        END IF;
    ELSE
        RAISE NOTICE '用户 a8a51720-6aa1-49a1-8d9f-9dd5db111094 在 auth.users 表中不存在';
    END IF;
END $$;

-- 查询最终结果
SELECT 
    u.id,
    u.email,
    u.created_at as auth_created_at,
    p.role,
    p.status,
    p.created_at as profile_created_at
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE u.id = 'a8a51720-6aa1-49a1-8d9f-9dd5db111094';