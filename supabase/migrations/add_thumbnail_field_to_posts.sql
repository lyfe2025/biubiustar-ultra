-- 为posts表添加thumbnail字段用于存储视频封面
ALTER TABLE posts ADD COLUMN thumbnail TEXT;

-- 添加注释说明该字段的用途
COMMENT ON COLUMN posts.thumbnail IS '视频封面图片URL，用于显示视频的缩略图';