-- 修复posts表中的状态冲突问题
-- 将所有is_published=true但status=pending的帖子状态改为published
-- 将所有is_published=false的帖子状态改为draft

UPDATE posts 
SET status = 'published' 
WHERE is_published = true AND status = 'pending';

UPDATE posts 
SET status = 'draft' 
WHERE is_published = false AND status != 'rejected';

-- 为了测试审核功能，创建一个待审核的帖子
INSERT INTO posts (
  title, 
  content, 
  user_id, 
  status, 
  is_published,
  category
) 
SELECT 
  '测试待审核帖子', 
  '这是一个用于测试管理后台审核功能的帖子内容。', 
  id, 
  'pending', 
  false,
  'general'
FROM user_profiles 
LIMIT 1;