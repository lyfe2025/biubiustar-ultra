-- 禁用user_profiles表的RLS以解决无限递归问题
-- 这是为了解决管理员权限验证中的无限递归错误

-- 删除所有现有的RLS策略
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow users to read their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow admin to read all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow admin to update all profiles" ON public.user_profiles;

-- 禁用RLS
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- 确保anon和authenticated角色有适当的权限
GRANT SELECT ON public.user_profiles TO anon;
GRANT ALL PRIVILEGES ON public.user_profiles TO authenticated;