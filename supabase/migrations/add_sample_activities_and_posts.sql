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
  '10000000-0000-0000-0000-000000000001',
  'React 18 新特性分享会',
  '深入探讨 React 18 的并发特性、Suspense 改进和新的 Hooks。适合有一定 React 基础的开发者参加，我们将通过实际代码演示和案例分析，帮助大家更好地理解和应用这些新特性。',
  'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20tech%20meetup%20react%20programming%20conference%20room&image_size=landscape_16_9',
  NOW() + INTERVAL '3 days',
  NOW() + INTERVAL '3 days' + INTERVAL '3 hours',
  '北京市朝阳区科技园A座会议室',
  50,
  '00000000-0000-0000-0000-000000000001',
  '技术分享',
  'upcoming'
),
-- 2. 进行中的活动
(
  '10000000-0000-0000-0000-000000000002',
  '周末徒步香山红叶',
  '秋高气爽，正是登山赏叶的好时节！我们将一起徒步香山，欣赏满山红叶，呼吸新鲜空气。路线适合初级徒步爱好者，全程约4小时。请穿着舒适的运动鞋，带好水和简单食物。',
  'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=autumn%20mountain%20hiking%20red%20leaves%20group%20outdoor%20activity&image_size=landscape_16_9',
  NOW() - INTERVAL '2 hours',
  NOW() + INTERVAL '4 hours',
  '北京香山公园',
  30,
  '00000000-0000-0000-0000-000000000001',
  '户外运动',
  'ongoing'
),
-- 3. 已结束的活动
(
  '10000000-0000-0000-0000-000000000003',
  '咖啡文化交流沙龙',
  '与咖啡爱好者一起探讨咖啡文化，品尝来自世界各地的精品咖啡豆。专业咖啡师将现场演示手冲咖啡技巧，分享咖啡知识。活动包含咖啡品鉴、制作体验和文化分享三个环节。',
  'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20coffee%20shop%20cultural%20salon%20people%20tasting%20coffee&image_size=landscape_16_9',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days' + INTERVAL '3 hours',
  '三里屯精品咖啡馆',
  25,
  '00000000-0000-0000-0000-000000000001',
  '社交聚会',
  'completed'
),
-- 4. 另一个即将开始的活动
(
  '10000000-0000-0000-0000-000000000004',
  '传统书法艺术工作坊',
  '跟随书法大师学习传统书法艺术，从基础笔画到字体结构，体验中华文化的深厚底蕴。工作坊提供笔墨纸砚，适合零基础学员。通过练习经典诗词，感受书法之美，陶冶情操。',
  'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20calligraphy%20workshop%20brush%20ink%20paper&image_size=landscape_16_9',
  NOW() + INTERVAL '1 week',
  NOW() + INTERVAL '1 week' + INTERVAL '2 hours',
  '文化艺术中心书法教室',
  20,
  '00000000-0000-0000-0000-000000000001',
  '文化艺术',
  'upcoming'
);

-- 为活动添加一些参与者
INSERT INTO activity_participants (activity_id, user_id, status) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'joined'),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'joined'),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'joined'),
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'joined');

-- 更新活动的参与者数量
UPDATE activities SET current_participants = 1 WHERE id IN (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000004'
);

-- 插入4个热门帖子
INSERT INTO posts (id, title, content, tags, user_id, likes_count, comments_count, shares_count, is_published) VALUES
('550e8400-e29b-41d4-a716-446655440001', '探索人工智能的未来发展趋势', '人工智能正在快速发展，从机器学习到深度学习，再到大语言模型，AI技术正在改变我们的生活方式。本文将深入探讨AI在各个领域的应用前景，包括医疗、教育、金融等行业的变革。我们也会讨论AI发展过程中面临的挑战和机遇，以及如何确保AI技术的安全和可持续发展。', ARRAY['人工智能', '科技', '未来'], '550e8400-e29b-41d4-a716-446655440000', 156, 23, 8, true),
('550e8400-e29b-41d4-a716-446655440002', '健康生活方式的重要性', '在快节奏的现代生活中，保持健康的生活方式变得越来越重要。本文将分享一些实用的健康生活建议，包括合理的饮食搭配、规律的运动习惯、充足的睡眠时间，以及如何管理工作和生活的压力。通过这些简单而有效的方法，我们可以提高生活质量，增强身体免疫力，享受更加充实和快乐的人生。', ARRAY['健康', '生活方式', '养生'], '550e8400-e29b-41d4-a716-446655440000', 89, 15, 5, true),
('550e8400-e29b-41d4-a716-446655440003', '旅行中的美食发现之旅', '旅行不仅是欣赏风景，更是品尝当地美食的绝佳机会。从街头小吃到米其林餐厅，每一道菜都承载着当地的文化和历史。本文将带你走进世界各地的美食天堂，分享那些令人难忘的味觉体验。我们会介绍如何在旅行中寻找地道美食，以及如何通过美食了解当地文化的深层内涵。', ARRAY['旅行', '美食', '文化'], '550e8400-e29b-41d4-a716-446655440000', 134, 28, 12, true),
('550e8400-e29b-41d4-a716-446655440004', '数字化时代的教育变革', '随着数字技术的快速发展，教育行业正在经历前所未有的变革。在线学习、虚拟现实教学、个性化学习平台等新技术正在重塑传统的教育模式。本文将探讨数字化教育的优势和挑战，分析如何利用技术提高教学效果，以及未来教育发展的趋势和方向。', ARRAY['教育', '数字化', '在线学习'], '550e8400-e29b-41d4-a716-446655440000', 78, 19, 6, true);

-- 为帖子添加一些点赞记录
INSERT INTO likes (user_id, post_id) VALUES
('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003'),
('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004');

-- 更新用户的帖子数量
UPDATE user_profiles SET posts_count = 4 WHERE id = '00000000-0000-0000-0000-000000000001';