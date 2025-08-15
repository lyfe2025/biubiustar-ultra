-- 查询system_settings表中的contact_email和site_domain记录
SELECT setting_key, setting_value, category, created_at 
FROM system_settings 
WHERE setting_key IN ('contact_email', 'site_domain') 
ORDER BY setting_key;

-- 如果记录不存在，插入默认记录
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public)
VALUES 
  ('contact_email', '', 'text', 'basic', '联系邮箱', true),
  ('site_domain', '', 'text', 'basic', '站点域名', true)
ON CONFLICT (setting_key) DO NOTHING;

-- 再次查询确认记录存在
SELECT setting_key, setting_value, category, created_at 
FROM system_settings 
WHERE setting_key IN ('contact_email', 'site_domain') 
ORDER BY setting_key;