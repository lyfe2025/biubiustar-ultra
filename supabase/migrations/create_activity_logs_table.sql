-- 创建活动日志表
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 日志类型：login, logout, create, update, delete, etc.
  action VARCHAR(100) NOT NULL, -- 具体操作：user_login, post_created, etc.
  details TEXT, -- 详细信息，JSON格式
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email VARCHAR(255), -- 冗余存储，防止用户删除后丢失信息
  ip_address INET, -- IP地址
  user_agent TEXT, -- 用户代理
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

-- 启用RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略：只有管理员可以查看所有日志
CREATE POLICY "管理员可以查看所有活动日志" ON activity_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- 创建RLS策略：只有管理员可以插入日志
CREATE POLICY "管理员可以插入活动日志" ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- 授权给anon和authenticated角色
GRANT SELECT ON activity_logs TO anon;
GRANT ALL PRIVILEGES ON activity_logs TO authenticated;

-- 插入一些示例数据
INSERT INTO activity_logs (type, action, details, user_email, ip_address) VALUES
('system', 'system_start', '系统启动', 'system@biubiustar.com', '127.0.0.1'),
('admin', 'admin_login', '管理员登录', 'admin@biubiustar.com', '192.168.1.100'),
('user', 'user_register', '用户注册', 'user@example.com', '192.168.1.101');