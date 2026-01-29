-- ============================================
-- Configure HRMS Site with Supabase Credentials
-- ============================================
-- Run this in your CENTRAL Supabase SQL Editor
-- This configures HRMS site with URL, anon key, and service key
-- ============================================

-- Update HRMS site with all credentials
UPDATE public.connected_sites
SET 
  supabase_url = 'https://snjtkvvmjqizdfyqbyzd.supabase.co',
  supabase_anon_key = 'sb_publishable_CE9_-aZRNd0L-KMw6LQsDA_XV0FyZCq',
  supabase_service_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuanRrdnZtanFpemRmeXFieXpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ3MTc4OSwiZXhwIjoyMDY4MDQ3Nzg5fQ.blV3qDpiRlQjRrS0kwDf6PqIW09STvUFudXNSboH2sY',
  updated_at = NOW()
WHERE name = 'hrms' AND is_active = true;

-- Verify it was updated
SELECT 
  id,
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
  END as service_key_status
FROM public.connected_sites
WHERE name = 'hrms' AND is_active = true;

-- ============================================
-- ✅ Service key added!
-- ============================================
-- Now try syncing a user - it should work!
-- ============================================
