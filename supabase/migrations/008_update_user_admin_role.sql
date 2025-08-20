-- 检查并更新用户角色为admin
-- 用户ID: a8a51720-6aa1-49a1-8d9f-9dd5db111094

-- 首先查看当前用户信息
SELECT id, username, role, status, created_at 
FROM user_profiles 
WHERE id = 'a8a51720-6aa1-49a1-8d9f-9dd5db111094';

-- 如果用户不存在，创建用户记录
INSERT INTO user_profiles (id, role, status, created_at, updated_at)
SELECT 'a8a51720-6aa1-49a1-8d9f-9dd5db111094', 'admin', 'active', now(), now()
WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles WHERE id = 'a8a51720-6aa1-49a1-8d9f-9dd5db111094'
);

-- 更新用户角色为admin（如果用户已存在）
UPDATE user_profiles 
SET role = 'admin', 
    status = 'active',
    updated_at = now()
WHERE id = 'a8a51720-6aa1-49a1-8d9f-9dd5db111094'
  AND role != 'admin';

-- 验证更新结果
SELECT id, username, role, status, updated_at 
FROM user_profiles 
WHERE id = 'a8a51720-6aa1-49a1-8d9f-9dd5db111094';