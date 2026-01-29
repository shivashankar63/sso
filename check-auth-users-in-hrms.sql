-- ============================================
-- Check auth.users in HRMS
-- ============================================
-- Run this in HRMS Supabase SQL Editor
-- This checks if users exist in auth.users for login
-- ============================================

-- Check if users exist in auth.users
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- Check specific user (replace email)
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  encrypted_password IS NOT NULL as has_password
FROM auth.users
WHERE email = 'your-email@example.com';  -- Replace with your email

-- Compare with user_profiles
SELECT 
  'user_profiles' as table_name,
  id,
  email,
  password_hash IS NOT NULL as has_password
FROM public.user_profiles
WHERE email = 'your-email@example.com'  -- Replace with your email

UNION ALL

SELECT 
  'auth.users' as table_name,
  id::text,
  email,
  encrypted_password IS NOT NULL as has_password
FROM auth.users
WHERE email = 'your-email@example.com';  -- Replace with your email

-- ============================================
-- If auth.users is empty:
-- - Users haven't been re-synced yet
-- - Service key not set
-- - Sync failed
-- ============================================
-- If auth.users exists but login fails:
-- - Password might not be set correctly
-- - Check encrypted_password column
-- ============================================
