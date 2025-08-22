-- 检查cache_configs表中的数据
-- 这个查询用于调试缓存配置显示问题

SELECT 
  cache_type,
  config_data,
  enabled,
  created_at,
  updated_at
FROM cache_configs
ORDER BY cache_type;

-- 检查每个缓存类型的配置结构
SELECT 
  cache_type,
  jsonb_pretty(config_data) as formatted_config,
  enabled
FROM cache_configs
ORDER BY cache_type;

-- 检查是否有必需的缓存类型
SELECT 
  'Expected cache types' as info,
  array_agg(cache_type) as existing_types
FROM cache_configs;

-- 验证配置数据结构
SELECT 
  cache_type,
  config_data ? 'maxSize' as has_max_size,
  config_data ? 'defaultTTL' as has_default_ttl,
  config_data ? 'cleanupInterval' as has_cleanup_interval,
  config_data->>'maxSize' as max_size_value,
  config_data->>'defaultTTL' as default_ttl_value,
  config_data->>'cleanupInterval' as cleanup_interval_value
FROM cache_configs
ORDER BY cache_type;