-- ============================================
-- Add HRMS Site with Supabase Credentials
-- ============================================
-- Run this in your CENTRAL dashboard Supabase
-- This adds the HRMS site with its Supabase credentials configured
-- ============================================

-- First, ensure the Supabase columns exist (if update-sites-schema.sql wasn't run)
DO $$ 
BEGIN
    -- Add supabase_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'connected_sites' 
        AND column_name = 'supabase_url'
    ) THEN
        ALTER TABLE public.connected_sites 
        ADD COLUMN supabase_url TEXT;
    END IF;

    -- Add supabase_anon_key column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'connected_sites' 
        AND column_name = 'supabase_anon_key'
    ) THEN
        ALTER TABLE public.connected_sites 
        ADD COLUMN supabase_anon_key TEXT;
    END IF;

    -- Add supabase_service_key column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'connected_sites' 
        AND column_name = 'supabase_service_key'
    ) THEN
        ALTER TABLE public.connected_sites 
        ADD COLUMN supabase_service_key TEXT;
    END IF;
END $$;

-- Insert HRMS site with Supabase configuration
INSERT INTO public.connected_sites (
    name,
    display_name,
    url,
    icon,
    category,
    status,
    protocol,
    supabase_url,
    supabase_anon_key,
    supabase_service_key,
    is_active,
    description
) VALUES (
    'hrms',
    'HRMS System',
    'https://hrms.example.com', -- Update with your actual HRMS site URL
    '💼',
    'hrms',
    'active',
    'oauth',
    'https://snjtkvvmjqizdfyqbyzd.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuanRrdnZtanFpemRmeXFieXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NzE3ODksImV4cCI6MjA2ODA0Nzc4OX0.cphGba1NoF7CqmeJqI-B9uJsLy1r18HHKFsmslT59GY',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuanRrdnZtanFpemRmeXFieXpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ3MTc4OSwiZXhwIjoyMDY4MDQ3Nzg5fQ.blV3qDpiRlQjRrS0kwDf6PqIW09STvUFudXNSboH2sY',
    true,
    'HRMS (Human Resource Management System) - Connected via SSO Dashboard'
)
ON CONFLICT (name) 
DO UPDATE SET
    display_name = EXCLUDED.display_name,
    url = EXCLUDED.url,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    status = EXCLUDED.status,
    supabase_url = EXCLUDED.supabase_url,
    supabase_anon_key = EXCLUDED.supabase_anon_key,
    supabase_service_key = EXCLUDED.supabase_service_key,
    updated_at = NOW();

-- ============================================
-- ✅ HRMS Site Added!
-- ============================================
-- The HRMS site is now configured with its Supabase credentials
-- You can see it in the dashboard and start syncing users
-- ============================================
