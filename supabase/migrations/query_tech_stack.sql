-- 查询tech_stack字段的数据
SELECT setting_key, setting_value, is_public, category 
FROM system_settings 
WHERE setting_key = 'tech_stack';