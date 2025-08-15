-- 创建登录尝试记录表
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL,
  email VARCHAR(255),
  attempt_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN DEFAULT FALSE,
  user_agent TEXT,
  failure_reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建IP黑名单表
CREATE TABLE IF NOT EXISTS ip_blacklist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL UNIQUE,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  reason VARCHAR(255) DEFAULT 'Too many failed login attempts',
  failed_attempts_count INTEGER DEFAULT 0,
  is_permanent BOOLEAN DEFAULT FALSE,
  blocked_by UUID, -- 管理员ID，如果是手动封禁
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建安全日志表
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL, -- 'login_attempt', 'ip_blocked', 'ip_unblocked', 'manual_block', 'manual_unblock'
  ip_address INET,
  user_id UUID,
  email VARCHAR(255),
  details JSONB,
  severity VARCHAR(20) DEFAULT 'info', -- 'info', 'warning', 'error', 'critical'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为查询性能创建索引
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON login_attempts(ip_address, attempt_time DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time ON login_attempts(email, attempt_time DESC);
CREATE INDEX IF NOT EXISTS idx_ip_blacklist_ip ON ip_blacklist(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_blacklist_blocked_until ON ip_blacklist(blocked_until);
CREATE INDEX IF NOT EXISTS idx_security_logs_type_time ON security_logs(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip_time ON security_logs(ip_address, created_at DESC);

-- 创建自动清理过期记录的函数
CREATE OR REPLACE FUNCTION cleanup_old_security_records()
RETURNS void AS $$
BEGIN
  -- 删除30天前的登录尝试记录
  DELETE FROM login_attempts 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- 删除90天前的安全日志
  DELETE FROM security_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- 自动解锁过期的IP黑名单（非永久封禁）
  UPDATE ip_blacklist 
  SET blocked_until = NULL,
      updated_at = NOW()
  WHERE blocked_until IS NOT NULL 
    AND blocked_until < NOW() 
    AND is_permanent = FALSE;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器函数来更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为ip_blacklist表创建更新时间触发器
CREATE TRIGGER update_ip_blacklist_updated_at
  BEFORE UPDATE ON ip_blacklist
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 授权给anon和authenticated角色
GRANT SELECT ON login_attempts TO anon, authenticated;
GRANT SELECT ON ip_blacklist TO anon, authenticated;
GRANT SELECT ON security_logs TO anon, authenticated;

-- 为管理员角色授予完整权限（需要在应用层控制）
-- 注意：实际权限控制将在应用层通过RLS策略实现

-- 插入一些示例配置数据
INSERT INTO security_logs (event_type, details, severity) 
VALUES ('system_init', '{"message": "Security tables initialized"}', 'info')
ON CONFLICT DO NOTHING;