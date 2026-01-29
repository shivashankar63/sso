-- ============================================
-- Test HRMS Login - Verify User Credentials
-- ============================================
-- Run this in HRMS Supabase SQL Editor
-- Replace email and password with actual values
-- ============================================

-- Test 1: Check if user exists
SELECT 
  id,
  email,
  full_name,
  password_hash,
  role,
  CASE 
    WHEN password_hash IS NULL THEN '❌ No password set'
    WHEN password_hash = '' THEN '❌ Empty password'
    ELSE '✅ Password set'
  END as password_status
FROM public.user_profiles
WHERE email = 'your-email@example.com';  -- Replace with actual email

-- Test 2: Test password match (manual check)
-- Compare the password_hash value with the password you're using
-- If they match exactly, login should work

-- Test 3: Check if employee record exists (optional)
SELECT 
  e.id,
  e.email,
  e.full_name,
  e.department,
  up.password_hash IS NOT NULL as can_login
FROM public.employees e
LEFT JOIN public.user_profiles up ON e.email = up.email
WHERE e.email = 'your-email@example.com';  -- Replace with actual email

-- ============================================
-- If password_hash matches your password exactly:
-- Login should work (if HRMS code is correct)
-- ============================================
