-- Create contact_submissions table for storing contact form data
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'replied')),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_at ON public.contact_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON public.contact_submissions(email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow anonymous users to insert contact form submissions
CREATE POLICY "Allow anonymous contact form submissions" ON public.contact_submissions
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow authenticated users to insert contact form submissions
CREATE POLICY "Allow authenticated contact form submissions" ON public.contact_submissions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Only allow service role to read/update/delete (for admin functionality)
CREATE POLICY "Service role full access" ON public.contact_submissions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT INSERT ON public.contact_submissions TO anon;
GRANT INSERT ON public.contact_submissions TO authenticated;
GRANT ALL PRIVILEGES ON public.contact_submissions TO service_role;

-- Add comments for documentation
COMMENT ON TABLE public.contact_submissions IS 'Stores contact form submissions from website visitors';
COMMENT ON COLUMN public.contact_submissions.name IS 'Full name of the person submitting the form';
COMMENT ON COLUMN public.contact_submissions.email IS 'Email address for contact response';
COMMENT ON COLUMN public.contact_submissions.subject IS 'Subject/topic of the inquiry';
COMMENT ON COLUMN public.contact_submissions.message IS 'Main message content';
COMMENT ON COLUMN public.contact_submissions.status IS 'Processing status: pending, read, replied';
COMMENT ON COLUMN public.contact_submissions.submitted_at IS 'When the form was submitted';
COMMENT ON COLUMN public.contact_submissions.updated_at IS 'Last update timestamp';