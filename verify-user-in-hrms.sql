-- ============================================
-- Verify User in HRMS Database
-- ============================================
-- Run this in HRMS Supabase (snjtkvvmjqizdfyqbyzd)
-- Check if user exists and has password
-- ============================================

-- Check all users
SELECT 
    email,
    full_name,
    CASE 
        WHEN password_hash IS NULL THEN '❌ No password'
        WHEN password_hash = '' THEN '❌ Empty password'
        ELSE '✅ Password set'
    END as password_status,
    role,
    created_at
FROM public.user_profiles
ORDER BY created_at DESC;

-- Check specific user (replace email)
SELECT 
    email,
    full_name,
    password_hash,
    CASE 
        WHEN password_hash IS NULL THEN 'No password - needs sync'
        WHEN password_hash = '' THEN 'Empty password - needs update'
        ELSE 'Password ready for login'
    END as status
FROM public.user_profiles 
WHERE email = 'peru@example.com'; -- Replace with actual email

-- ============================================
-- If password_hash is NULL:
--   1. User wasn't synced with password
--   2. Go to dashboard → Sync user again
--   3. Make sure password was set when creating user
-- ============================================
