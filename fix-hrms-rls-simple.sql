-- ============================================
-- Simple Fix: Disable RLS for user_profiles
-- ============================================
-- Run this in HRMS Supabase SQL Editor
-- This is the simplest fix - just disables RLS
-- ============================================

-- Disable RLS completely
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'user_profiles';

-- Should show: rls_enabled = false
-- ============================================
-- ✅ RLS disabled! Now sync should work
-- ============================================
