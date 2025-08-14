-- 修复user_profiles表的RLS策略无限递归问题
-- 删除现有的有问题的策略
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;

-- 创建新的简单RLS策略
-- 允许用户查看和更新自己的资料
CREATE POLICY "Enable read access for own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update for own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- 允许管理员访问所有用户资料（用于管理后台）
CREATE POLICY "Enable admin access" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role = 'admin'
        )
    );

-- 允许服务角色访问所有数据（用于后端API）
GRANT ALL ON user_profiles TO service_role;

-- 允许匿名和认证用户基本读取权限
GRANT SELECT ON user_profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;