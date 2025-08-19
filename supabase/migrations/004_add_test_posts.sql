-- 添加测试帖子数据，用于测试热门排序功能

-- 插入测试帖子（需要先确保有用户数据）
INSERT INTO posts (
  id,
  title,
  content,
  category,
  tags,
  user_id,
  likes_count,
  comments_count,
  views_count,
  status,
  created_at,
  updated_at
) VALUES 
  -- 高热度帖子
  (
    gen_random_uuid(),
    '🔥 最新科技趋势分享',
    '分享一些最新的科技趋势和发展方向，包括AI、区块链、元宇宙等热门话题。这些技术正在改变我们的生活方式...',
    'technology',
    ARRAY['科技', 'AI', '趋势'],
    (SELECT id FROM auth.users LIMIT 1),
    150,
    45,
    1200,
    'published',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  -- 中等热度帖子
  (
    gen_random_uuid(),
    '📚 学习编程的心得体会',
    '作为一个程序员，我想分享一些学习编程的心得和体会。从零基础到现在，这个过程充满了挑战和收获...',
    'education',
    ARRAY['编程', '学习', '心得'],
    (SELECT id FROM auth.users LIMIT 1),
    80,
    25,
    600,
    'published',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),
  -- 低热度帖子
  (
    gen_random_uuid(),
    '🌟 今天的生活感悟',
    '今天是个美好的一天，想和大家分享一些生活中的小感悟。生活就像一杯茶，需要慢慢品味...',
    'lifestyle',
    ARRAY['生活', '感悟', '分享'],
    (SELECT id FROM auth.users LIMIT 1),
    20,
    8,
    150,
    'published',
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '3 hours'
  ),
  -- 超高热度帖子
  (
    gen_random_uuid(),
    '🚀 重大突破！新技术发布',
    '今天要宣布一个重大突破！我们团队经过几个月的努力，终于完成了这个项目。这将会改变整个行业...',
    'technology',
    ARRAY['突破', '技术', '发布'],
    (SELECT id FROM auth.users LIMIT 1),
    300,
    120,
    2500,
    'published',
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '6 hours'
  ),
  -- 新发布但无互动的帖子