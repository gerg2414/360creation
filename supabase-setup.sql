-- Run this in Supabase SQL Editor to set up your database

-- Create submissions table
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  location TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  extras TEXT,
  trade TEXT DEFAULT 'plumber',
  logo_url TEXT,
  mockup_url TEXT,
  status TEXT DEFAULT 'new',
  viewed_at TIMESTAMPTZ,
  mockup_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for simplicity with service key)
CREATE POLICY "Allow all operations" ON submissions FOR ALL USING (true);

-- Storage buckets (run these separately or create via Supabase dashboard)
-- Go to Storage in Supabase dashboard and create two buckets:
-- 1. "logos" - set to public
-- 2. "mockups" - set to public
