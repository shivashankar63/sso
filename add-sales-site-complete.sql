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
  'https://your-sales-project.supabase.co',  -- Supabase URL (REPLACE WITH YOUR SALES SUPABASE URL)
  'your-supabase-anon-key-here', -- Supabase Anon Key (REPLACE WITH YOUR SALES SUPABASE ANON KEY)
  'your-supabase-service-key-here' -- Supabase Service Key (REPLACE WITH YOUR SALES SUPABASE SERVICE KEY)
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
