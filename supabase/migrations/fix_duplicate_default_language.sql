-- 修复重复的默认语言设置
-- 删除错误的 defaultLanguage 字段，保留标准的 default_language 字段

-- 首先检查当前状态
SELECT 
    setting_key, 
    setting_value, 
    category, 
    created_at, 
    updated_at
FROM system_settings 
WHERE setting_key IN ('default_language', 'defaultLanguage')
ORDER BY created_at;

-- 删除重复的 defaultLanguage 字段（保留更早创建的 default_language）
DELETE FROM system_settings 
WHERE setting_key = 'defaultLanguage';

-- 验证删除结果
SELECT 
    setting_key, 
    setting_value, 
    category, 
    created_at, 
    updated_at
FROM system_settings 
WHERE setting_key IN ('default_language', 'defaultLanguage')
ORDER BY created_at;