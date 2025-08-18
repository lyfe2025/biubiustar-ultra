-- 插入BiuBiuStar社交平台的基础设置数据
-- 如果设置已存在则更新，不存在则插入

-- 站点名称
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public)
VALUES ('site_name', 'BiuBiuStar', 'string', 'basic', '网站名称', true)
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = now();

-- 站点描述（中文）
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public)
VALUES ('site_description_zh', '一个现代化的社交活动平台，连接志趣相投的人们', 'string', 'basic', '网站描述（中文）', true)
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = now();

-- 站点描述（英文）
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public)
VALUES ('site_description_en', 'A modern social activity platform connecting like-minded people', 'string', 'basic', '网站描述（英文）', true)
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = now();

-- 联系邮箱
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public)
VALUES ('contact_email', 'contact@biubiustar.com', 'string', 'basic', '联系邮箱', true)
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = now();

-- 站点域名
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public)
VALUES ('site_domain', 'localhost:5173', 'string', 'basic', '站点域名', true)
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = now();

-- 站点Logo路径
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public)
VALUES ('site_logo', '/assets/logo.png', 'string', 'basic', '站点Logo路径', true)
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = now();

-- 站点Favicon路径
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public)
VALUES ('site_favicon', '/favicon.ico', 'string', 'basic', '站点Favicon路径', true)
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = now();

-- 站点关键词
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public)
VALUES ('site_keywords', '社交平台,活动,社区,交友,兴趣', 'string', 'basic', '站点关键词', true)
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = now();

-- 版权信息
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public)
VALUES ('copyright', '© 2024 BiuBiuStar. All rights reserved.', 'string', 'basic', '版权信息', true)
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = now();

-- ICP备案号（可选）
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public)
VALUES ('icp_number', '', 'string', 'basic', 'ICP备案号', true)
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = now();