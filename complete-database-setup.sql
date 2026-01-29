-- ============================================
-- COMPLETE DATABASE SETUP FOR SSO DASHBOARD
-- ============================================
-- Run this ENTIRE file in Supabase SQL Editor
-- Project: https://snvyotfofpdkheecupho.supabase.co
-- ============================================

-- ============================================
-- STEP 1: Create get_user_id() Function
-- ============================================
-- This function extracts the Clerk user ID from JWT tokens
-- ============================================

CREATE OR REPLACE FUNCTION get_user_id()
RETURNS text AS $$
SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$ LANGUAGE sql STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_id() TO anon;

-- ============================================
-- STEP 2: Create User Profiles Table
-- ============================================
-- Stores user profile information linked to Clerk user IDs
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id TEXT PRIMARY KEY, -- Clerk user ID (not UUID)
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    team TEXT,
    department TEXT,
    phone TEXT,
    clerk_user_id TEXT UNIQUE NOT NULL, -- Explicit Clerk ID reference
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
    ON public.user_profiles
    FOR SELECT
    USING (get_user_id() = id);

CREATE POLICY "Users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (get_user_id() = id)
    WITH CHECK (get_user_id() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.user_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = get_user_id() AND role = 'admin'
        )
    );

-- ============================================
-- STEP 3: Create User Roles Table
-- ============================================
-- Manages user roles across different applications
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'user', 'viewer')),
    app_name TEXT,
    granted_by TEXT REFERENCES public.user_profiles(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    UNIQUE(user_id, role, app_name)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles"
    ON public.user_roles
    FOR SELECT
    USING (get_user_id() = user_id);

CREATE POLICY "Admins can manage roles"
    ON public.user_roles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = get_user_id() AND role = 'admin'
        )
    );

-- ============================================
-- STEP 4: Create App Access Table
-- ============================================
-- Tracks which users have access to which applications
-- ============================================

CREATE TABLE IF NOT EXISTS public.app_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    app_name TEXT NOT NULL,
    access_granted BOOLEAN DEFAULT TRUE,
    granted_by TEXT REFERENCES public.user_profiles(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    UNIQUE(user_id, app_name)
);

ALTER TABLE public.app_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own access"
    ON public.app_access
    FOR SELECT
    USING (get_user_id() = user_id);

CREATE POLICY "Admins can manage access"
    ON public.app_access
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = get_user_id() AND role = 'admin'
        )
    );

-- ============================================
-- STEP 5: Create Audit Logs Table
-- ============================================
-- Tracks user activities and events
-- ============================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    app_name TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
    ON public.audit_logs
    FOR SELECT
    USING (get_user_id() = user_id);

CREATE POLICY "Admins can view all audit logs"
    ON public.audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = get_user_id() AND role = 'admin'
        )
    );

-- ============================================
-- STEP 6: Create Helper Functions
-- ============================================
-- Utility functions for common operations
-- ============================================

CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id TEXT DEFAULT get_user_id())
RETURNS TEXT AS $$
    SELECT role FROM public.user_profiles WHERE id = p_user_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_app_access(p_app_name TEXT, p_user_id TEXT DEFAULT get_user_id())
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.app_access
        WHERE user_id = p_user_id
        AND app_name = p_app_name
        AND access_granted = TRUE
        AND (revoked_at IS NULL OR revoked_at > NOW())
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_apps(p_user_id TEXT DEFAULT get_user_id())
RETURNS TABLE(app_name TEXT) AS $$
    SELECT app_name FROM public.app_access
    WHERE user_id = p_user_id
    AND access_granted = TRUE
    AND (revoked_at IS NULL OR revoked_at > NOW());
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at timestamp
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- STEP 7: Create Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_id ON public.user_profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_app_name ON public.user_roles(app_name);
CREATE INDEX IF NOT EXISTS idx_app_access_user_id ON public.app_access(user_id);
CREATE INDEX IF NOT EXISTS idx_app_access_app_name ON public.app_access(app_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);

-- ============================================
-- STEP 8: Create User Summary View
-- ============================================
-- Convenient view to see user information with their apps and roles
-- ============================================

CREATE OR REPLACE VIEW public.user_summary AS
SELECT 
    up.id,
    up.email,
    up.full_name,
    up.role as primary_role,
    up.team,
    up.department,
    up.clerk_user_id,
    up.created_at,
    up.updated_at,
    array_agg(DISTINCT aa.app_name) FILTER (WHERE aa.access_granted = TRUE) as accessible_apps,
    array_agg(DISTINCT ur.role) FILTER (WHERE ur.role IS NOT NULL) as all_roles
FROM public.user_profiles up
LEFT JOIN public.app_access aa ON up.id = aa.user_id
LEFT JOIN public.user_roles ur ON up.id = ur.user_id
GROUP BY up.id, up.email, up.full_name, up.role, up.team, up.department, up.clerk_user_id, up.created_at, up.updated_at;

GRANT SELECT ON public.user_summary TO authenticated;
GRANT SELECT ON public.user_summary TO anon;

-- ============================================
-- STEP 9: Revoke Public Access
-- ============================================
-- Ensure tables are secure by default
-- ============================================

REVOKE ALL ON public.user_profiles FROM public;
REVOKE ALL ON public.user_roles FROM public;
REVOKE ALL ON public.app_access FROM public;
REVOKE ALL ON public.audit_logs FROM public;

-- ============================================
-- ✅ SETUP COMPLETE!
-- ============================================
-- Your database is now ready for the SSO Dashboard
-- 
-- Next steps:
-- 1. When Clerk is configured, update JWT Secret in Supabase
-- 2. Test the connection by creating a user profile
-- 3. Use the helper functions to check access and roles
-- ============================================
