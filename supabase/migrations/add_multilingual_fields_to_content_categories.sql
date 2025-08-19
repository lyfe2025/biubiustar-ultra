-- Add multilingual fields to content_categories table
-- This migration adds support for Chinese (Simplified), Chinese (Traditional), English, and Vietnamese

-- Add multilingual name fields
ALTER TABLE content_categories 
ADD COLUMN name_zh VARCHAR(100),
ADD COLUMN name_zh_tw VARCHAR(100),
ADD COLUMN name_en VARCHAR(100),
ADD COLUMN name_vi VARCHAR(100);

-- Add multilingual description fields
ALTER TABLE content_categories 
ADD COLUMN description_zh TEXT,
ADD COLUMN description_zh_tw TEXT,
ADD COLUMN description_en TEXT,
ADD COLUMN description_vi TEXT;

-- Update existing records with current name and description values
-- Copy current name to all language fields for backward compatibility
UPDATE content_categories SET 
  name_zh = name,
  name_zh_tw = name,
  name_en = name,
  name_vi = name,
  description_zh = description,
  description_zh_tw = description,
  description_en = description,
  description_vi = description
WHERE name_zh IS NULL;

-- Update with proper translations for default categories
UPDATE content_categories SET 
  name_zh = '通用',
  name_zh_tw = '通用',
  name_en = 'General',
  name_vi = 'Chung',
  description_zh = '通用内容分类',
  description_zh_tw = '通用內容分類',
  description_en = 'General content category',
  description_vi = 'Danh mục nội dung chung'
WHERE name = 'general';

UPDATE content_categories SET 
  name_zh = '技术',
  name_zh_tw = '技術',
  name_en = 'Technology',
  name_vi = 'Công nghệ',
  description_zh = '技术相关内容',
  description_zh_tw = '技術相關內容',
  description_en = 'Technology related content',
  description_vi = 'Nội dung liên quan đến công nghệ'
WHERE name = 'technology';

UPDATE content_categories SET 
  name_zh = '生活',
  name_zh_tw = '生活',
  name_en = 'Lifestyle',
  name_vi = 'Lối sống',
  description_zh = '生活方式相关内容',
  description_zh_tw = '生活方式相關內容',
  description_en = 'Lifestyle related content',
  description_vi = 'Nội dung liên quan đến lối sống'
WHERE name = 'lifestyle';

UPDATE content_categories SET 
  name_zh = '娱乐',
  name_zh_tw = '娛樂',
  name_en = 'Entertainment',
  name_vi = 'Giải trí',
  description_zh = '娱乐相关内容',
  description_zh_tw = '娛樂相關內容',
  description_en = 'Entertainment related content',
  description_vi = 'Nội dung giải trí'
WHERE name = 'entertainment';

UPDATE content_categories SET 
  name_zh = '教育',
  name_zh_tw = '教育',
  name_en = 'Education',
  name_vi = 'Giáo dục',
  description_zh = '教育相关内容',
  description_zh_tw = '教育相關內容',
  description_en = 'Education related content',
  description_vi = 'Nội dung giáo dục'
WHERE name = 'education';

UPDATE content_categories SET 
  name_zh = '商业',
  name_zh_tw = '商業',
  name_en = 'Business',
  name_vi = 'Kinh doanh',
  description_zh = '商业相关内容',
  description_zh_tw = '商業相關內容',
  description_en = 'Business related content',
  description_vi = 'Nội dung kinh doanh'
WHERE name = 'business';

-- Add comments for documentation
COMMENT ON COLUMN content_categories.name_zh IS 'Category name in Chinese (Simplified)';
COMMENT ON COLUMN content_categories.name_zh_tw IS 'Category name in Chinese (Traditional)';
COMMENT ON COLUMN content_categories.name_en IS 'Category name in English';
COMMENT ON COLUMN content_categories.name_vi IS 'Category name in Vietnamese';
COMMENT ON COLUMN content_categories.description_zh IS 'Category description in Chinese (Simplified)';
COMMENT ON COLUMN content_categories.description_zh_tw IS 'Category description in Chinese (Traditional)';
COMMENT ON COLUMN content_categories.description_en IS 'Category description in English';
COMMENT ON COLUMN content_categories.description_vi IS 'Category description in Vietnamese';