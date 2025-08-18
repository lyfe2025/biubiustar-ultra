-- 更新基础设置的默认数据
UPDATE system_settings 
SET setting_value = CASE setting_key
    WHEN 'site_name' THEN 'BiuBiuStar'
    WHEN 'site_description' THEN '一个现代化的社交平台'
    WHEN 'site_description_zh' THEN '一个现代化的社交平台，连接每一个你'
    WHEN 'site_description_zh_tw' THEN '一個現代化的社交平台，連接每一個你'
    WHEN 'site_description_en' THEN 'A modern social platform that connects everyone'
    WHEN 'site_description_vi' THEN 'Một nền tảng xã hội hiện đại kết nối mọi người'
    WHEN 'contact_email' THEN 'contact@biubiustar.com'
    WHEN 'site_domain' THEN 'biubiustar.com'
    WHEN 'site_logo' THEN '/uploads/site-logo.png'
    WHEN 'site_favicon' THEN '/uploads/site-favicon.png'
    ELSE setting_value
END,
updated_at = NOW()
WHERE category = 'basic' AND setting_key IN (
    'site_name', 'site_description', 'site_description_zh', 'site_description_zh_tw', 
    'site_description_en', 'site_description_vi', 'contact_email', 'site_domain',
    'site_logo', 'site_favicon'
);
