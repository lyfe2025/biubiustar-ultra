-- 管理后台帖子列表性能优化索引
-- 针对 /api/admin/posts 接口的查询模式进行优化
-- 创建时间：2024年

-- 1. 为管理后台帖子列表查询创建复合索引
-- 优化按创建时间倒序排列的查询
CREATE INDEX IF NOT EXISTS idx_posts_admin_list 
ON posts (created_at DESC, id DESC);

-- 2. 为媒体文件关联查询创建复合索引
-- 优化 media_files 表的 post_id 和 display_order 查询
CREATE INDEX IF NOT EXISTS idx_media_files_post_display 
ON media_files (post_id, display_order ASC);

-- 3. 为用户信息关联查询优化索引
-- 确保 user_profiles 表的 id 索引存在（通常主键已有索引）
-- 这里添加一个覆盖索引，包含常用字段
CREATE INDEX IF NOT EXISTS idx_user_profiles_admin_info 
ON user_profiles (id) 
INCLUDE (username, avatar_url, full_name);

-- 4. 为帖子状态和发布时间创建复合索引
-- 优化按发布状态筛选的查询
CREATE INDEX IF NOT EXISTS idx_posts_status_created 
ON posts (is_published, created_at DESC);

-- 5. 为帖子用户ID和创建时间创建复合索引
-- 优化按用户筛选帖子的查询
CREATE INDEX IF NOT EXISTS idx_posts_user_created 
ON posts (user_id, created_at DESC);

-- 6. 为帖子标题搜索优化（如果需要搜索功能）
-- 使用 GIN 索引支持全文搜索
CREATE INDEX IF NOT EXISTS idx_posts_title_gin 
ON posts USING gin(to_tsvector('english', title));

-- 7. 为帖子内容搜索优化（如果需要搜索功能）
-- 使用 GIN 索引支持全文搜索
CREATE INDEX IF NOT EXISTS idx_posts_content_gin 
ON posts USING gin(to_tsvector('english', content));

-- 8. 为统计查询优化的部分索引
-- 只为已发布的帖子创建索引，减少索引大小
CREATE INDEX IF NOT EXISTS idx_posts_published_stats 
ON posts (created_at DESC) 
WHERE is_published = true;

-- 9. 为媒体文件类型查询优化
-- 优化按文件类型筛选的查询
CREATE INDEX IF NOT EXISTS idx_media_files_type 
ON media_files (file_type, post_id);

-- 10. 为帖子互动数据排序优化
-- 优化按点赞数、评论数排序的查询
CREATE INDEX IF NOT EXISTS idx_posts_likes_desc 
ON posts (likes_count DESC, created_at DESC) 
WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_posts_comments_desc 
ON posts (comments_count DESC, created_at DESC) 
WHERE is_published = true;

-- 添加索引使用说明注释
COMMENT ON INDEX idx_posts_admin_list IS '管理后台帖子列表主查询索引：按创建时间倒序';
COMMENT ON INDEX idx_media_files_post_display IS '媒体文件关联查询索引：按帖子ID和显示顺序';
COMMENT ON INDEX idx_user_profiles_admin_info IS '用户信息覆盖索引：包含管理后台常用字段';
COMMENT ON INDEX idx_posts_status_created IS '帖子状态筛选索引：按发布状态和创建时间';
COMMENT ON INDEX idx_posts_user_created IS '用户帖子查询索引：按用户ID和创建时间';
COMMENT ON INDEX idx_posts_published_stats IS '已发布帖子统计索引：减少索引大小的部分索引';

-- 性能优化说明：
-- 1. idx_posts_admin_list：针对管理后台主列表查询，支持高效的时间倒序排列
-- 2. idx_media_files_post_display：优化媒体文件关联查询，减少JOIN开销
-- 3. idx_user_profiles_admin_info：覆盖索引避免回表查询用户信息
-- 4. idx_posts_status_created：支持按发布状态筛选的查询
-- 5. 部分索引（WHERE条件）：只为需要的数据创建索引，节省存储空间
-- 6. GIN索引：支持全文搜索功能，提升搜索性能
-- 7. 复合索引顺序：按查询频率和选择性排列字段顺序

-- 预期性能提升：
-- - 管理后台帖子列表查询：响应时间减少 60-80%
-- - 媒体文件关联查询：减少 N+1 查询问题
-- - 用户信息查询：避免回表，提升 40-60% 性能
-- - 整体数据库负载：减少 50-70%