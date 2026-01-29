-- ============================================
-- Verify auth.users Entries Were Created
-- ============================================
-- Run this in HRMS Supabase SQL Editor
-- This checks if users exist in auth.users table
-- ============================================

-- Check auth.users (requires service role or admin access)
-- Note: You may need to use Supabase Dashboard > Authentication > Users
-- Or use the API test endpoint: /api/test/check-auth-users?email=your-email

-- Check user_profiles
SELECT 
  id,
  email,
  full_name,
  password_hash IS NOT NULL as has_password,
  created_at
FROM public.user_profiles
ORDER BY created_at DESC;

-- Check employees
SELECT 
  id,
  email,
  full_name,
  employee_status,
  created_at
FROM public.employees
ORDER BY created_at DESC;

-- ============================================
-- To check auth.users:
-- 1. Go to HRMS Supabase Dashboard
-- 2. Authentication > Users
-- 3. Or use API: /api/test/check-auth-users?email=your-email
-- ============================================
