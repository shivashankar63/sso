-- ============================================
-- Update HRMS Site URL
-- ============================================
-- Run this in your CENTRAL dashboard Supabase
-- Updates the HRMS site URL to the correct one
-- ============================================

UPDATE public.connected_sites
SET 
    url = 'https://techvitta-hrms-tau.vercel.app/',
    updated_at = NOW()
WHERE name = 'hrms';

-- Verify the update
SELECT name, display_name, url, status 
FROM public.connected_sites 
WHERE name = 'hrms';

-- ============================================
-- ✅ HRMS URL Updated!
-- ============================================
