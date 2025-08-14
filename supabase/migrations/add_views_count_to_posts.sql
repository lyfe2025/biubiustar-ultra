-- 为posts表添加views_count字段
ALTER TABLE posts ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- 更新现有记录的views_count为0
UPDATE posts SET views_count = 0 WHERE views_count IS NULL;

-- 添加注释
COMMENT ON COLUMN posts.views_count IS '帖子浏览次数';