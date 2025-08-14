-- 为posts表添加category字段
ALTER TABLE posts ADD COLUMN category VARCHAR(50) DEFAULT 'general';

-- 为现有数据设置默认分类
UPDATE posts SET category = 'general' WHERE category IS NULL;

-- 添加索引以提高查询性能
CREATE INDEX idx_posts_category ON posts(category);

-- 添加约束确保category不为空
ALTER TABLE posts ALTER COLUMN category SET NOT NULL;