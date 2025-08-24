-- Remove Japanese and Korean fields from activity_categories table
-- These fields are not needed as the system only supports 4 languages: zh, zh-TW, en, vi

ALTER TABLE activity_categories 
DROP COLUMN IF EXISTS name_ja,
DROP COLUMN IF EXISTS name_ko,
DROP COLUMN IF EXISTS description_ja,
DROP COLUMN IF EXISTS description_ko;