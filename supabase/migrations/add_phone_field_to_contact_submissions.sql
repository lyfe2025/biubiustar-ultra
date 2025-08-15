-- Add phone field to contact_submissions table
-- This migration adds a phone field to store contact phone numbers

ALTER TABLE contact_submissions 
ADD COLUMN phone VARCHAR(50) NULL;

-- Add comment for the phone column
COMMENT ON COLUMN contact_submissions.phone IS 'Phone number of the person submitting the form';

-- Update the table comment to reflect the new field
COMMENT ON TABLE contact_submissions IS 'Stores contact form submissions from website visitors including phone numbers';