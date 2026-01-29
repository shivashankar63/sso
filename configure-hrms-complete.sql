-- ============================================
-- Complete HRMS Site Configuration
-- ============================================
-- Run this in your CENTRAL Supabase SQL Editor
-- This configures HRMS site with all credentials
-- ============================================

-- First, ensure the HRMS site exists
INSERT INTO public.connected_sites (
  name,
  display_name,
  url,
  icon,
  status,
  protocol,
  is_active,
  supabase_url,
  supabase_anon_key,
  supabase_service_key
)
VALUES (
  'hrms',
  'HRMS System',
  'https://techvitta-hrms-tau.vercel.app/',
  '💼',
  'active',
  'oauth',
  true,
  'https://snjtkvvmjqizdfyqbyzd.supabase.co',
  'sb_publishable_CE9_-aZRNd0L-KMw6LQsDA_XV0FyZCq',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuanRrdnZtanFpemRmeXFieXpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ3MTc4OSwiZXhwIjoyMDY4MDQ3Nzg5fQ.blV3qDpiRlQjRrS0kwDf6PqIW09STvUFudXNSboH2sY'
)
ON CONFLICT (name) DO UPDATE SET
  supabase_url = EXCLUDED.supabase_url,
  supabase_anon_key = EXCLUDED.supabase_anon_key,
  supabase_service_key = EXCLUDED.supabase_service_key,
  updated_at = NOW();

-- Verify configuration
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
  END as service_key_status,
  is_active
FROM public.connected_sites
WHERE name = 'hrms';

-- ============================================
-- ✅ HRMS site fully configured!
-- ============================================
-- Now try syncing a user - it should work!
-- ============================================
