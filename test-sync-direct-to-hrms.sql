-- ============================================
-- Test Direct Write to HRMS Database
-- ============================================
-- Run this in HRMS Supabase SQL Editor
-- This tests if we can write directly to user_profiles
-- ============================================

-- Test 1: Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
) as table_exists;

-- Test 2: Check RLS status
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'user_profiles';

-- Test 3: Check RLS policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'user_profiles';

-- Test 4: Try to insert a test user
INSERT INTO public.user_profiles (
  id,
  clerk_user_id,
  email,
  full_name,
  password_hash,
  role
) VALUES (
  'test_direct_' || extract(epoch from now())::text,
  'clerk_test_123',
  'test_direct@example.com',
  'Test Direct User',
  'test123',
  'user'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- Test 5: Verify the insert worked
SELECT * FROM public.user_profiles 
WHERE email = 'test_direct@example.com';

-- Test 6: Check all users in table
SELECT COUNT(*) as total_users FROM public.user_profiles;

-- ============================================
-- If Test 4 fails, RLS is blocking writes
-- Solution: Disable RLS or add proper policy
-- ============================================
-- If Test 5 returns empty, the write didn't work
-- ============================================
