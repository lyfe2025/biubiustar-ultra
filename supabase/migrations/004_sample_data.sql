-- 004_sample_data.sql
-- 添加基础模拟数据用于测试和演示

-- 注意：由于auth.users表由Supabase Auth管理，我们不能直接插入用户数据
-- 这个迁移文件将添加一些不依赖用户ID的示例数据
-- 用户相关的数据需要在实际用户注册后通过应用程序创建

-- 创建联系表单表（如果不存在）
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入联系表单示例数据（这些数据不依赖用户表）
INSERT INTO contact_submissions (id, name, email, subject, message, status, submitted_at) VALUES
('990e8400-e29b-41d4-a716-446655440001', '张三', 'zhangsan@email.com', '合作咨询', '您好，我们公司希望与贵平台建立合作关系，请问可以安排时间详谈吗？', 'pending', NOW() - INTERVAL '2 days'),
('990e8400-e29b-41d4-a716-446655440002', 'Emily Johnson', 'emily.j@company.com', 'Partnership Inquiry', 'Hi, I represent a tech startup and we are interested in exploring partnership opportunities. Could we schedule a call?', 'read', NOW() - INTERVAL '1 week'),
('990e8400-e29b-41d4-a716-446655440003', 'Trần Văn Nam', 'tranvannam@gmail.com', 'Hỗ trợ kỹ thuật', 'Chào anh/chị, tôi gặp một số vấn đề khi sử dụng ứng dụng. Có thể hỗ trợ tôi được không?', 'replied', NOW() - INTERVAL '3 days'),
('990e8400-e29b-41d4-a716-446655440004', '李小明', 'lixiaoming@outlook.com', '功能建议', '希望能增加夜间模式功能，这样使用起来会更舒适。谢谢！', 'pending', NOW() - INTERVAL '1 day'),
('990e8400-e29b-41d4-a716-446655440005', 'Michael Brown', 'michael.brown@email.com', 'Bug Report', 'I found a bug in the mobile app where the images are not loading properly on iOS devices.', 'read', NOW() - INTERVAL '5 days'),
('990e8400-e29b-41d4-a716-446655440006', 'Nguyễn Thị Hoa', 'nguyenthihoa@yahoo.com', 'Góp ý cải thiện', 'Ứng dụng rất tốt nhưng tôi nghĩ nên có thêm tính năng dịch tự động cho các bài viết.', 'pending', NOW() - INTERVAL '6 hours');

-- 注释：以下是用户注册后可以通过应用程序创建的数据模板

/*
用户注册后，应用程序可以创建以下类型的模拟数据：

1. 示例帖子数据：
   - 中文帖子：关于上海秋天、设计灵感分享等
   - 英文帖子：AI技术讨论、咖啡店推荐等
   - 越南语帖子：美食分享、旅游体验等

2. 活动数据：
   - 即将到来：设计师聚会、技术讲座、创业研讨会
   - 正在进行：马拉松训练营
   - 已结束：内容创作工作坊、摄影外拍活动

3. 社交互动数据：
   - 评论：多语言评论和回复
   - 点赞：对帖子和评论的点赞
   - 关注：用户之间的关注关系
   - 活动参与：用户参加各种活动

这些数据将在用户注册并使用应用程序时自动生成，
确保所有外键关系都指向真实存在的用户ID。
*/

-- 创建一个函数来生成示例数据（需要在用户存在时调用）
CREATE OR REPLACE FUNCTION create_sample_data_for_user(user_id UUID)
RETURNS void AS $$
BEGIN
  -- 这个函数可以在用户注册后调用，创建该用户的示例数据
  -- 包括示例帖子、活动等
  -- 具体实现可以在应用程序中完成
  RAISE NOTICE '示例数据创建函数已准备就绪，用户ID: %', user_id;
END;
$$ LANGUAGE plpgsql;

-- 添加一些基础配置数据（如果需要的话）
-- 这些数据不依赖用户，可以安全地插入

-- 示例：应用程序配置数据
-- CREATE TABLE IF NOT EXISTS app_settings (
--   key VARCHAR(255) PRIMARY KEY,
--   value TEXT,
--   description TEXT,
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- INSERT INTO app_settings (key, value, description) VALUES
-- ('max_post_length', '2000', '帖子最大字符数'),
-- ('max_activity_participants', '100', '活动最大参与人数'),
-- ('supported_languages', 'zh,en,vi', '支持的语言列表')
-- ON CONFLICT (key) DO NOTHING;

-- 完成模拟数据设置
SELECT 'Sample data migration completed. Contact submissions added.' as result;