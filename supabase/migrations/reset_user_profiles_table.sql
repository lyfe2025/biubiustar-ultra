-- 彻底重置user_profiles表以解决ID冲突问题
-- 警告：这将删除所有用户资料数据

-- 删除所有用户资料记录
DELETE FROM user_profiles;

-- 重置序列（如果有的话）
-- ALTER SEQUENCE IF EXISTS user_profiles_id_seq RESTART WITH 1;

-- 显示重置结果
SELECT 'User profiles table reset completed. Current count:' as message, COUNT(*) as count FROM user_profiles;

-- 显示auth.users表中的用户数量作为对比
SELECT 'Auth users count:' as message, COUNT(*) as count FROM auth.users;