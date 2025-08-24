-- 检查触发器是否存在
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_user_posts_count';

-- 检查函数是否存在
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name IN ('update_user_posts_count', 'fix_user_posts_count')
AND routine_schema = 'public';