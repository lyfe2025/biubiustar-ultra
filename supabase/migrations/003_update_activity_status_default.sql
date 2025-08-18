-- 更新活动状态系统，统一状态定义
-- 将默认状态从'upcoming'改为'published'
-- 同时更新现有数据以保持一致性

-- 首先更新现有的'upcoming'状态为'published'
UPDATE activities 
SET status = 'published' 
WHERE status = 'upcoming';

-- 更新现有的'active'状态为'published' (向后兼容)
UPDATE activities 
SET status = 'published' 
WHERE status = 'active';

-- 修改status字段的默认值
ALTER TABLE activities 
ALTER COLUMN status SET DEFAULT 'published';

-- 添加注释说明状态字段的用途
COMMENT ON COLUMN activities.status IS '活动状态: published(已发布), draft(草稿), cancelled(已取消)';