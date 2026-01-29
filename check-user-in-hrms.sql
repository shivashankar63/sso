-- ============================================
-- Check if user exists in HRMS
-- ============================================
-- Run this in HRMS Supabase to verify user sync
-- Replace 'user@example.com' with your user's email
-- ============================================

-- Check in user_profiles table (for login)
SELECT 
  id,
  email,
  full_name,
  password_hash,
  CASE 
    WHEN password_hash IS NULL THEN '❌ No password'
    WHEN password_hash = '' THEN '❌ Empty password'
    ELSE '✅ Password set'
  END as password_status,
  created_at,
  updated_at
FROM public.user_profiles
WHERE email = 'user@example.com'; -- Replace with your email

-- Check in employees table
SELECT 
  id,
  email,
  full_name,
  department,
  employee_status,
  created_at,
  updated_at
FROM public.employees
WHERE email = 'user@example.com'; -- Replace with your email

-- Check both tables together
SELECT 
  'user_profiles' as table_name,
  email,
  full_name,
  password_hash IS NOT NULL as has_password
FROM public.user_profiles
WHERE email = 'user@example.com' -- Replace with your email

UNION ALL

SELECT 
  'employees' as table_name,
  email,
  full_name,
  false as has_password
FROM public.employees
WHERE email = 'user@example.com'; -- Replace with your email

-- ============================================
-- If user_profiles doesn't exist:
-- 1. User wasn't synced yet
-- 2. Go to dashboard → Click "Sync" next to user
-- ============================================
-- If password_hash is NULL:
-- 1. Password wasn't set in dashboard
-- 2. Update user in dashboard with password
-- 3. Sync again
-- ============================================
