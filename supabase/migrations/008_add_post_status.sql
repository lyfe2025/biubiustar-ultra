-- 添加posts表的status字段，支持内容审核状态管理
-- 状态说明：pending(待审核)、published(已发布)、rejected(已拒绝)、draft(草稿)

-- 添加status字段
ALTER TABLE posts 
ADD COLUMN status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected', 'draft'));

-- 为现有数据设置status值
-- 将is_published=true的设为published，false的设为pending
UPDATE posts 
SET status = CASE 
    WHEN is_published = true THEN 'published'
    ELSE 'pending'
END;

-- 添加索引以提高查询性能
CREATE INDEX idx_posts_status ON posts(status);

-- 添加复合索引用于前台查询
CREATE INDEX idx_posts_status_created_at ON posts(status, created_at DESC);

-- 更新RLS策略，确保前台只能看到published状态的内容
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
CREATE POLICY "Posts are viewable by everyone" ON posts
    FOR SELECT USING (status = 'published');

-- 允许用户查看自己的所有状态的帖子
DROP POLICY IF EXISTS "Users can view own posts" ON posts;
CREATE POLICY "Users can view own posts" ON posts
    FOR SELECT USING (auth.uid() = user_id);

-- 用户只能创建pending状态的帖子
DROP POLICY IF EXISTS "Users can insert own posts" ON posts;
CREATE POLICY "Users can insert own posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = user_id AND status IN ('pending', 'draft'));

-- 用户只能更新自己的帖子，但不能直接修改status为published
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Users can update own posts" ON posts
    FOR UPDATE USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id AND status IN ('pending', 'draft'));

-- 用户可以删除自己的帖子
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
CREATE POLICY "Users can delete own posts" ON posts
    FOR DELETE USING (auth.uid() = user_id);