-- ============================================
-- Fix RLS Policies for user_profiles
-- ============================================
-- Run this in your CENTRAL dashboard Supabase
-- Fixes the infinite recursion error when adding users
-- ============================================

-- Drop all existing policies on user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow all operations" ON public.user_profiles;

-- Since authentication is disabled, allow all operations
-- This prevents infinite recursion issues
CREATE POLICY "Allow all operations on user_profiles"
    ON public.user_profiles
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- ✅ RLS Policies Fixed!
-- ============================================
-- Now you can add users without recursion errors
-- ============================================
