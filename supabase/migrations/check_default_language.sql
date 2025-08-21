-- 查询 default_language 字段的当前状态
SELECT setting_key, setting_value, category, is_public, description
FROM system_settings 
WHERE setting_key = 'default_language';

-- 查看所有 language 分类的设置
SELECT setting_key, setting_value, category, is_public
FROM system_settings 
WHERE category = 'language';

-- 查看所有 basic 分类的设置
SELECT setting_key, setting_value, category, is_public
FROM system_settings 
WHERE category = 'basic';