-- Add ip_address field to contact_submissions table
ALTER TABLE contact_submissions 
ADD COLUMN ip_address VARCHAR(45);

-- Add comment for the new column
COMMENT ON COLUMN contact_submissions.ip_address IS 'IP address of the user who submitted the contact form';

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON contact_submissions TO anon;
GRANT SELECT, INSERT, UPDATE ON contact_submissions TO authenticated;
GRANT ALL PRIVILEGES ON contact_submissions TO service_role;