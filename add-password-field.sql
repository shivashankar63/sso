-- ============================================
-- Add Password Field to user_profiles
-- ============================================
-- Run this in your CENTRAL dashboard Supabase
-- Adds password field for user login
-- ============================================

-- Add password field (hashed in production, plain for now)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add index for password lookups (if needed)
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_password 
ON public.user_profiles(email) 
WHERE password_hash IS NOT NULL;

-- ============================================
-- ✅ Password Field Added!
-- ============================================
-- Now users can have passwords for login
-- ============================================
