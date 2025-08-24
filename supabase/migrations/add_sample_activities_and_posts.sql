-- 添加示例活动和帖子数据
-- 创建4个活动（包含即将开始、进行中、已结束三种状态）和4个热门帖子

-- 创建演示用户（如果不存在）
INSERT INTO auth.users (id, aud, role, email, encrypted_password, created_at, updated_at, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin) 
SELECT '550e8400-e29b-41d4-a716-446655440000', 'authenticated', 'authenticated', 'demo@example.com', '$2a$10$dummy.encrypted.password.hash', NOW(), NOW(), NOW(), '{}', '{}', false
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '550e8400-e29b-41d4-a716-446655440000');

INSERT INTO user_profiles (id, username, full_name, bio, avatar_url, location) 
SELECT '550e8400-e29b-41d4-a716-446655440000', 'demo_user', '演示用户', '这是一个演示用户账户，用于展示系统功能。', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20user%20avatar%20profile%20picture&image_size=square', '北京市'
WHERE NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = '550e8400-e29b-41d4-a716-446655440000');

-- 获取一些活动分类ID（假设这些分类已存在）
-- 如果分类不存在，先创建基础分类
INSERT INTO activity_categories (name, description, color, icon, name_zh, name_zh_tw, name_en, name_vi, description_zh, description_zh_tw, description_en, description_vi) VALUES
('技术分享', '技术交流和知识分享活动', '#3B82F6', 'code', '技术分享', '技術分享', 'Tech Sharing', 'Chia sẻ công nghệ', '技术交流和知识分享活动', '技術交流和知識分享活動', 'Technology exchange and knowledge sharing activities', 'Hoạt động trao đổi công nghệ và chia sẻ kiến thức'),
('户外运动', '户外体育活动和运动', '#10B981', 'mountain', '户外运动', '戶外運動', 'Outdoor Sports', 'Thể thao ngoài trời', '户外体育活动和运动', '戶外體育活動和運動', 'Outdoor sports and physical activities', 'Các hoạt động thể thao và vận động ngoài trời'),
('社交聚会', '社交活动和聚会', '#F59E0B', 'users', '社交聚会', '社交聚會', 'Social Gathering', 'Tụ tập xã hội', '社交活动和聚会', '社交活動和聚會', 'Social activities and gatherings', 'Các hoạt động xã hội và tụ tập'),
('文化艺术', '文化艺术活动', '#8B5CF6', 'palette', '文化艺术', '文化藝術', 'Culture & Arts', 'Văn hóa nghệ thuật', '文化艺术活动', '文化藝術活動', 'Cultural and artistic activities', 'Các hoạt động văn hóa nghệ thuật')
ON CONFLICT (name) DO NOTHING;

-- 插入4个示例活动
INSERT INTO activities (id, title, description, image_url, start_date, end_date, location, max_participants, user_id, category, status) VALUES
-- 1. 即将开始的活动
(
  '11111111-1111-1111-1111-111111111111',
  'React 18 新特性分享会',
  '深入探讨 React 18 的并发特性、Suspense 改进和新的 Hooks。适合有一定 React 基础的开发者参加，我们将通过实际代码演示和案例分析，帮助大家更好地理解和应用这些新特性。',
  'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20tech%20meetup%20react%20programming%20conference%20room&image_size=landscape_16_9',
  NOW() + INTERVAL '3 days',
  NOW() + INTERVAL '3 days' + INTERVAL '3 hours',
  '北京市朝阳区科技园A座会议室',
  50,
  '550e8400-e29b-41d4-a716-446655440000',
  '技术分享',
  'upcoming'
),
-- 2. 进行中的活动
(
  '22222222-2222-2222-2222-222222222222',
  '周末徒步香山红叶',
  '秋高气爽，正是登山赏叶的好时节！我们将一起徒步香山，欣赏满山红叶，呼吸新鲜空气。路线适合初级徒步爱好者，全程约4小时。请穿着舒适的运动鞋，带好水和简单食物。',
  'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=autumn%20mountain%20hiking%20red%20leaves%20group%20outdoor%20activity&image_size=landscape_16_9',
  NOW() - INTERVAL '2 hours',
  NOW() + INTERVAL '4 hours',
  '北京香山公园',
  30,
  '550e8400-e29b-41d4-a716-446655440000',
  '户外运动',
  'ongoing'
),
-- 3. 已结束的活动
(
  '33333333-3333-3333-3333-333333333333',
  '咖啡文化交流沙龙',
  '与咖啡爱好者一起探讨咖啡文化，品尝来自世界各地的精品咖啡豆。专业咖啡师将现场演示手冲咖啡技巧，分享咖啡知识。活动包含咖啡品鉴、制作体验和文化分享三个环节。',
  'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20coffee%20shop%20cultural%20salon%20people%20tasting%20coffee&image_size=landscape_16_9',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days' + INTERVAL '3 hours',
  '三里屯精品咖啡馆',
  25,
  '550e8400-e29b-41d4-a716-446655440000',
  '社交聚会',
  'completed'
),
-- 4. 另一个即将开始的活动
(
  '44444444-4444-4444-4444-444444444444',
  '传统书法艺术工作坊',
  '跟随书法大师学习传统书法艺术，从基础笔画到字体结构，体验中华文化的深厚底蕴。工作坊提供笔墨纸砚，适合零基础学员。通过练习经典诗词，感受书法之美，陶冶情操。',
  'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20calligraphy%20workshop%20brush%20ink%20paper&image_size=landscape_16_9',
  NOW() + INTERVAL '1 week',
  NOW() + INTERVAL '1 week' + INTERVAL '2 hours',
  '文化艺术中心书法教室',
  20,
  '550e8400-e29b-41d4-a716-446655440000',
  '文化艺术',
  'upcoming'
);

-- 插入活动参与者
INSERT INTO activity_participants (activity_id, user_id, status) VALUES
('11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440000', 'confirmed'),
('22222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440000', 'confirmed'),
('33333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440000', 'confirmed'),
('44444444-4444-4444-4444-444444444444', '550e8400-e29b-41d4-a716-446655440000', 'confirmed');

-- 更新活动的参与者数量
UPDATE activities SET current_participants = (
  SELECT COUNT(*) FROM activity_participants 
  WHERE activity_id = activities.id AND status = 'confirmed'
) WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444');

-- 创建4个热门帖子
INSERT INTO posts (id, title, content, tags, user_id, likes_count, comments_count, shares_count, views_count, is_published, category, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', '如何提高编程效率', '分享一些实用的编程技巧和工具，帮助大家提高开发效率。包括代码编辑器配置、快捷键使用、调试技巧等。', ARRAY['编程', '效率', '技巧'], '550e8400-e29b-41d4-a716-446655440000', 156, 23, 12, 890, true, '技术分享', 'published'),
('550e8400-e29b-41d4-a716-446655440002', '城市摄影技巧分享', '在城市中拍摄的一些心得体会，包括光线运用、构图技巧、后期处理等方面的经验分享。', ARRAY['摄影', '城市', '技巧'], '550e8400-e29b-41d4-a716-446655440000', 234, 45, 18, 1250, true, '摄影分享', 'published'),
('550e8400-e29b-41d4-a716-446655440003', '健康生活方式指南', '分享一些保持健康生活的小贴士，包括饮食搭配、运动计划、作息调整等实用建议。', ARRAY['健康', '生活', '运动'], '550e8400-e29b-41d4-a716-446655440000', 189, 67, 25, 1456, true, '生活分享', 'published'),
('550e8400-e29b-41d4-a716-446655440004', '旅行攻略：探索未知的美景', '最近的一次旅行经历分享，包括路线规划、景点推荐、美食发现等，希望能给大家的旅行提供参考。', ARRAY['旅行', '攻略', '美景'], '550e8400-e29b-41d4-a716-446655440000', 312, 89, 34, 2103, true, '旅行分享', 'published');

-- 为帖子添加一些点赞记录
INSERT INTO likes (user_id, post_id) VALUES
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004');

-- 更新用户的帖子数量
UPDATE user_profiles SET posts_count = 4 WHERE id = '550e8400-e29b-41d4-a716-446655440000';