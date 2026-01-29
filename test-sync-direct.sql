-- ============================================
-- Test Direct Sync to HRMS
-- ============================================
-- Run this in CENTRAL Supabase to test if sync works
-- ============================================

-- First, check if connected_sites table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'connected_sites'
) as table_exists;

-- If table_exists is false, run setup-all-tables.sql first!

-- Check if HRMS site is configured
SELECT 
    id,
    name,
    display_name,
    supabase_url,
    CASE 
        WHEN supabase_url IS NULL THEN '❌ No Supabase URL'
        WHEN supabase_anon_key IS NULL THEN '❌ No Anon Key'
        ELSE '✅ Configured'
    END as config_status
FROM public.connected_sites
WHERE name = 'hrms';

-- Check if user exists in central database
SELECT 
    id,
    email,
    full_name,
    CASE 
        WHEN password_hash IS NULL THEN '❌ No password'
        ELSE '✅ Has password'
    END as password_status
FROM public.user_profiles
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- If HRMS is not configured:
--   1. Go to dashboard
--   2. Click Database icon (🗄️) on HRMS site
--   3. Enter Supabase URL and Anon Key
--   4. Save
-- ============================================
