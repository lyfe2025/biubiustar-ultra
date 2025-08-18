-- 添加更多活动分类
-- 避免与现有分类重复：商务活动、娱乐休闲、户外运动、文化艺术、社交聚会

INSERT INTO activity_categories (name, description, color, icon, is_active) VALUES
-- 学习和知识类
('技术分享', '技术交流和知识分享活动', '#3B82F6', 'code', true),
('学习交流', '学习小组和知识交流活动', '#F59E0B', 'book-open', true),
('读书会', '读书分享和文学交流活动', '#7C3AED', 'book', true),

-- 生活和兴趣类
('美食聚会', '美食品尝和烹饪交流活动', '#EF4444', 'utensils', true),
('摄影', '摄影交流和作品分享活动', '#06B6D4', 'camera', true),
('音乐', '音乐演出和交流活动', '#EC4899', 'music', true),
('旅行', '旅行分享和户外探索活动', '#10B981', 'map-pin', true),

-- 健康和运动类
('健身运动', '健身锻炼和体育活动', '#F97316', 'dumbbell', true),

-- 社会和公益类
('志愿服务', '公益活动和志愿服务', '#22C55E', 'heart', true),

-- 职业和商务类
('商务网络', '商务社交和职业发展活动', '#6B7280', 'users', true),

-- 创意和艺术类
('艺术创作', '艺术创作和手工制作活动', '#A855F7', 'paintbrush', true),

-- 其他类别
('其他', '其他类型的活动', '#64748B', 'more-horizontal', true);

-- 更新时间戳
UPDATE activity_categories SET updated_at = NOW() WHERE updated_at IS NULL;