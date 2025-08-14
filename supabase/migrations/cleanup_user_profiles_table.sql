-- 彻底清理user_profiles表中的所有数据
-- 这将删除所有用户资料记录，包括可能的孤立记录

DELETE FROM user_profiles;

-- 重置序列（如果有的话）
-- 注意：user_profiles表使用UUID作为主键，通常不需要重置序列
-- 但为了确保完全清理，我们可以检查是否有相关序列

-- 显示清理结果
SELECT 'user_profiles表已清理完成' as message;
SELECT COUNT(*) as remaining_records FROM user_profiles;

-- 检查是否还有任何约束或索引问题
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'user_profiles'::regclass;