-- ============================================
-- Fix RLS Policies for Connected Sites
-- ============================================
-- Run this in your CENTRAL dashboard Supabase
-- This ensures anyone can view connected sites (since auth is disabled)
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active sites" ON public.connected_sites;
DROP POLICY IF EXISTS "Admins can manage sites" ON public.connected_sites;

-- Allow anyone to view active sites (since authentication is disabled)
CREATE POLICY "Anyone can view active sites"
    ON public.connected_sites
    FOR SELECT
    USING (is_active = TRUE);

-- Allow anyone to insert/update (for now, since auth is disabled)
CREATE POLICY "Anyone can manage sites"
    ON public.connected_sites
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- ✅ RLS Policies Updated!
-- ============================================
-- Now the dashboard should be able to load sites
-- ============================================
