-- Add video field to posts table
ALTER TABLE posts ADD COLUMN video TEXT;

-- Add comment for the new column
COMMENT ON COLUMN posts.video IS '帖子视频文件URL';