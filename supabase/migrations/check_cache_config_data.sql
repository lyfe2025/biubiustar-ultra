-- 检查缓存配置表中的数据
SELECT 
    id,
    config_key,
    config_value,
    description,
    created_at,
    updated_at
FROM cache_config 
ORDER BY config_key;

-- 统计记录数
SELECT COUNT(*) as total_records FROM cache_config;