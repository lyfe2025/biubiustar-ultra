-- Initialize default cache configurations
-- This script adds default configuration for all cache types

-- Insert default cache configurations for all cache types
INSERT INTO cache_configs (cache_type, config_data, enabled) VALUES
('user', '{
  "maxSize": 1000,
  "defaultTTL": 3600000,
  "cleanupInterval": 300000,
  "compressionEnabled": true,
  "persistToDisk": false
}', true),
('content', '{
  "maxSize": 2000,
  "defaultTTL": 1800000,
  "cleanupInterval": 300000,
  "compressionEnabled": true,
  "persistToDisk": false
}', true),
('stats', '{
  "maxSize": 500,
  "defaultTTL": 900000,
  "cleanupInterval": 300000,
  "compressionEnabled": false,
  "persistToDisk": true
}', true),
('config', '{
  "maxSize": 100,
  "defaultTTL": 7200000,
  "cleanupInterval": 600000,
  "compressionEnabled": false,
  "persistToDisk": true
}', true),
('session', '{
  "maxSize": 5000,
  "defaultTTL": 1800000,
  "cleanupInterval": 300000,
  "compressionEnabled": true,
  "persistToDisk": false
}', true),
('api', '{
  "maxSize": 1500,
  "defaultTTL": 600000,
  "cleanupInterval": 300000,
  "compressionEnabled": true,
  "persistToDisk": false
}', true)
ON CONFLICT (cache_type) DO UPDATE SET
  config_data = EXCLUDED.config_data,
  enabled = EXCLUDED.enabled,
  updated_at = now();

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON cache_configs TO authenticated;
GRANT SELECT ON cache_configs TO anon;