-- 初始化缓存配置数据
-- 为所有6种缓存类型插入默认配置

INSERT INTO cache_configs (cache_type, config_data, enabled) VALUES
('user', '{"maxSize": 500, "defaultTTL": 1800000, "cleanupInterval": 300000}', true),
('content', '{"maxSize": 1000, "defaultTTL": 600000, "cleanupInterval": 120000}', true),
('stats', '{"maxSize": 200, "defaultTTL": 120000, "cleanupInterval": 60000}', true),
('config', '{"maxSize": 100, "defaultTTL": 3600000, "cleanupInterval": 600000}', true),
('session', '{"maxSize": 300, "defaultTTL": 900000, "cleanupInterval": 300000}', true),
('api', '{"maxSize": 500, "defaultTTL": 300000, "cleanupInterval": 120000}', true)
ON CONFLICT (cache_type) DO UPDATE SET
  config_data = EXCLUDED.config_data,
  enabled = EXCLUDED.enabled,
  updated_at = now();

-- 验证数据插入
SELECT cache_type, config_data, enabled FROM cache_configs ORDER BY cache_type;