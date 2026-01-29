-- ============================================
-- Check if HRMS site exists in database
-- ============================================
-- Run this in your CENTRAL dashboard Supabase
-- ============================================

-- Check if connected_sites table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'connected_sites'
) as table_exists;

-- Check all sites in connected_sites
SELECT 
    id,
    name,
    display_name,
    url,
    status,
    is_active,
    supabase_url,
    created_at
FROM public.connected_sites
ORDER BY created_at DESC;

-- Check specifically for HRMS site
SELECT * FROM public.connected_sites WHERE name = 'hrms';
