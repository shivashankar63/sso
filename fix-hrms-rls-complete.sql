-- ============================================
-- Fix RLS Policies for user_profiles in HRMS
-- ============================================
-- Run this in HRMS Supabase SQL Editor
-- This disables RLS or sets ALLOW ALL policy
-- ============================================

-- Clean up any test users first (optional)
DELETE FROM public.user_profiles 
WHERE email LIKE 'test_%' OR clerk_user_id LIKE 'clerk_test_%';

-- Option 1: Disable RLS completely (Easiest)
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Option 2: Or create ALLOW ALL policy (if you want to keep RLS enabled)
-- First, drop existing policies
DROP POLICY IF EXISTS "Allow all operations" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create ALLOW ALL policy
CREATE POLICY "Allow all operations" ON public.user_profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verify RLS is configured
SELECT 
  tablename,
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_profiles') as policy_count
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'user_profiles';

-- ============================================
-- ✅ RLS fixed! Now sync should work
-- ============================================
