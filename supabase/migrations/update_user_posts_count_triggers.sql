-- 创建触发器函数和触发器来自动维护用户的posts_count字段
-- 只有status为'published'的帖子才计入posts_count

-- 创建触发器函数来更新用户的posts_count
CREATE OR REPLACE FUNCTION update_user_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  -- 处理INSERT操作
  IF TG_OP = 'INSERT' THEN
    -- 只有published状态的帖子才增加计数
    IF NEW.status = 'published' THEN
      UPDATE user_profiles 
      SET posts_count = posts_count + 1 
      WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
  END IF;
  
  -- 处理UPDATE操作
  IF TG_OP = 'UPDATE' THEN
    -- 如果状态从非published变为published，增加计数
    IF OLD.status != 'published' AND NEW.status = 'published' THEN
      UPDATE user_profiles 
      SET posts_count = posts_count + 1 
      WHERE id = NEW.user_id;
    -- 如果状态从published变为非published，减少计数
    ELSIF OLD.status = 'published' AND NEW.status != 'published' THEN
      UPDATE user_profiles 
      SET posts_count = posts_count - 1 
      WHERE id = NEW.user_id;
    END IF;
    
    -- 如果帖子的用户发生变化（虽然这种情况很少见）
    IF OLD.user_id != NEW.user_id THEN
      -- 从原用户减少计数（如果原帖子是published状态）
      IF OLD.status = 'published' THEN
        UPDATE user_profiles 
        SET posts_count = posts_count - 1 
        WHERE id = OLD.user_id;
      END IF;
      
      -- 给新用户增加计数（如果新帖子是published状态）
      IF NEW.status = 'published' THEN
        UPDATE user_profiles 
        SET posts_count = posts_count + 1 
        WHERE id = NEW.user_id;
      END IF;
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- 处理DELETE操作
  IF TG_OP = 'DELETE' THEN
    -- 只有published状态的帖子才减少计数
    IF OLD.status = 'published' THEN
      UPDATE user_profiles 
      SET posts_count = posts_count - 1 
      WHERE id = OLD.user_id;
    END IF;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_update_user_posts_count ON posts;
CREATE TRIGGER trigger_update_user_posts_count
  AFTER INSERT OR UPDATE OR DELETE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_posts_count();

-- 创建修复脚本函数，重新计算所有用户的posts_count
CREATE OR REPLACE FUNCTION fix_user_posts_count()
RETURNS TABLE(user_id UUID, old_count INTEGER, new_count INTEGER, updated BOOLEAN) AS $$
DECLARE
  user_record RECORD;
  actual_count INTEGER;
  current_count INTEGER;
BEGIN
  -- 遍历所有用户
  FOR user_record IN 
    SELECT up.id, up.posts_count 
    FROM user_profiles up
  LOOP
    -- 计算该用户实际的published帖子数量
    SELECT COUNT(*) INTO actual_count
    FROM posts p
    WHERE p.user_id = user_record.id AND p.status = 'published';
    
    current_count := COALESCE(user_record.posts_count, 0);
    
    -- 如果计数不匹配，则更新
    IF current_count != actual_count THEN
      UPDATE user_profiles 
      SET posts_count = actual_count 
      WHERE id = user_record.id;
      
      -- 返回更新信息
      RETURN QUERY SELECT 
        user_record.id,
        current_count,
        actual_count,
        true;
    ELSE
      -- 返回未更新的信息
      RETURN QUERY SELECT 
        user_record.id,
        current_count,
        actual_count,
        false;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- 添加注释
COMMENT ON FUNCTION update_user_posts_count() IS '自动维护用户posts_count字段的触发器函数，只计算published状态的帖子';
COMMENT ON FUNCTION fix_user_posts_count() IS '修复用户posts_count字段，重新计算所有用户的published帖子数量';