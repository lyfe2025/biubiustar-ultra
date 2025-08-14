-- 清理孤立的user_profiles记录
-- 删除没有对应auth.users记录的user_profiles数据

-- 首先查看孤立记录的数量
SELECT COUNT(*) as orphaned_count
FROM user_profiles up
WHERE NOT EXISTS (
    SELECT 1 
    FROM auth.users au 
    WHERE au.id = up.id
);

-- 显示孤立记录的详细信息
SELECT up.id, up.username, up.created_at
FROM user_profiles up
WHERE NOT EXISTS (
    SELECT 1 
    FROM auth.users au 
    WHERE au.id = up.id
)
ORDER BY up.created_at DESC;

-- 删除孤立的user_profiles记录
DELETE FROM user_profiles
WHERE id IN (
    SELECT up.id
    FROM user_profiles up
    WHERE NOT EXISTS (
        SELECT 1 
        FROM auth.users au 
        WHERE au.id = up.id
    )
);

-- 验证清理结果
SELECT COUNT(*) as remaining_orphaned_count
FROM user_profiles up
WHERE NOT EXISTS (
    SELECT 1 
    FROM auth.users au 
    WHERE au.id = up.id
);