-- 检查当前的RLS策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'activities';

-- 检查当前用户的auth.uid()
SELECT auth.uid() as current_user_id;

-- 删除所有现有的activities表策略
DROP POLICY IF EXISTS "activities_select_policy" ON activities;
DROP POLICY IF EXISTS "activities_insert_policy" ON activities;
DROP POLICY IF EXISTS "activities_update_policy" ON activities;
DROP POLICY IF EXISTS "activities_delete_policy" ON activities;

-- 创建新的RLS策略
-- 允许所有人查看活动
CREATE POLICY "activities_select_policy" ON activities
    FOR SELECT
    USING (true);

-- 允许认证用户创建活动
CREATE POLICY "activities_insert_policy" ON activities
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- 允许用户更新自己创建的活动
CREATE POLICY "activities_update_policy" ON activities
    FOR UPDATE
    USING (auth.uid() = user_id);

-- 允许用户删除自己创建的活动
CREATE POLICY "activities_delete_policy" ON activities
    FOR DELETE
    USING (auth.uid() = user_id);

-- 再次检查策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'activities';