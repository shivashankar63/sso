-- ============================================
-- COMPLETE SETUP - All Required Tables
-- ============================================
-- Run this in your CENTRAL dashboard Supabase
-- Creates all tables needed for SSO dashboard
-- ============================================

-- Step 1: Create connected_sites table
CREATE TABLE IF NOT EXISTS public.connected_sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'inactive', 'error')),
    protocol TEXT DEFAULT 'oauth' CHECK (protocol IN ('oauth', 'saml', 'oidc', 'custom')),
    app_type TEXT DEFAULT 'web' CHECK (app_type IN ('web', 'api', 'mobile', 'desktop')),
    
    -- Authentication configuration
    client_id TEXT,
    client_secret TEXT,
    redirect_uri TEXT,
    scopes TEXT[],
    
    -- SAML/OIDC specific
    metadata_url TEXT,
    entity_id TEXT,
    
    -- Connection details
    last_sync_at TIMESTAMPTZ,
    sync_status TEXT,
    error_message TEXT,
    
    -- Statistics
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    
    -- Metadata
    description TEXT,
    category TEXT,
    tags TEXT[],
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT,
    
    -- Settings
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Supabase credentials for each site
    supabase_url TEXT,
    supabase_anon_key TEXT,
    supabase_service_key TEXT
);

ALTER TABLE public.connected_sites ENABLE ROW LEVEL SECURITY;

-- Allow all operations (since auth is disabled)
DROP POLICY IF EXISTS "Anyone can view active sites" ON public.connected_sites;
DROP POLICY IF EXISTS "Admins can manage sites" ON public.connected_sites;
DROP POLICY IF EXISTS "Anyone can manage sites" ON public.connected_sites;

CREATE POLICY "Allow all operations on connected_sites"
    ON public.connected_sites
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_connected_sites_status ON public.connected_sites(status);
CREATE INDEX IF NOT EXISTS idx_connected_sites_is_active ON public.connected_sites(is_active);
CREATE INDEX IF NOT EXISTS idx_connected_sites_name ON public.connected_sites(name);

-- Step 2: Create user_profiles table (if not exists)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id TEXT PRIMARY KEY,
    clerk_user_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    password_hash TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    team TEXT,
    department TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow all operations (since auth is disabled)
DROP POLICY IF EXISTS "Allow all operations on user_profiles" ON public.user_profiles;

CREATE POLICY "Allow all operations on user_profiles"
    ON public.user_profiles
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Step 3: Create user_sync_log table (if not exists)
CREATE TABLE IF NOT EXISTS public.user_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    target_site TEXT NOT NULL,
    sync_status TEXT NOT NULL CHECK (sync_status IN ('pending', 'in_progress', 'success', 'failed')),
    sync_type TEXT CHECK (sync_type IN ('create', 'update', 'delete')),
    synced_data JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

ALTER TABLE public.user_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on user_sync_log"
    ON public.user_sync_log
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_sync_log_user_id ON public.user_sync_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sync_log_target_site ON public.user_sync_log(target_site);
CREATE INDEX IF NOT EXISTS idx_user_sync_log_status ON public.user_sync_log(sync_status);

-- ============================================
-- ✅ All Tables Created!
-- ============================================
-- Now you can:
--   1. Add sites via dashboard
--   2. Add users via dashboard
--   3. Sync users to sites
-- ============================================
