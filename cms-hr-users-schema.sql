-- ============================================
-- CMS hr_users Table Schema
-- ============================================
-- Run this in CMS Supabase SQL Editor
-- Project: qzgzmytmfoozociuhgtp
-- URL: https://supabase.com/dashboard/project/qzgzmytmfoozociuhgtp
-- ============================================
-- This creates the hr_users table for CMS Portal
-- CMS uses: auth.users (UUID) + hr_users table (UUID)
-- ============================================

-- Create hr_users table (CMS specific)
CREATE TABLE IF NOT EXISTS public.hr_users (
    id UUID PRIMARY KEY, -- Must match auth.users.id (UUID)
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'hr' CHECK (role IN ('admin', 'hr', 'editor', 'author', 'user')),
    phone TEXT,
    department TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Foreign key to auth.users
    CONSTRAINT hr_users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.hr_users ENABLE ROW LEVEL SECURITY;

-- RLS Policy - Allow all for now (service key will bypass this)
-- Adjust based on your security needs
DROP POLICY IF EXISTS "Allow all for hr_users" ON public.hr_users;
CREATE POLICY "Allow all for hr_users"
    ON public.hr_users
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hr_users_email ON public.hr_users(email);
CREATE INDEX IF NOT EXISTS idx_hr_users_role ON public.hr_users(role);

-- Trigger function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_hr_users_updated_at ON public.hr_users;
CREATE TRIGGER update_hr_users_updated_at
    BEFORE UPDATE ON public.hr_users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ✅ CMS hr_users Table Schema Complete!
-- ============================================
-- Next steps:
-- 1. Users can now be synced from SSO Dashboard to CMS
-- 2. Users will appear in auth.users (UUID) and hr_users table (UUID)
-- 3. Login will work with synced credentials via auth.users
-- 4. Role mapping: admin → admin, manager/user → hr
-- ============================================
