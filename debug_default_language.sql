-- 查询 default_language 字段的数据库存储情况
SELECT 
    setting_key,
    setting_value,
    setting_type,
    category,
    is_public,
    description
FROM system_settings 
WHERE setting_key = 'default_language';

-- 查看所有公开设置的分类分布
SELECT 
    category,
    COUNT(*) as count,
    STRING_AGG(setting_key, ', ') as keys
FROM system_settings 
WHERE is_public = true
GROUP BY category
ORDER BY category;