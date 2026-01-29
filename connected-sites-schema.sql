-- ============================================
-- Connected Sites/Applications Schema
-- ============================================
-- Run this in Supabase SQL Editor
-- Stores configuration for all connected websites/applications
-- ============================================

-- Table to store connected sites/applications
CREATE TABLE IF NOT EXISTS public.connected_sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT, -- Emoji or icon identifier
    status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'inactive', 'error')),
    protocol TEXT DEFAULT 'oauth' CHECK (protocol IN ('oauth', 'saml', 'oidc', 'custom')),
    app_type TEXT DEFAULT 'web' CHECK (app_type IN ('web', 'api', 'mobile', 'desktop')),
    
    -- Authentication configuration
    client_id TEXT,
    client_secret TEXT, -- Encrypted in production
    redirect_uri TEXT,
    scopes TEXT[], -- Array of OAuth scopes
    
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
    category TEXT, -- e.g., 'hrms', 'cms', 'sales', 'garage'
    tags TEXT[],
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT, -- User who added this site
    
    -- Settings
    settings JSONB DEFAULT '{}'::jsonb, -- Flexible settings storage
    is_active BOOLEAN DEFAULT TRUE
);

ALTER TABLE public.connected_sites ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow all authenticated users to view, only admins to manage
CREATE POLICY "Anyone can view active sites"
    ON public.connected_sites
    FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Admins can manage sites"
    ON public.connected_sites
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = get_user_id() AND role = 'admin'
        )
    );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_connected_sites_status ON public.connected_sites(status);
CREATE INDEX IF NOT EXISTS idx_connected_sites_category ON public.connected_sites(category);
CREATE INDEX IF NOT EXISTS idx_connected_sites_is_active ON public.connected_sites(is_active);
CREATE INDEX IF NOT EXISTS idx_connected_sites_created_at ON public.connected_sites(created_at);

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_connected_sites_updated_at ON public.connected_sites;
CREATE TRIGGER update_connected_sites_updated_at
    BEFORE UPDATE ON public.connected_sites
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- View for site statistics
CREATE OR REPLACE VIEW public.sites_summary AS
SELECT 
    cs.id,
    cs.name,
    cs.display_name,
    cs.url,
    cs.icon,
    cs.status,
    cs.protocol,
    cs.category,
    cs.total_users,
    cs.active_users,
    cs.last_sync_at,
    cs.is_active,
    cs.created_at,
    COUNT(DISTINCT aa.user_id) as users_with_access
FROM public.connected_sites cs
LEFT JOIN public.app_access aa ON cs.name = aa.app_name AND aa.access_granted = TRUE
WHERE cs.is_active = TRUE
GROUP BY cs.id, cs.name, cs.display_name, cs.url, cs.icon, cs.status, cs.protocol, 
         cs.category, cs.total_users, cs.active_users, cs.last_sync_at, cs.is_active, cs.created_at;

GRANT SELECT ON public.sites_summary TO authenticated;
GRANT SELECT ON public.sites_summary TO anon;

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================

-- Example: Add your first two sites
-- INSERT INTO public.connected_sites (name, display_name, url, icon, category, status)
-- VALUES 
--     ('site1', 'My First Site', 'https://site1.example.com', '🌐', 'web', 'pending'),
--     ('site2', 'My Second Site', 'https://site2.example.com', '🔗', 'web', 'pending')
-- ON CONFLICT (name) DO NOTHING;

-- ============================================
-- ✅ Connected Sites Schema Complete!
-- ============================================
