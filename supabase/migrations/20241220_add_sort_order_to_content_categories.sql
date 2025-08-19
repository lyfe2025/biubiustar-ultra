-- Add sort_order field to content_categories table
ALTER TABLE content_categories ADD COLUMN sort_order INTEGER DEFAULT 0;

-- Update existing records with sort_order based on created_at
WITH numbered_categories AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as new_sort_order
  FROM content_categories
)
UPDATE content_categories 
SET sort_order = numbered_categories.new_sort_order
FROM numbered_categories
WHERE content_categories.id = numbered_categories.id;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_content_categories_sort_order ON content_categories(sort_order);