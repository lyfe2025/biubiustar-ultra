-- 插入缺失的基本设置记录
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public)
VALUES 
  ('contact_email', '', 'string', 'basic', '联系邮箱', true),
  ('site_domain', '', 'string', 'basic', '站点域名', true)
ON CONFLICT (setting_key) DO NOTHING;