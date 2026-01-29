-- ============================================
-- User Profiles Schema for Each Site's Supabase
-- ============================================
-- Run this in EACH of your site's Supabase databases
-- (HRMS Supabase, CMS Supabase, Sales Supabase, Garage Supabase)
-- 
-- This creates the user_profiles table that will receive synced users
-- ============================================

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

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow reads for authenticated users
-- Since users come from central dashboard, we allow service role to insert/update
CREATE POLICY "Service role can manage profiles"
    ON public.user_profiles
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Or if you want to use JWT-based auth later:
-- CREATE POLICY "Users can view own profile"
--     ON public.user_profiles
--     FOR SELECT
--     USING (get_user_id() = id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_id ON public.user_profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ✅ Schema Complete for This Site!
-- ============================================
-- Repeat this in each of your site's Supabase databases
-- ============================================
