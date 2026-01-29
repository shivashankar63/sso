-- ============================================
-- User Profiles Schema for HRMS Supabase
-- ============================================
-- Run this in HRMS Supabase (snjtkvvmjqizdfyqbyzd)
-- This creates the user_profiles table that will receive synced users
-- ============================================

-- Drop table if exists (for clean setup - remove this line if you want to keep existing data)
-- DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Create the function first (needed for trigger)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- User Profiles Table (for receiving synced users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id TEXT PRIMARY KEY, -- Same ID from central dashboard
    clerk_user_id TEXT UNIQUE NOT NULL, -- Clerk user ID
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    team TEXT,
    department TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.user_profiles;

-- RLS Policy - Allow all operations (since we're using service role for syncing)
CREATE POLICY "Service role can manage profiles"
    ON public.user_profiles
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_id ON public.user_profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;

-- Create trigger
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Verify table was created
SELECT 
    'Table created successfully!' as status,
    COUNT(*) as current_row_count
FROM public.user_profiles;

-- ============================================
-- ✅ Schema Complete!
-- ============================================
-- The user_profiles table is now ready to receive synced users
-- ============================================
