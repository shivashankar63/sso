-- ============================================
-- Add Sales Site to Connected Sites
-- ============================================
-- Run this in CENTRAL Supabase SQL Editor
-- Replace placeholders with your actual values
-- ============================================

-- Ensure columns exist (if not already added)
ALTER TABLE public.connected_sites 
ADD COLUMN IF NOT EXISTS supabase_url TEXT,
ADD COLUMN IF NOT EXISTS supabase_anon_key TEXT,
ADD COLUMN IF NOT EXISTS supabase_service_key TEXT;

-- Insert Sales site
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
  'https://sales.example.com', -- Site URL (replace with actual URL)
  '💰',                      -- Icon emoji
  'sales',                   -- Category
  'active',                  -- Status
  'oauth',                   -- Protocol
  true,                      -- Is active
  'Sales Management Portal - Connected via SSO Dashboard',
  'https://your-sales-supabase.supabase.co',  -- Supabase URL (replace!)
  'your-sales-anon-key-here', -- Supabase Anon Key (replace!)
  'your-sales-service-key-here' -- Supabase Service Key (replace! optional but recommended)
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
