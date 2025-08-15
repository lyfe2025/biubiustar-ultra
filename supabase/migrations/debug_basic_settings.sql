-- 数据库调试脚本：解决联系邮箱和站点域名保存问题
-- 目标：确保contact_email和site_domain记录存在且能正常更新

-- 1. 查询当前system_settings表中的所有basic分类设置
SELECT 'Current basic settings:' as info;
SELECT setting_key, setting_value, category, is_public, created_at, updated_at 
FROM system_settings 
WHERE category = 'basic' 
ORDER BY setting_key;

-- 2. 专门查询contact_email和site_domain记录
SELECT 'Contact email and site domain records:' as info;
SELECT setting_key, setting_value, category, is_public, created_at, updated_at 
FROM system_settings 
WHERE setting_key IN ('contact_email', 'site_domain') 
ORDER BY setting_key;

-- 3. 检查这两个记录是否存在，如果不存在则插入默认值
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public) 
VALUES 
('contact_email', 'admin@biubiustar.com', 'string', 'basic', '联系邮箱', true),
('site_domain', 'biubiustar.com', 'string', 'basic', '站点域名', true)
ON CONFLICT (setting_key) DO NOTHING;

-- 4. 再次查询确认记录已存在
SELECT 'After insertion - Contact email and site domain records:' as info;
SELECT setting_key, setting_value, category, is_public, created_at, updated_at 
FROM system_settings 
WHERE setting_key IN ('contact_email', 'site_domain') 
ORDER BY setting_key;

-- 5. 测试更新功能 - 更新contact_email为测试值
UPDATE system_settings 
SET setting_value = 'test-contact@biubiustar.com', updated_at = NOW() 
WHERE setting_key = 'contact_email';

-- 6. 测试更新功能 - 更新site_domain为测试值
UPDATE system_settings 
SET setting_value = 'test.biubiustar.com', updated_at = NOW() 
WHERE setting_key = 'site_domain';

-- 7. 验证更新结果
SELECT 'After test updates:' as info;
SELECT setting_key, setting_value, category, is_public, created_at, updated_at 
FROM system_settings 
WHERE setting_key IN ('contact_email', 'site_domain') 
ORDER BY setting_key;

-- 8. 恢复为默认值
UPDATE system_settings 
SET setting_value = 'admin@biubiustar.com', updated_at = NOW() 
WHERE setting_key = 'contact_email';

UPDATE system_settings 
SET setting_value = 'biubiustar.com', updated_at = NOW() 
WHERE setting_key = 'site_domain';

-- 9. 最终验证
SELECT 'Final verification:' as info;
SELECT setting_key, setting_value, category, is_public, created_at, updated_at 
FROM system_settings 
WHERE setting_key IN ('contact_email', 'site_domain') 
ORDER BY setting_key;

-- 10. 检查权限设置
SELECT 'Table permissions check:' as info;
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'system_settings' 
AND grantee IN ('anon', 'authenticated') 
ORDER BY grantee, privilege_type;