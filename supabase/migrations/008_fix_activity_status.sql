-- Fix activity status from 'active' to 'published' for upcoming activities
-- This ensures activities are properly displayed on the homepage

-- Update existing activities with 'active' status to 'published'
UPDATE activities 
SET status = 'published'
WHERE status = 'active' 
  AND start_date >= NOW();

-- Also update any activities with 'upcoming' status to 'published' for consistency
UPDATE activities 
SET status = 'published'
WHERE status = 'upcoming' 
  AND start_date >= NOW();

-- Add a comment to document this change
COMMENT ON TABLE activities IS 'Activities table - status should be "published" for active/upcoming events to display on homepage';