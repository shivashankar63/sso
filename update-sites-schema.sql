-- ============================================
-- Update Connected Sites Schema
-- ============================================
-- Add Supabase credentials for each site
-- Run this AFTER connected-sites-schema.sql
-- ============================================

-- Add Supabase configuration columns to connected_sites table
ALTER TABLE public.connected_sites 
ADD COLUMN IF NOT EXISTS supabase_url TEXT,
ADD COLUMN IF NOT EXISTS supabase_anon_key TEXT,
ADD COLUMN IF NOT EXISTS supabase_service_key TEXT; -- For admin operations

-- Add index for Supabase URL lookups
CREATE INDEX IF NOT EXISTS idx_connected_sites_supabase_url 
ON public.connected_sites(supabase_url) 
WHERE supabase_url IS NOT NULL;

-- Update RLS to allow viewing Supabase URLs (for sync operations)
-- Note: Service keys should be encrypted in production

-- ============================================
-- Example: Update your sites with Supabase credentials
-- ============================================
-- Replace with your actual site Supabase credentials
-- 
-- UPDATE public.connected_sites
-- SET 
--     supabase_url = 'https://hrms-site.supabase.co',
--     supabase_anon_key = 'your-hrms-anon-key',
--     supabase_service_key = 'your-hrms-service-key'
-- WHERE name = 'hrms';
--
-- UPDATE public.connected_sites
-- SET 
--     supabase_url = 'https://cms-site.supabase.co',
--     supabase_anon_key = 'your-cms-anon-key',
--     supabase_service_key = 'your-cms-service-key'
-- WHERE name = 'cms';
-- ============================================
