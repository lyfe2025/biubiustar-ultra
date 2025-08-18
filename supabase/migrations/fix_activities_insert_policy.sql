-- 修复activities表的RLS策略，允许认证用户创建活动

-- 删除现有的INSERT策略（如果存在）
DROP POLICY IF EXISTS "Users can insert their own activities" ON activities;
DROP POLICY IF EXISTS "Allow authenticated users to insert activities" ON activities;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON activities;

-- 创建新的INSERT策略，允许认证用户创建活动
CREATE POLICY "Allow authenticated users to create activities" ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 确保SELECT策略存在，允许所有人查看活动
DROP POLICY IF EXISTS "Activities are viewable by everyone" ON activities;
CREATE POLICY "Activities are viewable by everyone" ON activities
  FOR SELECT
  TO public
  USING (true);

-- 确保UPDATE策略存在，只允许创建者更新
DROP POLICY IF EXISTS "Users can update their own activities" ON activities;
CREATE POLICY "Users can update their own activities" ON activities
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 确保DELETE策略存在，只允许创建者删除
DROP POLICY IF EXISTS "Users can delete their own activities" ON activities;
CREATE POLICY "Users can delete their own activities" ON activities
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 确保表权限正确设置
GRANT SELECT ON activities TO anon;
GRANT ALL PRIVILEGES ON activities TO authenticated;