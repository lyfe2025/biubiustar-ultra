-- 创建内容分类表
CREATE TABLE IF NOT EXISTS content_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6', -- 十六进制颜色代码
  icon VARCHAR(50) DEFAULT 'tag', -- 图标名称
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0, -- 排序顺序
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_content_categories_name ON content_categories(name);
CREATE INDEX idx_content_categories_is_active ON content_categories(is_active);
CREATE INDEX idx_content_categories_sort_order ON content_categories(sort_order);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_content_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_content_categories_updated_at
  BEFORE UPDATE ON content_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_content_categories_updated_at();

-- 启用行级安全策略
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;

-- 创建策略：所有人可以查看活跃的分类
CREATE POLICY "Anyone can view active content categories" ON content_categories
  FOR SELECT USING (is_active = true);

-- 创建策略：认证用户可以查看所有分类
CREATE POLICY "Authenticated users can view all content categories" ON content_categories
  FOR SELECT TO authenticated USING (true);

-- 创建策略：只有管理员可以修改分类（这里暂时允许认证用户，后续可以添加角色检查）
CREATE POLICY "Authenticated users can manage content categories" ON content_categories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 插入默认分类
INSERT INTO content_categories (name, description, color, icon, sort_order) VALUES
('全部', '显示所有内容', '#6B7280', 'grid', 0),
('生活分享', '日常生活、心情感悟', '#F59E0B', 'heart', 1),
('学习交流', '学习心得、知识分享', '#3B82F6', 'book', 2),
('兴趣爱好', '兴趣爱好、技能展示', '#10B981', 'star', 3),
('美食推荐', '美食分享、餐厅推荐', '#EF4444', 'utensils', 4),
('旅行游记', '旅行经历、景点推荐', '#8B5CF6', 'map', 5),
('科技数码', '科技产品、数码评测', '#06B6D4', 'smartphone', 6),
('其他', '其他类型内容', '#6B7280', 'more-horizontal', 99)
ON CONFLICT (name) DO NOTHING;

-- 更新posts表的category字段，使其引用content_categories表的name字段
-- 为现有posts设置默认分类
UPDATE posts SET category = '其他' WHERE category = 'general' OR category IS NULL;

-- 添加外键约束（软约束，通过应用层控制）
-- ALTER TABLE posts ADD CONSTRAINT fk_posts_category 
-- FOREIGN KEY (category) REFERENCES content_categories(name) ON UPDATE CASCADE;

-- 添加注释
COMMENT ON TABLE content_categories IS '内容分类表，用于管理帖子的分类标签';
COMMENT ON COLUMN content_categories.name IS '分类名称，唯一标识';
COMMENT ON COLUMN content_categories.description IS '分类描述';
COMMENT ON COLUMN content_categories.color IS '分类颜色，十六进制格式';
COMMENT ON COLUMN content_categories.icon IS '分类图标名称';
COMMENT ON COLUMN content_categories.is_active IS '是否启用该分类';
COMMENT ON COLUMN content_categories.sort_order IS '排序顺序，数字越小越靠前';