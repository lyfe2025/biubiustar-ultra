-- 添加内容分类数据
INSERT INTO content_categories (name, description, color, icon, is_active) VALUES
('技术分享', '分享技术经验、教程和心得', '#3B82F6', 'code', true),
('生活随笔', '记录生活点滴、感悟和体验', '#10B981', 'heart', true),
('学习笔记', '学习过程中的笔记和总结', '#F59E0B', 'book', true),
('产品评测', '各类产品的使用体验和评价', '#EF4444', 'star', true),
('旅行游记', '旅行见闻和攻略分享', '#8B5CF6', 'map', true),
('美食分享', '美食制作和品尝体验', '#F97316', 'utensils', true)
ON CONFLICT (name) DO NOTHING;

-- 获取一个用户ID用于创建帖子（使用第一个用户）
DO $$
DECLARE
    sample_user_id uuid;
BEGIN
    -- 获取第一个用户ID
    SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
    
    -- 如果没有用户，创建一个示例用户
    IF sample_user_id IS NULL THEN
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'demo@example.com',
            '$2a$10$dummy.hash.for.demo.user.only',
            now(),
            now(),
            now()
        ) RETURNING id INTO sample_user_id;
        
        -- 为示例用户创建profile
        INSERT INTO user_profiles (id, username, display_name, bio)
        VALUES (
            sample_user_id,
            'demo_user',
            '演示用户',
            '这是一个演示账户，用于展示系统功能。'
        );
    END IF;
    
    -- 添加帖子数据
    INSERT INTO posts (title, content, category, status, tags, user_id, likes_count, comments_count, views_count, image_url) VALUES
    -- 已发布的帖子
    ('React 18 新特性详解', '本文将详细介绍 React 18 的新特性，包括并发渲染、自动批处理、Suspense 改进等内容。这些新特性将大大提升 React 应用的性能和用户体验。\n\n## 并发渲染\n\n并发渲染是 React 18 最重要的特性之一...', '技术分享', 'published', ARRAY['React', '前端', 'JavaScript'], sample_user_id, 15, 3, 128, 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=React%20logo%20with%20modern%20blue%20gradient%20background&image_size=landscape_4_3'),
    
    ('我的咖啡制作心得', '作为一个咖啡爱好者，我想分享一下这些年来学到的咖啡制作技巧。从选豆到冲泡，每一个环节都很重要。\n\n## 选择咖啡豆\n\n好的咖啡豆是制作美味咖啡的基础...', '生活随笔', 'published', ARRAY['咖啡', '生活', '分享'], sample_user_id, 8, 2, 95, 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=coffee%20beans%20and%20brewing%20equipment%20on%20wooden%20table&image_size=landscape_4_3'),
    
    ('TypeScript 学习笔记 - 高级类型', 'TypeScript 的高级类型系统非常强大，本文记录了我在学习过程中的一些心得体会。\n\n## 联合类型和交叉类型\n\n联合类型使用 | 符号...', '学习笔记', 'published', ARRAY['TypeScript', '学习', '编程'], sample_user_id, 12, 5, 156, 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=TypeScript%20code%20on%20computer%20screen%20with%20blue%20theme&image_size=landscape_4_3'),
    
    ('iPhone 15 Pro 使用体验', '使用 iPhone 15 Pro 一个月后的真实感受，从拍照到性能，全方位评测。\n\n## 外观设计\n\n钛金属材质确实带来了不同的手感...', '产品评测', 'published', ARRAY['iPhone', '评测', '数码'], sample_user_id, 20, 8, 234, 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%2015%20Pro%20on%20clean%20white%20background&image_size=square_hd'),
    
    ('京都三日游攻略', '刚从京都回来，分享一下这次旅行的详细攻略，希望对大家有帮助。\n\n## 第一天：清水寺周边\n\n建议早上8点就出发...', '旅行游记', 'published', ARRAY['京都', '旅行', '攻略'], sample_user_id, 25, 12, 312, 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Kyoto%20temple%20with%20cherry%20blossoms%20traditional%20architecture&image_size=landscape_4_3'),
    
    -- 待审核的帖子
    ('Vue 3 Composition API 最佳实践', '本文总结了 Vue 3 Composition API 的最佳实践，包括代码组织、性能优化等方面。', '技术分享', 'pending', ARRAY['Vue', '前端'], sample_user_id, 0, 0, 0, NULL),
    
    ('在家制作意大利面的小技巧', '分享一些在家制作正宗意大利面的小技巧，让你在家也能享受餐厅级别的美食。', '美食分享', 'pending', ARRAY['意大利面', '烹饪'], sample_user_id, 0, 0, 0, NULL),
    
    -- 草稿状态的帖子
    ('Node.js 性能优化指南', '这是一篇关于 Node.js 性能优化的文章，目前还在编写中...', '技术分享', 'draft', ARRAY['Node.js', '性能'], sample_user_id, 0, 0, 0, NULL),
    
    ('我的读书笔记：《代码整洁之道》', '最近在读《代码整洁之道》这本书，记录一些重要的观点和心得...', '学习笔记', 'draft', ARRAY['读书', '编程'], sample_user_id, 0, 0, 0, NULL),
    
    -- 被拒绝的帖子
    ('这是一篇测试文章', '这只是一篇测试文章，内容不够充实。', '生活随笔', 'rejected', ARRAY['测试'], sample_user_id, 0, 0, 0, NULL);
    
END $$;

-- 检查权限并授予必要的访问权限
GRANT SELECT ON posts TO anon;
GRANT SELECT ON posts TO authenticated;
GRANT SELECT ON content_categories TO anon;
GRANT SELECT ON content_categories TO authenticated;
GRANT ALL PRIVILEGES ON posts TO authenticated;
GRANT ALL PRIVILEGES ON content_categories TO authenticated;