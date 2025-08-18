-- Add multilingual fields to activity_categories table
-- This migration adds support for four languages: Chinese (zh), Traditional Chinese (zh-TW), English (en), and Vietnamese (vi)

ALTER TABLE activity_categories 
ADD COLUMN name_zh TEXT,
ADD COLUMN name_zh_tw TEXT,
ADD COLUMN name_en TEXT,
ADD COLUMN name_vi TEXT,
ADD COLUMN description_zh TEXT,
ADD COLUMN description_zh_tw TEXT,
ADD COLUMN description_en TEXT,
ADD COLUMN description_vi TEXT;

-- Update existing records to populate multilingual fields with current name and description
-- This ensures backward compatibility
UPDATE activity_categories 
SET 
  name_zh = name,
  name_zh_tw = name,
  name_en = name,
  name_vi = name,
  description_zh = description,
  description_zh_tw = description,
  description_en = description,
  description_vi = description
WHERE name IS NOT NULL;

-- Add comments to document the purpose of these fields
COMMENT ON COLUMN activity_categories.name_zh IS 'Category name in Simplified Chinese';
COMMENT ON COLUMN activity_categories.name_zh_tw IS 'Category name in Traditional Chinese';
COMMENT ON COLUMN activity_categories.name_en IS 'Category name in English';
COMMENT ON COLUMN activity_categories.name_vi IS 'Category name in Vietnamese';
COMMENT ON COLUMN activity_categories.description_zh IS 'Category description in Simplified Chinese';
COMMENT ON COLUMN activity_categories.description_zh_tw IS 'Category description in Traditional Chinese';
COMMENT ON COLUMN activity_categories.description_en IS 'Category description in English';
COMMENT ON COLUMN activity_categories.description_vi IS 'Category description in Vietnamese';