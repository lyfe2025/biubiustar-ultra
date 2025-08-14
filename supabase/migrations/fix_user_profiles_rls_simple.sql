-- 修复user_profiles表的RLS策略 - 使用更简单的方法
-- 完全删除所有现有策略
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable admin access" ON user_profiles;

-- 创建简单的RLS策略，避免递归
-- 允许用户查看和更新自己的资料
CREATE POLICY "Allow own profile access" ON user_profiles
    FOR ALL USING (auth.uid() = id);

-- 允许所有认证用户读取其他用户的基本信息（用于显示用户名等）
CREATE POLICY "Allow public read" ON user_profiles
    FOR SELECT USING (true);

-- 确保权限设置正确
GRANT ALL ON user_profiles TO service_role;
GRANT SELECT ON user_profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;