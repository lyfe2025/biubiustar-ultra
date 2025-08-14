-- 为用户管理功能添加status和role字段
-- 添加用户状态字段
ALTER TABLE user_profiles 
ADD COLUMN status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'pending'));

-- 添加用户角色字段
ALTER TABLE user_profiles 
ADD COLUMN role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin'));

-- 添加邮箱验证状态字段
ALTER TABLE user_profiles 
ADD COLUMN email_verified BOOLEAN DEFAULT false;

-- 添加最后登录时间字段
ALTER TABLE user_profiles 
ADD COLUMN last_login TIMESTAMPTZ;

-- 为现有用户设置默认值
UPDATE user_profiles SET 
  status = 'active',
  role = 'user',
  email_verified = true
WHERE status IS NULL OR role IS NULL;

-- 添加索引以提高查询性能
CREATE INDEX idx_user_profiles_status ON user_profiles(status);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_email_verified ON user_profiles(email_verified);

-- 更新RLS策略以支持管理员操作
-- 允许管理员查看所有用户
CREATE POLICY "管理员可以查看所有用户" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() AND up.role IN ('admin', 'moderator')
    )
  );

-- 允许管理员更新用户状态和角色
CREATE POLICY "管理员可以更新用户" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

-- 允许管理员删除用户
CREATE POLICY "管理员可以删除用户" ON user_profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );