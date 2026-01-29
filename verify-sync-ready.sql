-- ============================================
-- Verify Everything is Ready for Sync
-- ============================================
-- Run this in CENTRAL Supabase to check configuration
-- ============================================

-- Check HRMS site configuration
SELECT 
  name,
  display_name,
  supabase_url,
  CASE 
    WHEN supabase_anon_key IS NOT NULL THEN '✅ Configured'
    ELSE '❌ Not set'
  END as anon_key_status,
  CASE 
    WHEN supabase_service_key IS NOT NULL THEN '✅ Configured (RLS bypass enabled)'
    ELSE '❌ Not set (RLS may block writes)'
  END as service_key_status,
  is_active
FROM connected_sites
WHERE name = 'hrms';

-- ============================================
-- If service_key_status shows ✅, you're ready!
-- ============================================
-- Now try syncing a user from the dashboard
-- ============================================
