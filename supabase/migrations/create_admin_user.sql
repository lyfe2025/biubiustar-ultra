-- 创建管理员账号
-- 注意：这个脚本需要在Supabase Dashboard中执行，因为需要创建auth.users记录

-- 首先检查是否已存在管理员账号
DO $$
BEGIN
  -- 检查是否存在admin@biubiustar.com的用户
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@biubiustar.com'
  ) THEN
    -- 如果不存在，我们需要手动在Supabase Dashboard中创建
    RAISE NOTICE '需要在Supabase Dashboard中创建用户: admin@biubiustar.com';
  ELSE
    -- 如果存在，检查是否有对应的profile
    IF NOT EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN auth.users au ON up.id = au.id
      WHERE au.email = 'admin@biubiustar.com'
    ) THEN
      -- 创建profile记录
      INSERT INTO public.user_profiles (id, username, full_name, role)
      SELECT 
        au.id,
        'admin',
        'Administrator',
        'admin'
      FROM auth.users au
      WHERE au.email = 'admin@biubiustar.com';
      
      RAISE NOTICE '已为现有用户创建管理员profile';
    ELSE
      -- 更新现有profile为管理员角色
      UPDATE public.user_profiles 
      SET role = 'admin', username = 'admin', full_name = 'Administrator'
      WHERE id IN (
        SELECT au.id FROM auth.users au WHERE au.email = 'admin@biubiustar.com'
      );
      
      RAISE NOTICE '已更新现有用户为管理员角色';
    END IF;
  END IF;
END $$;

-- 显示当前所有用户和角色
SELECT 
  au.email,
  up.username,
  up.role,
  au.created_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
ORDER BY au.created_at DESC;