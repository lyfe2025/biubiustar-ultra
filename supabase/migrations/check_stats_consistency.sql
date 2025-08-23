-- 检查统计数据一致性的查询
-- 这个文件用于验证posts表中的统计字段与实际数据是否一致

-- 1. 查看posts表的统计字段
SELECT 
    id,
    title,
    likes_count,
    comments_count,
    views_count,
    status,
    created_at
FROM posts 
ORDER BY created_at DESC;

-- 2. 查看实际的点赞数据统计
SELECT 
    p.id,
    p.title,
    p.likes_count as stored_likes_count,
    COUNT(l.id) as actual_likes_count,
    (p.likes_count = COUNT(l.id)) as likes_consistent
FROM posts p
LEFT JOIN likes l ON p.id = l.post_id
GROUP BY p.id, p.title, p.likes_count
ORDER BY p.created_at DESC;

-- 3. 查看实际的评论数据统计
SELECT 
    p.id,
    p.title,
    p.comments_count as stored_comments_count,
    COUNT(c.id) as actual_comments_count,
    (p.comments_count = COUNT(c.id)) as comments_consistent
FROM posts p
LEFT JOIN comments c ON p.id = c.post_id
GROUP BY p.id, p.title, p.comments_count
ORDER BY p.created_at DESC;

-- 4. 综合统计对比
SELECT 
    p.id,
    p.title,
    p.likes_count as stored_likes,
    COUNT(DISTINCT l.id) as actual_likes,
    p.comments_count as stored_comments,
    COUNT(DISTINCT c.id) as actual_comments,
    p.views_count,
    CASE 
        WHEN p.likes_count = COUNT(DISTINCT l.id) AND p.comments_count = COUNT(DISTINCT c.id) 
        THEN 'CONSISTENT' 
        ELSE 'INCONSISTENT' 
    END as status
FROM posts p
LEFT JOIN likes l ON p.id = l.post_id
LEFT JOIN comments c ON p.id = c.post_id
GROUP BY p.id, p.title, p.likes_count, p.comments_count, p.views_count
ORDER BY p.created_at DESC;

-- 5. 总体统计
SELECT 
    'TOTALS' as summary,
    SUM(p.likes_count) as total_stored_likes,
    COUNT(l.id) as total_actual_likes,
    SUM(p.comments_count) as total_stored_comments,
    COUNT(c.id) as total_actual_comments,
    SUM(p.views_count) as total_views
FROM posts p
LEFT JOIN likes l ON p.id = l.post_id
LEFT JOIN comments c ON p.id = c.post_id;