-- 测试触发器功能
-- 首先查看一个用户当前的posts_count
SELECT id, username, posts_count 
FROM user_profiles 
WHERE username = 'admin' 
LIMIT 1;

-- 为该用户创建一个published状态的测试帖子
INSERT INTO posts (user_id, title, content, status) 
SELECT 
    up.id,
    'Test Post for Trigger',
    'This is a test post to verify the trigger functionality',
    'published'
FROM user_profiles up 
WHERE up.username = 'admin' 
LIMIT 1;

-- 再次查看该用户的posts_count，应该增加1
SELECT id, username, posts_count 
FROM user_profiles 
WHERE username = 'admin' 
LIMIT 1;

-- 删除测试帖子
DELETE FROM posts 
WHERE title = 'Test Post for Trigger';

-- 最后查看该用户的posts_count，应该恢复原值
SELECT id, username, posts_count 
FROM user_profiles 
WHERE username = 'admin' 
LIMIT 1;