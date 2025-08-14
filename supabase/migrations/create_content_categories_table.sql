-- 创建内容分类表
CREATE TABLE IF NOT EXISTS public.content_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR DEFAULT '#3B82F6',
    icon VARCHAR DEFAULT 'tag',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 启用RLS
ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略 - 允许所有认证用户读取
CREATE POLICY "Allow authenticated users to read content categories" ON public.content_categories
    FOR SELECT TO authenticated USING (true);

-- 创建RLS策略 - 只允许管理员进行增删改操作
CREATE POLICY "Allow admin to manage content categories" ON public.content_categories
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- 授权给anon和authenticated角色
GRANT SELECT ON public.content_categories TO anon;
GRANT ALL PRIVILEGES ON public.content_categories TO authenticated;

-- 插入一些初始数据
INSERT INTO public.content_categories (name, description, color, icon) VALUES
    ('技术分享', '技术相关的内容分享', '#3B82F6', 'code'),
    ('生活随笔', '日常生活感悟和随笔', '#10B981', 'heart'),
    ('学习笔记', '学习过程中的笔记和总结', '#F59E0B', 'book'),
    ('项目展示', '个人或团队项目的展示', '#8B5CF6', 'folder'),
    ('其他', '其他类型的内容', '#6B7280', 'more-horizontal')
ON CONFLICT (name) DO NOTHING;