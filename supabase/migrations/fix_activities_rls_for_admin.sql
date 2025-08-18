-- 修复activities表的RLS策略，允许管理员创建活动
-- 删除现有的活动创建策略
DROP POLICY IF EXISTS "用户可以创建活动" ON activities;

-- 创建新的策略，允许认证用户和管理员创建活动
CREATE POLICY "用户和管理员可以创建活动" ON activities
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- 同样更新活动更新策略，允许管理员更新所有活动
DROP POLICY IF EXISTS "用户可以更新自己组织的活动" ON activities;

CREATE POLICY "用户和管理员可以更新活动" ON activities
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- 同样更新活动删除策略，允许管理员删除所有活动
DROP POLICY IF EXISTS "用户可以删除自己组织的活动" ON activities;

CREATE POLICY "用户和管理员可以删除活动" ON activities
  FOR DELETE USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- 确保anon和authenticated角色有正确的权限
GRANT SELECT, INSERT, UPDATE, DELETE ON activities TO authenticated;
GRANT SELECT ON activities TO anon;