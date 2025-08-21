-- 检查 default_language 字段的当前状态
SELECT 'Current default_language status:' as info;
SELECT setting_key, setting_value, category, is_public, description
FROM system_settings 
WHERE setting_key = 'default_language';

-- 如果 default_language 在 language 分类下，将其移动到 basic 分类
-- 这样前端就可以通过 'basic.defaultLanguage' 访问
UPDATE system_settings 
SET category = 'basic',
    updated_at = now()
WHERE setting_key = 'default_language' AND category = 'language';

-- 如果 default_language 不存在，则创建它
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public, created_at, updated_at)
SELECT 'default_language', 'zh', 'string', 'basic', '网站默认语言设置', true, now(), now()
WHERE NOT EXISTS (
    SELECT 1 FROM system_settings WHERE setting_key = 'default_language'
);

-- 验证更新结果
SELECT 'Updated default_language status:' as info;
SELECT setting_key, setting_value, category, is_public, description
FROM system_settings 
WHERE setting_key = 'default_language';