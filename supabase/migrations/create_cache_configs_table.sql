-- 创建缓存配置表
CREATE TABLE IF NOT EXISTS cache_configs (
    id SERIAL PRIMARY KEY,
    cache_type VARCHAR(50) UNIQUE NOT NULL, -- user, content, stats, config, session, api
    config_data JSONB NOT NULL, -- 缓存配置的JSON数据
    enabled BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_cache_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cache_configs_updated_at
    BEFORE UPDATE ON cache_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_cache_configs_updated_at();

-- 插入默认缓存配置
INSERT INTO cache_configs (cache_type, config_data, enabled, description) VALUES
('user', '{
  "ttl": 300000,
  "maxSize": 1000,
  "checkPeriod": 60000,
  "deleteOnExpire": true,
  "useClones": false
}', true, '用户数据缓存配置'),

('content', '{
  "ttl": 600000,
  "maxSize": 500,
  "checkPeriod": 120000,
  "deleteOnExpire": true,
  "useClones": false
}', true, '内容数据缓存配置'),

('stats', '{
  "ttl": 180000,
  "maxSize": 200,
  "checkPeriod": 30000,
  "deleteOnExpire": true,
  "useClones": false
}', true, '统计数据缓存配置'),

('config', '{
  "ttl": 1800000,
  "maxSize": 100,
  "checkPeriod": 300000,
  "deleteOnExpire": true,
  "useClones": false
}', true, '配置数据缓存配置'),

('session', '{
  "ttl": 1800000,
  "maxSize": 2000,
  "checkPeriod": 300000,
  "deleteOnExpire": true,
  "useClones": false
}', true, '会话数据缓存配置'),

('api', '{
  "ttl": 60000,
  "maxSize": 300,
  "checkPeriod": 15000,
  "deleteOnExpire": true,
  "useClones": false
}', true, 'API响应缓存配置')

ON CONFLICT (cache_type) DO NOTHING;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_cache_configs_type ON cache_configs(cache_type);
CREATE INDEX IF NOT EXISTS idx_cache_configs_enabled ON cache_configs(enabled);

-- 设置表权限
GRANT SELECT ON cache_configs TO anon;
GRANT ALL PRIVILEGES ON cache_configs TO authenticated;
GRANT ALL PRIVILEGES ON cache_configs TO service_role;

-- 为序列设置权限
GRANT USAGE, SELECT ON SEQUENCE cache_configs_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE cache_configs_id_seq TO service_role;