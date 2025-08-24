-- Add Japanese and Korean language support to activity_categories table
-- This migration adds support for Japanese (ja) and Korean (ko) languages

ALTER TABLE activity_categories 
ADD COLUMN name_ja TEXT,
ADD COLUMN name_ko TEXT,
ADD COLUMN description_ja TEXT,
ADD COLUMN description_ko TEXT;

-- Add comments to document the purpose of these fields
COMMENT ON COLUMN activity_categories.name_ja IS 'Category name in Japanese';
COMMENT ON COLUMN activity_categories.name_ko IS 'Category name in Korean';
COMMENT ON COLUMN activity_categories.description_ja IS 'Category description in Japanese';
COMMENT ON COLUMN activity_categories.description_ko IS 'Category description in Korean';