-- 更新用户注册触发器，添加默认头像功能
-- 修改 handle_new_user 函数以包含默认头像URL设置

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
  default_avatar_url TEXT;
BEGIN
  -- 获取基础用户名
  base_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
  final_username := base_username;
  
  -- 检查用户名是否已存在，如果存在则添加数字后缀
  WHILE EXISTS (SELECT 1 FROM public.user_profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;
  
  -- 生成默认头像URL
  default_avatar_url := '/api/avatar/default?username=' || encode(final_username::bytea, 'escape');
  
  INSERT INTO public.user_profiles (
    id, 
    username, 
    full_name, 
    avatar_url,
    followers_count, 
    following_count, 
    posts_count
  )
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    default_avatar_url,
    0,
    0,
    0
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 为现有用户添加默认头像（如果他们还没有头像的话）
UPDATE public.user_profiles 
SET avatar_url = '/api/avatar/default?username=' || encode(username::bytea, 'escape')
WHERE avatar_url IS NULL OR avatar_url = '';