-- 验证contact_email和site_domain设置记录是否已存在
SELECT setting_key, setting_value, category, is_public, created_at 
FROM system_settings 
WHERE setting_key IN ('contact_email', 'site_domain') 
ORDER BY setting_key;

-- 同时查看所有basic分类的设置
SELECT setting_key, setting_value, category 
FROM system_settings 
WHERE category = 'basic' 
ORDER BY setting_key;