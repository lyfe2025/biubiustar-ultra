-- 插入默认的基础设置数据
-- 如果数据已存在则跳过，避免重复插入

INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public, created_at, updated_at)
VALUES 
  ('site_name', 'BiuBiuStar', 'string', 'basic', '网站名称', true, NOW(), NOW()),
  ('site_description', '一个现代化的网站平台', 'string', 'basic', '网站描述', true, NOW(), NOW()),
  ('site_description_zh', '一个现代化的网站平台', 'string', 'basic', '网站描述（中文）', true, NOW(), NOW()),
  ('site_description_zh_tw', '一個現代化的網站平台', 'string', 'basic', '网站描述（繁体中文）', true, NOW(), NOW()),
  ('site_description_en', 'A modern website platform', 'string', 'basic', '网站描述（英文）', true, NOW(), NOW()),
  ('site_description_vi', 'Một nền tảng website hiện đại', 'string', 'basic', '网站描述（越南语）', true, NOW(), NOW()),
  ('site_logo', '', 'string', 'basic', '网站Logo', true, NOW(), NOW()),
  ('site_favicon', '', 'string', 'basic', '网站Favicon', true, NOW(), NOW()),
  ('contact_email', 'admin@biubiustar.com', 'string', 'basic', '联系邮箱', true, NOW(), NOW()),
  ('site_domain', 'localhost:3001', 'string', 'basic', '网站域名', true, NOW(), NOW()),
  ('site_keywords', 'BiuBiuStar,网站,平台', 'string', 'basic', '网站关键词', true, NOW(), NOW()),
  ('tech_stack', '["React","Node.js","Supabase"]', 'json', 'basic', '技术栈', true, NOW(), NOW())
ON CONFLICT (setting_key) DO NOTHING;

-- 验证插入结果
SELECT 
  setting_key,
  setting_value,
  category,
  is_public
FROM system_settings 
WHERE category = 'basic'
ORDER BY setting_key;