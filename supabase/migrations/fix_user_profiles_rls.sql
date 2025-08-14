-- 修复user_profiles表的RLS无限递归问题

-- 首先禁用RLS策略
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 删除可能导致无限递归的现有策略
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;

-- 重新启用RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 创建简化的RLS策略，避免递归
-- 允许用户查看自己的资料
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- 允许用户更新自己的资料
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- 允许插入新用户资料（注册时需要）
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 验证修复结果
SELECT 
    'RLS_STATUS' as check_type,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 列出当前的RLS策略
SELECT 
    'CURRENT_POLICIES' as check_type,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';