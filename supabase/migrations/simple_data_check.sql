-- 简单的数据查询
-- 查看posts表的基本统计信息
SELECT 
    COUNT(*) as total_posts,
    SUM(likes_count) as total_likes_stored,
    SUM(comments_count) as total_comments_stored,
    SUM(views_count) as total_views_stored
FROM posts;

-- 查看实际的likes数量
SELECT COUNT(*) as actual_likes_count FROM likes WHERE post_id IS NOT NULL;

-- 查看实际的comments数量
SELECT COUNT(*) as actual_comments_count FROM comments;

-- 查看每个帖子的详细统计
SELECT 
    p.id,
    p.title,
    p.likes_count,
    p.comments_count,
    p.views_count,
    p.status
FROM posts p
ORDER BY p.created_at DESC
LIMIT 10;