-- ============================================
-- Simple Create Table (If schema fails)
-- ============================================
-- Run this in HRMS Supabase if the full schema fails
-- ============================================

-- Create table (simplest version)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id TEXT PRIMARY KEY,
    clerk_user_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    password_hash TEXT, -- Password for login (hashed in production)
    role TEXT DEFAULT 'user',
    team TEXT,
    department TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow all operations (for syncing from dashboard)
CREATE POLICY "Allow all operations" ON public.user_profiles
    FOR ALL USING (true) WITH CHECK (true);

-- Verify
SELECT 'Table created!' as status, COUNT(*) as rows FROM public.user_profiles;
