-- 创建media_files表来存储帖子的多个图片和视频文件
-- 支持每个帖子最多9个媒体文件

CREATE TABLE IF NOT EXISTS media_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('image', 'video')),
    file_size INTEGER,
    mime_type VARCHAR(100),
    thumbnail_url TEXT, -- 视频缩略图或图片缩略图
    display_order INTEGER NOT NULL DEFAULT 0, -- 显示顺序，0-8
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引提高查询性能
CREATE INDEX IF NOT EXISTS idx_media_files_post_id ON media_files(post_id);
CREATE INDEX IF NOT EXISTS idx_media_files_display_order ON media_files(post_id, display_order);

-- 添加约束确保每个帖子最多9个媒体文件
ALTER TABLE media_files ADD CONSTRAINT check_max_files_per_post 
    CHECK ((SELECT COUNT(*) FROM media_files WHERE post_id = media_files.post_id) <= 9);

-- 添加约束确保display_order在0-8范围内
ALTER TABLE media_files ADD CONSTRAINT check_display_order 
    CHECK (display_order >= 0 AND display_order <= 8);

-- 添加唯一约束确保同一帖子中display_order不重复
ALTER TABLE media_files ADD CONSTRAINT unique_post_display_order 
    UNIQUE (post_id, display_order);

-- 启用RLS
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Users can view media files" ON media_files
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own media files" ON media_files
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM posts 
            WHERE posts.id = media_files.post_id 
            AND posts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own media files" ON media_files
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM posts 
            WHERE posts.id = media_files.post_id 
            AND posts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own media files" ON media_files
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM posts 
            WHERE posts.id = media_files.post_id 
            AND posts.user_id = auth.uid()
        )
    );

-- 管理员可以管理所有媒体文件
