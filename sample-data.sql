-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================
-- Run this AFTER complete-database-setup.sql
-- Replace 'clerk_user_id_here' with actual Clerk user IDs
-- ============================================

-- Example: Create a test admin user profile
-- Replace 'user_2abc123xyz' with your actual Clerk user ID
INSERT INTO public.user_profiles (
    id,
    email,
    full_name,
    role,
    clerk_user_id,
    team,
    department
) VALUES (
    'user_2abc123xyz',  -- Replace with actual Clerk user ID
    'admin@example.com',
    'Admin User',
    'admin',
    'user_2abc123xyz',  -- Same as id
    'IT',
    'Administration'
) ON CONFLICT (id) DO NOTHING;

-- Example: Grant access to apps for the admin
INSERT INTO public.app_access (user_id, app_name, access_granted)
VALUES 
    ('user_2abc123xyz', 'hrms', TRUE),
    ('user_2abc123xyz', 'cms', TRUE),
    ('user_2abc123xyz', 'sales', TRUE),
    ('user_2abc123xyz', 'garage', TRUE)
ON CONFLICT (user_id, app_name) DO NOTHING;

-- Example: Create a regular user profile
-- Replace 'user_2def456uvw' with another actual Clerk user ID
INSERT INTO public.user_profiles (
    id,
    email,
    full_name,
    role,
    clerk_user_id,
    team,
    department
) VALUES (
    'user_2def456uvw',  -- Replace with actual Clerk user ID
    'user@example.com',
    'Regular User',
    'user',
    'user_2def456uvw',  -- Same as id
    'Sales',
    'Marketing'
) ON CONFLICT (id) DO NOTHING;

-- Example: Grant limited app access
INSERT INTO public.app_access (user_id, app_name, access_granted)
VALUES 
    ('user_2def456uvw', 'sales', TRUE),
    ('user_2def456uvw', 'cms', TRUE)
ON CONFLICT (user_id, app_name) DO NOTHING;

-- ============================================
-- USEFUL QUERIES FOR TESTING
-- ============================================

-- View all user profiles
-- SELECT * FROM public.user_profiles;

-- View user summary with apps and roles
-- SELECT * FROM public.user_summary;

-- Check if a user has access to an app
-- SELECT has_app_access('sales', 'user_2abc123xyz');

-- Get all apps for a user
-- SELECT * FROM get_user_apps('user_2abc123xyz');

-- View recent audit logs
-- SELECT * FROM public.audit_logs ORDER BY created_at DESC LIMIT 10;
