-- ============================================
-- Add Password Field to HRMS user_profiles
-- ============================================
-- Run this in HRMS Supabase (snjtkvvmjqizdfyqbyzd)
-- Adds password_hash column for login
-- ============================================

-- Add password_hash column if it doesn't exist
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- ============================================
-- ✅ Password Field Added to HRMS!
-- ============================================
-- Now passwords will sync from dashboard to HRMS
-- ============================================
