-- 性能优化索引迁移
-- 根据预缓存性能优化清单添加必要的数据库索引

-- 为posts表添加性能优化索引
-- 注意：posts表使用tags数组而不是category字段，所以为tags添加GIN索引
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_posts_is_published ON posts(is_published);
CREATE INDEX IF NOT EXISTS idx_posts_published_created_at ON posts(is_published, created_at DESC) WHERE is_published = true;

-- 为posts表添加全文搜索索引
-- 创建全文搜索索引用于title和content字段
CREATE INDEX IF NOT EXISTS idx_posts_title_search ON posts USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_posts_content_search ON posts USING GIN(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_posts_full_text_search ON posts USING GIN(to_tsvector('english', title || ' ' || content));

-- 为activities表添加性能优化索引
CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_status_start_date ON activities(status, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_category_status ON activities(category, status);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);

-- 为user_profiles表添加性能优化索引
-- username字段已经有UNIQUE约束，会自动创建索引，但为了确保性能再添加一个
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at DESC);

-- 为activity_participants表添加复合索引
-- 注意：已经有UNIQUE(activity_id, user_id)约束，会自动创建索引
-- 但为了查询性能，添加额外的索引
CREATE INDEX IF NOT EXISTS idx_activity_participants_user_id ON activity_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_participants_status ON activity_participants(status);
CREATE INDEX IF NOT EXISTS idx_activity_participants_joined_at ON activity_participants(joined_at DESC);

-- 为comments表添加额外的性能索引
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id) WHERE parent_id IS NOT NULL;

-- 为likes表添加复合索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_likes_post_user ON likes(post_id, user_id) WHERE post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_likes_comment_user ON likes(comment_id, user_id) WHERE comment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON likes(created_at DESC);

-- 为follows表添加性能索引
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at DESC);

-- 添加部分索引以优化特定查询场景
-- 只为已发布的帖子创建索引，减少索引大小
CREATE INDEX IF NOT EXISTS idx_posts_published_likes ON posts(likes_count DESC) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_posts_published_comments ON posts(comments_count DESC) WHERE is_published = true;

-- 为活跃状态的活动创建索引
CREATE INDEX IF NOT EXISTS idx_activities_upcoming_start_date ON activities(start_date ASC) WHERE status = 'upcoming';
CREATE INDEX IF NOT EXISTS idx_activities_ongoing_end_date ON activities(end_date ASC) WHERE status = 'ongoing';

-- 添加注释说明索引用途
COMMENT ON INDEX idx_posts_tags IS '帖子标签GIN索引，用于标签搜索';
COMMENT ON INDEX idx_posts_full_text_search IS '帖子全文搜索索引，用于标题和内容搜索';
COMMENT ON INDEX idx_activities_status_start_date IS '活动状态和开始时间复合索引，用于活动列表查询';
COMMENT ON INDEX idx_activity_participants_user_id IS '活动参与者用户ID索引，用于查询用户参与的活动';
COMMENT ON INDEX idx_posts_published_created_at IS '已发布帖子按创建时间排序的复合索引';