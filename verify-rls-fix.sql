-- ============================================
-- Verify RLS Policies Are Fixed
-- ============================================
-- Run this in your CENTRAL dashboard Supabase
-- Checks if the policies are correct
-- ============================================

-- Check existing policies on user_profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- Try a test insert (this should work now)
-- Uncomment to test:
-- INSERT INTO public.user_profiles (id, clerk_user_id, email, full_name, role)
-- VALUES ('test_user_123', 'clerk_test_123', 'test@example.com', 'Test User', 'user')
-- ON CONFLICT (id) DO NOTHING;

-- ============================================
-- If you see "Allow all operations on user_profiles" policy, you're good!
-- ============================================
