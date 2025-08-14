-- 添加示例活动和帖子数据
-- 注意：由于user_id字段有NOT NULL约束且外键指向auth.users表，
-- 我们需要先创建一个临时的系统用户或使用现有用户
-- 在实际应用中，这些数据应该关联到真实用户

DO $$
DECLARE
    system_user_id UUID;
BEGIN
    -- 尝试获取第一个现有用户的ID，如果没有则创建一个临时用户记录
    SELECT id INTO system_user_id FROM auth.users LIMIT 1;
    
    -- 如果没有现有用户，我们跳过数据插入并给出提示
    IF system_user_id IS NULL THEN
        RAISE NOTICE '没有找到现有用户，跳过示例数据插入。请在有用户注册后重新运行此迁移。';
        RETURN;
    END IF;
    
    RAISE NOTICE '使用用户ID: % 作为示例数据的创建者', system_user_id;
    
    -- 插入示例活动数据
    INSERT INTO activities (
        id, title, description, image_url, start_date, end_date, 
        location, max_participants, current_participants, user_id, 
        category, status, created_at, updated_at
    ) VALUES
    -- 即将到来的活动
    (
        '11111111-1111-1111-1111-111111111111',
        '设计师聚会 - 创意分享',
        '欢迎所有设计师参加我们的月度聚会，分享最新的设计趋势和创意灵感。我们将讨论UI/UX设计、品牌设计等话题。',
        'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=creative_design_meetup_modern_workspace_colorful_sketches&image_size=landscape_4_3',
        NOW() + INTERVAL '3 days',
        NOW() + INTERVAL '3 days' + INTERVAL '3 hours',
        '上海市黄浦区创意园区A座',
        30,
        12,
        system_user_id,
        'design',
        'active',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'Tech Talk: AI in Web Development',
        'Join us for an exciting discussion about how AI is transforming web development. We will cover the latest tools, frameworks, and best practices.',
        'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=tech_conference_AI_programming_modern_auditorium&image_size=landscape_4_3',
        NOW() + INTERVAL '1 week',
        NOW() + INTERVAL '1 week' + INTERVAL '2 hours',
        'Shanghai Tech Hub, Floor 15',
        50,
        23,
        system_user_id,
        'technology',
        'active',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'Buổi gặp mặt cộng đồng startup',
        'Tham gia cùng chúng tôi trong buổi gặp mặt dành cho các startup và doanh nhân. Chia sẻ kinh nghiệm, kết nối và học hỏi từ nhau.',
        'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=startup_networking_event_modern_coworking_space&image_size=landscape_4_3',
        NOW() + INTERVAL '5 days',
        NOW() + INTERVAL '5 days' + INTERVAL '4 hours',
        'Quận 1, TP. Hồ Chí Minh',
        40,
        18,
        system_user_id,
        'business',
        'active',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days'
    ),
    -- 正在进行的活动
    (
        '44444444-4444-4444-4444-444444444444',
        '马拉松训练营',
        '为期一个月的马拉松训练营，适合所有水平的跑者。专业教练指导，科学训练计划。',
        'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=marathon_training_runners_park_sunrise&image_size=landscape_4_3',
        NOW() - INTERVAL '1 week',
        NOW() + INTERVAL '3 weeks',
        '世纪公园',
        100,
        67,
        system_user_id,
        'sports',
        'active',
        NOW() - INTERVAL '2 weeks',
        NOW() - INTERVAL '1 week'
    ),
    -- 已结束的活动
    (
        '55555555-5555-5555-5555-555555555555',
        'Photography Workshop',
        'Learn the fundamentals of digital photography, including composition, lighting, and post-processing techniques.',
        'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=photography_workshop_camera_studio_lighting&image_size=landscape_4_3',
        NOW() - INTERVAL '2 weeks',
        NOW() - INTERVAL '2 weeks' + INTERVAL '6 hours',
        'Creative Studio, Jingan District',
        25,
        25,
        system_user_id,
        'art',
        'completed',
        NOW() - INTERVAL '3 weeks',
        NOW() - INTERVAL '2 weeks'
    ),
    (
        '66666666-6666-6666-6666-666666666666',
        'Khóa học nấu ăn Việt Nam',
        'Học cách nấu các món ăn truyền thống Việt Nam như phở, bánh mì, và gỏi cuốn. Được hướng dẫn bởi đầu bếp chuyên nghiệp.',
        'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=vietnamese_cooking_class_traditional_kitchen_pho&image_size=landscape_4_3',
        NOW() - INTERVAL '1 month',
        NOW() - INTERVAL '1 month' + INTERVAL '4 hours',
        'Trung tâm ẩm thực, Quận 3',
        20,
        18,
        system_user_id,
        'food',
        'completed',
        NOW() - INTERVAL '5 weeks',
        NOW() - INTERVAL '1 month'
    );

    -- 插入示例帖子数据
    INSERT INTO posts (
        id, title, content, image_url, user_id, likes_count, 
        shares_count, comments_count, created_at, updated_at
    ) VALUES
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '上海秋日美景',
        '今天的上海秋天真的太美了！黄浦江边的梧桐叶正黄，配上现代化的天际线，这种新旧交融的美感让人陶醉。#上海秋天 #城市美景',
        'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=shanghai_autumn_huangpu_river_golden_leaves_skyline&image_size=square_hd',
        system_user_id,
        24,
        8,
        12,
        NOW() - INTERVAL '2 hours',
        NOW() - INTERVAL '1 hour'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Amazing Coffee Discovery',
        'Just discovered this amazing coffee shop in Xintiandi! The latte art is incredible and the atmosphere is perfect for remote work. Highly recommend for fellow digital nomads! ☕️ #ShanghaiCoffee #RemoteWork',
        'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cozy_coffee_shop_latte_art_laptop_modern_interior&image_size=square_hd',
        system_user_id,
        31,
        15,
        8,
        NOW() - INTERVAL '5 hours',
        NOW() - INTERVAL '4 hours'
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'Bánh Mì Fusion Tuyệt Vời',
        'Hôm nay mình đã thử món bánh mì fusion tại một quán nhỏ ở phố cổ. Sự kết hợp giữa hương vị truyền thống Việt Nam và phong cách hiện đại thật tuyệt vời! 🥖✨ #BánhMì #ẨmThựcViệt',
        'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=vietnamese_banh_mi_fusion_street_food_colorful&image_size=square_hd',
        system_user_id,
        18,
        6,
        5,
        NOW() - INTERVAL '8 hours',
        NOW() - INTERVAL '7 hours'
    ),
    (
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        '极简主义设计灵感',
        '分享一个设计灵感：极简主义在移动应用设计中的应用。少即是多，通过减少不必要的元素，让用户专注于核心功能。这张图展示了我最新的UI设计概念。#设计灵感 #UI设计 #极简主义',
        'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist_mobile_app_UI_design_clean_interface&image_size=portrait_4_3',
        system_user_id,
        42,
        19,
        16,
        NOW() - INTERVAL '12 hours',
        NOW() - INTERVAL '10 hours'
    ),
    (
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        'AI and Creativity Collaboration',
        'Excited to share my thoughts on the future of AI in creative industries. While AI tools are becoming more sophisticated, human creativity and emotional intelligence remain irreplaceable. The key is collaboration, not competition. 🤖🎨 #AI #Creativity #FutureTech',
        'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=AI_creativity_collaboration_human_robot_artistic&image_size=landscape_4_3',
        system_user_id,
        56,
        23,
        21,
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '20 hours'
    ),
    (
        'ffffffff-ffff-ffff-ffff-ffffffffffff',
        'Sustainable Living Workshop',
        'Cuối tuần vừa rồi mình đã tham gia một workshop về sustainable living. Thật bất ngờ khi biết được những cách đơn giản để giảm thiểu tác động đến môi trường. Hãy cùng nhau bảo vệ hành tinh xanh! 🌱 #SustainableLiving #MôiTrường',
        'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=sustainable_living_workshop_eco_friendly_green_lifestyle&image_size=square',
        system_user_id,
        29,
        11,
        9,
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '1 day'
    ),
    (
        'gggggggg-gggg-gggg-gggg-gggggggggggg',
        '陆家嘴绝美日落',
        '今天在陆家嘴拍到了绝美的日落！金融中心的摩天大楼在夕阳下闪闪发光，这就是我爱上海的原因之一。每一天都有新的惊喜等着我们去发现。📸 #上海日落 #陆家嘴 #城市摄影',
        'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=lujiazui_shanghai_sunset_skyscrapers_golden_hour&image_size=landscape_16_9',
        system_user_id,
        67,
        28,
        19,
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '2 days'
    ),
    (
        'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
        'React Hooks Learning Tips',
        'Learning React hooks has been a game-changer for my development workflow. The useState and useEffect hooks make state management so much cleaner. Here is a quick tip: always remember to include dependencies in your useEffect array! 💻 #React #WebDev #JavaScript',
        'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=react_hooks_code_programming_modern_development&image_size=landscape_4_3',
        system_user_id,
        38,
        14,
        11,
        NOW() - INTERVAL '4 days',
        NOW() - INTERVAL '3 days'
    );

    RAISE NOTICE '示例数据插入完成：6个活动和8个帖子';
END $$;

-- 验证数据插入
SELECT 'Activities count:' as info, COUNT(*) as count FROM activities
UNION ALL
SELECT 'Posts count:' as info, COUNT(*) as count FROM posts;