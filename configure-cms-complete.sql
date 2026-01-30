-- ============================================
-- Complete CMS Site Configuration
-- ============================================
-- Run this in your CENTRAL Supabase SQL Editor
-- This configures CMS site with all credentials
-- ============================================

-- First, ensure the CMS site exists
INSERT INTO public.connected_sites (
  name,
  display_name,
  url,
  icon,
  category,
  status,
  protocol,
  is_active,
  description,
  supabase_url,
  supabase_anon_key,
  supabase_service_key
)
VALUES (
  'cms',
  'CMS Portal',
  'https://cms.techvitta.in',
  '📋',
  'cms',
  'active',
  'oauth',
  true,
  'Content Management System - Connected via SSO Dashboard',
  'https://qzgzmytmfoozociuhgtp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6Z3pteXRtZm9vem9jaXVoZ3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzOTQwOTEsImV4cCI6MjA3Njk3MDA5MX0.w0JiBV0cIH2ZFCDB9sUgrfBPlVUy_hiujQuRInJF29I',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6Z3pteXRtZm9vem9jaXVoZ3RwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM5NDA5MSwiZXhwIjoyMDc2OTcwMDkxfQ.qtE7V9jtA5ZQirn8EkL9q7BAZXlQy5o1vO5XcBAiNz0'
)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  url = EXCLUDED.url,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  supabase_url = EXCLUDED.supabase_url,
  supabase_anon_key = EXCLUDED.supabase_anon_key,
  supabase_service_key = EXCLUDED.supabase_service_key,
  updated_at = NOW();

-- Verify configuration
SELECT 
  id,
  name,
  display_name,
  url,
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
WHERE name = 'cms';

-- ============================================
-- ✅ CMS site fully configured!
-- ============================================
-- Next steps:
-- 1. Replace placeholder values above with actual CMS credentials
-- 2. Set up CMS Supabase database (run site-supabase-schema.sql in CMS Supabase)
-- 3. Configure RLS policies in CMS Supabase
-- 4. Sync users from dashboard
-- ============================================
