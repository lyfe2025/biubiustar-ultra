-- 添加包含视频的测试帖子数据
-- 用于测试管理后台的视频显示功能

-- 插入包含视频的测试帖子
INSERT INTO posts (
    id,
    user_id,
    title,
    content,
    video,
    image_url,
    thumbnail,
    category,
    status,
    tags,
    likes_count,
    comments_count,
    views_count,
    created_at,
    updated_at
) VALUES 
(
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    '🎥 React 开发技巧视频教程',
    '分享一个关于 React 开发技巧的视频教程，包含了一些实用的编程技巧和最佳实践。这个视频详细介绍了如何优化 React 组件性能，以及如何使用最新的 Hooks API。',
    'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=React%20development%20tutorial%20video%20thumbnail%20with%20code%20editor&image_size=landscape_16_9',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=React%20logo%20video%20thumbnail%20programming&image_size=landscape_16_9',
    '技术分享',
    'published',
    ARRAY['React', '视频教程', '前端开发', '编程'],
    45,
    12,
    320,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
),
(
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    '🎬 旅行Vlog：京都樱花季',
    '记录了我在京都樱花季的美好时光，从清水寺到哲学之道，每一处风景都让人流连忘返。这个视频包含了详细的旅行攻略和拍摄技巧分享。',
    'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Kyoto%20cherry%20blossoms%20travel%20vlog%20thumbnail&image_size=landscape_16_9',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cherry%20blossoms%20Kyoto%20temple%20video%20thumbnail&image_size=landscape_16_9',
    '旅行游记',
    'published',
    ARRAY['旅行', 'Vlog', '京都', '樱花', '视频'],
    78,
    25,
    560,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
),
(
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    '🍳 美食制作：意大利面完整教程',
    '从选材到制作，完整展示如何制作正宗的意大利面。这个视频包含了详细的步骤说明和专业厨师的小贴士，让你在家也能做出餐厅级别的美食。',
    'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Italian%20pasta%20cooking%20tutorial%20video%20thumbnail&image_size=landscape_16_9',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=pasta%20cooking%20kitchen%20video%20thumbnail&image_size=landscape_16_9',
    '美食分享',
    'published',
    ARRAY['美食', '烹饪', '意大利面', '教程', '视频'],
    32,
    8,
    245,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
),
(
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    '📱 iPhone 15 Pro 深度评测视频',
    '详细评测 iPhone 15 Pro 的各项功能，包括摄像头、性能、电池续航等方面。这个视频提供了全面的使用体验分享和购买建议。',
    'https://sample-videos.com/zip/10/mp4/SampleVideo_1920x1080_1mb.mp4',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%2015%20Pro%20review%20video%20thumbnail%20tech&image_size=landscape_16_9',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%20review%20tech%20video%20thumbnail&image_size=landscape_16_9',
    '产品评测',
    'published',
    ARRAY['iPhone', '评测', '数码', '视频', '科技'],
    89,
    34,
    720,
    NOW() - INTERVAL '5 hours',
    NOW() - INTERVAL '5 hours'
),
(
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    '🎨 数字艺术创作过程分享',
    '分享我的数字艺术创作过程，从草图到最终作品的完整流程。这个视频展示了各种数字绘画技巧和创意思路，适合艺术爱好者观看学习。',
    'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=digital%20art%20creation%20process%20video%20thumbnail&image_size=landscape_16_9',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=digital%20painting%20art%20video%20thumbnail&image_size=landscape_16_9',
    '生活随笔',
    'published',
    ARRAY['艺术', '数字绘画', '创作', '视频', '教程'],
    56,
    18,
    380,
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '6 hours'
);

-- 确保权限正确设置
GRANT SELECT ON posts TO anon;
GRANT SELECT ON posts TO authenticated;
GRANT ALL PRIVILEGES ON posts TO authenticated;