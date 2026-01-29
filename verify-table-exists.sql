-- ============================================
-- Verify user_profiles Table Exists
-- ============================================
-- Run this in HRMS Supabase (snjtkvvmjqizdfyqbyzd)
-- This checks if the table was created successfully
-- ============================================

-- Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles'
) as table_exists;

-- Show table structure if it exists
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Count rows (should be 0 if just created)
SELECT COUNT(*) as row_count FROM public.user_profiles;

-- ============================================
-- If table_exists is false, run site-supabase-schema.sql
-- ============================================
