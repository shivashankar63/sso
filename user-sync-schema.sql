-- ============================================
-- User Sync Schema
-- ============================================
-- Run this AFTER complete-database-setup.sql
-- Handles syncing user data across all connected sites
-- ============================================

-- Table to track user sync across sites
CREATE TABLE IF NOT EXISTS public.user_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    source_site TEXT, -- Which site the user came from
    target_site TEXT, -- Which site we're syncing to
    sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'success', 'failed', 'in_progress')),
    sync_type TEXT DEFAULT 'create' CHECK (sync_type IN ('create', 'update', 'delete')),
    error_message TEXT,
    synced_data JSONB, -- Store the data that was synced
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

ALTER TABLE public.user_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sync logs"
    ON public.user_sync_log
    FOR SELECT
    USING (get_user_id() = user_id);

CREATE POLICY "Admins can view all sync logs"
    ON public.user_sync_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = get_user_id() AND role = 'admin'
        )
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_sync_log_user_id ON public.user_sync_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sync_log_status ON public.user_sync_log(sync_status);
CREATE INDEX IF NOT EXISTS idx_user_sync_log_created_at ON public.user_sync_log(created_at);

-- Function to sync user to all connected sites
CREATE OR REPLACE FUNCTION public.sync_user_to_all_sites(p_user_id TEXT)
RETURNS TABLE(site_name TEXT, status TEXT, error TEXT) AS $$
DECLARE
    site_record RECORD;
    sync_result TEXT;
    error_msg TEXT;
BEGIN
    -- Loop through all active connected sites
    FOR site_record IN 
        SELECT name, url, protocol FROM public.connected_sites 
        WHERE is_active = TRUE AND status = 'active'
    LOOP
        BEGIN
            -- Insert sync log entry
            INSERT INTO public.user_sync_log (user_id, target_site, sync_status, sync_type)
            VALUES (p_user_id, site_record.name, 'pending', 'create')
            RETURNING id INTO sync_result;
            
            -- Return success (actual sync will be handled by API/webhook)
            RETURN QUERY SELECT site_record.name, 'pending'::TEXT, NULL::TEXT;
        EXCEPTION WHEN OTHERS THEN
            error_msg := SQLERRM;
            RETURN QUERY SELECT site_record.name, 'failed'::TEXT, error_msg;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get users that need syncing
CREATE OR REPLACE FUNCTION public.get_users_to_sync()
RETURNS TABLE(
    user_id TEXT,
    email TEXT,
    full_name TEXT,
    sites_to_sync TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        up.email,
        up.full_name,
        ARRAY_AGG(cs.name) FILTER (WHERE cs.name IS NOT NULL) as sites
    FROM public.user_profiles up
    CROSS JOIN public.connected_sites cs
    WHERE cs.is_active = TRUE 
    AND cs.status = 'active'
    AND NOT EXISTS (
        SELECT 1 FROM public.user_sync_log usl
        WHERE usl.user_id = up.id 
        AND usl.target_site = cs.name
        AND usl.sync_status = 'success'
    )
    GROUP BY up.id, up.email, up.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for sync status
CREATE OR REPLACE VIEW public.user_sync_status AS
SELECT 
    up.id as user_id,
    up.email,
    up.full_name,
    cs.name as site_name,
    cs.display_name as site_display_name,
    COALESCE(usl.sync_status, 'not_synced') as sync_status,
    usl.completed_at as last_synced_at,
    usl.error_message
FROM public.user_profiles up
CROSS JOIN public.connected_sites cs
LEFT JOIN public.user_sync_log usl ON usl.user_id = up.id 
    AND usl.target_site = cs.name 
    AND usl.id = (
        SELECT id FROM public.user_sync_log 
        WHERE user_id = up.id AND target_site = cs.name 
        ORDER BY created_at DESC LIMIT 1
    )
WHERE cs.is_active = TRUE;

GRANT SELECT ON public.user_sync_status TO authenticated;
GRANT SELECT ON public.user_sync_status TO anon;

-- ============================================
-- ✅ User Sync Schema Complete!
-- ============================================
