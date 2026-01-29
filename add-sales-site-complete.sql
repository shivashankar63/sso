-- ============================================
-- Add Sales Site to Connected Sites
-- ============================================
-- Run this in CENTRAL Supabase SQL Editor
-- Sales App: https://firstpsales.vercel.app/
-- ============================================

-- Ensure columns exist (if not already added)
ALTER TABLE public.connected_sites 
ADD COLUMN IF NOT EXISTS supabase_url TEXT,
ADD COLUMN IF NOT EXISTS supabase_anon_key TEXT,
ADD COLUMN IF NOT EXISTS supabase_service_key TEXT;

-- Insert Sales site with actual credentials
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
) VALUES (
  'sales',                    -- Site name (unique identifier)
  'Sales Portal',            -- Display name
  'https://firstpsales.vercel.app/', -- Site URL
  '💰',                      -- Icon emoji
  'sales',                   -- Category
  'active',                  -- Status
  'oauth',                   -- Protocol
  true,                      -- Is active
  'Sales Management Portal - Connected via SSO Dashboard',
  'https://uvqlonqtlqypxqatgbih.supabase.co',  -- Supabase URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2cWxvbnF0bHF5cHhxYXRnYmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2OTUwNjYsImV4cCI6MjA4MzI3MTA2Nn0.nr4eX7XcKlUaJ5Sg3OJDCj0MLpBae6hxfYjRcddYLQM', -- Supabase Anon Key
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2cWxvbnF0bHF5cHhxYXRnYmloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY5NTA2NiwiZXhwIjoyMDgzMjcxMDY2fQ.dbW-b0MdbZKrSEp6YdWNdBnz-xMHw132WO3qJKOXpWo' -- Supabase Service Key
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

-- ============================================
-- ✅ Sales Site Added!
-- ============================================
-- Next steps:
-- 1. Set up Sales Supabase database (run site-supabase-schema.sql in Sales Supabase)
-- 2. Configure RLS policies in Sales Supabase (if needed)
-- 3. Sync users from dashboard to Sales site
-- ============================================
