-- Create cache_configs table for persistent cache configuration storage
CREATE TABLE IF NOT EXISTS cache_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_type VARCHAR(50) NOT NULL UNIQUE,
    config_data JSONB NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for cache_type for faster lookups
CREATE INDEX IF NOT EXISTS idx_cache_configs_cache_type ON cache_configs(cache_type);
CREATE INDEX IF NOT EXISTS idx_cache_configs_enabled ON cache_configs(enabled);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_cache_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cache_configs_updated_at
    BEFORE UPDATE ON cache_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_cache_configs_updated_at();

-- Insert default cache configurations
INSERT INTO cache_configs (cache_type, config_data, enabled) VALUES
('user', '{
    "maxSize": 1000,
    "defaultTTL": 300000,
    "cleanupInterval": 60000
}', true),
('content', '{
    "maxSize": 500,
    "defaultTTL": 600000,
    "cleanupInterval": 120000
}', true),
('stats', '{
    "maxSize": 200,
    "defaultTTL": 180000,
    "cleanupInterval": 90000
}', true),
('config', '{
    "maxSize": 100,
    "defaultTTL": 900000,
    "cleanupInterval": 300000
}', true),
('session', '{
    "maxSize": 2000,
    "defaultTTL": 1800000,
    "cleanupInterval": 300000
}', true),
('api', '{
    "maxSize": 1500,
    "defaultTTL": 120000,
    "cleanupInterval": 60000
}', true)
ON CONFLICT (cache_type) DO NOTHING;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON cache_configs TO authenticated;
GRANT SELECT ON cache_configs TO anon;

-- Add RLS policies
ALTER TABLE cache_configs ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users (admin access)
CREATE POLICY "Admin can manage cache configs" ON cache_configs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Policy for read access
CREATE POLICY "Users can read cache configs" ON cache_configs
    FOR SELECT USING (true);

COMMENT ON TABLE cache_configs IS 'Stores cache configuration settings for different cache types';
COMMENT ON COLUMN cache_configs.cache_type IS 'Type of cache (user, content, stats, config, session, api)';
COMMENT ON COLUMN cache_configs.config_data IS 'JSON configuration data including maxSize, defaultTTL, cleanupInterval';
COMMENT ON COLUMN cache_configs.enabled IS 'Whether this cache type is enabled';