-- ============================================
-- Sales App Database Schema
-- ============================================
-- Run this in SALES Supabase SQL Editor
-- Project: uvqlonqtlqypxqatgbih
-- URL: https://supabase.com/dashboard/project/uvqlonqtlqypxqatgbih
-- ============================================
-- This creates the users table to receive synced users from SSO Dashboard
-- Sales app uses: auth.users (UUID) + users table (UUID)
-- ============================================

-- Users Table (for receiving synced users)
-- Note: This table uses UUID to match auth.users.id
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY, -- Must match auth.users.id (UUID)
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'salesman' CHECK (role IN ('owner', 'manager', 'salesman')),
    phone TEXT,
    department TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Foreign key to auth.users
    CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policy - Allow all for now (service key will bypass this)
-- Adjust based on your security needs
DROP POLICY IF EXISTS "Allow all for users" ON public.users;
CREATE POLICY "Allow all for users"
    ON public.users
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- Trigger function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ✅ Sales Database Schema Complete!
-- ============================================
-- Next steps:
-- 1. Users can now be synced from SSO Dashboard to Sales
-- 2. Users will appear in auth.users (UUID) and users table (UUID)
-- 3. Login will work with synced credentials via auth.users
-- 4. Role mapping: admin/owner -> owner, manager -> manager, user -> salesman
-- ============================================
