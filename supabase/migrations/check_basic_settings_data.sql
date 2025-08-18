-- 检查system_settings表中的基础设置数据
SELECT 
  id,
  setting_key,
  setting_value,
  setting_type,
  category,
  description,
  is_public,
  created_at,
  updated_at
FROM system_settings 
WHERE category = 'basic'
ORDER BY setting_key;

-- 检查所有设置数据的总数
SELECT 
  category,
  COUNT(*) as count
FROM system_settings 
GROUP BY category
ORDER BY category;

-- 检查是否有任何数据
SELECT COUNT(*) as total_settings FROM system_settings;