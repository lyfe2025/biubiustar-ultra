-- 创建活动分类表
CREATE TABLE IF NOT EXISTS activity_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6', -- 十六进制颜色代码
  icon VARCHAR(50) DEFAULT 'tag', -- 图标名称
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_activity_categories_updated_at
    BEFORE UPDATE ON activity_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 插入默认分类数据
INSERT INTO activity_categories (name, description, color, icon) VALUES
('户外运动', '户外体育活动和运动', '#10B981', 'mountain'),
('学习交流', '学术研讨和知识分享', '#3B82F6', 'book-open'),
('社交聚会', '社交活动和聚会', '#F59E0B', 'users'),
('文化艺术', '文化艺术活动', '#8B5CF6', 'palette'),
('志愿服务', '公益和志愿服务活动', '#EF4444', 'heart'),
('技术分享', '技术交流和分享', '#06B6D4', 'code'),
('娱乐休闲', '娱乐和休闲活动', '#84CC16', 'gamepad-2'),
('商务活动', '商务会议和活动', '#6B7280', 'briefcase')
ON CONFLICT (name) DO NOTHING;

-- 启用行级安全策略
ALTER TABLE activity_categories ENABLE ROW LEVEL SECURITY;

-- 创建策略：所有人可以查看活跃的分类
CREATE POLICY "Anyone can view active categories" ON activity_categories
  FOR SELECT USING (is_active = true);

-- 创建策略：认证用户可以查看所有分类
CREATE POLICY "Authenticated users can view all categories" ON activity_categories
  FOR SELECT TO authenticated USING (true);

-- 创建策略：只有管理员可以修改分类（这里暂时允许认证用户，后续可以添加角色检查）
CREATE POLICY "Authenticated users can manage categories" ON activity_categories
  FOR ALL TO authenticated USING (true);

-- 授权给anon和authenticated角色
GRANT SELECT ON activity_categories TO anon;
GRANT ALL PRIVILEGES ON activity_categories TO authenticated;

-- 为activities表添加category_id外键（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE activities ADD COLUMN category_id UUID REFERENCES activity_categories(id);
    END IF;
END $$;