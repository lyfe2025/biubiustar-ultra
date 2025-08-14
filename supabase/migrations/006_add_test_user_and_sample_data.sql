-- 006_add_test_user_and_sample_data.sql
-- 创建测试用户和示例数据

-- 首先插入一个测试用户到auth.users表
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    aud,
    role
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'test@example.com',
    '$2a$10$dummy.encrypted.password.hash.for.testing.purposes.only',
    NOW(),
    NOW(),
    NOW(),
    '{"name": "Test User", "avatar_url": "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=friendly_user_avatar&image_size=square"}',
    'authenticated',
    'authenticated'
);

-- 插入示例活动数据
INSERT INTO activities (
    id,
    user_id,
    title,
    description,
    location,
    start_date,
    end_date,
    max_participants,
    current_participants,
    category,
    status,
    image_url,
    created_at,
    updated_at
) VALUES 
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'Weekend Hiking Adventure',
    'Join us for a refreshing weekend hike through the beautiful mountain trails. Perfect for beginners and experienced hikers alike.',
    'Mountain Trail Park',
    NOW() + INTERVAL '3 days',
    NOW() + INTERVAL '3 days' + INTERVAL '6 hours',
    20,
    5,
    'outdoor',
    'active',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=mountain_hiking_trail_scenic_view&image_size=landscape_16_9',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'Cooking Workshop: Italian Cuisine',
    'Learn to cook authentic Italian dishes with our professional chef. All ingredients and equipment provided.',
    'Community Kitchen Center',
    NOW() + INTERVAL '5 days',
    NOW() + INTERVAL '5 days' + INTERVAL '3 hours',
    15,
    8,
    'cooking',
    'active',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=italian_cooking_kitchen_pasta_making&image_size=landscape_4_3',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'Photography Meetup',
    'Capture the beauty of urban landscapes with fellow photography enthusiasts. Bring your camera and creativity!',
    'Downtown Arts District',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '7 days' + INTERVAL '4 hours',
    12,
    3,
    'photography',
    'active',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=urban_photography_camera_cityscape&image_size=portrait_4_3',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'Book Club Discussion',
    'Monthly book club meeting to discuss our latest read. New members welcome! Coffee and snacks provided.',
    'Central Library Meeting Room',
    NOW() + INTERVAL '10 days',
    NOW() + INTERVAL '10 days' + INTERVAL '2 hours',
    25,
    12,
    'education',
    'active',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cozy_library_books_reading_discussion&image_size=square_hd',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'Yoga in the Park',
    'Start your weekend with a peaceful yoga session in the park. Suitable for all levels. Bring your own mat.',
    'Riverside Park',
    NOW() + INTERVAL '2 days',
    NOW() + INTERVAL '2 days' + INTERVAL '1 hour 30 minutes',
    30,
    18,
    'fitness',
    'active',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=outdoor_yoga_park_peaceful_meditation&image_size=landscape_16_9',
    NOW(),
    NOW()
);

-- 插入示例帖子数据
INSERT INTO posts (
    id,
    user_id,
    title,
    content,
    image_url,
    likes_count,
    comments_count,
    shares_count,
    created_at,
    updated_at
) VALUES 
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'Amazing Hiking Adventure',
    'Just finished an amazing hiking trip! The views were absolutely breathtaking. Nature has a way of refreshing the soul. 🏔️ #hiking #nature #adventure',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=mountain_summit_view_hiking_achievement&image_size=square',
    24,
    5,
    3,
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
),
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'Urban Photography Project',
    'Excited to share my latest photography project! Captured some stunning urban landscapes during golden hour. The city looks magical at this time. 📸✨',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=golden_hour_cityscape_urban_photography&image_size=landscape_16_9',
    18,
    7,
    2,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
),
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'Authentic Pasta Making Class',
    'Cooking class was incredible today! Learned to make authentic pasta from scratch. The chef shared some amazing family recipes. Can not wait to try them at home! 🍝👨‍🍳',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=homemade_pasta_cooking_italian_cuisine&image_size=square_hd',
    31,
    9,
    5,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
),
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'Thought-Provoking Book Club',
    'Book club discussion was thought-provoking as always. We dove deep into the themes of resilience and hope. Great conversations with wonderful people! 📚💭',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=book_club_discussion_library_reading&image_size=portrait_4_3',
    15,
    12,
    1,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
),
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'Peaceful Morning Yoga',
    'Morning yoga session in the park was exactly what I needed. Starting the day with mindfulness and movement sets such a positive tone. Namaste! 🧘‍♀️🌅',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=sunrise_yoga_park_peaceful_meditation&image_size=landscape_4_3',
    22,
    4,
    2,
    NOW() - INTERVAL '1 week',
    NOW() - INTERVAL '1 week'
);

-- 插入用户资料数据
INSERT INTO user_profiles (
    id,
    username,
    full_name,
    bio,
    avatar_url,
    location,
    website,
    created_at,
    updated_at
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'testuser',
    'Test User',
    'Adventure seeker, photography enthusiast, and lifelong learner. Love connecting with like-minded people through shared experiences.',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=friendly_user_avatar_profile_picture&image_size=square',
    'San Francisco, CA',
    'https://example.com',
    NOW(),
    NOW()
);