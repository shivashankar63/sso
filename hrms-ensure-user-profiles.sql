-- ============================================
-- Ensure user_profiles table exists in HRMS
-- ============================================
-- Run this in your HRMS Supabase database
-- This ensures the table exists for password storage
-- ============================================

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id text NOT NULL,
  clerk_user_id text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  full_name text,
  avatar_url text,
  role text DEFAULT 'user'::text CHECK (role = ANY (ARRAY['admin'::text, 'manager'::text, 'user'::text])),
  team text,
  department text,
  phone text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  password_hash text,
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow all operations (since auth is disabled)
DROP POLICY IF EXISTS "Allow all operations" ON public.user_profiles;
CREATE POLICY "Allow all operations" ON public.user_profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_user_id ON public.user_profiles(clerk_user_id);

-- ============================================
-- Optional: Function to sync employee data from user_profiles
-- ============================================
-- This function can be called to update employees table from user_profiles
CREATE OR REPLACE FUNCTION sync_employee_from_profile(p_email text)
RETURNS void AS $$
BEGIN
  UPDATE public.employees
  SET 
    full_name = (SELECT full_name FROM public.user_profiles WHERE email = p_email),
    department = (SELECT department FROM public.user_profiles WHERE email = p_email),
    updated_at = now()
  WHERE email = p_email;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ✅ Done! user_profiles table is ready
-- ============================================
-- Now the sync will:
-- 1. Update employees table (if employee exists)
-- 2. Create/update user_profiles table (for password/login)
-- ============================================
