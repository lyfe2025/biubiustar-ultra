-- 为站点描述添加多语言支持
-- 添加多语言站点描述字段
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
('site_description_zh', '一个现代化的社交平台', 'string', 'basic', '网站描述（简体中文）', true),
('site_description_zh_tw', '一個現代化的社交平台', 'string', 'basic', '網站描述（繁體中文）', true),
('site_description_en', 'A modern social platform', 'string', 'basic', 'Website description (English)', true),
('site_description_vi', 'Một nền tảng xã hội hiện đại', 'string', 'basic', 'Mô tả trang web (Tiếng Việt)', true)
ON CONFLICT (setting_key) DO NOTHING;

-- 更新原有的site_description为默认值（简体中文）
UPDATE system_settings 
SET setting_value = '一个现代化的社交平台'
WHERE setting_key = 'site_description' AND setting_value IS NULL;
