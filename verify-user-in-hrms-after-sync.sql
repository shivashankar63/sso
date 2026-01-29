-- ============================================
-- Verify User Exists in HRMS After Sync
-- ============================================
-- Run this in HRMS Supabase SQL Editor
-- Replace 'your-email@example.com' with actual email
-- ============================================

-- Check if user exists
SELECT 
  id,
  email,
  full_name,
  password_hash,
  role,
  department,
  created_at,
  updated_at,
  CASE 
    WHEN password_hash IS NULL THEN '❌ No password'
    WHEN password_hash = '' THEN '❌ Empty password'
    ELSE '✅ Password set'
  END as password_status
FROM public.user_profiles
WHERE email = 'your-email@example.com';  -- Replace with your email

-- Check all users in table
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN password_hash IS NOT NULL THEN 1 END) as users_with_password
FROM public.user_profiles;

-- ============================================
-- If user exists with password, sync worked! ✅
-- ============================================
