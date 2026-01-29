-- ============================================
-- Quick Setup Commands for Clerk SSO Project
-- ============================================
-- ⚠️ IMPORTANT: Run supabase-clerk-schema.sql FIRST!
-- These commands work with Clerk user IDs
-- 
-- Run these commands in Supabase SQL Editor
-- Project: https://ostdxmquaeiqntyhazxc.supabase.co
-- ============================================

-- 1. Check if schema exists (run this first to verify tables were created)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'user_roles', 'app_access', 'audit_logs');

-- 2. View all user profiles
SELECT * FROM public.user_profiles ORDER BY created_at DESC;

-- 3. Create a user profile manually (use Clerk user ID)
-- Replace 'clerk_user_id_here' with actual Clerk user ID
-- Replace 'user@example.com' with actual email
INSERT INTO public.user_profiles (id, email, full_name, clerk_user_id, role)
VALUES (
    'clerk_user_id_here',  -- This should match Clerk's user ID
    'user@example.com',
    'John Doe',
    'clerk_user_id_here',
    'user'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Grant Sales app access to a user (replace email)
INSERT INTO public.app_access (user_id, app_name, access_granted)
SELECT id, 'sales', TRUE
FROM public.user_profiles
WHERE email = 'user@example.com'
ON CONFLICT (user_id, app_name) DO UPDATE
SET access_granted = TRUE, revoked_at = NULL;

-- 5. Grant HRMS app access to a user (replace email)
INSERT INTO public.app_access (user_id, app_name, access_granted)
SELECT id, 'hrms', TRUE
FROM public.user_profiles
WHERE email = 'user@example.com'
ON CONFLICT (user_id, app_name) DO UPDATE
SET access_granted = TRUE, revoked_at = NULL;

-- 6. Grant CMS app access to a user (replace email)
INSERT INTO public.app_access (user_id, app_name, access_granted)
SELECT id, 'cms', TRUE
FROM public.user_profiles
WHERE email = 'user@example.com'
ON CONFLICT (user_id, app_name) DO UPDATE
SET access_granted = TRUE, revoked_at = NULL;

-- 7. Grant Garage app access to a user (replace email)
INSERT INTO public.app_access (user_id, app_name, access_granted)
SELECT id, 'garage', TRUE
FROM public.user_profiles
WHERE email = 'user@example.com'
ON CONFLICT (user_id, app_name) DO UPDATE
SET access_granted = TRUE, revoked_at = NULL;

-- 8. Make user an admin (replace email)
UPDATE public.user_profiles 
SET role = 'admin'
WHERE email = 'admin@techvitta.com';

-- 9. View user summary
SELECT * FROM public.user_summary;

-- 10. Check user's app access
SELECT 
    up.email,
    up.clerk_user_id,
    aa.app_name,
    aa.access_granted,
    aa.granted_at
FROM public.user_profiles up
LEFT JOIN public.app_access aa ON up.id = aa.user_id
WHERE up.email = 'user@example.com';

-- 11. View recent audit logs
SELECT 
    al.event_type,
    al.app_name,
    up.email,
    al.created_at
FROM public.audit_logs al
LEFT JOIN public.user_profiles up ON al.user_id = up.id
ORDER BY al.created_at DESC
LIMIT 50;

-- 12. Revoke app access
UPDATE public.app_access
SET access_granted = FALSE, revoked_at = NOW()
WHERE user_id = (SELECT id FROM public.user_profiles WHERE email = 'user@example.com')
AND app_name = 'sales';

-- 13. Check if user has access to specific app
SELECT has_app_access('sales', 'clerk_user_id_here');

-- 14. Get all apps for a user
SELECT * FROM get_user_apps('clerk_user_id_here');

-- 15. Get user role
SELECT get_user_role('clerk_user_id_here');

-- ============================================
