-- 创建系统设置表
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json
    category VARCHAR(100) NOT NULL, -- basic, language, user, email, storage, security, notification, cache, backup
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- 是否可以在前台访问
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_system_settings_updated_at();

-- 插入默认系统设置
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
-- 基本设置
('site_name', 'BiuBiuStar', 'string', 'basic', '网站名称', true),
('site_description', '一个现代化的社交平台', 'string', 'basic', '网站描述', true),
('site_logo', '', 'string', 'basic', '网站Logo URL', true),
('site_favicon', '', 'string', 'basic', '网站Favicon URL', true),
('site_keywords', 'social,platform,community', 'string', 'basic', '网站关键词', true),

-- 语言设置
('default_language', 'zh-CN', 'string', 'language', '默认语言', true),
('supported_languages', '["zh-CN","zh-TW","en","vi"]', 'json', 'language', '支持的语言列表', true),
('auto_detect_language', 'true', 'boolean', 'language', '自动检测用户语言', true),

-- 用户设置
('allow_registration', 'true', 'boolean', 'user', '允许用户注册', false),
('require_email_verification', 'false', 'boolean', 'user', '需要邮箱验证', false),
('default_user_role', 'user', 'string', 'user', '默认用户角色', false),
('max_posts_per_day', '10', 'number', 'user', '每日最大发帖数', false),
('max_file_size', '10485760', 'number', 'user', '最大文件大小(字节)', false),

-- 邮箱设置
('smtp_host', '', 'string', 'email', 'SMTP主机', false),
('smtp_port', '587', 'number', 'email', 'SMTP端口', false),
('smtp_username', '', 'string', 'email', 'SMTP用户名', false),
('smtp_password', '', 'string', 'email', 'SMTP密码', false),
('smtp_from_email', '', 'string', 'email', '发件人邮箱', false),
('smtp_from_name', 'BiuBiuStar', 'string', 'email', '发件人名称', false),
('smtp_use_tls', 'true', 'boolean', 'email', '使用TLS加密', false),

-- 存储设置
('storage_provider', 'supabase', 'string', 'storage', '存储提供商', false),
('max_upload_size', '10485760', 'number', 'storage', '最大上传大小(字节)', false),
('allowed_file_types', '["jpg","jpeg","png","gif","pdf","doc","docx"]', 'json', 'storage', '允许的文件类型', false),
('storage_path', 'uploads', 'string', 'storage', '存储路径', false),

-- 安全设置
('password_min_length', '8', 'number', 'security', '密码最小长度', false),
('password_require_uppercase', 'true', 'boolean', 'security', '密码需要大写字母', false),
('password_require_lowercase', 'true', 'boolean', 'security', '密码需要小写字母', false),
('password_require_numbers', 'true', 'boolean', 'security', '密码需要数字', false),
('password_require_symbols', 'false', 'boolean', 'security', '密码需要特殊字符', false),
('max_login_attempts', '5', 'number', 'security', '最大登录尝试次数', false),
('login_lockout_duration', '900', 'number', 'security', '登录锁定时长(秒)', false),

-- 通知设置
('enable_email_notifications', 'true', 'boolean', 'notification', '启用邮件通知', false),
('enable_system_notifications', 'true', 'boolean', 'notification', '启用系统通知', false),
('notification_email_new_user', 'true', 'boolean', 'notification', '新用户注册邮件通知', false),
('notification_email_new_post', 'false', 'boolean', 'notification', '新帖子邮件通知', false),

-- 缓存设置
('enable_cache', 'true', 'boolean', 'cache', '启用缓存', false),
('cache_ttl', '3600', 'number', 'cache', '缓存过期时间(秒)', false),
('cache_type', 'memory', 'string', 'cache', '缓存类型', false),

-- 备份设置
('enable_auto_backup', 'false', 'boolean', 'backup', '启用自动备份', false),
('backup_frequency', 'daily', 'string', 'backup', '备份频率', false),
('backup_retention_days', '30', 'number', 'backup', '备份保留天数', false),
('backup_storage_path', 'backups', 'string', 'backup', '备份存储路径', false)

ON CONFLICT (setting_key) DO NOTHING;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_is_public ON system_settings(is_public);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- 设置表权限
GRANT SELECT ON system_settings TO anon;
GRANT ALL PRIVILEGES ON system_settings TO authenticated;
GRANT ALL PRIVILEGES ON system_settings TO service_role;